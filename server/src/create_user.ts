import * as admin from 'firebase-admin';
import serviceAccount from '../../app-logs-ee256-firebase-adminsdk-fbsvc-1dd4266dd5.json';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}

const db = admin.firestore();

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.log('Usage: npx ts-node src/create_user.ts <email> <phone> <password> <role: admin|user>');
    process.exit(1);
  }

  const email = args[0].toLowerCase();
  const phone = args[1];
  const password = args[2];
  const role = args[3].toLowerCase() as 'admin' | 'user';

  if (role !== 'admin' && role !== 'user') {
    console.error('Error: Role must be either "admin" or "user"');
    process.exit(1);
  }

  try {
    console.log(`Creating user in Firebase Auth: ${email}...`);
    // Create the Auth account using email + password (avoids missing Phone Auth configuration error)
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: email.split('@')[0].toUpperCase(),
    });

    console.log(`Successfully created Auth user with UID: ${userRecord.uid}`);

    console.log(`Creating user document in Firestore: users/${userRecord.uid}...`);
    // Store phone number and clearance role securely in Firestore users collection
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      phoneNumber: phone,
      role,
      createdAt: new Date().toISOString(),
    });

    console.log(`\n🎉 SUCCESS! User fully initialized in the database!`);
    console.log(`📧 Email:      ${email}`);
    console.log(`📞 Phone:      ${phone}`);
    console.log(`🔑 Password:   ${password}`);
    console.log(`🛡️ Clearance:  ${role.toUpperCase()}`);
  } catch (error: any) {
    console.error('\n❌ FAILED to create user:', error.message);
    process.exit(1);
  }
};

main();
