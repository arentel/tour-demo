import { useTour } from '../context/TourContext';

export default function Header() {
  const {
    isMenuOpen,
    setIsMenuOpen,
    tourData,
    navigateToScene,
    currentSceneId,
    setIsAdminOpen,
    isAdminOpen,
  } = useTour();

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
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          className="relative z-10 ml-auto text-white/70 hover:text-white transition-colors duration-200 text-sm font-medium tracking-wide"
        >
          {isAdminOpen ? 'CERRAR ADMIN' : 'ADMIN'}
        </button>
      </header>

      {/* Menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Blurred background */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-lg transition-all duration-500 ${
            isMenuOpen ? 'backdrop-blur-lg' : 'backdrop-blur-none'
          }`}
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
