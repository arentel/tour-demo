import { useState, useRef, useCallback, useEffect } from 'react';
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
    uploadImage,
    resetData,
    isAdminAuthenticated,
    logoutAdmin,
  } = useTour();

  const [selectedSceneId, setSelectedSceneId] = useState(
    tourData.scenes[0]?.id || null
  );
  const [placingHotspot, setPlacingHotspot] = useState(false);
  const [newHotspotName, setNewHotspotName] = useState('');
  const [newHotspotTarget, setNewHotspotTarget] = useState('');
  const [newHotspotDirection, setNewHotspotDirection] = useState('');
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [showAddScene, setShowAddScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneImage, setNewSceneImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef(null);
  const newSceneFileRef = useRef(null);

  // Drag state
  const dragRef = useRef(null); // { hotspotId, startX, startY, moved }
  const [dragPos, setDragPos] = useState(null); // { id, x, y } - live position while dragging

  const handleDragStart = (e, hotspotId) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      hotspotId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  };

  const handleDragMove = useCallback((e) => {
    if (!dragRef.current || !imageRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && Math.abs(dx) + Math.abs(dy) > 4) {
      dragRef.current.moved = true;
    }
    if (dragRef.current.moved) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const y = Math.min(100, Math.max(0, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
      setDragPos({ id: dragRef.current.hotspotId, x, y });
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    if (dragRef.current.moved && dragPos) {
      updateHotspot(selectedSceneId, dragPos.id, { x: dragPos.x, y: dragPos.y });
    }
    if (!dragRef.current.moved) {
      // It was a click, not a drag - toggle editing
      const id = dragRef.current.hotspotId;
      setEditingHotspot((prev) => (prev === id ? null : id));
    }
    dragRef.current = null;
    setDragPos(null);
  }, [dragPos, selectedSceneId, updateHotspot]);

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  if (!isAdminOpen || !isAdminAuthenticated) return null;

  const selectedScene = tourData.scenes.find((s) => s.id === selectedSceneId);

  const getHotspotPos = (hs) => {
    if (dragPos && dragPos.id === hs.id) return { x: dragPos.x, y: dragPos.y };
    return { x: hs.x, y: hs.y };
  };

  const handleImageClick = (e) => {
    if (!placingHotspot || !selectedScene) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const id = `hs-${selectedSceneId}-${Date.now()}`;
    addHotspot(selectedSceneId, {
      id,
      name: newHotspotName || `Hotspot ${selectedScene.hotspots.length + 1}`,
      x,
      y,
      targetScene: newHotspotTarget || null,
      direction: newHotspotDirection || null,
    });
    setPlacingHotspot(false);
    setNewHotspotName('');
    setNewHotspotTarget('');
    setNewHotspotDirection('');
  };

  const handleImageUpload = async (sceneId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(sceneId, file);
      updateScene(sceneId, { image: url });
    } catch (err) {
      console.error('Upload failed:', err);
      // Fallback to data URL
      const reader = new FileReader();
      reader.onload = (ev) => updateScene(sceneId, { image: ev.target.result });
      reader.readAsDataURL(file);
    }
    setUploading(false);
  };

  const handleNewSceneImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    newSceneFileRef.current = file;
    // Show a preview via data URL
    const reader = new FileReader();
    reader.onload = (ev) => setNewSceneImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddScene = async () => {
    if (!newSceneName.trim()) return;
    const id = newSceneName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    let imageUrl = newSceneImage || '/scenes/scene-lobby.jpg';

    // Upload to Firebase Storage if a file was selected
    if (newSceneFileRef.current) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(id, newSceneFileRef.current);
      } catch (err) {
        console.error('New scene upload failed:', err);
        // Keep the data URL preview as fallback
      }
      setUploading(false);
    }

    addScene({
      id,
      name: newSceneName,
      image: imageUrl,
      hotspots: [],
    });
    setSelectedSceneId(id);
    setNewSceneName('');
    setNewSceneImage('');
    newSceneFileRef.current = null;
    setShowAddScene(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left sidebar - scene list */}
      <div
        className="w-72 flex-shrink-0 flex flex-col h-full"
        style={{
          background: '#fafafa',
          borderRight: '1px solid #e8e8e8',
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #e8e8e8' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#111', color: '#fff' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-medium" style={{ color: '#111' }}>Tour Virtual</h1>
              <p className="text-[10px]" style={{ color: '#999' }}>{tourData.scenes.length} escenas</p>
            </div>
          </div>
          <button
            onClick={logoutAdmin}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#999', background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f0f0';
              e.currentTarget.style.color = '#666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#999';
            }}
            title="Cerrar sesión"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>

        {/* Scene list */}
        <div className="flex-1 overflow-y-auto admin-scroll-light p-3 space-y-1">
          {tourData.scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                setSelectedSceneId(scene.id);
                setEditingHotspot(null);
                setPlacingHotspot(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
              style={{
                background: selectedSceneId === scene.id ? '#fff' : 'transparent',
                boxShadow: selectedSceneId === scene.id ? '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: '1px solid #e8e8e8' }}
              >
                <img src={scene.image} alt={scene.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: selectedSceneId === scene.id ? '#111' : '#555' }}
                >
                  {scene.name}
                </p>
                <p className="text-[11px]" style={{ color: '#aaa' }}>
                  {scene.hotspots.length} hotspot{scene.hotspots.length !== 1 && 's'}
                </p>
              </div>
            </button>
          ))}

          {/* Add scene button / form */}
          {!showAddScene ? (
            <button
              onClick={() => setShowAddScene(true)}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl transition-colors text-xs font-medium"
              style={{
                color: '#aaa',
                border: '1px dashed #ddd',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.borderColor = '#bbb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#aaa';
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Añadir escena
            </button>
          ) : (
            <div
              className="rounded-xl p-3.5 space-y-2.5"
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <input
                type="text"
                placeholder="Nombre de la escena"
                value={newSceneName}
                onChange={(e) => setNewSceneName(e.target.value)}
                autoFocus
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ border: '1px solid #e0e0e0', color: '#333' }}
                onFocus={(e) => (e.target.style.borderColor = '#bbb')}
                onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
              />
              <label
                className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors"
                style={{ border: '1px solid #e0e0e0', color: '#888' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span className="text-xs">
                  {newSceneImage ? 'Imagen seleccionada' : 'Subir imagen'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleNewSceneImageUpload} />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleAddScene}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: '#111', color: '#fff' }}
                >
                  Crear
                </button>
                <button
                  onClick={() => { setShowAddScene(false); setNewSceneName(''); setNewSceneImage(''); }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: '#f0f0f0', color: '#666' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-3 space-y-2" style={{ borderTop: '1px solid #e8e8e8' }}>
          <button
            onClick={() => {
              if (confirm('Esto restaurará los datos por defecto. ¿Continuar?')) {
                resetData();
                setSelectedSceneId(tourData.scenes[0]?.id || null);
              }
            }}
            className="w-full py-2 px-3 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
            style={{ color: '#c44', background: '#fff5f5', border: '1px solid #ffe0e0' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ffeded')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff5f5')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 105.64-12.18L1 10" />
            </svg>
            Restaurar datos por defecto
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full" style={{ background: '#f2f2f2' }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{
            background: '#fff',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          <div className="flex items-center gap-4">
            {selectedScene && (
              <>
                <h2 className="text-base font-medium" style={{ color: '#111' }}>
                  {selectedScene.name}
                </h2>
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: '#f5f5f5', color: '#888' }}
                >
                  {selectedScene.hotspots.length} hotspot{selectedScene.hotspots.length !== 1 && 's'}
                </span>
              </>
            )}
          </div>
          {selectedScene && (
            <div className="flex items-center gap-2">
              {/* Upload new image */}
              <label
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                style={{ background: '#f5f5f5', color: '#666' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#eee')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                {uploading ? 'Subiendo...' : 'Cambiar imagen'}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleImageUpload(selectedSceneId, e)} />
              </label>
              {/* Edit scene name */}
              <input
                type="text"
                value={selectedScene.name}
                onChange={(e) => updateScene(selectedSceneId, { name: e.target.value })}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium focus:outline-none"
                style={{ border: '1px solid #e0e0e0', color: '#333', width: 140 }}
                onFocus={(e) => (e.target.style.borderColor = '#bbb')}
                onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
              />
              {/* Delete scene */}
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar la escena "${selectedScene.name}"?`)) {
                    const remaining = tourData.scenes.filter((s) => s.id !== selectedSceneId);
                    setSelectedSceneId(remaining[0]?.id || null);
                    removeScene(selectedSceneId);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                style={{ color: '#c44', background: '#fff5f5', border: '1px solid #ffe0e0' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ffeded')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff5f5')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Image + hotspot editor area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Image preview with hotspots */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
            {selectedScene ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  ref={imageRef}
                  className="relative max-w-full max-h-full overflow-hidden rounded-xl"
                  style={{
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                    cursor: placingHotspot ? 'crosshair' : 'default',
                  }}
                  onClick={handleImageClick}
                >
                  <img
                    src={selectedScene.image}
                    alt={selectedScene.name}
                    className="block max-w-full max-h-[calc(100vh-160px)] object-contain select-none"
                    draggable={false}
                  />
                  {/* Render hotspots on image */}
                  {selectedScene.hotspots.map((hs) => {
                    const pos = getHotspotPos(hs);
                    const isDragging = dragPos && dragPos.id === hs.id;
                    return (
                      <div
                        key={hs.id}
                        className="absolute group"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: isDragging ? 50 : editingHotspot === hs.id ? 40 : 10,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                          style={{
                            background: isDragging ? '#333' : editingHotspot === hs.id ? '#111' : 'rgba(0,0,0,0.6)',
                            border: editingHotspot === hs.id || isDragging ? '2px solid #fff' : '2px solid rgba(255,255,255,0.8)',
                            boxShadow: isDragging
                              ? '0 0 0 4px rgba(17,17,17,0.4), 0 4px 12px rgba(0,0,0,0.4)'
                              : editingHotspot === hs.id
                                ? '0 0 0 3px #111, 0 2px 8px rgba(0,0,0,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.3)',
                            cursor: placingHotspot ? 'crosshair' : 'grab',
                            transform: isDragging ? 'scale(1.2)' : 'scale(1)',
                          }}
                          onMouseDown={(e) => {
                            if (placingHotspot) return;
                            handleDragStart(e, hs.id);
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        {/* Tooltip */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 transition-opacity pointer-events-none"
                          style={{
                            whiteSpace: 'nowrap',
                            opacity: isDragging ? 1 : undefined,
                          }}
                        >
                          <div
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${isDragging ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                            style={{
                              background: '#111',
                              color: '#fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            {isDragging ? `${pos.x}%, ${pos.y}%` : hs.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Placing mode overlay */}
                  {placingHotspot && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.15)' }}
                    >
                      <div
                        className="px-5 py-3 rounded-xl text-sm font-medium"
                        style={{
                          background: '#fff',
                          color: '#111',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                        }}
                      >
                        Haz clic en la imagen para colocar el hotspot
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" className="mx-auto mb-3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm" style={{ color: '#999' }}>Selecciona o crea una escena</p>
              </div>
            )}
          </div>

          {/* Right panel - hotspot list */}
          {selectedScene && (
            <div
              className="w-80 flex-shrink-0 flex flex-col h-full overflow-hidden"
              style={{
                background: '#fff',
                borderLeft: '1px solid #e8e8e8',
              }}
            >
              {/* Hotspot panel header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: '1px solid #e8e8e8' }}
              >
                <h3 className="text-sm font-medium" style={{ color: '#111' }}>Hotspots</h3>
                {!placingHotspot ? (
                  <button
                    onClick={() => setPlacingHotspot(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                    style={{ background: '#111', color: '#fff' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Añadir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setPlacingHotspot(false);
                      setNewHotspotName('');
                      setNewHotspotTarget('');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                    style={{ background: '#f0f0f0', color: '#666' }}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* New hotspot config (when placing) */}
              {placingHotspot && (
                <div className="px-5 py-3 space-y-2.5" style={{ borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                  <p className="text-[11px] font-medium" style={{ color: '#888' }}>Nuevo hotspot</p>
                  <input
                    type="text"
                    placeholder="Nombre del hotspot"
                    value={newHotspotName}
                    onChange={(e) => setNewHotspotName(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
                    style={{ border: '1px solid #e0e0e0', color: '#333' }}
                    onFocus={(e) => (e.target.style.borderColor = '#bbb')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  />
                  <select
                    value={newHotspotTarget}
                    onChange={(e) => setNewHotspotTarget(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
                    style={{ border: '1px solid #e0e0e0', color: '#333' }}
                  >
                    <option value="">Sin escena destino</option>
                    {tourData.scenes
                      .filter((s) => s.id !== selectedSceneId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium" style={{ color: '#888' }}>Flecha:</span>
                    {['left', '', 'right'].map((dir) => (
                      <button
                        key={dir}
                        onClick={() => setNewHotspotDirection(dir)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                        style={{
                          background: newHotspotDirection === dir ? '#111' : '#f0f0f0',
                          color: newHotspotDirection === dir ? '#fff' : '#666',
                        }}
                      >
                        {dir === 'left' ? '← Izq' : dir === 'right' ? 'Der →' : 'Sin'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotspot list */}
              <div className="flex-1 overflow-y-auto admin-scroll-light">
                {selectedScene.hotspots.length === 0 && !placingHotspot ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ background: '#f5f5f5' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#888' }}>Sin hotspots</p>
                    <p className="text-[11px]" style={{ color: '#bbb' }}>
                      Haz clic en "Añadir" y luego en la imagen para colocar hotspots
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-1.5">
                    {selectedScene.hotspots.map((hs) => (
                      <div
                        key={hs.id}
                        className="rounded-xl overflow-hidden transition-all"
                        style={{
                          border: editingHotspot === hs.id ? '1px solid #ddd' : '1px solid transparent',
                          background: editingHotspot === hs.id ? '#fafafa' : 'transparent',
                        }}
                      >
                        {/* Hotspot row */}
                        <div
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
                          style={{
                            background: editingHotspot === hs.id ? '#fafafa' : 'transparent',
                          }}
                          onClick={() => setEditingHotspot(editingHotspot === hs.id ? null : hs.id)}
                          onMouseEnter={(e) => {
                            if (editingHotspot !== hs.id) e.currentTarget.style.background = '#f8f8f8';
                          }}
                          onMouseLeave={(e) => {
                            if (editingHotspot !== hs.id) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{
                              background: editingHotspot === hs.id ? '#111' : '#e8e8e8',
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: editingHotspot === hs.id ? '#fff' : '#999',
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: '#333' }}>{hs.name}</p>
                            <p className="text-[10px]" style={{ color: '#bbb' }}>
                              {hs.x}%, {hs.y}%
                              {hs.targetScene && ` → ${tourData.scenes.find((s) => s.id === hs.targetScene)?.name || ''}`}
                            </p>
                          </div>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="#ccc" strokeWidth="1.5"
                            style={{
                              transform: editingHotspot === hs.id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>

                        {/* Expanded edit */}
                        {editingHotspot === hs.id && (
                          <div className="px-3 pb-3 space-y-2.5">
                            <div>
                              <label className="text-[10px] font-medium block mb-1" style={{ color: '#999' }}>Nombre</label>
                              <input
                                type="text"
                                value={hs.name}
                                onChange={(e) => updateHotspot(selectedSceneId, hs.id, { name: e.target.value })}
                                className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                style={{ border: '1px solid #e0e0e0', color: '#333' }}
                                onFocus={(e) => (e.target.style.borderColor = '#bbb')}
                                onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] font-medium block mb-1" style={{ color: '#999' }}>X (%)</label>
                                <input
                                  type="number" min="0" max="100" value={hs.x}
                                  onChange={(e) => updateHotspot(selectedSceneId, hs.id, { x: Number(e.target.value) })}
                                  className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                  style={{ border: '1px solid #e0e0e0', color: '#333' }}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-medium block mb-1" style={{ color: '#999' }}>Y (%)</label>
                                <input
                                  type="number" min="0" max="100" value={hs.y}
                                  onChange={(e) => updateHotspot(selectedSceneId, hs.id, { y: Number(e.target.value) })}
                                  className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                  style={{ border: '1px solid #e0e0e0', color: '#333' }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-medium block mb-1" style={{ color: '#999' }}>Escena destino</label>
                              <select
                                value={hs.targetScene || ''}
                                onChange={(e) => updateHotspot(selectedSceneId, hs.id, { targetScene: e.target.value || null })}
                                className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                style={{ border: '1px solid #e0e0e0', color: '#333' }}
                              >
                                <option value="">Sin destino</option>
                                {tourData.scenes
                                  .filter((s) => s.id !== selectedSceneId)
                                  .map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-medium block mb-1" style={{ color: '#999' }}>Dirección de flecha</label>
                              <div className="flex gap-1.5">
                                {[
                                  { value: 'left', label: '← Izquierda' },
                                  { value: null, label: 'Sin flecha' },
                                  { value: 'right', label: 'Derecha →' },
                                ].map((opt) => (
                                  <button
                                    key={opt.value ?? 'none'}
                                    onClick={() => updateHotspot(selectedSceneId, hs.id, { direction: opt.value })}
                                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                    style={{
                                      background: (hs.direction || null) === opt.value ? '#111' : '#f0f0f0',
                                      color: (hs.direction || null) === opt.value ? '#fff' : '#666',
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                removeHotspot(selectedSceneId, hs.id);
                                setEditingHotspot(null);
                              }}
                              className="w-full py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                              style={{ color: '#c44', background: '#fff5f5', border: '1px solid #ffe0e0' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#ffeded')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff5f5')}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                              Eliminar hotspot
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
