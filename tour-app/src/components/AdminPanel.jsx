import { useState } from 'react';
import { useTour } from '../context/TourContext';

export default function AdminPanel() {
  const {
    isAdminOpen,
    tourData,
    addScene,
    removeScene,
    updateScene,
    addHotspot,
    removeHotspot,
    updateHotspot,
    resetData,
    navigateToScene,
    currentSceneId,
    isAdminAuthenticated,
    logoutAdmin,
  } = useTour();

  const [editingScene, setEditingScene] = useState(null);
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneImage, setNewSceneImage] = useState('');
  const [showAddScene, setShowAddScene] = useState(false);
  const [showAddHotspot, setShowAddHotspot] = useState(null);
  const [newHotspot, setNewHotspot] = useState({
    name: '',
    x: 50,
    y: 50,
    targetScene: '',
  });

  const handleAddScene = () => {
    if (!newSceneName.trim()) return;
    const id = newSceneName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    addScene({
      id,
      name: newSceneName,
      image: newSceneImage || '/scenes/scene-lobby.jpg',
      hotspots: [],
    });
    setNewSceneName('');
    setNewSceneImage('');
    setShowAddScene(false);
  };

  const handleAddHotspot = (sceneId) => {
    if (!newHotspot.name.trim()) return;
    const id = `hs-${sceneId}-${Date.now()}`;
    addHotspot(sceneId, {
      ...newHotspot,
      id,
      targetScene: newHotspot.targetScene || null,
    });
    setNewHotspot({ name: '', x: 50, y: 50, targetScene: '' });
    setShowAddHotspot(null);
  };

  const handleImageUpload = (sceneId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateScene(sceneId, { image: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleNewSceneImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewSceneImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  if (!isAdminOpen || !isAdminAuthenticated) return null;

  // Shared input style
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.85)',
  };

  return (
    <div
      className="fixed top-20 right-0 bottom-0 w-96 z-30 flex flex-col"
      style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-white/80 text-sm font-light tracking-[0.1em] uppercase">
          Administrador
        </h2>
        <button
          onClick={logoutAdmin}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.1em' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          title="Cerrar sesión"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          SALIR
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto admin-scroll p-5 space-y-3">
        {/* Reset button */}
        <button
          onClick={() => {
            if (confirm('Esto restaurará los datos por defecto. ¿Continuar?')) {
              resetData();
            }
          }}
          className="w-full py-2 px-4 rounded-lg text-xs font-light tracking-wide transition-colors"
          style={{
            background: 'rgba(180,80,80,0.08)',
            border: '1px solid rgba(180,80,80,0.15)',
            color: 'rgba(220,160,160,0.7)',
          }}
        >
          Restaurar datos por defecto
        </button>

        {/* Scenes */}
        {tourData.scenes.map((scene) => (
          <div
            key={scene.id}
            className="overflow-hidden rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Scene header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: currentSceneId === scene.id ? 'rgba(255,255,255,0.04)' : 'transparent',
              }}
              onClick={() => {
                setEditingScene(editingScene === scene.id ? null : scene.id);
                navigateToScene(scene.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <img src={scene.image} alt={scene.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white/80 text-sm font-light">{scene.name}</h3>
                  <p className="text-white/25 text-[10px] font-light">
                    {scene.hotspots.length} hotspot{scene.hotspots.length !== 1 && 's'}
                  </p>
                </div>
              </div>
              <svg
                className="w-4 h-4 transition-transform"
                style={{
                  color: 'rgba(255,255,255,0.25)',
                  transform: editingScene === scene.id ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* Scene details */}
            {editingScene === scene.id && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-white/30 text-[10px] tracking-[0.1em] uppercase block mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={scene.name}
                    onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm font-light focus:outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="text-white/30 text-[10px] tracking-[0.1em] uppercase block mb-1.5">Imagen</label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors" style={inputStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className="text-white/35 text-xs font-light">Subir imagen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(scene.id, e)} />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/30 text-[10px] tracking-[0.1em] uppercase">Hotspots</label>
                    <button
                      onClick={() => setShowAddHotspot(showAddHotspot === scene.id ? null : scene.id)}
                      className="text-white/40 text-[10px] tracking-wider uppercase hover:text-white/70 transition-colors"
                    >
                      + Añadir
                    </button>
                  </div>

                  {showAddHotspot === scene.id && (
                    <div className="rounded-lg p-3 mb-2 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input
                        type="text"
                        placeholder="Nombre del hotspot"
                        value={newHotspot.name}
                        onChange={(e) => setNewHotspot({ ...newHotspot, name: e.target.value })}
                        className="w-full rounded px-2 py-1.5 text-xs font-light focus:outline-none"
                        style={inputStyle}
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-white/25 text-[9px] block mb-0.5">X (%)</label>
                          <input type="number" min="0" max="100" value={newHotspot.x}
                            onChange={(e) => setNewHotspot({ ...newHotspot, x: Number(e.target.value) })}
                            className="w-full rounded px-2 py-1.5 text-xs font-light focus:outline-none" style={inputStyle} />
                        </div>
                        <div className="flex-1">
                          <label className="text-white/25 text-[9px] block mb-0.5">Y (%)</label>
                          <input type="number" min="0" max="100" value={newHotspot.y}
                            onChange={(e) => setNewHotspot({ ...newHotspot, y: Number(e.target.value) })}
                            className="w-full rounded px-2 py-1.5 text-xs font-light focus:outline-none" style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/25 text-[9px] block mb-0.5">Escena destino</label>
                        <select value={newHotspot.targetScene}
                          onChange={(e) => setNewHotspot({ ...newHotspot, targetScene: e.target.value })}
                          className="w-full rounded px-2 py-1.5 text-xs font-light focus:outline-none" style={inputStyle}>
                          <option value="" style={{ background: '#0a0a0a' }}>Sin destino</option>
                          {tourData.scenes.filter((s) => s.id !== scene.id).map((s) => (
                            <option key={s.id} value={s.id} style={{ background: '#0a0a0a' }}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleAddHotspot(scene.id)}
                          className="flex-1 py-1.5 rounded text-[10px] font-light tracking-wider uppercase transition-colors"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                          Añadir
                        </button>
                        <button onClick={() => setShowAddHotspot(null)}
                          className="flex-1 py-1.5 rounded text-[10px] font-light tracking-wider uppercase transition-colors"
                          style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {scene.hotspots.map((hs) => (
                    <div key={hs.id} className="rounded-lg p-3 mb-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs font-light">{hs.name}</span>
                        <button onClick={() => removeHotspot(scene.id, hs.id)} className="transition-colors" style={{ color: 'rgba(180,80,80,0.5)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input type="text" value={hs.name}
                          onChange={(e) => updateHotspot(scene.id, hs.id, { name: e.target.value })}
                          className="w-full rounded px-2 py-1 text-xs font-light focus:outline-none" style={inputStyle} />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-white/25 text-[9px]">X: {hs.x}%</label>
                            <input type="range" min="0" max="100" value={hs.x}
                              onChange={(e) => updateHotspot(scene.id, hs.id, { x: Number(e.target.value) })}
                              className="w-full h-[2px]" style={{ accentColor: 'rgba(255,255,255,0.5)' }} />
                          </div>
                          <div className="flex-1">
                            <label className="text-white/25 text-[9px]">Y: {hs.y}%</label>
                            <input type="range" min="0" max="100" value={hs.y}
                              onChange={(e) => updateHotspot(scene.id, hs.id, { y: Number(e.target.value) })}
                              className="w-full h-[2px]" style={{ accentColor: 'rgba(255,255,255,0.5)' }} />
                          </div>
                        </div>
                        <select value={hs.targetScene || ''}
                          onChange={(e) => updateHotspot(scene.id, hs.id, { targetScene: e.target.value || null })}
                          className="w-full rounded px-2 py-1 text-xs font-light focus:outline-none" style={inputStyle}>
                          <option value="" style={{ background: '#0a0a0a' }}>Sin destino</option>
                          {tourData.scenes.filter((s) => s.id !== scene.id).map((s) => (
                            <option key={s.id} value={s.id} style={{ background: '#0a0a0a' }}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar la escena "${scene.name}"?`)) {
                      setEditingScene(null);
                      removeScene(scene.id);
                    }
                  }}
                  className="w-full py-2 rounded-lg text-[10px] font-light tracking-wider uppercase transition-colors"
                  style={{ background: 'rgba(180,80,80,0.06)', border: '1px solid rgba(180,80,80,0.12)', color: 'rgba(220,160,160,0.6)' }}
                >
                  Eliminar escena
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add scene */}
        {!showAddScene ? (
          <button
            onClick={() => setShowAddScene(true)}
            className="w-full py-3 rounded-xl text-white/25 hover:text-white/45 transition-colors text-xs font-light tracking-wider"
            style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
          >
            + Añadir nueva escena
          </button>
        ) : (
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 className="text-white/60 text-xs font-light tracking-[0.1em] uppercase">Nueva escena</h4>
            <input type="text" placeholder="Nombre de la escena" value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm font-light focus:outline-none" style={inputStyle} />
            <label className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors" style={inputStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-white/35 text-xs font-light">
                {newSceneImage ? 'Imagen seleccionada' : 'Subir imagen'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleNewSceneImageUpload} />
            </label>
            <div className="flex gap-2">
              <button onClick={handleAddScene}
                className="flex-1 py-2 rounded-lg text-xs font-light tracking-wide transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                Crear
              </button>
              <button onClick={() => { setShowAddScene(false); setNewSceneName(''); setNewSceneImage(''); }}
                className="flex-1 py-2 rounded-lg text-xs font-light tracking-wide transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
