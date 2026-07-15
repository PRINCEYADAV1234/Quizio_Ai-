import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });


const MODEL = 'gemini-3.5-flash';
const MAX_RETRIES = 3;

// Max chars to send as input — increased to 150,000 to read the full PDF content
const MAX_INPUT_CHARS = 150000;

/**
 * Tries to parse JSON. If it's truncated (Gemini hit token limit mid-response),
 * it recovers whatever complete array items were generated.
 */
function safeParseJSON(raw: string): any[] {
  try {
    return JSON.parse(raw);
  } catch {
    // Try to extract all complete JSON objects from a truncated array
    const matches = raw.match(/\{[\s\S]*?\}(?=\s*[,\]]|\s*$)/g);
    if (matches && matches.length > 0) {
      const recovered: any[] = [];
      for (const m of matches) {
        try { recovered.push(JSON.parse(m)); } catch { /* skip malformed item */ }
      }
      if (recovered.length > 0) {
        console.warn(`[Gemini] JSON was truncated. Recovered ${recovered.length} items from partial response.`);
        return recovered;
      }
    }
    throw new Error(`Gemini returned malformed JSON: ${raw.substring(0, 200)}`);
  }
}

async function callWithRetry(
  fn: (modelName: string) => Promise<any>
): Promise<any> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn(MODEL);
    } catch (err: any) {
      const is503 = err?.status === 503 || String(err?.message).includes('503') || String(err?.message).includes('high demand');
      const isNetwork = err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';

      if ((is503 || isNetwork) && attempt < MAX_RETRIES) {
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
        console.log(`[Gemini] Attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Gemini: All retry attempts exhausted');
}

export async function generateSummary(text: string): Promise<string> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  const prompt = `You are a professional tutor. Summarize the following educational content in a structured, comprehensive, and engaging manner. Use clear headings, bullet points, and highlight key terms:\n\n${text.substring(0, 12000)}`;

  const result = await callWithRetry(async (modelName) => {
    const r = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { maxOutputTokens: 2048 },
    });
    return r.text;
  });
  return result ?? '';
}

export async function generateQuiz(
  text: string,
  quizType: string,
  difficulty: string,
  questionCount: number = 5
): Promise<any[]> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  return await callWithRetry(async (modelName) => {
    let formatInstructions = '';
    let prompt = '';

    if (quizType === 'extract_mcq') {
      formatInstructions = `Each question must have an "options" array containing the options present in the PDF question, and a "correctAnswer" string representing the index of the correct option (e.g. "0", "1", "2", "3").`;
      prompt = `The following educational text contains multiple-choice questions (MCQs) in raw text. Identify, parse and extract all of those MCQs. Do not invent new questions. Extract only the questions present in the document.
IMPORTANT: You MUST extract questions strictly from the provided text as-is.
${formatInstructions}
Also provide a short explanation for the correct answer under "explanation".`;
    } else {
      if (quizType === 'mcq') {
        formatInstructions = `Each question must have an "options" array containing 4 possible string answers, and a "correctAnswer" string representing the index of the correct option (e.g. "0", "1", "2", "3").`;
      } else if (quizType === 'true_false') {
        formatInstructions = `Each question must have an "options" array containing ["True", "False"], and a "correctAnswer" string which is either "0" (for True) or "1" (for False).`;
      } else if (quizType === 'fill_in_the_blanks') {
        formatInstructions = `Each question must have the blank marked with "____" in "questionText", and "correctAnswer" must be the exact word/phrase that fills the blank. Do not include options.`;
      } else {
        formatInstructions = `Each question must have a "questionText", and "correctAnswer" must be a concise correct response to the question. Do not include options.`;
      }
      prompt = `Based strictly on the provided educational text, generate exactly ${questionCount} questions for a "${quizType}" quiz at "${difficulty}" difficulty level.
IMPORTANT: You MUST generate questions based ONLY on the facts, details, and context provided in the text. Do NOT use general external knowledge or assume information not in the text.
${formatInstructions}
Also provide a short explanation for the correct answer under "explanation".`;
    }

    const fullPrompt = `${prompt}\n\nYou must output a JSON array of objects conforming to this schema:\n[\n  {\n    "questionText": "string",\n    "options": ["string"],\n    "correctAnswer": "string",\n    "explanation": "string"\n  }\n]\n\nText:\n\n${text.substring(0, MAX_INPUT_CHARS)}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      },
    });

    if (!response.text) throw new Error('Gemini returned no text for quiz generation.');
    return safeParseJSON(response.text);
  });
}

export async function generateFlashcards(text: string, count: number = 8): Promise<any[]> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  return await callWithRetry(async (modelName) => {
    const prompt = `Based strictly on the following educational text, generate exactly ${count} interactive flashcard Q&As. Focus on core definitions, formulas, and critical concepts directly mentioned in the text.
IMPORTANT: You MUST generate flashcards based ONLY on facts directly stated in the text. Do NOT use external general knowledge.
Output a JSON array of objects conforming to this schema:
[
  {
    "question": "string",
    "answer": "string"
  }
]

Text:\n\n${text.substring(0, MAX_INPUT_CHARS)}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 2048,
      },
    });

    if (!response.text) throw new Error('Gemini returned no text for flashcard generation.');
    return safeParseJSON(response.text);
  });
}

export async function generateQuizFromImage(
  imageBase64: string,
  mimeType: string,
  quizType: string = 'mcq',
  questionCount: number = 5
): Promise<any[]> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  return await callWithRetry(async (modelName) => {
    let formatInstructions = '';
    if (quizType === 'extract_mcq') {
      formatInstructions = `Extract all MCQs visible in the image. Do not invent new questions. Each question must have an "options" array and a "correctAnswer" string index (e.g. "0", "1", "2", "3").`;
    } else if (quizType === 'true_false') {
      formatInstructions = `Generate True/False questions. Each must have "options": ["True", "False"] and "correctAnswer" of "0" or "1".`;
    } else {
      formatInstructions = `Generate ${questionCount} MCQ questions. Each must have an "options" array of 4 choices and "correctAnswer" as the index string (e.g. "0", "1", "2", "3").`;
    }

    const prompt = `You are an OCR and quiz-generation assistant. Carefully read the handwritten or printed content in this image.
${formatInstructions}
Also provide a brief explanation under "explanation".

Output a JSON array:
[
  {
    "questionText": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "explanation": "string"
  }
]`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64,
          },
        },
      ],
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      },
    });

    if (!response.text) throw new Error('Gemini returned no text for image quiz generation.');
    return safeParseJSON(response.text);
  });
}
