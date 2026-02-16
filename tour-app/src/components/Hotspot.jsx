import { useState } from 'react';
import { useTour } from '../context/TourContext';

export default function Hotspot({ hotspot }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToScene } = useTour();

  const handleClick = () => {
    if (hotspot.targetScene) {
      navigateToScene(hotspot.targetScene);
    }
  };

  return (
    <div
      className="absolute z-10 flex items-center"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="relative flex items-center cursor-pointer select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Outer pulse ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="hotspot-pulse-ring rounded-full border border-white/60"
            style={{ width: 44, height: 44 }}
          />
        </div>

        {/* Main circle */}
        <div
          className="relative flex items-center justify-center rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-[2px] transition-all duration-300 ease-out"
          style={{
            width: hovered ? 'auto' : 40,
            height: 40,
            minWidth: 40,
            paddingLeft: hovered ? 16 : 0,
            paddingRight: hovered ? 16 : 0,
            borderRadius: hovered ? 20 : 9999,
          }}
        >
          {/* Center dot */}
          <div
            className={`rounded-full bg-white transition-all duration-300 ${
              hovered ? 'w-2 h-2 mr-2 flex-shrink-0' : 'w-2.5 h-2.5 hotspot-dot-pulse'
            }`}
          />

          {/* Label */}
          <span
            className="text-white text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
            style={{
              maxWidth: hovered ? 200 : 0,
              opacity: hovered ? 1 : 0,
            }}
          >
            {hotspot.name}
          </span>
        </div>
      </div>
    </div>
  );
}
