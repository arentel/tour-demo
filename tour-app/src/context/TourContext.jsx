import { createContext, useContext, useState, useCallback } from 'react';
import { loadTourData, saveTourData, resetTourData } from '../data/tourData';

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [tourData, setTourData] = useState(loadTourData);
  const [currentSceneId, setCurrentSceneId] = useState(tourData.startScene);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const currentScene = tourData.scenes.find((s) => s.id === currentSceneId);

  const navigateToScene = useCallback(
    (sceneId) => {
      if (tourData.scenes.find((s) => s.id === sceneId)) {
        setCurrentSceneId(sceneId);
        setIsMenuOpen(false);
      }
    },
    [tourData.scenes]
  );

  const updateTourData = useCallback((newData) => {
    setTourData(newData);
    saveTourData(newData);
  }, []);

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
      // Remove hotspots targeting deleted scene
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

  const resetData = useCallback(() => {
    const data = resetTourData();
    setTourData(data);
    setCurrentSceneId(data.startScene);
  }, []);

  return (
    <TourContext.Provider
      value={{
        tourData,
        currentScene,
        currentSceneId,
        isMenuOpen,
        isAdminOpen,
        setIsMenuOpen,
        setIsAdminOpen,
        navigateToScene,
        addScene,
        removeScene,
        updateScene,
        addHotspot,
        removeHotspot,
        updateHotspot,
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
