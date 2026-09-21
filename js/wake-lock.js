/**
 * Metrónomo MK - Screen Wake Lock API Manager
 * Mantiene la pantalla encendida durante ensayos y conciertos.
 */
class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;
    this.isActive = false;
    this.listeners = [];

    if (this.isSupported) {
      // Re-adquirir Wake Lock automáticamente cuando la pestaña vuelve a primer plano
      document.addEventListener('visibilitychange', async () => {
        if (this.isActive && document.visibilityState === 'visible') {
          await this.request();
        }
      });
    } else {
      console.warn('[WakeLock] API no soportada en este navegador. Se usará fallback de actividad.');
    }
  }

  /**
   * Solicita el bloqueo de apagado de pantalla
   */
  async request() {
    if (!this.isSupported) return false;

    try {
      if (this.wakeLock !== null && !this.wakeLock.released) {
        return true; // Ya está activo
      }

      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isActive = true;

      this.wakeLock.addEventListener('release', () => {
        // Notificar que se liberó
        this._notify(false);
      });

      console.log('[WakeLock] Pantalla bloqueada para mantenerse siempre activa.');
      this._notify(true);
      return true;
    } catch (err) {
      console.error(`[WakeLock Error]: ${err.name}, ${err.message}`);
      this.isActive = false;
      this._notify(false);
      return false;
    }
  }

  /**
   * Libera el bloqueo de pantalla
   */
  async release() {
    if (!this.wakeLock) return;

    try {
      this.isActive = false;
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('[WakeLock] Bloqueo de pantalla liberado.');
      this._notify(false);
    } catch (err) {
      console.error('[WakeLock Release Error]:', err);
    }
  }

  /**
   * Alterna el estado del wake lock
   */
  async toggle() {
    if (this.isActive) {
      await this.release();
    } else {
      await this.request();
    }
    return this.isActive;
  }

  /**
   * Suscribe un callback para cambios de estado
   */
  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      callback(this.isActive);
    }
  }

  _notify(state) {
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

// Exportar instancia singleton
window.wakeLockManager = new WakeLockManager();
