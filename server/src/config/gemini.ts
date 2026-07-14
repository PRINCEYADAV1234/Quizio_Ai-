import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenerativeAI(apiKey);

export async function generateSummary(text: string): Promise<string> {
  if (!apiKey) {
    return "This is a placeholder summary. Set your GEMINI_API_KEY in the .env file to enable live AI summaries.";
  }
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = `You are a professional tutor. Summarize the following educational content in a structured, comprehensive, and engaging manner. Use clear headings, bullet points, and highlight key terms:\n\n${text.substring(0, 15000)}`;
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return result.response.text();
  } catch (error) {
    console.error('Gemini generateSummary error:', error);
    return 'Failed to generate summary using Gemini AI.';
  }
}

export async function generateQuiz(
  text: string,
  quizType: string,
  difficulty: string,
  questionCount: number = 5
): Promise<any[]> {
  if (!apiKey) {
    // Return mock data if API key is not present
    return Array.from({ length: questionCount }, (_, i) => ({
      questionText: `Mock question ${i + 1} from text (Please check GEMINI_API_KEY)`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: '0',
      explanation: 'Set up GEMINI_API_KEY to see real AI-generated questions.',
    }));
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    let formatInstructions = '';
    let prompt = '';
    
    if (quizType === 'extract_mcq') {
      formatInstructions = `Each question must have an "options" array containing the options present in the PDF question, and a "correctAnswer" string representing the index of the correct option (e.g. "0", "1", "2", "3").`;
      prompt = `The following educational text contains multiple-choice questions (MCQs) in raw text. Identify, parse and extract all of those MCQs. Do not invent new questions. Extract only the questions present in the document.
${formatInstructions}
Also provide a short explanation for the correct answer under "explanation".

You must output a JSON array of objects conforming to this schema:
[
  {
    "questionText": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "explanation": "string"
  }
]

Text:\n\n${text.substring(0, 12000)}`;
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

      prompt = `Based on the following educational text, generate exactly ${questionCount} questions for a "${quizType}" quiz at "${difficulty}" difficulty level.
${formatInstructions}
Also provide a short explanation for the correct answer under "explanation".

You must output a JSON array of objects conforming to this schema:
[
  {
    "questionText": "string",
    "options": ["string"] // only if MCQ or true_false
    "correctAnswer": "string",
    "explanation": "string"
  }
]

Text:\n\n${text.substring(0, 12000)}`;
    }

    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini generateQuiz error (using fallback):', error);
    return Array.from({ length: questionCount }, (_, i) => ({
      questionText: `Sample question ${i + 1} from text (AI generation fallback)`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: '0',
      explanation: 'Please check if GEMINI_API_KEY is valid. This is a local backup question.',
    }));
  }
}

export async function generateFlashcards(text: string, count: number = 8): Promise<any[]> {
  if (!apiKey) {
    return Array.from({ length: count }, (_, i) => ({
      question: `Mock flashcard question ${i + 1}`,
      answer: 'Mock flashcard answer (Set GEMINI_API_KEY for real AI generation)',
    }));
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Based on the following educational text, generate exactly ${count} interactive flashcard Q&As. Focus on core definitions, formulas, and critical concepts.
Output a JSON array of objects conforming to this schema:
[
  {
    "question": "string",
    "answer": "string"
  }
]

Text:\n\n${text.substring(0, 12000)}`;

    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini generateFlashcards error (using fallback):', error);
    return Array.from({ length: count }, (_, i) => ({
      question: `Sample flashcard question ${i + 1}`,
      answer: 'Please check your GEMINI_API_KEY. This is a backup flashcard.',
    }));
  }
}
