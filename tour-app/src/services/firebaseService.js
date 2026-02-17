import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { defaultTourData } from '../data/tourData';

const TOUR_ID = 'main';
const MAX_IMAGE_WIDTH = 1920;
const IMAGE_QUALITY = 0.7;

// --- Image compression (File → compressed data URL) ---

export function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_IMAGE_WIDTH) {
        height = Math.round((height * MAX_IMAGE_WIDTH) / width);
        width = MAX_IMAGE_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback: read as-is
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

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

  // Sort by the order field
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

  // Get existing scenes to detect deletions
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
