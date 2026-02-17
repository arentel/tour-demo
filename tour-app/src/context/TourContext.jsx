import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadTourData as loadLocal, saveTourData as saveLocal, resetTourData as resetLocal } from '../data/tourData';
import {
  loadTourData as loadFromSupabase,
  saveTourData as saveToSupabase,
  resetTourData as resetInSupabase,
  uploadSceneImage,
  signIn,
  signOut,
  onAuthChange,
} from '../services/supabaseService';

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [tourData, setTourData] = useState(() => loadLocal());
  const [currentSceneId, setCurrentSceneId] = useState(() => loadLocal().startScene);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const currentScene = tourData.scenes.find((s) => s.id === currentSceneId);

  // Listen to Supabase auth state
  useEffect(() => {
    let unsub;
    try {
      unsub = onAuthChange((user) => {
        setIsAdminAuthenticated(!!user);
        if (user) {
          setShowLoginModal(false);
          setIsAdminOpen(true);
        }
        setAuthLoading(false);
      });
    } catch (err) {
      console.warn('Auth setup failed:', err);
      setAuthLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    loadFromSupabase()
      .then((data) => {
        if (!cancelled && data) {
          setTourData(data);
          setCurrentSceneId(data.startScene);
          saveLocal(data);
        }
      })
      .catch((err) => {
        console.warn('Supabase load failed, using local data:', err);
      })
      .finally(() => {
        if (!cancelled) setDataReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  // --- Auth ---
  const loginAdmin = useCallback(async (email, password) => {
    try {
      await signIn(email, password);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setIsAdminOpen(false);
  }, []);

  // --- Navigation ---
  const navigateToScene = useCallback(
    (sceneId) => {
      if (tourData.scenes.find((s) => s.id === sceneId)) {
        setCurrentSceneId(sceneId);
        setIsMenuOpen(false);
      }
    },
    [tourData.scenes]
  );

  // --- Data persistence (Supabase + localStorage fallback) ---
  const updateTourData = useCallback((newData) => {
    setTourData(newData);
    saveLocal(newData);
    saveToSupabase(newData);
  }, []);

  // --- Scene CRUD ---
  const addScene = useCallback(
    (scene) => {
      const newData = {
        ...tourData,
        scenes: [...tourData.scenes, scene],
      };
      updateTourData(newData);
    },
    [tourData, updateTourData]
  );

  const removeScene = useCallback(
    (sceneId) => {
      const newScenes = tourData.scenes.filter((s) => s.id !== sceneId);
      const cleanedScenes = newScenes.map((scene) => ({
        ...scene,
        hotspots: scene.hotspots.map((hs) =>
          hs.targetScene === sceneId ? { ...hs, targetScene: null } : hs
        ),
      }));
      const newData = {
        ...tourData,
        scenes: cleanedScenes,
        startScene:
          tourData.startScene === sceneId
            ? cleanedScenes[0]?.id || ''
            : tourData.startScene,
      };
      if (currentSceneId === sceneId) {
        setCurrentSceneId(cleanedScenes[0]?.id || '');
      }
      updateTourData(newData);
    },
    [tourData, currentSceneId, updateTourData]
  );

  const updateScene = useCallback(
    (sceneId, updates) => {
      const newData = {
        ...tourData,
        scenes: tourData.scenes.map((s) =>
          s.id === sceneId ? { ...s, ...updates } : s
        ),
      };
      updateTourData(newData);
    },
    [tourData, updateTourData]
  );

  // --- Hotspot CRUD ---
  const addHotspot = useCallback(
    (sceneId, hotspot) => {
      const scene = tourData.scenes.find((s) => s.id === sceneId);
      if (!scene) return;
      updateScene(sceneId, {
        hotspots: [...scene.hotspots, hotspot],
      });
    },
    [tourData.scenes, updateScene]
  );

  const removeHotspot = useCallback(
    (sceneId, hotspotId) => {
      const scene = tourData.scenes.find((s) => s.id === sceneId);
      if (!scene) return;
      updateScene(sceneId, {
        hotspots: scene.hotspots.filter((hs) => hs.id !== hotspotId),
      });
    },
    [tourData.scenes, updateScene]
  );

  const updateHotspot = useCallback(
    (sceneId, hotspotId, updates) => {
      const scene = tourData.scenes.find((s) => s.id === sceneId);
      if (!scene) return;
      updateScene(sceneId, {
        hotspots: scene.hotspots.map((hs) =>
          hs.id === hotspotId ? { ...hs, ...updates } : hs
        ),
      });
    },
    [tourData.scenes, updateScene]
  );

  // --- Image: compress + upload to Supabase Storage ---
  const uploadImage = useCallback(async (sceneId, file) => {
    return uploadSceneImage(sceneId, file);
  }, []);

  // --- Reset ---
  const resetData = useCallback(async () => {
    try {
      const data = await resetInSupabase();
      setTourData(data);
      setCurrentSceneId(data.startScene);
      saveLocal(data);
    } catch (err) {
      console.error('Reset error:', err);
      const data = resetLocal();
      setTourData(data);
      setCurrentSceneId(data.startScene);
    }
  }, []);

  return (
    <TourContext.Provider
      value={{
        tourData,
        currentScene,
        currentSceneId,
        isMenuOpen,
        isAdminOpen,
        isAdminAuthenticated,
        showLoginModal,
        firebaseReady: dataReady,
        authLoading,
        setIsMenuOpen,
        setIsAdminOpen,
        setShowLoginModal,
        navigateToScene,
        loginAdmin,
        logoutAdmin,
        addScene,
        removeScene,
        updateScene,
        addHotspot,
        removeHotspot,
        updateHotspot,
        uploadImage,
        resetData,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
