import { supabase } from '../lib/supabase';
import { defaultTourData } from '../data/tourData';

const MAX_IMAGE_WIDTH = 1920;
const IMAGE_QUALITY = 0.7;

// --- Image: compress → upload to Storage → return public URL ---

function compressImageToBlob(file) {
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
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        IMAGE_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback: use original file
    };
    img.src = url;
  });
}

export async function uploadSceneImage(sceneId, file) {
  const blob = await compressImageToBlob(file);
  const path = `${sceneId}.jpg`;

  // Upsert: upload with overwrite
  const { error } = await supabase.storage
    .from('scenes')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('scenes').getPublicUrl(path);
  // Append timestamp to bust cache after re-upload
  return `${data.publicUrl}?t=${Date.now()}`;
}

// --- Database: Scenes ---

export async function loadTourData() {
  // Load config
  const { data: configRows } = await supabase
    .from('tour_config')
    .select('start_scene')
    .limit(1);

  const startScene = configRows?.[0]?.start_scene || 'lobby';

  // Load scenes
  const { data: scenes, error } = await supabase
    .from('scenes')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw error;

  if (!scenes || scenes.length === 0) {
    // First time: seed default data
    await seedDefaultData();
    return defaultTourData;
  }

  return {
    startScene,
    scenes: scenes.map((s) => ({
      id: s.scene_id,
      name: s.name,
      image: s.image_url || `/scenes/scene-${s.scene_id}.jpg`,
      hotspots: s.hotspots || [],
    })),
  };
}

export async function saveTourData(tourData) {
  // Update config
  const { data: configRows } = await supabase
    .from('tour_config')
    .select('id')
    .limit(1);

  if (configRows?.[0]) {
    await supabase
      .from('tour_config')
      .update({ start_scene: tourData.startScene, updated_at: new Date().toISOString() })
      .eq('id', configRows[0].id);
  }

  // Get existing scene_ids to detect deletions
  const { data: existing } = await supabase
    .from('scenes')
    .select('scene_id');

  const existingIds = new Set((existing || []).map((s) => s.scene_id));
  const newIds = new Set(tourData.scenes.map((s) => s.id));

  // Delete removed scenes
  const toDelete = [...existingIds].filter((id) => !newIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from('scenes').delete().in('scene_id', toDelete);
  }

  // Upsert all current scenes
  const rows = tourData.scenes.map((scene, index) => ({
    scene_id: scene.id,
    name: scene.name,
    image_url: scene.image,
    order: index,
    hotspots: scene.hotspots,
  }));

  await supabase.from('scenes').upsert(rows, { onConflict: 'scene_id' });
}

export async function resetTourData() {
  // Delete all scenes
  await supabase.from('scenes').delete().neq('scene_id', '');

  // Re-seed
  await seedDefaultData();
  return defaultTourData;
}

async function seedDefaultData() {
  // Config
  const { data: configRows } = await supabase
    .from('tour_config')
    .select('id')
    .limit(1);

  if (configRows?.[0]) {
    await supabase
      .from('tour_config')
      .update({ start_scene: defaultTourData.startScene })
      .eq('id', configRows[0].id);
  }

  // Scenes
  const rows = defaultTourData.scenes.map((scene, index) => ({
    scene_id: scene.id,
    name: scene.name,
    image_url: scene.image,
    order: index,
    hotspots: scene.hotspots,
  }));

  await supabase.from('scenes').upsert(rows, { onConflict: 'scene_id' });
}

// --- Auth ---

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
}
