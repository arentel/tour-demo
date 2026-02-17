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
    logoutAdmin,
  } = useTour();

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      if (isAdminOpen) {
        logoutAdmin();
      } else {
        setIsAdminOpen(true);
      }
    } else {
      setShowLoginModal(true);
    }
  };

  const getAdminLabel = () => {
    if (!isAdminAuthenticated) return 'ADMIN';
    if (isAdminOpen) return 'CERRAR';
    return 'ADMIN';
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
            className={`block w-7 h-[1.5px] bg-white/90 transition-all duration-300 ease-out ${
              isMenuOpen ? 'rotate-45 translate-y-[6.5px]' : 'group-hover:w-5'
            }`}
          />
          <span
            className={`block w-7 h-[1.5px] bg-white/90 transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-0 scale-0' : ''
            }`}
          />
          <span
            className={`block w-7 h-[1.5px] bg-white/90 transition-all duration-300 ease-out ${
              isMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : 'group-hover:w-5'
            }`}
          />
        </button>

        {/* Center logo - larger */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-12 md:h-14 w-auto brightness-0 invert drop-shadow-lg"
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
          {getAdminLabel()}
        </button>
      </header>

      {/* Menu overlay with progressive edge blur */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-700 ease-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Layer 1: Edge gradients */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            background: `
              linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 70%),
              linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 35%),
              linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 35%),
              linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 35%)
            `,
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Layer 2: Backdrop blur */}
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            backdropFilter: isMenuOpen ? 'blur(10px)' : 'blur(0px)',
            WebkitBackdropFilter: isMenuOpen ? 'blur(10px)' : 'blur(0px)',
            transitionDelay: '80ms',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Layer 3: Radial vignette */}
        <div
          className="absolute inset-0 transition-opacity duration-600 ease-out"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)',
            transitionDelay: '120ms',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Scene list */}
        <nav className="relative z-10 flex flex-col items-start justify-center h-full pl-12 md:pl-20 gap-1">
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
                animationDelay: isMenuOpen ? `${index * 0.07}s` : '0s',
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
