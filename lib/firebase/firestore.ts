import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type DocumentReference
} from "firebase/firestore";
import { db } from "./client";

export async function getDocument<T extends object>(
  collectionName: string,
  id: string
): Promise<T | null> {
  if (!db) {
    return null;
  }

  const documentRef = doc(db, collectionName, id) as DocumentReference<T>;
  const snapshot = await getDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as T;
}

export async function setDocument<T extends object>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  if (!db) {
    return;
  }

  const documentRef = doc(db, collectionName, id) as DocumentReference<T>;
  await setDoc(documentRef as never, data as never);
}

export async function updateDocument<T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  if (!db) {
    return;
  }

  const documentRef = doc(db, collectionName, id) as DocumentReference<T>;
  await updateDoc(documentRef as never, data as never);
}
