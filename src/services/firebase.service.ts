import * as admin from "firebase-admin";
import * as path from "path";

class FirebaseService {
  private static instance: FirebaseService;

  private constructor() {
    try {
      const serviceAccountPath = path.join(
        __dirname,
        "../configs/firebase-service-account-key.json"
      );
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async sendNotification(
    deviceToken: string,
    title: string,
    body: string
  ): Promise<void> {
    const message = {
      notification: {
        title,
        body,
      },
      token: deviceToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send notification");
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
