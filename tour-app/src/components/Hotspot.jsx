import { useState, useRef, useEffect } from 'react';
import { useTour } from '../context/TourContext';

export default function Hotspot({ hotspot }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToScene } = useTour();
  const labelRef = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);

  useEffect(() => {
    if (labelRef.current) {
      // Use requestAnimationFrame to ensure layout is complete before measuring
      requestAnimationFrame(() => {
        if (labelRef.current) {
          setLabelWidth(labelRef.current.scrollWidth);
        }
      });
    }
  }, [hotspot.name]);

  const handleClick = () => {
    if (hotspot.targetScene) {
      navigateToScene(hotspot.targetScene);
    }
  };

  const expandedWidth = 38 + labelWidth + 12;

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Pulse ring */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          top: '50%',
          left: 20,
          opacity: hovered ? 0 : 1,
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
          width: hovered ? expandedWidth : 40,
          height: 40,
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.6)',
          background: hovered
            ? 'rgba(0,0,0,0.55)'
            : 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'width 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease, border-color 0.35s ease',
          borderColor: hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
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
            className={`rounded-full bg-white ${hovered ? '' : 'hotspot-dot-pulse'}`}
            style={{
              width: hovered ? 6 : 8,
              height: hovered ? 6 : 8,
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
          />
        </div>

        {/* Label */}
        <span
          ref={labelRef}
          className="whitespace-nowrap flex items-center"
          style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '13px',
            fontWeight: 300,
            letterSpacing: '0.04em',
            height: 40,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 0.35s ease 0.1s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.05s',
          }}
        >
          {hotspot.name}
        </span>
      </div>
    </div>
  );
}
