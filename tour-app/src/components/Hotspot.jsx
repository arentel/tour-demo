import { useState, useRef, useEffect } from 'react';
import { useTour } from '../context/TourContext';

export default function Hotspot({ hotspot, isActive = false, onActivate }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToScene } = useTour();
  const labelRef = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const touchedRef = useRef(false);

  const hasDirection = !!hotspot.direction;
  const expanded = hovered || isActive;

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

  // With direction: dot hides → text+arrow centered across full pill
  // Without direction: dot stays → text flows after dot
  const expandedWidth = hasDirection
    ? labelWidth + 32
    : 38 + labelWidth + 16;

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
        {/* Dot — collapses to 0 width when expanded + has direction */}
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
          /* With direction — label centered across full pill, no dot */
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
              style={labelStyle}
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
        ) : (
          /* Without direction — label flows after dot with proper spacing */
          <span
            ref={labelRef}
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
