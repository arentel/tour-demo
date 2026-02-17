import { useState, useRef, useEffect } from 'react';
import { useTour } from '../context/TourContext';

export default function Hotspot({ hotspot, isActive = false, onActivate }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToScene } = useTour();
  const labelRef = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const touchedRef = useRef(false);

  useEffect(() => {
    if (labelRef.current) {
      requestAnimationFrame(() => {
        if (labelRef.current) {
          setLabelWidth(labelRef.current.scrollWidth);
        }
      });
    }
  }, [hotspot.name, hotspot.direction]);

  const handleTouchStart = (e) => {
    touchedRef.current = true;
    e.stopPropagation(); // Prevent panorama pan when tapping hotspot
  };

  const handleClick = () => {
    if (touchedRef.current) {
      // Mobile: double-tap logic
      touchedRef.current = false;
      if (!isActive) {
        // First tap → expand
        onActivate?.(hotspot.id);
      } else {
        // Second tap → navigate
        if (hotspot.targetScene) {
          navigateToScene(hotspot.targetScene);
        }
      }
      return;
    }
    // Desktop: navigate directly on click
    if (hotspot.targetScene) {
      navigateToScene(hotspot.targetScene);
    }
  };

  const expanded = hovered || isActive;
  const expandedWidth = 38 + labelWidth + 12;

  return (
    <div
      data-hotspot
      className="absolute z-10"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onTouchStart={handleTouchStart}
    >
      {/* Pulse ring */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          top: '50%',
          left: 20,
          opacity: expanded ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div
          className="hotspot-pulse-ring rounded-full"
          style={{
            width: 48,
            height: 48,
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        />
      </div>

      {/* Main container */}
      <div
        className="relative flex items-center cursor-pointer select-none overflow-hidden"
        style={{
          width: expanded ? expandedWidth : 40,
          height: 40,
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.6)',
          background: expanded
            ? 'rgba(0,0,0,0.55)'
            : 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'width 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease, border-color 0.35s ease',
          borderColor: expanded ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Center dot */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 38, minWidth: 38, height: 38 }}
        >
          <div
            className={`rounded-full bg-white ${expanded ? '' : 'hotspot-dot-pulse'}`}
            style={{
              width: expanded ? 6 : 8,
              height: expanded ? 6 : 8,
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
          />
        </div>

        {/* Label – centered across full pill width */}
        <span
          className="absolute inset-0 whitespace-nowrap flex items-center justify-center pointer-events-none"
          style={{
            opacity: expanded ? 1 : 0,
            transition: 'opacity 0.35s ease 0.1s',
          }}
        >
          <span
            ref={labelRef}
            className="flex items-center gap-1.5"
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '13px',
              fontWeight: 300,
              letterSpacing: '0.04em',
            }}
          >
            {hotspot.direction === 'left' && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            )}
            {hotspot.name}
            {hotspot.direction === 'right' && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </span>
        </span>
      </div>
    </div>
  );
}
