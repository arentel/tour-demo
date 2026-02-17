import { useState, useEffect } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  // Transition when scene changes
  useEffect(() => {
    if (currentScene?.id !== displayScene?.id) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayScene(currentScene);
        setTimeout(() => setTransitioning(false), 50);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentScene, displayScene]);

  if (!displayScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">No hay escenas disponibles</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full overflow-hidden relative bg-black ${
        transitioning ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-300`}
    >
      {/* Scene image - static 2D */}
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

      {/* Scene indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-6 py-2 text-white/80 text-sm font-light tracking-widest">
          {displayScene.name}
        </div>
      </div>
    </div>
  );
}
