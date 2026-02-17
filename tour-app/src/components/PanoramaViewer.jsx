import { useState, useEffect } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  useEffect(() => {
    if (currentScene?.id !== displayScene?.id) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayScene(currentScene);
        setTimeout(() => setTransitioning(false), 50);
      }, 400);
      return () => clearTimeout(timer);
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

      {/* Scene indicator - minimal elegant pill */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div
          className="px-6 py-2 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span
            className="text-white/75 font-light tracking-[0.15em] uppercase"
            style={{ fontSize: '11px' }}
          >
            {displayScene.name}
          </span>
        </div>
      </div>
    </div>
  );
}
