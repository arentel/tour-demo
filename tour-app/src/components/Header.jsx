import { useTour } from '../context/TourContext';

export default function Header() {
  const {
    isMenuOpen,
    setIsMenuOpen,
    tourData,
    navigateToScene,
    currentSceneId,
    isAdminAuthenticated,
    isAdminOpen,
    setIsAdminOpen,
    setShowLoginModal,
  } = useTour();

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(!isAdminOpen);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 md:px-10">
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)',
          }}
        />

        {/* Hamburger button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-[5px] group"
          aria-label="Menu"
        >
          <span
            className={`block w-7 h-[2px] bg-white/90 transition-all duration-300 ease-out ${
              isMenuOpen ? 'rotate-45 translate-y-[7px]' : 'group-hover:w-5'
            }`}
          />
          <span
            className={`block w-7 h-[2px] bg-white/90 transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-0 scale-0' : ''
            }`}
          />
          <span
            className={`block w-7 h-[2px] bg-white/90 transition-all duration-300 ease-out ${
              isMenuOpen ? '-rotate-45 -translate-y-[7px]' : 'group-hover:w-5'
            }`}
          />
        </button>

        {/* Center logo - larger */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <object
            data="/logo.svg"
            type="image/svg+xml"
            className="h-12 md:h-14 w-auto drop-shadow-lg pointer-events-none"
            aria-label="Logo"
          />
        </div>

        {/* Admin button */}
        <button
          onClick={handleAdminClick}
          className="relative z-10 ml-auto flex items-center gap-2.5 transition-all duration-200 text-[11px] font-light tracking-[0.2em] uppercase"
          style={{
            color: isAdminAuthenticated
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(255,255,255,0.5)',
          }}
        >
          {isAdminAuthenticated && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          )}
          ADMIN
        </button>
      </header>

      {/* Menu overlay with progressive edge blur */}
      <div
        className={`fixed inset-0 z-40 ${
          isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Layer 1: Edge gradients - appears first (0ms) */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            transition: isMenuOpen
              ? 'opacity 0.5s ease-out 0ms'
              : 'opacity 0.4s ease-in 0ms',
            background: `
              linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 70%),
              linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 35%),
              linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 35%),
              linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 35%)
            `,
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Layer 2: Backdrop blur - starts early (50ms), builds slowly */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: isMenuOpen ? 'blur(12px)' : 'blur(0px)',
            WebkitBackdropFilter: isMenuOpen ? 'blur(12px)' : 'blur(0px)',
            transition: isMenuOpen
              ? 'backdrop-filter 0.9s ease-out 50ms, -webkit-backdrop-filter 0.9s ease-out 50ms'
              : 'backdrop-filter 0.3s ease-in 0ms, -webkit-backdrop-filter 0.3s ease-in 0ms',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Layer 3: Radial vignette - appears with slight delay (150ms) */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            transition: isMenuOpen
              ? 'opacity 0.7s ease-out 150ms'
              : 'opacity 0.3s ease-in 0ms',
            background: 'radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Scene list - appears after blur is already building (300ms delay) */}
        <nav
          className="relative z-10 flex flex-col items-start justify-center h-full pl-12 md:pl-20 gap-1"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            transition: isMenuOpen
              ? 'opacity 0.5s ease-out 300ms'
              : 'opacity 0.25s ease-in 0ms',
          }}
        >
          <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-4 font-light">
            Espacios
          </span>
          {tourData.scenes.map((scene, index) => (
            <button
              key={scene.id}
              className={`menu-item-animate text-2xl md:text-4xl lg:text-5xl font-extralight tracking-[0.08em] transition-all duration-400 origin-left ${
                currentSceneId === scene.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/90'
              }`}
              style={{
                animationDelay: isMenuOpen ? `${0.3 + index * 0.07}s` : '0s',
                animationPlayState: isMenuOpen ? 'running' : 'paused',
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() => navigateToScene(scene.id)}
            >
              <span className="inline-block transition-transform duration-400 hover:translate-x-3">
                {scene.name}
              </span>
              {currentSceneId === scene.id && (
                <span className="ml-4 inline-block w-6 h-[1px] bg-white/70 align-middle" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
