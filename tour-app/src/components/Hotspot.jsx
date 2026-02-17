import { useState, useRef, useEffect } from 'react';
import { useTour } from '../context/TourContext';

export default function Hotspot({ hotspot }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToScene } = useTour();
  const labelRef = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);

  // Measure the actual text width once on mount and when name changes
  useEffect(() => {
    if (labelRef.current) {
      setLabelWidth(labelRef.current.scrollWidth);
    }
  }, [hotspot.name]);

  const handleClick = () => {
    if (hotspot.targetScene) {
      navigateToScene(hotspot.targetScene);
    }
  };

  // Expanded width = circle (40) + gap (8) + text + padding right (16)
  const expandedWidth = 40 + 8 + labelWidth + 16;

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Pulse ring - fades out on hover */}
      <div
        className="absolute top-1/2 left-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div
          className="hotspot-pulse-ring rounded-full border border-white/50"
          style={{ width: 48, height: 48 }}
        />
      </div>

      {/* Main container - animates width smoothly */}
      <div
        className="relative flex items-center cursor-pointer select-none overflow-hidden"
        style={{
          width: hovered ? expandedWidth : 40,
          height: 40,
          borderRadius: 20,
          border: '1.5px solid rgba(255,255,255,0.7)',
          background: hovered
            ? 'rgba(0,0,0,0.45)'
            : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'width 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Center dot */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          <div
            className={`rounded-full bg-white ${hovered ? '' : 'hotspot-dot-pulse'}`}
            style={{
              width: hovered ? 7 : 9,
              height: hovered ? 7 : 9,
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
          />
        </div>

        {/* Label */}
        <span
          ref={labelRef}
          className="text-white text-sm font-medium whitespace-nowrap pr-4"
          style={{
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
