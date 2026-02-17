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
    if (isAdminOpen) return 'CERRAR SESIÓN';
    return 'ADMIN';
  };

  return (
    <>
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

        {/* Hamburger button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-out ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-0 scale-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-out ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>

        {/* Center logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* Admin button */}
        <button
          onClick={handleAdminClick}
          className={`relative z-10 ml-auto flex items-center gap-2 transition-colors duration-200 text-sm font-medium tracking-wide ${
            isAdminAuthenticated
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-white/70 hover:text-white'
          }`}
        >
          {isAdminAuthenticated && (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
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
        {/* Layer 1: Edge gradients - dark from all edges, transparent center */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            background: `
              linear-gradient(to right, rgba(0,0,0,0.85) 0%, transparent 50%),
              linear-gradient(to left, rgba(0,0,0,0.6) 0%, transparent 40%),
              linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 40%),
              linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)
            `,
            transitionDelay: '0ms',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Layer 2: Center backdrop blur that fades in slightly after edges */}
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            backdropFilter: isMenuOpen ? 'blur(12px)' : 'blur(0px)',
            WebkitBackdropFilter: isMenuOpen ? 'blur(12px)' : 'blur(0px)',
            transitionDelay: '100ms',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Layer 3: Radial vignette overlay for depth */}
        <div
          className="absolute inset-0 transition-opacity duration-600 ease-out"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
            transitionDelay: '150ms',
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Scene list */}
        <nav className="relative z-10 flex flex-col items-start justify-center h-full pl-16 gap-2">
          {tourData.scenes.map((scene, index) => (
            <button
              key={scene.id}
              className={`menu-item-animate text-3xl md:text-5xl font-light tracking-wider transition-all duration-300 hover:tracking-widest hover:scale-105 origin-left ${
                currentSceneId === scene.id
                  ? 'text-white'
                  : 'text-white/50 hover:text-white'
              }`}
              style={{
                animationDelay: isMenuOpen ? `${index * 0.08}s` : '0s',
                animationPlayState: isMenuOpen ? 'running' : 'paused',
              }}
              onClick={() => navigateToScene(scene.id)}
            >
              <span className="inline-block transition-transform duration-300 hover:translate-x-4">
                {scene.name}
              </span>
              {currentSceneId === scene.id && (
                <span className="ml-4 inline-block w-2 h-2 rounded-full bg-white" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
