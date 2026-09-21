/**
 * Metrónomo MK - Main Application Controller
 * Coordina vistas, eventos táctiles, controles de escenario, setlists y modales.
 */

class AppController {
  constructor() {
    this.currentSong = null;
    this.editingSongId = null;
    this.init();
  }

  init() {
    // 1. Inicializar Motores
    window.visualEngine.init({
      stageContainer: document.getElementById('stage-view'),
      beatNumberEl: document.getElementById('beat-number'),
      flashOverlayEl: document.getElementById('flash-overlay'),
      dotsContainerEl: document.getElementById('metric-dots'),
      hapticEnabled: window.storageManager.getSettings().hapticFeedback
    });

    // 2. Conectar AudioEngine con VisualEngine
    window.audioEngine.onTick = (beatData) => {
      window.visualEngine.triggerBeat(beatData);
    };

    window.audioEngine.onStateChange = (isPlaying) => {
      this.updatePlayStateUI(isPlaying);
      if (isPlaying) {
        // Solicitar Screen Wake Lock automáticamente al reproducir
        if (window.storageManager.getSettings().wakeLockAuto) {
          window.wakeLockManager.request();
        }
      }
    };

    // 3. Conectar Tap Tempo
    window.tapTempo.onBpmCalculated = (bpm) => {
      this.updateTempoFromTap(bpm);
    };

    window.tapTempo.onTap = (info) => {
      this.showToast(`🥁 TAP (${info.count}) ${info.bpm ? `→ ${info.bpm} BPM` : ''}`);
    };

    // 4. Conectar Wake Lock status
    window.wakeLockManager.onChange((isActive) => {
      const badge = document.getElementById('wakelock-badge');
      if (badge) {
        badge.className = 'wakelock-badge ' + (isActive ? 'active' : 'disabled');
        badge.innerHTML = isActive ? '⚡' : '💤';
      }
    });

    // 5. Cargar datos iniciales
    this.loadActiveSong();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.registerServiceWorker();

    // Iniciar Wake Lock por defecto si está configurado
    if (window.storageManager.getSettings().wakeLockAuto) {
      window.wakeLockManager.request();
    }
  }

  // =========================================================================
  // CARGA Y ACTUALIZACIÓN DE CANCIÓN ACTIVA
  // =========================================================================

  loadActiveSong() {
    const song = window.storageManager.getActiveSong();
    if (!song) {
      // Si la banda no tiene canciones, crear una por defecto
      const defaultSong = window.storageManager.addSong({
        title: 'Canción Inicial',
        artist: 'Metrónomo MK',
        bpm: 120,
        timeSignature: { numerator: 4, denominator: 4, label: '4/4' }
      });
      this.currentSong = defaultSong;
    } else {
      this.currentSong = song;
    }

    this.applySongToEngine(this.currentSong);
    this.updateStageUI();
  }

  applySongToEngine(song) {
    if (!song) return;

    window.audioEngine.setBpm(song.bpm);
    window.audioEngine.setTimeSignature(song.timeSignature);
    window.visualEngine.reset(song.timeSignature.numerator);
  }

