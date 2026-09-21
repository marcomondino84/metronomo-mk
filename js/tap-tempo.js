/**
 * Metrónomo MK - Tap Tempo Detector
 * Detector de tempo por pulsación manual con media móvil ponderada y auto-reset.
 */
class TapTempo {
  constructor() {
    this.tapTimes = [];
    this.maxTaps = 8;
    this.timeoutMs = 2500; // 2.5 segundos de inactividad para resetear
    this.resetTimer = null;
    this.onBpmCalculated = null;
    this.onTap = null;
  }

  tap() {
    const now = performance.now();

    // Limpiar temporizador de auto-reset
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    // Si el último tap fue hace más de timeoutMs, reiniciar lista
    if (this.tapTimes.length > 0) {
      const lastTap = this.tapTimes[this.tapTimes.length - 1];
      if (now - lastTap > this.timeoutMs) {
        this.tapTimes = [];
      }
    }

    this.tapTimes.push(now);

    // Mantener sólo los últimos N taps
    if (this.tapTimes.length > this.maxTaps) {
      this.tapTimes.shift();
    }

    // Programar auto-reset
    this.resetTimer = setTimeout(() => {
      this.reset();
    }, this.timeoutMs);

    let calculatedBpm = null;

    if (this.tapTimes.length >= 2) {
      // Calcular intervalos entre taps sucesivos
      const intervals = [];
      for (let i = 1; i < this.tapTimes.length; i++) {
        intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
      }

      // Filtrar posibles outliers si hay suficientes muestras
      let validIntervals = intervals;
      if (intervals.length >= 4) {
        const sorted = [...intervals].sort((a, b) => a - b);
        // Excluir el menor y mayor
        validIntervals = sorted.slice(1, sorted.length - 1);
      }

      // Promedio ponderado (dando más peso a los taps más recientes)
      let weightedSum = 0;
      let weightTotal = 0;
      validIntervals.forEach((interval, idx) => {
        const weight = idx + 1;
        weightedSum += interval * weight;
        weightTotal += weight;
      });

      const averageIntervalMs = weightedSum / weightTotal;
      calculatedBpm = Math.round(60000 / averageIntervalMs);
      calculatedBpm = Math.max(20, Math.min(360, calculatedBpm));

      if (this.onBpmCalculated) {
        this.onBpmCalculated(calculatedBpm, this.tapTimes.length);
      }
    }

    if (this.onTap) {
      this.onTap({
        count: this.tapTimes.length,
        bpm: calculatedBpm
      });
    }

    // Vibración corta de respuesta
    if ('vibrate' in navigator) {
      try { navigator.vibrate(20); } catch (e) {}
    }

    return calculatedBpm;
  }

  reset() {
    this.tapTimes = [];
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}

window.tapTempo = new TapTempo();
