/**
 * Metrónomo MK - Storage & Backup Manager
 * Maneja persistencia en LocalStorage y Backup/Restore en JSON.
 */

const STORAGE_KEYS = {
  BANDS: 'metronomo_mk_bands_v3',
  ACTIVE_BAND_ID: 'metronomo_mk_active_band_v3',
  ACTIVE_SONG_ID: 'metronomo_mk_active_song_v3',
  SETTINGS: 'metronomo_mk_settings_v3'
};

const DEFAULT_SETTINGS = {
  audioClickEnabled: false,       // Muteado por defecto según requerimiento
  audioVolume: 0.8,
  flashStyle: 'fullscreen',       // 'fullscreen' o 'badge'
  hapticFeedback: true,           // Vibración al tap y pulso (si soportado)
  wakeLockAuto: true,             // Mantener pantalla encendida automáticamente
  accentFrequency: 1600,          // Tono pulso 1 (agudo penetrante)
  beatFrequency: 900,             // Tono pulsos secundarios
  compactListView: false          // Modo lista universal compacto
};

const DEMO_BANDS = [
  {
    id: 'band-resto-urbano',
    name: '🥁 Resto Urbano',
    createdAt: new Date().toISOString(),
    songs: [
      { id: 'ru-1', artist: 'Divididos', title: 'Tengo', bpm: 176, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-2', artist: 'Divididos', title: 'La ñapi', bpm: 144, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-3', artist: 'Don Cornelio', title: 'Ella vendrá', bpm: 135, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-4', artist: 'Sumo', title: 'Estallando desde el océano', bpm: 167, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-5', artist: 'Las Pelotas', title: 'La colina', bpm: 126, timeSignature: { numerator: 3, denominator: 4, label: '3/4' }, notes: 'Compás ternario 3/4' },
      { id: 'ru-6', artist: 'Sumo', title: 'Crua chan', bpm: 118, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-7', artist: 'Sumo', title: 'No tan distintos', bpm: 170, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-8', artist: 'Las Pelotas', title: 'Personalmente', bpm: 142, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-9', artist: 'Las Pelotas', title: 'Será', bpm: 128, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-10', artist: 'Resto Urbano', title: 'No es fácil', bpm: 105, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Tema Propio' },
      { id: 'ru-11', artist: 'Cabezones', title: 'Globo', bpm: 98, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-12', artist: 'Las Pelotas', title: 'Mareada', bpm: 96, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-13', artist: 'Sumo', title: 'Next week', bpm: 175, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-14', artist: 'Sumo', title: 'El ojo blindado', bpm: 188, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-15', artist: 'Infierno', title: 'Hombres de hierro', bpm: 120, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-16', artist: 'Divididos', title: 'Buscando un ángel', bpm: 165, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-17', artist: 'Resto Urbano', title: 'Volveré', bpm: 100, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Tema Propio' },
      { id: 'ru-18', artist: 'Green Day', title: 'Jesus of Suburbia', bpm: 147, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-19', artist: 'Las Pelotas', title: 'Día feliz', bpm: 192, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-20', artist: 'Resto Urbano', title: 'Cuidado silencio', bpm: 128, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Tema Propio' },
      { id: 'ru-21', artist: 'Divididos', title: 'Spaghetti del rock', bpm: 102, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-22', artist: 'Divididos', title: 'Sobrio a las piñas', bpm: 115, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-23', artist: 'Resto Urbano', title: 'Perdido en la tormenta', bpm: 110, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Tema Propio' },
      { id: 'ru-24', artist: 'Molotov', title: 'Perro negro', bpm: 160, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-25', artist: 'Soda Stereo', title: 'Persiana americana', bpm: 105, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-26', artist: 'Resto Urbano', title: 'Cosas que no hacen bien', bpm: 148, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Tema Propio' },
      { id: 'ru-27', artist: 'Resto Urbano', title: 'La llave', bpm: 88, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Tema Propio' },
      { id: 'ru-28', artist: 'Blink-182', title: 'All the Small Things', bpm: 150, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-29', artist: 'Green Day', title: 'American Idiot', bpm: 175, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-30', artist: 'La Renga', title: 'Las cosas que hace', bpm: 122, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-31', artist: 'La Renga', title: 'A tu lado', bpm: 202, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-32', artist: 'Catupecu Machu', title: 'Entero o a pedazos', bpm: 95, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-33', artist: 'Arde la Sangre', title: 'Artefacto', bpm: 107, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'ru-34', artist: 'Catupecu Machu', title: 'Perfectos cromosomas', bpm: 146, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' }
    ]
  },
  {
    id: 'band-dr-vaporano',
    name: '⚡ Dr. Vaporano',
    createdAt: new Date().toISOString(),
    songs: [
      { id: 'dv-1', artist: 'Dr. Vaporano', title: 'Eso está bien', bpm: 122, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-2', artist: 'Dr. Vaporano', title: 'Nube roja', bpm: 95, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-3', artist: 'Dr. Vaporano', title: 'Movimientos', bpm: 132, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-4', artist: 'Dr. Vaporano', title: 'Ratones', bpm: 110, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-5', artist: 'Dr. Vaporano', title: 'Barrio chino', bpm: 120, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-6', artist: 'Dr. Vaporano', title: 'Arlequín', bpm: 130, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-7', artist: 'Dr. Vaporano', title: 'Flores eléctricas', bpm: 117, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-8', artist: 'Dr. Vaporano', title: 'Ojos de pez', bpm: 120, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-9', artist: 'Pappo', title: 'Ruta 66', bpm: 154, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: 'Blues Rock' },
      { id: 'dv-10', artist: 'Dr. Vaporano', title: 'Ahora', bpm: 111, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-11', artist: 'Dr. Vaporano', title: 'Como un loco', bpm: 123, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-12', artist: 'Dr. Vaporano', title: 'Solo por hoy', bpm: 125, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-13', artist: 'Dr. Vaporano', title: 'Siete vidas', bpm: 138, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-14', artist: 'Dr. Vaporano', title: 'Toneladas', bpm: 108, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-15', artist: 'Dr. Vaporano', title: 'Viaje Ancestral', bpm: 120, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-16', artist: 'Pappo', title: 'Rock and Roll y fiebre', bpm: 136, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-17', artist: 'Pappo', title: 'Jenny sube a mi auto', bpm: 139, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-18', artist: 'Dr. Vaporano', title: 'Madre atómica', bpm: 128, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-19', artist: 'Dr. Vaporano', title: 'Qué pasará', bpm: 127, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-20', artist: 'Dr. Vaporano', title: 'Buenas noches', bpm: 115, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-21', artist: 'Dr. Vaporano', title: 'Mexicana', bpm: 122, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'dv-22', artist: 'Dr. Vaporano', title: 'Mejor así', bpm: 200, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' }
    ]
  },
  {
    id: 'band-stanly-mados',
    name: '🎸 Stanly Mados',
    createdAt: new Date().toISOString(),
    songs: [
      { id: 'sm-1', artist: 'Divididos', title: 'Cajita musical', bpm: 103, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-2', artist: 'Divididos', title: 'Vida de topos', bpm: 92, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-3', artist: 'Divididos', title: 'Sábado', bpm: 100, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-4', artist: 'Divididos', title: 'Tanto anteojo', bpm: 140, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-5', artist: 'Divididos', title: 'Paisano de Hurlingham', bpm: 97, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-6', artist: 'Divididos', title: 'Gol de mujer', bpm: 95, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-7', artist: 'Divididos', title: 'Tomando mate en la paz', bpm: 137, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-8', artist: 'Divididos', title: '¿Qué ves?', bpm: 108, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-9', artist: 'Divididos', title: 'El arriero', bpm: 122, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-10', artist: 'Divididos', title: 'Amapola del 66', bpm: 144, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-11', artist: 'Divididos', title: 'Salir a asustar', bpm: 140, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-12', artist: 'Divididos', title: 'Salir a comprar', bpm: 100, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-13', artist: 'Divididos', title: 'Ala delta', bpm: 155, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-14', artist: 'Divididos', title: 'Basta fuerte', bpm: 112, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-15', artist: 'Divididos', title: 'El 38', bpm: 153, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-16', artist: 'Divididos', title: 'Nene de antes', bpm: 95, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' },
      { id: 'sm-17', artist: 'Divididos', title: '¿Qué tal?', bpm: 128, timeSignature: { numerator: 4, denominator: 4, label: '4/4' }, notes: '' }
    ]
  }
];

class StorageManager {
  constructor() {
    this.bands = [];
    this.activeBandId = null;
    this.activeSongId = null;
    this.settings = { ...DEFAULT_SETTINGS };
    this._load();
  }

  _load() {
    try {
      const storedBands = localStorage.getItem(STORAGE_KEYS.BANDS);
      if (storedBands) {
        this.bands = JSON.parse(storedBands);
      } else {
        // Inicializar con las bandas oficiales del baterista
        this.bands = JSON.parse(JSON.stringify(DEMO_BANDS));
        this._saveBands();
      }

      const storedBandId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BAND_ID);
      this.activeBandId = storedBandId && this.bands.some(b => b.id === storedBandId)
        ? storedBandId
        : (this.bands[0] ? this.bands[0].id : null);

      const storedSongId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SONG_ID);
      const currentBand = this.getActiveBand();
      if (currentBand && currentBand.songs && currentBand.songs.length > 0) {
        this.activeSongId = storedSongId && currentBand.songs.some(s => s.id === storedSongId)
          ? storedSongId
          : currentBand.songs[0].id;
      } else {
        this.activeSongId = null;
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (e) {
      console.error('[StorageManager] Error cargando datos de LocalStorage:', e);
      this.bands = JSON.parse(JSON.stringify(DEMO_BANDS));
      this.activeBandId = this.bands[0].id;
      this.activeSongId = this.bands[0].songs[0].id;
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  _saveBands() {
    localStorage.setItem(STORAGE_KEYS.BANDS, JSON.stringify(this.bands));
  }

  _saveActiveIds() {
    if (this.activeBandId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BAND_ID, this.activeBandId);
    }
    if (this.activeSongId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SONG_ID, this.activeSongId);
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    return this.settings;
  }

  getSettings() {
    return { ...this.settings };
  }

  // Bandas
  getBands() {
    return this.bands;
  }

  getActiveBand() {
    return this.bands.find(b => b.id === this.activeBandId) || this.bands[0] || null;
  }

  setActiveBand(bandId) {
    const band = this.bands.find(b => b.id === bandId);
    if (band) {
      this.activeBandId = band.id;
      if (band.songs && band.songs.length > 0) {
        this.activeSongId = band.songs[0].id;
      } else {
        this.activeSongId = null;
      }
      this._saveActiveIds();
      return band;
    }
    return null;
  }

  addBand(name) {
    const newBand = {
      id: 'band_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name.trim() || 'Nueva Banda',
      createdAt: new Date().toISOString(),
      songs: []
    };
    this.bands.push(newBand);
    this._saveBands();
    this.setActiveBand(newBand.id);
    return newBand;
  }

  renameBand(bandId, newName) {
    const band = this.bands.find(b => b.id === bandId);
    if (band) {
      band.name = newName.trim();
      this._saveBands();
      return band;
    }
    return null;
  }

  deleteBand(bandId) {
    if (this.bands.length <= 1) {
      throw new Error('Debe existir al menos una banda en el sistema.');
    }
    this.bands = this.bands.filter(b => b.id !== bandId);
    if (this.activeBandId === bandId) {
      this.setActiveBand(this.bands[0].id);
    }
    this._saveBands();
    return true;
  }

  // Canciones
  getActiveSong() {
    const currentBand = this.getActiveBand();
    if (!currentBand || !currentBand.songs) return null;
    return currentBand.songs.find(s => s.id === this.activeSongId) || currentBand.songs[0] || null;
  }

  setActiveSong(songId) {
    const currentBand = this.getActiveBand();
    if (!currentBand) return null;
    const song = currentBand.songs.find(s => s.id === songId);
    if (song) {
      this.activeSongId = song.id;
      this._saveActiveIds();
      return song;
    }
    return null;
  }

  getNextSong() {
    const currentBand = this.getActiveBand();
    if (!currentBand || !currentBand.songs || currentBand.songs.length === 0) return null;
    const currentIndex = currentBand.songs.findIndex(s => s.id === this.activeSongId);
    if (currentIndex === -1 || currentIndex >= currentBand.songs.length - 1) {
      return currentBand.songs[0];
    }
    return currentBand.songs[currentIndex + 1];
  }

  getPreviousSong() {
    const currentBand = this.getActiveBand();
    if (!currentBand || !currentBand.songs || currentBand.songs.length === 0) return null;
    const currentIndex = currentBand.songs.findIndex(s => s.id === this.activeSongId);
    if (currentIndex <= 0) {
      return currentBand.songs[currentBand.songs.length - 1];
    }
    return currentBand.songs[currentIndex - 1];
  }

  addSong(songData) {
    const currentBand = this.getActiveBand();
    if (!currentBand) throw new Error('No hay banda activa.');

    const newSong = {
      id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: (songData.title || 'Nueva Canción').trim(),
      artist: (songData.artist || '').trim(),
      bpm: parseInt(songData.bpm, 10) || 120,
      timeSignature: songData.timeSignature || { numerator: 4, denominator: 4, label: '4/4' },
      notes: (songData.notes || '').trim()
    };

    currentBand.songs.push(newSong);
    this._saveBands();
    this.setActiveSong(newSong.id);
    return newSong;
  }

  updateSong(songId, songData) {
    const currentBand = this.getActiveBand();
    if (!currentBand) return null;
    const song = currentBand.songs.find(s => s.id === songId);
    if (song) {
      if (songData.title !== undefined) song.title = songData.title.trim();
      if (songData.artist !== undefined) song.artist = songData.artist.trim();
      if (songData.bpm !== undefined) song.bpm = Math.max(20, Math.min(400, parseInt(songData.bpm, 10) || 120));
      if (songData.timeSignature !== undefined) song.timeSignature = songData.timeSignature;
      if (songData.notes !== undefined) song.notes = songData.notes.trim();

      this._saveBands();
      return song;
    }
    return null;
  }

  deleteSong(songId) {
    const currentBand = this.getActiveBand();
    if (!currentBand) return false;
    currentBand.songs = currentBand.songs.filter(s => s.id !== songId);
    if (this.activeSongId === songId) {
      this.activeSongId = currentBand.songs[0] ? currentBand.songs[0].id : null;
      this._saveActiveIds();
    }
    this._saveBands();
    return true;
  }

  moveSong(songId, direction) {
    const currentBand = this.getActiveBand();
    if (!currentBand || !currentBand.songs) return false;
    const index = currentBand.songs.findIndex(s => s.id === songId);
    if (index === -1) return false;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBand.songs.length) return false;

    const temp = currentBand.songs[index];
    currentBand.songs[index] = currentBand.songs[targetIndex];
    currentBand.songs[targetIndex] = temp;

    this._saveBands();
    return true;
  }

  moveSongToPosition(songId, newIndex) {
    const currentBand = this.getActiveBand();
    if (!currentBand || !currentBand.songs) return false;
    const oldIndex = currentBand.songs.findIndex(s => s.id === songId);
    if (oldIndex === -1) return false;

    const clampedIndex = Math.max(0, Math.min(currentBand.songs.length - 1, newIndex));
    if (oldIndex === clampedIndex) return true;

    const [removed] = currentBand.songs.splice(oldIndex, 1);
    currentBand.songs.splice(clampedIndex, 0, removed);

    this._saveBands();
    return true;
  }

  reorderSongs(orderedSongIds) {
    const currentBand = this.getActiveBand();
    if (!currentBand || !currentBand.songs) return false;

    const newSongs = [];
    orderedSongIds.forEach(id => {
      const found = currentBand.songs.find(s => s.id === id);
      if (found) newSongs.push(found);
    });

    currentBand.songs.forEach(s => {
      if (!newSongs.some(ns => ns.id === s.id)) {
        newSongs.push(s);
      }
    });

    currentBand.songs = newSongs;
    this._saveBands();
    return true;
  }

  createShowSetlist(sourceBandId, showName, selectedSongIds) {
    const sourceBand = this.bands.find(b => b.id === sourceBandId) || this.getActiveBand();
    if (!sourceBand) throw new Error('Banda origen no encontrada');

    const showSongs = [];
    selectedSongIds.forEach(songId => {
      const original = sourceBand.songs.find(s => s.id === songId);
      if (original) {
        showSongs.push({
          ...JSON.parse(JSON.stringify(original)),
          id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
        });
      }
    });

    const newBand = {
      id: 'band_show_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: showName.trim() || `🎤 Show ${sourceBand.name}`,
      createdAt: new Date().toISOString(),
      songs: showSongs
    };

    this.bands.push(newBand);
    this._saveBands();
    this.setActiveBand(newBand.id);
    return newBand;
  }

  addExistingSongsToBand(targetBandId, songsArray) {
    const targetBand = this.bands.find(b => b.id === targetBandId) || this.getActiveBand();
    if (!targetBand) throw new Error('Banda de destino no encontrada');

    if (!Array.isArray(targetBand.songs)) {
      targetBand.songs = [];
    }

    const addedSongs = [];
    songsArray.forEach(sourceSong => {
      const newSong = {
        id: 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: (sourceSong.title || 'Canción').trim(),
        artist: (sourceSong.artist || '').trim(),
        bpm: parseInt(sourceSong.bpm, 10) || 120,
        timeSignature: sourceSong.timeSignature ? { ...sourceSong.timeSignature } : { numerator: 4, denominator: 4, label: '4/4' },
        notes: (sourceSong.notes || '').trim()
      };
      targetBand.songs.push(newSong);
      addedSongs.push(newSong);
    });

    this._saveBands();
    return addedSongs;
  }

  // Backup & Restore en JSON
  exportBackup() {
    const backupData = {
      app: 'Metronomo MK',
      version: '1.0.6',
      exportedAt: new Date().toISOString(),
      bands: this.bands,
      activeBandId: this.activeBandId,
      activeSongId: this.activeSongId,
      settings: this.settings
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `metronomo-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return backupData;
  }

  async importBackup(jsonFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.bands || !Array.isArray(data.bands)) {
            throw new Error('Formato de archivo inválido: no contiene lista de bandas válida.');
          }

          const validBands = data.bands.map(band => ({
            id: band.id || ('band_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
            name: band.name || 'Banda Importada',
            createdAt: band.createdAt || new Date().toISOString(),
            songs: Array.isArray(band.songs) ? band.songs.map(song => ({
              id: song.id || ('song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
              title: song.title || 'Canción sin título',
              artist: song.artist || '',
              bpm: parseInt(song.bpm, 10) || 120,
              timeSignature: song.timeSignature || { numerator: 4, denominator: 4, label: '4/4' },
              notes: song.notes || ''
            })) : []
          }));

          if (validBands.length === 0) {
            throw new Error('El archivo de respaldo no contiene ninguna banda válida.');
          }

          this.bands = validBands;
          this.activeBandId = data.activeBandId && this.bands.some(b => b.id === data.activeBandId)
            ? data.activeBandId
            : this.bands[0].id;

          const currentBand = this.getActiveBand();
          this.activeSongId = currentBand && currentBand.songs && currentBand.songs.length > 0
            ? (data.activeSongId && currentBand.songs.some(s => s.id === data.activeSongId) ? data.activeSongId : currentBand.songs[0].id)
            : null;

          if (data.settings && typeof data.settings === 'object') {
            this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
          }

          this._saveBands();
          this._saveActiveIds();
          this.saveSettings(this.settings);

          resolve({ success: true, count: this.bands.length });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo de respaldo.'));
      reader.readAsText(jsonFile);
    });
  }

  resetToDemo() {
    this.bands = JSON.parse(JSON.stringify(DEMO_BANDS));
    this.activeBandId = this.bands[0].id;
    this.activeSongId = this.bands[0].songs[0].id;
    this.settings = { ...DEFAULT_SETTINGS };
    this._saveBands();
    this._saveActiveIds();
    this.saveSettings(this.settings);
    return true;
  }
}

window.storageManager = new StorageManager();
