import { useState, useEffect } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  useEffect(() => {
    if (currentScene?.id !== displayScene?.id) {
      // Scene changed — animate transition
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayScene(currentScene);
        setTimeout(() => setTransitioning(false), 50);
      }, 400);
      return () => clearTimeout(timer);
    } else if (currentScene) {
      // Same scene but data changed (e.g. hotspot positions) — update without transition
      setDisplayScene(currentScene);
    }
  }, [currentScene, displayScene]);

  if (!displayScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white/40">
        <p className="text-lg font-light tracking-widest">Sin escenas disponibles</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full overflow-hidden relative bg-black ${
        transitioning ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-400`}
    >
      {/* Scene image */}
      <img
        src={displayScene.image}
        alt={displayScene.name}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* Hotspots */}
      {displayScene.hotspots.map((hotspot) => (
        <Hotspot key={hotspot.id} hotspot={hotspot} />
      ))}

    </div>
  );
}
