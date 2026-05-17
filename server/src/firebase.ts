import * as admin from 'firebase-admin';
import serviceAccount from '../../app-logs-ee256-firebase-adminsdk-fbsvc-1dd4266dd5.json';

export const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
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
