import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { defaultTourData } from '../data/tourData';

const TOUR_ID = 'main';

// --- Firestore: Tour Data ---

export async function loadTourDataFromFirestore() {
  const tourRef = doc(db, 'tours', TOUR_ID);
  const tourSnap = await getDoc(tourRef);

  if (!tourSnap.exists()) {
    // First time: seed with default data
    await seedDefaultData();
    return defaultTourData;
  }

  const tourMeta = tourSnap.data();
  const scenesSnap = await getDocs(
    collection(db, 'tours', TOUR_ID, 'scenes')
  );

  const scenes = [];
  scenesSnap.forEach((docSnap) => {
    scenes.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Sort by the order field, or by name as fallback
  scenes.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return {
    startScene: tourMeta.startScene || scenes[0]?.id || '',
    scenes,
  };
}

export async function saveTourDataToFirestore(tourData) {
  const batch = writeBatch(db);

  // Update tour metadata
  const tourRef = doc(db, 'tours', TOUR_ID);
  batch.set(tourRef, { startScene: tourData.startScene });

  // We need to delete old scenes and write new ones
  // First get existing scenes to remove stale ones
  const existingSnap = await getDocs(
    collection(db, 'tours', TOUR_ID, 'scenes')
  );
  const existingIds = new Set();
  existingSnap.forEach((docSnap) => existingIds.add(docSnap.id));

  const newIds = new Set(tourData.scenes.map((s) => s.id));

  // Delete scenes that no longer exist
  for (const oldId of existingIds) {
    if (!newIds.has(oldId)) {
      batch.delete(doc(db, 'tours', TOUR_ID, 'scenes', oldId));
    }
  }

  // Upsert all current scenes
  tourData.scenes.forEach((scene, index) => {
    const sceneRef = doc(db, 'tours', TOUR_ID, 'scenes', scene.id);
    const { id, ...sceneData } = scene;
    batch.set(sceneRef, { ...sceneData, order: index });
  });

  await batch.commit();
}

export async function resetTourDataInFirestore() {
  // Delete all existing scenes
  const existingSnap = await getDocs(
    collection(db, 'tours', TOUR_ID, 'scenes')
  );
  const batch = writeBatch(db);
  existingSnap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();

  // Re-seed
  await seedDefaultData();
  return defaultTourData;
}

async function seedDefaultData() {
  const batch = writeBatch(db);

  const tourRef = doc(db, 'tours', TOUR_ID);
  batch.set(tourRef, { startScene: defaultTourData.startScene });

  defaultTourData.scenes.forEach((scene, index) => {
    const sceneRef = doc(db, 'tours', TOUR_ID, 'scenes', scene.id);
    const { id, ...sceneData } = scene;
    batch.set(sceneRef, { ...sceneData, order: index });
  });

  await batch.commit();
}

// --- Storage: Image Upload ---

export async function uploadSceneImage(sceneId, file) {
  const storageRef = ref(storage, `tours/${TOUR_ID}/scenes/${sceneId}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteSceneImage(sceneId) {
  try {
    const storageRef = ref(storage, `tours/${TOUR_ID}/scenes/${sceneId}`);
    await deleteObject(storageRef);
  } catch {
    // Image may not exist in storage (e.g. default scenes use local images)
  }
}
