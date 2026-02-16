import { useState } from 'react';
import { useTour } from '../context/TourContext';

export default function AdminPanel() {
  const {
    isAdminOpen,
    setIsAdminOpen,
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
      image: newSceneImage || '/scenes/scene-lobby.svg',
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

  if (!isAdminOpen) return null;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-96 z-30 flex flex-col bg-[#0d0d1a]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-white text-lg font-semibold tracking-wide">
          Panel de Administrador
        </h2>
        <button
          onClick={() => setIsAdminOpen(false)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto admin-scroll p-5 space-y-4">
        {/* Reset button */}
        <button
          onClick={() => {
            if (confirm('Esto restaurará los datos por defecto. ¿Continuar?')) {
              resetData();
            }
          }}
          className="w-full py-2 px-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Restaurar datos por defecto
        </button>

        {/* Scenes */}
        {tourData.scenes.map((scene) => (
          <div
            key={scene.id}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            {/* Scene header */}
            <div
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                currentSceneId === scene.id
                  ? 'bg-blue-500/20 border-b border-blue-500/30'
                  : 'hover:bg-white/5 border-b border-white/5'
              }`}
              onClick={() => {
                setEditingScene(editingScene === scene.id ? null : scene.id);
                navigateToScene(scene.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                  <img
                    src={scene.image}
                    alt={scene.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">{scene.name}</h3>
                  <p className="text-white/40 text-xs">
                    {scene.hotspots.length} hotspot{scene.hotspots.length !== 1 && 's'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-white/40 transition-transform ${
                    editingScene === scene.id ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Scene details */}
            {editingScene === scene.id && (
              <div className="p-4 space-y-3">
                {/* Scene name edit */}
                <div>
                  <label className="text-white/50 text-xs block mb-1">
                    Nombre de la escena
                  </label>
                  <input
                    type="text"
                    value={scene.name}
                    onChange={(e) =>
                      updateScene(scene.id, { name: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Image upload */}
                <div>
                  <label className="text-white/50 text-xs block mb-1">
                    Imagen panorámica
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white/10 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/15 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white/50"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className="text-white/50 text-sm">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(scene.id, e)}
                    />
                  </label>
                </div>

                {/* Hotspots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/50 text-xs">Hotspots</label>
                    <button
                      onClick={() =>
                        setShowAddHotspot(
                          showAddHotspot === scene.id ? null : scene.id
                        )
                      }
                      className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
                    >
                      + Añadir
                    </button>
                  </div>

                  {/* Add hotspot form */}
                  {showAddHotspot === scene.id && (
                    <div className="bg-white/5 rounded-lg p-3 mb-2 space-y-2 border border-white/10">
                      <input
                        type="text"
                        placeholder="Nombre del hotspot"
                        value={newHotspot.name}
                        onChange={(e) =>
                          setNewHotspot({ ...newHotspot, name: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-white/40 text-[10px] block mb-0.5">
                            X (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newHotspot.x}
                            onChange={(e) =>
                              setNewHotspot({
                                ...newHotspot,
                                x: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-white/40 text-[10px] block mb-0.5">
                            Y (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newHotspot.y}
                            onChange={(e) =>
                              setNewHotspot({
                                ...newHotspot,
                                y: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/40 text-[10px] block mb-0.5">
                          Escena destino
                        </label>
                        <select
                          value={newHotspot.targetScene}
                          onChange={(e) =>
                            setNewHotspot({
                              ...newHotspot,
                              targetScene: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="" className="bg-gray-900">
                            Sin destino (info)
                          </option>
                          {tourData.scenes
                            .filter((s) => s.id !== scene.id)
                            .map((s) => (
                              <option
                                key={s.id}
                                value={s.id}
                                className="bg-gray-900"
                              >
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddHotspot(scene.id)}
                          className="flex-1 py-1.5 bg-blue-500/30 text-blue-300 rounded text-xs hover:bg-blue-500/40 transition-colors"
                        >
                          Añadir
                        </button>
                        <button
                          onClick={() => setShowAddHotspot(null)}
                          className="flex-1 py-1.5 bg-white/10 text-white/50 rounded text-xs hover:bg-white/15 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hotspot list */}
                  {scene.hotspots.map((hs) => (
                    <div
                      key={hs.id}
                      className="bg-white/5 rounded-lg p-3 mb-2 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-xs font-medium">
                          {hs.name}
                        </span>
                        <button
                          onClick={() => removeHotspot(scene.id, hs.id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={hs.name}
                          onChange={(e) =>
                            updateHotspot(scene.id, hs.id, {
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-white/40 text-[10px]">
                              X: {hs.x}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={hs.x}
                              onChange={(e) =>
                                updateHotspot(scene.id, hs.id, {
                                  x: Number(e.target.value),
                                })
                              }
                              className="w-full h-1 accent-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-white/40 text-[10px]">
                              Y: {hs.y}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={hs.y}
                              onChange={(e) =>
                                updateHotspot(scene.id, hs.id, {
                                  y: Number(e.target.value),
                                })
                              }
                              className="w-full h-1 accent-blue-500"
                            />
                          </div>
                        </div>
                        <select
                          value={hs.targetScene || ''}
                          onChange={(e) =>
                            updateHotspot(scene.id, hs.id, {
                              targetScene: e.target.value || null,
                            })
                          }
                          className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="" className="bg-gray-900">
                            Sin destino
                          </option>
                          {tourData.scenes
                            .filter((s) => s.id !== scene.id)
                            .map((s) => (
                              <option
                                key={s.id}
                                value={s.id}
                                className="bg-gray-900"
                              >
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delete scene */}
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar la escena "${scene.name}"?`
                      )
                    ) {
                      setEditingScene(null);
                      removeScene(scene.id);
                    }
                  }}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
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
            className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-white/40 hover:text-white/60 hover:border-white/30 transition-colors text-sm"
          >
            + Añadir nueva escena
          </button>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
            <h4 className="text-white text-sm font-medium">Nueva escena</h4>
            <input
              type="text"
              placeholder="Nombre de la escena"
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
            <label className="flex items-center gap-2 cursor-pointer bg-white/10 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/15 transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/50"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-white/50 text-sm">
                {newSceneImage ? 'Imagen seleccionada' : 'Subir imagen panorámica'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleNewSceneImageUpload}
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleAddScene}
                className="flex-1 py-2 bg-blue-500/30 text-blue-300 rounded-lg text-sm hover:bg-blue-500/40 transition-colors"
              >
                Crear escena
              </button>
              <button
                onClick={() => {
                  setShowAddScene(false);
                  setNewSceneName('');
                  setNewSceneImage('');
                }}
                className="flex-1 py-2 bg-white/10 text-white/50 rounded-lg text-sm hover:bg-white/15 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
