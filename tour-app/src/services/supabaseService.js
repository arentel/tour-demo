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
      resolve(file);
    };
    img.src = url;
  });
}

function compressImageToDataUrl(file) {
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
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

export async function uploadSceneImage(sceneId, file) {
  if (!supabase) return compressImageToDataUrl(file);

  try {
    const blob = await compressImageToBlob(file);
    const path = `${sceneId}.jpg`;

    const { error } = await supabase.storage
      .from('scenes')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('scenes').getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (err) {
    console.warn('Storage upload failed, using data URL:', err);
    return compressImageToDataUrl(file);
  }
}

// --- Database: Scenes ---

export async function loadTourData() {
  if (!supabase) return null;

  try {
    const { data: configRows, error: configError } = await supabase
      .from('tour_config')
      .select('start_scene')
      .limit(1);

    if (configError) throw configError;

    const startScene = configRows?.[0]?.start_scene || 'lobby';

    const { data: scenes, error } = await supabase
      .from('scenes')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;

    if (!scenes || scenes.length === 0) {
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
  } catch (err) {
    console.warn('Supabase loadTourData failed:', err);
    return null;
  }
}

export async function saveTourData(tourData) {
  if (!supabase) return;

  try {
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

    const { data: existing } = await supabase
      .from('scenes')
      .select('scene_id');

    const existingIds = new Set((existing || []).map((s) => s.scene_id));
    const newIds = new Set(tourData.scenes.map((s) => s.id));

    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      await supabase.from('scenes').delete().in('scene_id', toDelete);
    }

    const rows = tourData.scenes.map((scene, index) => ({
      scene_id: scene.id,
      name: scene.name,
      image_url: scene.image,
      order: index,
      hotspots: scene.hotspots,
    }));

    await supabase.from('scenes').upsert(rows, { onConflict: 'scene_id' });
  } catch (err) {
    console.warn('Supabase saveTourData failed:', err);
  }
}

export async function resetTourData() {
  if (!supabase) return defaultTourData;

  try {
    await supabase.from('scenes').delete().neq('scene_id', '');
    await seedDefaultData();
  } catch (err) {
    console.warn('Supabase resetTourData failed:', err);
  }
  return defaultTourData;
}

async function seedDefaultData() {
  if (!supabase) return;

  try {
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

    const rows = defaultTourData.scenes.map((scene, index) => ({
      scene_id: scene.id,
      name: scene.name,
      image_url: scene.image,
      order: index,
      hotspots: scene.hotspots,
    }));

    await supabase.from('scenes').upsert(rows, { onConflict: 'scene_id' });
  } catch (err) {
    console.warn('Supabase seedDefaultData failed:', err);
  }
}

// --- Auth ---

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  if (!supabase) {
    callback(null);
    return () => {};
  }
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  } catch (err) {
    console.warn('Auth listener setup failed:', err);
    callback(null);
    return () => {};
  }
}
