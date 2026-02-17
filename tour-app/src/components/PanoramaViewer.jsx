import { useRef, useState, useCallback, useEffect } from 'react';
import { useTour } from '../context/TourContext';
import Hotspot from './Hotspot';

export default function PanoramaViewer() {
  const { currentScene } = useTour();
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragStartOffsetX, setDragStartOffsetX] = useState(0);
  const [dragStartOffsetY, setDragStartOffsetY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  // Transition when scene changes
  useEffect(() => {
    if (currentScene?.id !== displayScene?.id) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayScene(currentScene);
        setOffsetX(0);
        setOffsetY(0);
        setZoom(1);
        setTimeout(() => setTransitioning(false), 50);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentScene, displayScene]);

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setStartX(e.clientX);
      setStartY(e.clientY);
      setDragStartOffsetX(offsetX);
      setDragStartOffsetY(offsetY);
    },
    [offsetX, offsetY]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setOffsetX(dragStartOffsetX + dx);
      setOffsetY(Math.max(-300, Math.min(300, dragStartOffsetY + dy)));
    },
    [isDragging, startX, startY, dragStartOffsetX, dragStartOffsetY]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((prev) => Math.max(1, Math.min(3, prev - e.deltaY * 0.002)));
  }, []);

  // Touch support
  const handleTouchStart = useCallback(
    (e) => {
      const touch = e.touches[0];
      setIsDragging(true);
      setStartX(touch.clientX);
      setStartY(touch.clientY);
      setDragStartOffsetX(offsetX);
      setDragStartOffsetY(offsetY);
    },
    [offsetX, offsetY]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      setOffsetX(dragStartOffsetX + dx);
      setOffsetY(Math.max(-300, Math.min(300, dragStartOffsetY + dy)));
    },
    [isDragging, startX, startY, dragStartOffsetX, dragStartOffsetY]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  if (!displayScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">No hay escenas disponibles</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`panorama-viewer w-full h-full overflow-hidden relative bg-black ${
        transitioning ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-300`}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Scene image - 2D with drag & zoom */}
      <div
        className="absolute inset-0 select-none"
        style={{
          transform: `scale(${zoom}) translate(${offsetX / zoom}px, ${offsetY / zoom}px)`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <img
          src={displayScene.image}
          alt={displayScene.name}
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Hotspots */}
      {!isDragging &&
        displayScene.hotspots.map((hotspot) => (
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
