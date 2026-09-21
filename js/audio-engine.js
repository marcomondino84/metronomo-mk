/**
 * Metrónomo MK - High Precision Web Audio & Master Clock Engine
 * Reloj maestro con Lookahead Scheduling para cero latencia y sincronización visual exacta.
 */
class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    
    // Configuración rítmica
    this.bpm = 120;
    this.timeSignature = { numerator: 4, denominator: 4, label: '4/4' };
    
    // Parámetros de precisión (Lookahead Scheduler de Chris Wilson)
    this.lookahead = 20.0;          // Intervalo de verificación en ms
    this.scheduleAheadTime = 0.1;   // Cuánto tiempo en segundos se programa por anticipado (100ms)
    this.timerWorker = null;
    this.timerId = null;
    this.nextNoteTime = 0.0;
    this.currentBeat = 1;           // 1-indexed (1..numerator)
    
    // Configuración de audio
    this.audioEnabled = false;      // Silenciado por defecto según requerimiento
    this.volume = 0.8;
    this.accentFreq = 1800;         // Frecuencia en Hz para tiempo 1 (Acento)
    this.beatFreq = 950;            // Frecuencia en Hz para tiempos secundarios
    
    // Callbacks
    this.onBeatScheduled = null;    // Se dispara al programar un pulso (con tiempo exacto)
    this.onStateChange = null;      // Se dispara al reproducir/pausar
    this.onTick = null;             // Se dispara en el momento exacto del pulso visual
  }

  _initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setBpm(newBpm) {
    this.bpm = Math.max(20, Math.min(400, parseInt(newBpm, 10) || 120));
  }

  setTimeSignature(ts) {
    if (ts && ts.numerator && ts.denominator) {
      this.timeSignature = {
        numerator: Math.max(1, parseInt(ts.numerator, 10)),
        denominator: Math.max(1, parseInt(ts.denominator, 10)),
        label: ts.label || `${ts.numerator}/${ts.denominator}`
      };
      // Si el beat actual supera el nuevo numerador, reiniciar conteo
      if (this.currentBeat > this.timeSignature.numerator) {
        this.currentBeat = 1;
      }
    }
  }

  setAudioEnabled(enabled) {
    this.audioEnabled = !!enabled;
  }

  _calculateSecondsPerBeat() {
    // Para métricas con denominador 4 (ej. 4/4, 3/4, 5/4), un beat es una negra = 60 / BPM.
    // Para métricas compuestas con denominador 8 (ej. 6/8, 7/8, 12/8), si se cuenta por corchea: (60 / BPM) * (4 / denominator)
    const factor = 4.0 / this.timeSignature.denominator;
    return (60.0 / this.bpm) * factor;
  }

  _nextBeat() {
    const secondsPerBeat = this._calculateSecondsPerBeat();
    this.nextNoteTime += secondsPerBeat;
    
    this.currentBeat++;
    if (this.currentBeat > this.timeSignature.numerator) {
      this.currentBeat = 1;
    }
  }

  _playClick(time, isAccent) {
    if (!this.audioEnabled || !this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      if (isAccent) {
        // Pulso 1: Sonido penetrante y brillante
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.accentFreq, time);
        osc.frequency.exponentialRampToValueAtTime(300, time + 0.04);

        gainNode.gain.setValueAtTime(this.volume * 1.0, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
      } else {
        // Tiempos secundarios: Click corto y definido
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(this.beatFreq, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.03);

        gainNode.gain.setValueAtTime(this.volume * 0.65, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
      }

      osc.start(time);
      osc.stop(time + 0.05);
    } catch (e) {
      console.warn('[AudioEngine] Error reproduciendo click:', e);
    }
  }

  _scheduleBeat(beatNumber, time) {
    const isAccent = (beatNumber === 1);
    
    // 1. Sintetizar sonido si está activado
    this._playClick(time, isAccent);

    // 2. Programar notificación visual precisa
    const beatData = {
      beat: beatNumber,
      totalBeats: this.timeSignature.numerator,
      isAccent: isAccent,
      time: time,
      bpm: this.bpm,
      timeSignature: this.timeSignature
    };

    if (this.onBeatScheduled) {
      this.onBeatScheduled(beatData);
    }

    // Programar ejecución exacta de callback visual usando delay en ms relativo a audioCtx.currentTime
    if (this.onTick) {
      const delayMs = Math.max(0, (time - this.audioCtx.currentTime) * 1000);
      setTimeout(() => {
        if (this.isPlaying && this.onTick) {
          this.onTick(beatData);
        }
      }, delayMs);
    }
  }

  _scheduler() {
    // Mientras haya pulsos dentro de la ventana de programación anticipada
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this._scheduleBeat(this.currentBeat, this.nextNoteTime);
      this._nextBeat();
    }
  }

  start() {
    if (this.isPlaying) return;

    this._initContext();
    this.isPlaying = true;
    this.currentBeat = 1;
    this.nextNoteTime = this.audioCtx.currentTime + 0.05; // Breve margen para sincronía limpia

    // Iniciar loop de scheduling con temporizador de alta frecuencia
    this.timerId = setInterval(() => {
      if (this.isPlaying) {
        this._scheduler();
      }
    }, this.lookahead);

    if (this.onStateChange) {
      this.onStateChange(true);
    }
  }

  stop() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 1;

    if (this.onStateChange) {
      this.onStateChange(false);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

window.audioEngine = new AudioEngine();
