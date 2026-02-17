const defaultTourData = {
  scenes: [
    {
      id: 'lobby',
      name: 'Lobby',
      image: '/scenes/scene-lobby.jpg',
      hotspots: [
        {
          id: 'hs-lobby-1',
          name: 'Ir al Salón',
          x: 35,
          y: 50,
          targetScene: 'salon',
          direction: 'left',
        },
        {
          id: 'hs-lobby-2',
          name: 'Ir a la Cocina',
          x: 65,
          y: 50,
          targetScene: 'cocina',
          direction: 'right',
        },
        {
          id: 'hs-lobby-3',
          name: 'Recepción',
          x: 50,
          y: 60,
          targetScene: null,
          direction: null,
        },
      ],
    },
    {
      id: 'salon',
      name: 'Salón',
      image: '/scenes/scene-salon.jpg',
      hotspots: [
        {
          id: 'hs-salon-1',
          name: 'Volver al Lobby',
          x: 20,
          y: 50,
          targetScene: 'lobby',
          direction: 'left',
        },
        {
          id: 'hs-salon-2',
          name: 'Ir al Dormitorio',
          x: 75,
          y: 45,
          targetScene: 'dormitorio',
          direction: 'right',
        },
        {
          id: 'hs-salon-3',
          name: 'Sofá Principal',
          x: 50,
          y: 55,
          targetScene: null,
          direction: null,
        },
      ],
    },
    {
      id: 'cocina',
      name: 'Cocina',
      image: '/scenes/scene-cocina.jpg',
      hotspots: [
        {
          id: 'hs-cocina-1',
          name: 'Volver al Lobby',
          x: 15,
          y: 50,
          targetScene: 'lobby',
          direction: 'left',
        },
        {
          id: 'hs-cocina-2',
          name: 'Ir a la Terraza',
          x: 80,
          y: 45,
          targetScene: 'terraza',
          direction: 'right',
        },
        {
          id: 'hs-cocina-3',
          name: 'Isla Central',
          x: 50,
          y: 60,
          targetScene: null,
          direction: null,
        },
      ],
    },
    {
      id: 'dormitorio',
      name: 'Dormitorio',
      image: '/scenes/scene-dormitorio.jpg',
      hotspots: [
        {
          id: 'hs-dorm-1',
          name: 'Volver al Salón',
          x: 25,
          y: 50,
          targetScene: 'salon',
          direction: 'left',
        },
        {
          id: 'hs-dorm-2',
          name: 'Ir a la Terraza',
          x: 70,
          y: 45,
          targetScene: 'terraza',
          direction: 'right',
        },
        {
          id: 'hs-dorm-3',
          name: 'Cama',
          x: 50,
          y: 55,
          targetScene: null,
          direction: null,
        },
      ],
    },
    {
      id: 'terraza',
      name: 'Terraza',
      image: '/scenes/scene-terraza.jpg',
      hotspots: [
        {
          id: 'hs-terraza-1',
          name: 'Volver a la Cocina',
          x: 30,
          y: 50,
          targetScene: 'cocina',
          direction: 'left',
        },
        {
          id: 'hs-terraza-2',
          name: 'Volver al Dormitorio',
          x: 70,
          y: 50,
          targetScene: 'dormitorio',
          direction: 'right',
        },
        {
          id: 'hs-terraza-3',
          name: 'Mirador',
          x: 50,
          y: 40,
          targetScene: null,
          direction: null,
        },
      ],
    },
  ],
  startScene: 'lobby',
};

export function loadTourData() {
  const saved = localStorage.getItem('tourData');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultTourData;
    }
  }
  return defaultTourData;
}

export function saveTourData(data) {
  localStorage.setItem('tourData', JSON.stringify(data));
}

export function resetTourData() {
  localStorage.removeItem('tourData');
  return defaultTourData;
}

export { defaultTourData };
