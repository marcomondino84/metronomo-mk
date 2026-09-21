/**
 * Metrónomo MK - Fullscreen Visual Flash & Dynamic Count Engine
 * Renderizado de ultra alto contraste en OLED (#000000) con destellos Neón Verde y Cian/Blanco.
 */
class VisualEngine {
  constructor() {
    this.stageContainer = null;
    this.beatNumberEl = null;
    this.flashOverlayEl = null;
    this.dotsContainerEl = null;
    this.flashDuration = 90; // Duración del destello en ms (rápido para OLED)
    this.flashTimer = null;
    this.hapticEnabled = true;
  }

  init(options = {}) {
    this.stageContainer = options.stageContainer || document.getElementById('stage-view');
    this.beatNumberEl = options.beatNumberEl || document.getElementById('beat-number');
    this.flashOverlayEl = options.flashOverlayEl || document.getElementById('flash-overlay');
    this.dotsContainerEl = options.dotsContainerEl || document.getElementById('metric-dots');
    this.hapticEnabled = options.hapticEnabled !== undefined ? options.hapticEnabled : true;
  }

  setHapticEnabled(enabled) {
    this.hapticEnabled = !!enabled;
  }

  /**
   * Actualiza los puntos/indicadores según la métrica activa
   */
  updateMetricDots(numerator, currentBeat = 0) {
    if (!this.dotsContainerEl) return;

    this.dotsContainerEl.innerHTML = '';
    const total = Math.max(1, parseInt(numerator, 10) || 4);

    for (let i = 1; i <= total; i++) {
      const dot = document.createElement('div');
      dot.className = 'metric-dot' + (i === 1 ? ' dot-accent' : '');
      dot.dataset.beat = i;

      if (i === currentBeat) {
        dot.classList.add(i === 1 ? 'active-accent' : 'active-beat');
      }

      this.dotsContainerEl.appendChild(dot);
    }
  }

  /**
   * Dispara el destello visual de pantalla completa para el pulso actual
   */
  triggerBeat(beatData) {
    const { beat, totalBeats, isAccent } = beatData;

    requestAnimationFrame(() => {
      // 1. Actualizar el número gigante en pantalla
      if (this.beatNumberEl) {
        this.beatNumberEl.textContent = beat;
        this.beatNumberEl.className = 'beat-number ' + (isAccent ? 'accent-num' : 'sub-num');
      }

      // 2. Destello de pantalla completa
      if (this.flashOverlayEl) {
        // Limpiar temporizador previo si existía
        if (this.flashTimer) {
          clearTimeout(this.flashTimer);
        }

        // Aplicar clase de destello
        this.flashOverlayEl.className = 'flash-overlay ' + (isAccent ? 'flash-accent' : 'flash-sub');

        // Retorno ultra rápido a negro absoluto
        this.flashTimer = setTimeout(() => {
          if (this.flashOverlayEl) {
            this.flashOverlayEl.className = 'flash-overlay flash-idle';
          }
        }, this.flashDuration);
      }

      // 3. Actualizar puntos métricos
      if (this.dotsContainerEl) {
        const dots = this.dotsContainerEl.querySelectorAll('.metric-dot');
        dots.forEach((dot, index) => {
          const dotBeat = index + 1;
          dot.classList.remove('active-accent', 'active-beat');
          if (dotBeat === beat) {
            dot.classList.add(isAccent ? 'active-accent' : 'active-beat');
          }
        });
      }

      // 4. Feedback háptico en dispositivos compatibles (vibración sutil)
      if (this.hapticEnabled && 'vibrate' in navigator) {
        try {
          if (isAccent) {
            navigator.vibrate(35); // Acento más notorio
          } else {
            navigator.vibrate(12); // Pulso sutil
          }
        } catch (e) {
          // Ignorar restricciones de vibración en navegadores
        }
      }
    });
  }

  /**
   * Resetea el estado visual cuando se detiene el metrónomo
   */
  reset(numerator = 4) {
    if (this.beatNumberEl) {
      this.beatNumberEl.textContent = '1';
      this.beatNumberEl.className = 'beat-number idle-num';
    }

    if (this.flashOverlayEl) {
      if (this.flashTimer) clearTimeout(this.flashTimer);
      this.flashOverlayEl.className = 'flash-overlay flash-idle';
    }

    this.updateMetricDots(numerator, 0);
  }
}

window.visualEngine = new VisualEngine();
