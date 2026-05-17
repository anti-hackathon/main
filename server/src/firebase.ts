import * as admin from 'firebase-admin';
import * as fs from 'fs';

export const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    let credential = admin.credential.applicationDefault();
    
    // If GOOGLE_APPLICATION_CREDENTIALS is set, load it manually to avoid polluting GenAI
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
       try {
         const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
         credential = admin.credential.cert(serviceAccount);
         // Delete it so Google Gen AI doesn't switch to Vertex AI mode!
         delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
       } catch (e) {
         console.warn('Could not read service account, falling back to default', e);
       }
    }

    admin.initializeApp({
      credential,
    });
    console.log('Firebase Admin SDK initialized.');
  }
};

export const db = () => admin.firestore();

export const verifyUserToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw error;
  }
};

