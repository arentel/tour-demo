import { useState, useRef, useEffect } from 'react';
import { useTour } from '../context/TourContext';

const ArrowLeft = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function Hotspot({ hotspot, screenX, screenY, isActive = false, onActivate }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToScene } = useTour();
  const measureRef = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const touchedRef = useRef(false);

  const hasDirection = !!hotspot.direction;
  const expanded = hovered || isActive;

  // Viewport-mapped position (from PanoramaViewer)
  const posX = screenX ?? hotspot.x;
  const posY = screenY ?? hotspot.y;

  // Measure from a hidden span that's never constrained by the pill
  useEffect(() => {
    if (measureRef.current) {
      requestAnimationFrame(() => {
        if (measureRef.current) {
          setLabelWidth(measureRef.current.scrollWidth);
        }
      });
    }
  }, [hotspot.name, hotspot.direction]);

  const handleTouchStart = (e) => {
    touchedRef.current = true;
    e.stopPropagation();
  };

  const handleClick = () => {
    if (touchedRef.current) {
      touchedRef.current = false;
      if (!isActive) {
        onActivate?.(hotspot.id);
      } else {
        if (hotspot.targetScene) {
          navigateToScene(hotspot.targetScene);
        }
      }
      return;
    }
    if (hotspot.targetScene) {
      navigateToScene(hotspot.targetScene);
    }
  };

  // Width calculation uses the hidden measurement
  const expandedWidth = hasDirection
    ? labelWidth + 32   // 16px padding each side, no dot
    : 38 + labelWidth + 16; // dot(38) + text + 16px right

  const labelStyle = {
    color: 'rgba(255,255,255,0.95)',
    fontSize: '13px',
    fontWeight: 300,
    letterSpacing: '0.04em',
  };

  return (
    <div
      data-hotspot
      className="absolute z-10"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onTouchStart={handleTouchStart}
    >
      {/* Hidden measurement span — always at intrinsic width, never clipped */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          ...labelStyle,
        }}
      >
        {hotspot.direction === 'left' && <ArrowLeft />}
        {hotspot.name}
        {hotspot.direction === 'right' && <ArrowRight />}
      </span>

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

      {/* Main pill */}
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
        {/* Dot — collapses when expanded + has direction */}
        <div
          className="flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            width: (expanded && hasDirection) ? 0 : 38,
            minWidth: (expanded && hasDirection) ? 0 : 38,
            height: 38,
            opacity: (expanded && hasDirection) ? 0 : 1,
            transition: 'width 0.35s ease, min-width 0.35s ease, opacity 0.25s ease',
          }}
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

        {hasDirection ? (
          /* With direction — centered across full pill */
          <span
            className="absolute inset-0 whitespace-nowrap flex items-center justify-center pointer-events-none"
            style={{
              opacity: expanded ? 1 : 0,
              transition: 'opacity 0.35s ease 0.1s',
            }}
          >
            <span className="flex items-center gap-1.5" style={labelStyle}>
              {hotspot.direction === 'left' && <ArrowLeft />}
              {hotspot.name}
              {hotspot.direction === 'right' && <ArrowRight />}
            </span>
          </span>
        ) : (
          /* Without direction — flows after dot */
          <span
            className="whitespace-nowrap flex items-center"
            style={{
              ...labelStyle,
              height: 40,
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 0.35s ease 0.1s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.05s',
            }}
          >
            {hotspot.name}
          </span>
        )}
      </div>
    </div>
  );
}
