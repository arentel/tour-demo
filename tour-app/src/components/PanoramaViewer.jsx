import { useState, useEffect, useRef, useCallback } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  // Image natural dimensions (from onLoad)
  const [imgNat, setImgNat] = useState({ w: 0, h: 0 });

  // Container dimensions (via ResizeObserver)
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Mobile pan via object-position (offset from center, -50 to 50)
  const [panPct, setPanPct] = useState(0);
  const panPctRef = useRef(0);
  const touchRef = useRef(null);

  // Active hotspot for mobile double-tap
  const [activeHotspotId, setActiveHotspotId] = useState(null);

  const updatePan = useCallback((val) => {
    panPctRef.current = val;
    setPanPct(val);
  }, []);

  // Track container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
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

  const handleImageLoad = useCallback((e) => {
    setImgNat({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  }, []);

  // Map image-relative coordinates (0-100) to viewport-relative coordinates,
  // accounting for object-cover scaling and current object-position.
  const getScreenPos = useCallback((hx, hy) => {
    const { w: cw, h: ch } = containerSize;
    const { w: iw, h: ih } = imgNat;
    if (!cw || !ch || !iw || !ih) return { x: hx, y: hy };

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale; // displayed image width
    const dh = ih * scale; // displayed image height

    // object-position percentages (50% = center by default, shifted by pan)
    const opx = (50 - panPct) / 100;
    const opy = 0.5;

    // How much of the image overflows and is cropped
    const ox = (dw - cw) * opx;
    const oy = (dh - ch) * opy;

    // Image coordinate → viewport coordinate
    const viewX = (hx / 100) * dw - ox;
    const viewY = (hy / 100) * dh - oy;

    return {
      x: (viewX / cw) * 100,
      y: (viewY / ch) * 100,
    };
  }, [containerSize, imgNat, panPct]);

  // Touch handlers
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
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative bg-black ${
        transitioning ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-400`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      <img
        src={displayScene.image}
        alt={displayScene.name}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{ objectPosition: `${50 - panPct}% 50%` }}
        draggable={false}
        onLoad={handleImageLoad}
      />

      {/* Hotspots — mapped from image coords to viewport coords */}
      {displayScene.hotspots.map((hotspot) => {
        const pos = getScreenPos(hotspot.x, hotspot.y);
        return (
          <Hotspot
            key={hotspot.id}
            hotspot={hotspot}
            screenX={pos.x}
            screenY={pos.y}
            isActive={activeHotspotId === hotspot.id}
            onActivate={setActiveHotspotId}
          />
        );
      })}
    </div>
  );
}