  updateStageUI() {
    if (!this.currentSong) return;

    const titleEl = document.getElementById('stage-song-title');
    const artistEl = document.getElementById('stage-song-artist');
    const bpmEl = document.getElementById('stage-bpm-val');
    const metricEl = document.getElementById('stage-metric-val');
    const bandNameEl = document.getElementById('stage-band-name');
    const indexTagEl = document.getElementById('stage-song-index-tag');

    if (titleEl) titleEl.textContent = this.currentSong.title;
    if (artistEl) artistEl.textContent = this.currentSong.artist || 'Sin artista';
    if (bpmEl) bpmEl.textContent = `${this.currentSong.bpm} BPM`;
    if (metricEl) metricEl.textContent = this.currentSong.timeSignature.label || `${this.currentSong.timeSignature.numerator}/${this.currentSong.timeSignature.denominator}`;

    const activeBand = window.storageManager.getActiveBand();
    if (activeBand) {
      if (bandNameEl) bandNameEl.textContent = activeBand.name;
      if (indexTagEl && activeBand.songs) {
        const idx = activeBand.songs.findIndex(s => s.id === this.currentSong.id);
        const total = activeBand.songs.length;
        indexTagEl.textContent = idx !== -1 ? `${activeBand.name} • TEMA ${idx + 1} DE ${total}` : activeBand.name;
      }
    }

    // Actualizar puntos de métrica
    window.visualEngine.updateMetricDots(this.currentSong.timeSignature.numerator, 0);

    // Actualizar botón de Audio Click
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      const isAudioOn = window.audioEngine.audioEnabled;
      audioBtn.className = 'icon-btn ' + (isAudioOn ? 'active-green' : 'active-muted');
      audioBtn.title = isAudioOn ? 'Sonido Activado' : 'Sonido Silenciado (Solo Visual)';
      audioBtn.innerHTML = isAudioOn
        ? '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>'
        : '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
    }
  }

  updatePlayStateUI(isPlaying) {
    const playGuide = document.getElementById('play-guide-text');
    const beatNumberEl = document.getElementById('beat-number');

    if (playGuide) {
      playGuide.style.display = isPlaying ? 'none' : 'flex';
    }

    if (!isPlaying) {
      window.visualEngine.reset(this.currentSong ? this.currentSong.timeSignature.numerator : 4);
    }
  }

  // =========================================================================
  // NAVEGACIÓN DE CANCIONES (PREV / NEXT)
  // =========================================================================

  nextSong() {
    const next = window.storageManager.getNextSong();
    if (next) {
      const wasPlaying = window.audioEngine.isPlaying;
      if (wasPlaying) window.audioEngine.stop();
      window.storageManager.setActiveSong(next.id);
      this.currentSong = next;
      this.applySongToEngine(next);
      this.updateStageUI();
      if (wasPlaying) window.audioEngine.start();
      this.showToast(`⏭️ ${next.title} (${next.bpm} BPM)`);
    }
  }

  previousSong() {
    const prev = window.storageManager.getPreviousSong();
    if (prev) {
      const wasPlaying = window.audioEngine.isPlaying;
      if (wasPlaying) window.audioEngine.stop();
      window.storageManager.setActiveSong(prev.id);
      this.currentSong = prev;
      this.applySongToEngine(prev);
      this.updateStageUI();
      if (wasPlaying) window.audioEngine.start();
      this.showToast(`⏮️ ${prev.title} (${prev.bpm} BPM)`);
    }
  }

  // =========================================================================
  // AJUSTE DE TEMPO / NUDGE / TAP TEMPO
  // =========================================================================

  nudgeBpm(delta) {
    if (!this.currentSong) return;
    const newBpm = Math.max(20, Math.min(400, this.currentSong.bpm + delta));
    this.currentSong.bpm = newBpm;
    window.storageManager.updateSong(this.currentSong.id, { bpm: newBpm });
    window.audioEngine.setBpm(newBpm);
    this.updateStageUI();
  }

  updateTempoFromTap(bpm) {
    if (!this.currentSong || !bpm) return;
    this.currentSong.bpm = bpm;
    window.storageManager.updateSong(this.currentSong.id, { bpm: bpm });
    window.audioEngine.setBpm(bpm);
    this.updateStageUI();
  }

  // =========================================================================
  // VISTA DE SETLISTS Y GESTIÓN DE BANDAS
  // =========================================================================

  openSetlistView() {
    const view = document.getElementById('setlist-view');
    if (view) {
      view.classList.add('active');
      this.renderBandSelector();
      this.renderSongsList();
    }
  }

  closeSetlistView() {
    const view = document.getElementById('setlist-view');
    if (view) {
      view.classList.remove('active');
    }
  }

  renderBandSelector() {
    const selectEl = document.getElementById('band-select-dropdown');
    if (!selectEl) return;

    const bands = window.storageManager.getBands();
    const activeBand = window.storageManager.getActiveBand();

    selectEl.innerHTML = bands.map(b => `
      <option value="${b.id}" ${activeBand && activeBand.id === b.id ? 'selected' : ''}>
        ${b.name} (${b.songs.length} temas)
      </option>
    `).join('');
  }

  renderSongsList() {
    const container = document.getElementById('songs-scroll-container');
    if (!container) return;

    const activeBand = window.storageManager.getActiveBand();
    if (!activeBand || !activeBand.songs || activeBand.songs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 20px;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No hay canciones en este repertorio.</p>
          <p style="font-size: 0.85rem;">Toca el botón "+ Nueva Canción" para agregar la primera.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeBand.songs.map((song, index) => {
      const isPlaying = (this.currentSong && this.currentSong.id === song.id);
      return `
        <div class="song-card ${isPlaying ? 'active-playing' : ''}" 
             data-id="${song.id}" 
             data-index="${index}"
             draggable="true">
          <div class="song-card-top" onclick="window.appController.selectSongFromList('${song.id}')">
            <div class="song-drag-handle" title="Mantén presionado para arrastrar">☰</div>
            <span class="song-index" onclick="event.stopPropagation(); window.appController.promptMoveSong('${song.id}', ${index + 1})" title="Toca para cambiar de posición directa">
              ${String(index + 1).padStart(2, '0')}
            </span>
            <div class="song-details">
              <span class="song-name">${song.title}</span>
              <span class="song-sub">${song.artist ? song.artist : 'Sin artista'}</span>
            </div>
            <div class="song-meta-pill">
              <span class="song-bpm-tag">${song.bpm} BPM</span>
              <span class="song-metric-tag">${song.timeSignature.label || `${song.timeSignature.numerator}/${song.timeSignature.denominator}`}</span>
            </div>
          </div>
          
          <div class="song-card-bottom">
            <button class="btn-quick-select ${isPlaying ? 'is-active' : ''}" onclick="window.appController.selectSongFromList('${song.id}')">
              ${isPlaying ? '▶ EN REPRODUCCIÓN' : '⚡ Cargar en Escenario'}
            </button>
            <div class="song-actions">
              <button class="btn-icon-sm" onclick="event.stopPropagation(); window.appController.moveSong('${song.id}', 'up')" title="Subir 1 posición">▲</button>
              <button class="btn-icon-sm" onclick="event.stopPropagation(); window.appController.moveSong('${song.id}', 'down')" title="Bajar 1 posición">▼</button>
              <button class="btn-icon-sm" onclick="event.stopPropagation(); window.appController.openEditSongModal('${song.id}')" title="Editar">✏️</button>
              <button class="btn-icon-sm btn-delete" onclick="event.stopPropagation(); window.appController.deleteSong('${song.id}')" title="Eliminar">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.setupSongCardDragEvents(container);
  }

  setupSongCardDragEvents(container) {
    let draggedItem = null;

    const cards = container.querySelectorAll('.song-card');
    cards.forEach(card => {
      // Desktop HTML5 Drag & Drop
      card.addEventListener('dragstart', (e) => {
        draggedItem = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        cards.forEach(c => c.classList.remove('drag-over'));
        draggedItem = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedItem && draggedItem !== card) {
          card.classList.add('drag-over');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (draggedItem && draggedItem !== card) {
          const draggedId = draggedItem.getAttribute('data-id');
          const targetIndex = parseInt(card.getAttribute('data-index'), 10);
          window.storageManager.moveSongToPosition(draggedId, targetIndex);
          this.renderSongsList();
          this.showToast('↕️ Posición actualizada');
        }
      });
    });
  }

  promptMoveSong(songId, currentPosition) {
    const activeBand = window.storageManager.getActiveBand();
    if (!activeBand || !activeBand.songs) return;
    const total = activeBand.songs.length;
    const song = activeBand.songs.find(s => s.id === songId);
    if (!song) return;

    const input = prompt(`Mover "${song.title}" (actualmente #${currentPosition}) a la posición número (1 a ${total}):`, currentPosition);
    if (input === null) return;

    const targetPos = parseInt(input.trim(), 10);
    if (isNaN(targetPos) || targetPos < 1 || targetPos > total) {
      alert(`Por favor ingresa un número válido entre 1 y ${total}.`);
      return;
    }

    window.storageManager.moveSongToPosition(songId, targetPos - 1);
    this.renderSongsList();
    this.showToast(`↕️ "${song.title}" movida a la posición #${targetPos}`);
  }

  selectSongFromList(songId) {
    const wasPlaying = window.audioEngine.isPlaying;
    if (wasPlaying) window.audioEngine.stop();
    const song = window.storageManager.setActiveSong(songId);
    if (song) {
      this.currentSong = song;
      this.applySongToEngine(song);
      this.updateStageUI();
      this.closeSetlistView();
      if (wasPlaying) window.audioEngine.start();
      this.showToast(`▶️ Seleccionado: ${song.title}`);
    }
  }

  moveSong(songId, direction) {
    window.storageManager.moveSong(songId, direction);
    this.renderSongsList();
  }

  deleteSong(songId) {
    const activeBand = window.storageManager.getActiveBand();
    const song = activeBand.songs.find(s => s.id === songId);
    if (!song) return;

    if (confirm(`¿Eliminar "${song.title}" del repertorio?`)) {
      window.storageManager.deleteSong(songId);
      this.loadActiveSong();
      this.renderSongsList();
      this.showToast('🗑️ Canción eliminada');
    }
  }

  // =========================================================================
  // ARMAR SETLIST DE SHOW / VIVO
  // =========================================================================

  openShowBuilderModal() {
    const activeBand = window.storageManager.getActiveBand();
    if (!activeBand) return;

    this.showBuilderSelectedIds = [];
    const cleanBandName = activeBand.name.replace(/[🎸🥁⚡]/g, '').trim();
    const inputShowName = document.getElementById('input-show-name');
    if (inputShowName) {
      inputShowName.value = `${cleanBandName} - Show Vivo`;
    }

    this.renderShowBuilderLists();
    document.getElementById('show-builder-modal-overlay').classList.add('active');
  }

  closeShowBuilderModal() {
    document.getElementById('show-builder-modal-overlay').classList.remove('active');
  }

  renderShowBuilderLists() {
    const activeBand = window.storageManager.getActiveBand();
    if (!activeBand || !activeBand.songs) return;

    const selectedContainer = document.getElementById('show-selected-songs-list');
    const availableContainer = document.getElementById('show-available-songs-list');
    const countTag = document.getElementById('show-builder-count-tag');

    if (countTag) {
      countTag.textContent = `${this.showBuilderSelectedIds.length} temas en el show`;
    }

    // 1. Renderizar seleccionados para el show
    if (selectedContainer) {
      if (this.showBuilderSelectedIds.length === 0) {
        selectedContainer.innerHTML = `<div class="empty-show-msg">Toca canciones de la lista de abajo para agregarlas al show en orden...</div>`;
      } else {
        selectedContainer.innerHTML = this.showBuilderSelectedIds.map((songId, index) => {
          const song = activeBand.songs.find(s => s.id === songId);
          if (!song) return '';
          return `
            <div class="show-song-item is-selected">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                <span class="badge-count">#${index + 1}</span>
                <span class="show-song-name">${song.title} <span class="show-song-sub">(${song.artist || 'Sin artista'})</span></span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                <span class="show-song-badge">${song.bpm} BPM</span>
                <button type="button" class="btn-icon-sm" onclick="window.appController.moveSongInShow(${index}, 'up')" style="width: 28px; height: 28px;" title="Subir">▲</button>
                <button type="button" class="btn-icon-sm" onclick="window.appController.moveSongInShow(${index}, 'down')" style="width: 28px; height: 28px;" title="Bajar">▼</button>
                <button type="button" class="btn-remove-show-song" onclick="window.appController.removeSongFromShow(${index})" title="Quitar del show">✕</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Renderizar disponibles del catálogo
    if (availableContainer) {
      availableContainer.innerHTML = activeBand.songs.map((song) => {
        const alreadyCount = this.showBuilderSelectedIds.filter(id => id === song.id).length;
        return `
          <div class="show-song-item">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
              <span class="show-song-name">${song.title} <span class="show-song-sub">(${song.artist || 'Sin artista'})</span></span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              <span class="show-song-badge">${song.bpm} BPM</span>
              <button type="button" class="btn-add-show-song" onclick="window.appController.addSongToShow('${song.id}')">
                + Agregar ${alreadyCount > 0 ? `(${alreadyCount})` : ''}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  addSongToShow(songId) {
    this.showBuilderSelectedIds.push(songId);
    this.renderShowBuilderLists();
    if (navigator.vibrate) navigator.vibrate(15);
  }

  removeSongFromShow(index) {
    this.showBuilderSelectedIds.splice(index, 1);
    this.renderShowBuilderLists();
  }

  moveSongInShow(index, direction) {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= this.showBuilderSelectedIds.length) return;
    const temp = this.showBuilderSelectedIds[index];
    this.showBuilderSelectedIds[index] = this.showBuilderSelectedIds[target];
    this.showBuilderSelectedIds[target] = temp;
    this.renderShowBuilderLists();
  }

  clearShowSelection() {
    this.showBuilderSelectedIds = [];
    this.renderShowBuilderLists();
  }

  saveShowSetlist() {
    if (this.showBuilderSelectedIds.length === 0) {
      alert('Debes agregar al menos una canción al setlist del show.');
      return;
    }

    const inputShowName = document.getElementById('input-show-name');
    const showName = (inputShowName ? inputShowName.value.trim() : '') || 'Setlist de Show';
    const activeBand = window.storageManager.getActiveBand();

    try {
      const newShowBand = window.storageManager.createShowSetlist(activeBand.id, showName, this.showBuilderSelectedIds);
      this.closeShowBuilderModal();
      this.loadActiveSong();
      this.renderBandSelector();
      this.renderSongsList();
      this.showToast(`🎤 ¡Setlist "${newShowBand.name}" creado con ${newShowBand.songs.length} temas!`);
    } catch (e) {
      alert(`Error al crear setlist de show: ${e.message}`);
    }
  }

  // =========================================================================
  // REORDENAMIENTO RÁPIDO DE REPERTORIO
  // =========================================================================

  openQuickReorderModal() {
    this.renderQuickReorderList();
    document.getElementById('quick-reorder-modal-overlay').classList.add('active');
  }

  closeQuickReorderModal() {
    document.getElementById('quick-reorder-modal-overlay').classList.remove('active');
    this.renderSongsList();
  }

  renderQuickReorderList() {
    const activeBand = window.storageManager.getActiveBand();
    if (!activeBand || !activeBand.songs) return;

    const listContainer = document.getElementById('quick-reorder-list');
    if (!listContainer) return;

    const total = activeBand.songs.length;
    listContainer.innerHTML = activeBand.songs.map((song, index) => {
      return `
        <div class="quick-reorder-item">
          <div class="reorder-item-left">
            <button class="reorder-pos-btn" onclick="window.appController.promptMoveSong('${song.id}', ${index + 1}); window.appController.renderQuickReorderList();" title="Toca para cambiar de posición">
              #${String(index + 1).padStart(2, '0')}
            </button>
            <div style="display: flex; flex-direction: column; min-width: 0;">
              <strong style="color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</strong>
              <span style="font-size: 0.78rem; color: var(--neon-cyan);">${song.artist || 'Sin artista'} • ${song.bpm} BPM</span>
            </div>
          </div>
          <div class="reorder-arrows-group">
            <button class="btn-icon-sm" onclick="window.appController.moveSong('${song.id}', 'up'); window.appController.renderQuickReorderList();" ${index === 0 ? 'disabled style="opacity: 0.3;"' : ''}>▲</button>
            <button class="btn-icon-sm" onclick="window.appController.moveSong('${song.id}', 'down'); window.appController.renderQuickReorderList();" ${index === total - 1 ? 'disabled style="opacity: 0.3;"' : ''}>▼</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // MODALES: NUEVA / EDITAR CANCIÓN + ASISTENTE IA
  // =========================================================================

  openAddSongModal() {
    this.editingSongId = null;
    document.getElementById('modal-song-title-heading').textContent = 'Nueva Canción';
    document.getElementById('input-song-title').value = '';
    document.getElementById('input-song-artist').value = '';
    document.getElementById('input-song-bpm').value = 120;
    document.getElementById('range-song-bpm').value = 120;
    document.getElementById('select-song-metric').value = '4/4';
    document.getElementById('input-song-notes').value = '';
    document.getElementById('ai-suggestion-container').innerHTML = '';

    document.getElementById('song-modal-overlay').classList.add('active');
  }

  openEditSongModal(songId) {
    const activeBand = window.storageManager.getActiveBand();
    const song = activeBand.songs.find(s => s.id === songId);
    if (!song) return;

    this.editingSongId = songId;
    document.getElementById('modal-song-title-heading').textContent = 'Editar Canción';
    document.getElementById('input-song-title').value = song.title;
    document.getElementById('input-song-artist').value = song.artist || '';
    document.getElementById('input-song-bpm').value = song.bpm;
    document.getElementById('range-song-bpm').value = song.bpm;
    
    // Métrica
    const metricStr = song.timeSignature.label || `${song.timeSignature.numerator}/${song.timeSignature.denominator}`;
    const metricSelect = document.getElementById('select-song-metric');
    if ([...metricSelect.options].some(o => o.value === metricStr)) {
      metricSelect.value = metricStr;
    } else {
      metricSelect.value = 'custom';
      document.getElementById('custom-metric-row').style.display = 'grid';
      document.getElementById('input-custom-num').value = song.timeSignature.numerator;
      document.getElementById('input-custom-den').value = song.timeSignature.denominator;
    }

    document.getElementById('input-song-notes').value = song.notes || '';
    document.getElementById('ai-suggestion-container').innerHTML = '';

    document.getElementById('song-modal-overlay').classList.add('active');
  }

  closeSongModal() {
    document.getElementById('song-modal-overlay').classList.remove('active');
    document.getElementById('custom-metric-row').style.display = 'none';
  }

  async runAIAssistant() {
    const title = document.getElementById('input-song-title').value.trim();
    const artist = document.getElementById('input-song-artist').value.trim();
    const query = `${title} ${artist}`.trim();

    if (!query) {
      alert('Por favor ingresa al menos el título o artista para consultar con la IA.');
      return;
    }

    const container = document.getElementById('ai-suggestion-container');
    container.innerHTML = `
      <div style="color: #C084FC; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
        <span>🤖 Analizando tempo y métrica con IA...</span>
      </div>
    `;

    try {
      const result = await window.aiAssistant.suggestBpmAndMetric(query);
      container.innerHTML = `
        <div class="ai-suggestion-box">
          <div class="ai-suggestion-header">
            <span>✨ SUGERENCIA IA (${result.confidence} de confianza)</span>
            <span>${result.genre}</span>
          </div>
          <div class="ai-suggestion-body">
            <strong>${result.title}</strong> ${result.artist ? `de <em>${result.artist}</em>` : ''} → 
            <span style="color: var(--neon-green);">${result.bpm} BPM</span> | 
            <span style="color: var(--neon-cyan);">${result.timeSignature.label}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            💡 ${result.notes}
          </div>
          <button type="button" class="btn-apply-ai" onclick="window.appController.applyAISuggestion(${result.bpm}, '${result.timeSignature.label}')">
            Aplicar Valores
          </button>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<span style="color: var(--danger-red); font-size: 0.85rem;">Error al sugerir: ${e.message}</span>`;
    }
  }

  applyAISuggestion(bpm, metricLabel) {
    document.getElementById('input-song-bpm').value = bpm;
    document.getElementById('range-song-bpm').value = bpm;
    const metricSelect = document.getElementById('select-song-metric');
    metricSelect.value = metricLabel;
    this.showToast(`✨ Valores aplicados: ${bpm} BPM (${metricLabel})`);
  }

  saveSongModal() {
    const title = document.getElementById('input-song-title').value.trim();
    const artist = document.getElementById('input-song-artist').value.trim();
    const bpm = parseInt(document.getElementById('input-song-bpm').value, 10) || 120;
    const metricVal = document.getElementById('select-song-metric').value;
    const notes = document.getElementById('input-song-notes').value.trim();

    if (!title) {
      alert('Debes ingresar el nombre de la canción.');
      return;
    }

    let timeSignature = { numerator: 4, denominator: 4, label: '4/4' };
    if (metricVal === 'custom') {
      const num = parseInt(document.getElementById('input-custom-num').value, 10) || 4;
      const den = parseInt(document.getElementById('input-custom-den').value, 10) || 4;
      timeSignature = { numerator: num, denominator: den, label: `${num}/${den}` };
    } else {
      const parts = metricVal.split('/');
      timeSignature = {
        numerator: parseInt(parts[0], 10) || 4,
        denominator: parseInt(parts[1], 10) || 4,
        label: metricVal
      };
    }

    const songData = { title, artist, bpm, timeSignature, notes };

    if (this.editingSongId) {
      window.storageManager.updateSong(this.editingSongId, songData);
      if (this.currentSong && this.currentSong.id === this.editingSongId) {
        this.currentSong = window.storageManager.getActiveSong();
        this.applySongToEngine(this.currentSong);
      }
      this.showToast('✅ Canción actualizada');
    } else {
      const newSong = window.storageManager.addSong(songData);
      this.currentSong = newSong;
      this.applySongToEngine(newSong);
      this.showToast('✅ Canción agregada al setlist');
    }

    this.closeSongModal();
    this.updateStageUI();
    this.renderSongsList();
    this.renderBandSelector();
  }

  // =========================================================================
  // GESTIÓN DE BANDAS (CREAR / CAMBIAR / ELIMINAR)
  // =========================================================================

  createNewBandPrompt() {
    const name = prompt('Nombre de la nueva banda o proyecto:');
    if (name && name.trim()) {
      const newBand = window.storageManager.addBand(name.trim());
      this.loadActiveSong();
      this.renderBandSelector();
      this.renderSongsList();
      this.showToast(`🎸 Banda creada: ${newBand.name}`);
    }
  }

  deleteCurrentBand() {
    const activeBand = window.storageManager.getActiveBand();
    if (!activeBand) return;

    if (confirm(`¿Estás seguro de eliminar la banda "${activeBand.name}" y todas sus canciones?`)) {
      try {
        window.storageManager.deleteBand(activeBand.id);
        this.loadActiveSong();
        this.renderBandSelector();
        this.renderSongsList();
        this.showToast('🗑️ Banda eliminada');
      } catch (err) {
        alert(err.message);
      }
    }
  }

  // =========================================================================
  // MODAL DE AJUSTES Y BACKUP
  // =========================================================================

  openSettingsModal() {
    const settings = window.storageManager.getSettings();
    const audioSwitch = document.getElementById('switch-audio-click');
    const hapticSwitch = document.getElementById('switch-haptic');
    const wakelockSwitch = document.getElementById('switch-wakelock');

    if (audioSwitch) audioSwitch.checked = window.audioEngine.audioEnabled;
    if (hapticSwitch) hapticSwitch.checked = settings.hapticFeedback;
    if (wakelockSwitch) wakelockSwitch.checked = settings.wakeLockAuto;

    document.getElementById('settings-modal-overlay').classList.add('active');
  }

  closeSettingsModal() {
    document.getElementById('settings-modal-overlay').classList.remove('active');
  }

  exportBackupData() {
    window.storageManager.exportBackup();
    this.showToast('📦 Archivo de backup descargado');
  }

  async importBackupFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await window.storageManager.importBackup(file);
      this.loadActiveSong();
      this.renderBandSelector();
      this.renderSongsList();
      this.closeSettingsModal();
      this.showToast('✅ Copia de seguridad restaurada correctamente');
    } catch (err) {
      alert(`Error al importar backup: ${err.message}`);
    } finally {
      event.target.value = '';
    }
  }

  resetDemoData() {
    if (confirm('¿Restaurar el repertorio de demostración? Se reestablecerán las bandas por defecto.')) {
      window.storageManager.resetToDemo();
      this.loadActiveSong();
      this.renderBandSelector();
      this.renderSongsList();
      this.closeSettingsModal();
      this.showToast('🔄 Repertorio de prueba cargado');
    }
  }

  // =========================================================================
  // EVENT LISTENERS & SHORTCUTS
  // =========================================================================

  setupEventListeners() {
    // 1. Toque en el centro del escenario para Play / Pause
    const stageCenter = document.getElementById('stage-center-touch');
    if (stageCenter) {
      stageCenter.addEventListener('click', (e) => {
        e.preventDefault();
        window.audioEngine.toggle();
      });
    }

    // 2. Botones laterales Prev / Next
    document.getElementById('btn-stage-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.previousSong();
    });

    document.getElementById('btn-stage-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextSong();
    });

    // 3. Audio Toggle
    document.getElementById('btn-toggle-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const newState = !window.audioEngine.audioEnabled;
      window.audioEngine.setAudioEnabled(newState);
      window.storageManager.saveSettings({ audioClickEnabled: newState });
      this.updateStageUI();
      this.showToast(newState ? '🔊 Sonido Activado' : '🔇 Sonido Silenciado (Modo Visual)');
    });

    // 4. Wake Lock Toggle
    document.getElementById('wakelock-badge')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.wakeLockManager.toggle();
    });

    // 5. Botón Pantalla Completa
    document.getElementById('btn-toggle-fullscreen')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFullscreen();
    });

    // 6. Controles de Tempo Inferiores
    document.getElementById('btn-nudge-minus-5')?.addEventListener('click', () => this.nudgeBpm(-5));
    document.getElementById('btn-nudge-minus-1')?.addEventListener('click', () => this.nudgeBpm(-1));
    document.getElementById('btn-nudge-plus-1')?.addEventListener('click', () => this.nudgeBpm(1));
    document.getElementById('btn-nudge-plus-5')?.addEventListener('click', () => this.nudgeBpm(5));

    // 7. Botón Tap Tempo
    const tapBtn = document.getElementById('btn-tap-tempo');
    if (tapBtn) {
      tapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.tapTempo.tap();
      });
    }

    // 8. Botón Abrir Setlist
    document.getElementById('btn-open-setlist')?.addEventListener('click', () => this.openSetlistView());
    document.getElementById('btn-close-setlist')?.addEventListener('click', () => this.closeSetlistView());

    // 9. Selector de Banda
    document.getElementById('band-select-dropdown')?.addEventListener('change', (e) => {
      window.storageManager.setActiveBand(e.target.value);
      this.loadActiveSong();
      this.renderSongsList();
    });

    document.getElementById('btn-new-band')?.addEventListener('click', () => this.createNewBandPrompt());
    document.getElementById('btn-delete-band')?.addEventListener('click', () => this.deleteCurrentBand());

    // Herramientas de Setlist (Armar Show / Reordenar)
    document.getElementById('btn-open-show-builder')?.addEventListener('click', () => this.openShowBuilderModal());
    document.getElementById('btn-close-show-builder')?.addEventListener('click', () => this.closeShowBuilderModal());
    document.getElementById('btn-cancel-show-builder')?.addEventListener('click', () => this.closeShowBuilderModal());
    document.getElementById('btn-save-show-setlist')?.addEventListener('click', () => this.saveShowSetlist());
    document.getElementById('btn-clear-show-selection')?.addEventListener('click', () => this.clearShowSelection());

    document.getElementById('btn-open-quick-reorder')?.addEventListener('click', () => this.openQuickReorderModal());
    document.getElementById('btn-close-quick-reorder')?.addEventListener('click', () => this.closeQuickReorderModal());
    document.getElementById('btn-close-quick-reorder-done')?.addEventListener('click', () => this.closeQuickReorderModal());

    // 10. Botón Flotante Agregar Canción
    document.getElementById('btn-floating-add-song')?.addEventListener('click', () => this.openAddSongModal());

    // 11. Modal Canción
    document.getElementById('btn-close-song-modal')?.addEventListener('click', () => this.closeSongModal());
    document.getElementById('btn-cancel-song-modal')?.addEventListener('click', () => this.closeSongModal());
    document.getElementById('btn-save-song-modal')?.addEventListener('click', () => this.saveSongModal());
    document.getElementById('btn-ai-assist')?.addEventListener('click', () => this.runAIAssistant());

    // Slider BPM en Modal
    const modalBpmInput = document.getElementById('input-song-bpm');
    const modalBpmRange = document.getElementById('range-song-bpm');
    if (modalBpmInput && modalBpmRange) {
      modalBpmRange.addEventListener('input', (e) => {
        modalBpmInput.value = e.target.value;
      });
      modalBpmInput.addEventListener('input', (e) => {
        modalBpmRange.value = e.target.value;
      });
    }

    // Selector métrica en Modal
    document.getElementById('select-song-metric')?.addEventListener('change', (e) => {
      const customRow = document.getElementById('custom-metric-row');
      if (customRow) {
        customRow.style.display = (e.target.value === 'custom') ? 'grid' : 'none';
      }
    });

    // 12. Modal Ajustes
    document.getElementById('btn-open-settings')?.addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btn-close-settings-modal')?.addEventListener('click', () => this.closeSettingsModal());
    document.getElementById('btn-export-backup')?.addEventListener('click', () => this.exportBackupData());
    document.getElementById('input-restore-backup')?.addEventListener('change', (e) => this.importBackupFile(e));
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => this.resetDemoData());

    // Switches Ajustes
    document.getElementById('switch-audio-click')?.addEventListener('change', (e) => {
      window.audioEngine.setAudioEnabled(e.target.checked);
      window.storageManager.saveSettings({ audioClickEnabled: e.target.checked });
      this.updateStageUI();
    });

    document.getElementById('switch-haptic')?.addEventListener('change', (e) => {
      window.visualEngine.setHapticEnabled(e.target.checked);
      window.storageManager.saveSettings({ hapticFeedback: e.target.checked });
    });

    document.getElementById('switch-wakelock')?.addEventListener('change', (e) => {
      window.storageManager.saveSettings({ wakeLockAuto: e.target.checked });
      if (e.target.checked) {
        window.wakeLockManager.request();
      } else {
        window.wakeLockManager.release();
      }
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignorar si se está escribiendo en un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          window.audioEngine.toggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSong();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.previousSong();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.nudgeBpm(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.nudgeBpm(-1);
          break;
        case 'KeyT':
          e.preventDefault();
          window.tapTempo.tap();
          break;
        case 'KeyM':
          e.preventDefault();
          const newState = !window.audioEngine.audioEnabled;
          window.audioEngine.setAudioEnabled(newState);
          this.updateStageUI();
          this.showToast(newState ? '🔊 Sonido Activado' : '🔇 Sonido Silenciado');
          break;
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[PWA] Service Worker registrado:', reg.scope))
        .catch((err) => console.warn('[PWA] Error en Service Worker:', err));
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
});
