// SERVER ONLY — import this file only inside app/api routes.

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type AdminServices = {
  adminApp: App | null;
  adminAuth: ReturnType<typeof getAuth> | null;
  adminDb: ReturnType<typeof getFirestore> | null;
};

function readPrivateKey(value: string | undefined): string {
  return value?.replace(/\\n/g, "\n") ?? "";
}

function createAdminServices(): AdminServices {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const privateKey = readPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return {
      adminApp: null,
      adminAuth: null,
      adminDb: null
    };
  }

  const existingApp = getApps()[0] ?? null;
  const adminApp =
    existingApp ??
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });

  return {
    adminApp,
    adminAuth: getAuth(adminApp),
    adminDb: getFirestore(adminApp)
  };
}

const adminServices = createAdminServices();

export const adminApp = adminServices.adminApp;
export const adminAuth = adminServices.adminAuth;
export const adminDb = adminServices.adminDb;
