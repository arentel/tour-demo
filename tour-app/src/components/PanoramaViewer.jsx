import { useState, useEffect, useRef, useCallback } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Horizontal pan state (pixels, 0 = center)
  const [panX, setPanX] = useState(0);
  const panXRef = useRef(0);
  const touchRef = useRef(null);

  // Active hotspot for mobile double-tap
  const [activeHotspotId, setActiveHotspotId] = useState(null);

  // Keep panXRef in sync
  const updatePanX = useCallback((val) => {
    panXRef.current = val;
    setPanX(val);
  }, []);

  // Scene transition
  useEffect(() => {
    if (currentScene?.id !== displayScene?.id) {
      setTransitioning(true);
      updatePanX(0);
      setActiveHotspotId(null);
      const timer = setTimeout(() => {
        setDisplayScene(currentScene);
        setTimeout(() => setTransitioning(false), 50);
      }, 400);
      return () => clearTimeout(timer);
    } else if (currentScene) {
      setDisplayScene(currentScene);
    }
  }, [currentScene, displayScene, updatePanX]);

  // Max pan: 25% of viewport width (the overflow of the 150% inner container)
  const maxPanRef = useRef(0);
  useEffect(() => {
    maxPanRef.current = isMobile ? window.innerWidth * 0.25 : 0;
  }, [isMobile]);

  const handleTouchStart = useCallback((e) => {
    // Don't start pan if touching a hotspot
    if (e.target.closest('[data-hotspot]')) return;
    touchRef.current = {
      startX: e.touches[0].clientX,
      startPan: panXRef.current,
      moved: false,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current) return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(delta) > 8) {
      touchRef.current.moved = true;
      setActiveHotspotId(null);
    }
    const max = maxPanRef.current;
    const newPan = Math.max(-max, Math.min(max, touchRef.current.startPan + delta));
    updatePanX(newPan);
  }, [updatePanX]);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current) return;
    // Tap on background (no swipe) collapses active hotspot
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
      style={{ touchAction: isMobile ? 'none' : 'auto' }}
    >
      {/* Inner container — 150% wide on mobile for horizontal pan */}
      <div
        style={{
          position: 'absolute',
          width: isMobile ? '150%' : '100%',
          height: '100%',
          left: isMobile ? '-25%' : '0',
          transform: isMobile ? `translateX(${panX}px)` : 'none',
          willChange: isMobile ? 'transform' : 'auto',
        }}
      >
        <img
          src={displayScene.image}
          alt={displayScene.name}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* Hotspots */}
        {displayScene.hotspots.map((hotspot) => (
          <Hotspot
            key={hotspot.id}
            hotspot={hotspot}
            isActive={activeHotspotId === hotspot.id}
            onActivate={setActiveHotspotId}
          />
        ))}
      </div>
    </div>
  );
}
