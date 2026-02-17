import { useState, useEffect, useRef, useCallback } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  // Mobile pan via object-position (percentage offset from center, -50 to 50)
  const [panPct, setPanPct] = useState(0);
  const panPctRef = useRef(0);
  const touchRef = useRef(null);

  // Active hotspot for mobile double-tap
  const [activeHotspotId, setActiveHotspotId] = useState(null);

  const updatePan = useCallback((val) => {
    panPctRef.current = val;
    setPanPct(val);
  }, []);

  // Scene transition
  useEffect(() => {
    if (currentScene?.id !== displayScene?.id) {
      setTransitioning(true);
      updatePan(0);
      setActiveHotspotId(null);
      const timer = setTimeout(() => {
        setDisplayScene(currentScene);
        setTimeout(() => setTransitioning(false), 50);
      }, 400);
      return () => clearTimeout(timer);
    } else if (currentScene) {
      setDisplayScene(currentScene);
    }
  }, [currentScene, displayScene, updatePan]);

  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('[data-hotspot]')) return;
    touchRef.current = {
      startX: e.touches[0].clientX,
      startPan: panPctRef.current,
      moved: false,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current) return;
    const deltaX = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(deltaX) > 8) {
      touchRef.current.moved = true;
      setActiveHotspotId(null);
    }
    const deltaPct = (deltaX / window.innerWidth) * 60;
    const newPct = Math.max(-50, Math.min(50, touchRef.current.startPan + deltaPct));
    updatePan(newPct);
  }, [updatePan]);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current) return;
    if (!touchRef.current.moved) {
      setActiveHotspotId(null);
    }
    touchRef.current = null;
  }, []);

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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Scene image — panned via object-position on touch */}
      <img
        src={displayScene.image}
        alt={displayScene.name}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{ objectPosition: `${50 - panPct}% 50%` }}
        draggable={false}
      />

      {/* Hotspots — always positioned relative to viewport */}
      {displayScene.hotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.id}
          hotspot={hotspot}
          isActive={activeHotspotId === hotspot.id}
          onActivate={setActiveHotspotId}
        />
      ))}
    </div>
  );
}
