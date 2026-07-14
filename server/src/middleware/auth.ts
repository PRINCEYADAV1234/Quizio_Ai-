import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Extend Request interface to support user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
      };
    }
  }
}

let firebaseInitialized = false;

try {
  // If FIREBASE_SERVICE_ACCOUNT env var is provided, initialize Firebase Admin
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('Firebase Admin initialized successfully.');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseInitialized = true;
    console.log('Firebase Admin initialized with Project ID.');
  } else {
    console.warn('Firebase Admin environment variables missing. Running in local fallback mode.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!firebaseInitialized) {
    // Local fallback mode: decode JWT without signature verification so the user can run the app offline / with mock firebase
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        req.user = {
          uid: payload.user_id || payload.uid || 'mock-user-id',
          email: payload.email || 'mock@quizio.com',
          name: payload.name || 'Mock User',
        };
        return next();
      }
    } catch (e) {
      // If parsing fails, use standard mock payload
    }
    // Standard mock user
    req.user = {
      uid: 'mock-user-id',
      email: 'mock@quizio.com',
      name: 'Mock User',
    };
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
    next();
  } catch (error) {
    console.error('Firebase Auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
