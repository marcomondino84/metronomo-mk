/**
 * Metrónomo MK - Drum Notation & Rhythm Cheat Sheet Engine
 * Genera notación visual de batería en pentagrama vectorial (SVG) para 1 o 2 compases.
 * 100% nativo, ligero, offline y diseñado para alta legibilidad en escenario OLED.
 */

class DrumNotationEngine {
  constructor() {
    this.PRESETS = {
      'rock-standard': {
        name: '🥁 Rock Clásico (Bombo 1/3, Caja 2/4)',
        bars: 1,
        tracks: {
          hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        annotation: 'Base sólida en corcheas'
      },
      'four-on-floor': {
        name: '⚡ Cuatro al Piso / Disco Funk',
        bars: 1,
        tracks: {
          hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        annotation: 'Bombo a tierra en los 4 tiempos'
      },
      'rock-heavy': {
        name: '🎸 Rock Pesado / Doble Bombo',
        bars: 1,
        tracks: {
          hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          kick:  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        annotation: 'Patrón de bombo sincopado'
      },
      'intro-fill': {
        name: '🥁 Redoble / Fill de Entrada (2 compases)',
        bars: 2,
        tracks: {
          hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
          kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,  1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0]
        },
        annotation: 'Redoble de caja y toms terminando en crash'
      },
      'half-time': {
        name: '🎵 Medio Tiempo / Balada',
        bars: 1,
        tracks: {
          hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
          kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        annotation: 'Caja únicamente en tiempo 3'
      },
      'ternary-3-4': {
        name: '📐 Compás 3/4 (Vals / Ternario)',
        bars: 1,
        tracks: {
          hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
          snare: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
          kick:  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        annotation: 'Bombo en 1, caja en 2 y 3'
      },
      'break-entry': {
        name: '🛑 Corte / Entrada en 4',
        bars: 1,
        tracks: {
          hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
          snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
          kick:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          tom:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        annotation: 'Silencio en 1-3, entrada en 4'
      }
    };
  }

  /**
   * Crea un patrón vacío de 1 o 2 compases
   */
  createEmptyPattern(bars = 1, numerator = 4) {
    const stepsPerBar = numerator === 3 ? 12 : 16;
    const totalSteps = stepsPerBar * bars;
    return {
      bars: Math.min(2, Math.max(1, bars)),
      numerator: numerator,
      stepsPerBar: stepsPerBar,
      annotation: '',
      tracks: {
        hihat: new Array(totalSteps).fill(0),
        snare: new Array(totalSteps).fill(0),
        kick:  new Array(totalSteps).fill(0),
        tom:   new Array(totalSteps).fill(0)
      }
    };
  }

  /**
   * Obtiene copia profunda de un preset
   */
  getPreset(presetKey, numerator = 4) {
    const preset = this.PRESETS[presetKey];
    if (!preset) return null;
    const stepsPerBar = numerator === 3 ? 12 : 16;
    const totalSteps = stepsPerBar * preset.bars;

    const adaptArray = (arr) => {
      const res = new Array(totalSteps).fill(0);
      for (let i = 0; i < Math.min(arr.length, totalSteps); i++) {
        res[i] = arr[i];
      }
      return res;
    };

    return {
      bars: preset.bars,
      numerator: numerator,
      stepsPerBar: stepsPerBar,
      annotation: preset.annotation || '',
      tracks: {
        hihat: adaptArray(preset.tracks.hihat),
        snare: adaptArray(preset.tracks.snare),
        kick:  adaptArray(preset.tracks.kick),
        tom:   adaptArray(preset.tracks.tom)
      }
    };
  }

  /**
   * Genera el SVG nítido y estilizado del pentagrama de batería
   * @param {Object} pattern - Objeto con bars, tracks, annotation
   * @param {Object} options - { width, height, isCompact }
   */
  renderToSVG(pattern, options = {}) {
    if (!pattern || !pattern.tracks) {
      return '';
    }

    const bars = Math.min(2, Math.max(1, pattern.bars || 1));
    const numerator = pattern.numerator || 4;
    const stepsPerBar = pattern.stepsPerBar || (numerator === 3 ? 12 : 16);
    const totalSteps = stepsPerBar * bars;

    // Dimensiones del pentagrama
    const svgWidth = options.width || (bars === 1 ? 460 : 720);
    const svgHeight = options.height || 105;
    const marginLeft = 48;
    const marginRight = 18;

    // Posición vertical de las 5 líneas del pentagrama
    const staveTop = 32;
    const lineSpacing = 9;
    const staveBottom = staveTop + lineSpacing * 4;

    // Alturas de notas estándar en pentagrama de percusión:
    // Hi-Hat / Platillo: espacio arriba de la línea superior (y ≈ staveTop - 7) -> 'x'
    // Tom: 4to espacio / línea superior
    // Snare (Caja): 3er espacio
    // Kick (Bombo): 1er espacio
    const yHihat = staveTop - 7;
    const yTom   = staveTop + lineSpacing * 0.6;
    const ySnare = staveTop + lineSpacing * 1.6;
    const yKick  = staveTop + lineSpacing * 3.4;

    let svg = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="drum-score-svg" xmlns="http://www.w3.org/2000/svg">`;

    // 1. Las 5 líneas del pentagrama
    for (let i = 0; i < 5; i++) {
      const y = staveTop + i * lineSpacing;
      svg += `<line x1="${marginLeft - 14}" y1="${y}" x2="${svgWidth - marginRight}" y2="${y}" stroke="rgba(255,255,255,0.22)" stroke-width="1.2"/>`;
    }

    // 2. Clave de percusión neutra (dos barras verticales gruesas ||)
    svg += `<line x1="${marginLeft - 10}" y1="${staveTop}" x2="${marginLeft - 10}" y2="${staveBottom}" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>`;
    svg += `<line x1="${marginLeft - 4}" y1="${staveTop}" x2="${marginLeft - 4}" y2="${staveBottom}" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>`;

    // 3. Indicador de métrica (ej. 4/4 o 3/4)
    const metricText = `${numerator}`;
    const metricSubText = pattern.denominator || 4;
    svg += `<text x="${marginLeft + 10}" y="${staveTop + lineSpacing * 1.6}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="900" fill="#00FF66" text-anchor="middle">${metricText}</text>`;
    svg += `<text x="${marginLeft + 10}" y="${staveTop + lineSpacing * 3.7}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="900" fill="#00FF66" text-anchor="middle">${metricSubText}</text>`;

    const notesStartX = marginLeft + 28;
    const barWidth = (svgWidth - notesStartX - marginRight) / bars;

    // 4. Barras divisorias de compás
    for (let b = 1; b <= bars; b++) {
      const barX = notesStartX + b * barWidth;
      if (b < bars) {
        // Línea simple divisoria de compás
        svg += `<line x1="${barX}" y1="${staveTop}" x2="${barX}" y2="${staveBottom}" stroke="rgba(255,255,255,0.4)" stroke-width="1.6"/>`;
      } else {
        // Doble barra final
        svg += `<line x1="${barX - 4}" y1="${staveTop}" x2="${barX - 4}" y2="${staveBottom}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>`;
        svg += `<line x1="${barX}" y1="${staveTop}" x2="${barX}" y2="${staveBottom}" stroke="#00FF66" stroke-width="3"/>`;
      }
    }

    // 5. Títulos de los compases arriba
    for (let b = 0; b < bars; b++) {
      const labelX = notesStartX + b * barWidth + barWidth / 2;
      svg += `<text x="${labelX}" y="${staveTop - 14}" font-family="'Outfit', sans-serif" font-size="10.5" font-weight="800" fill="rgba(255,255,255,0.6)" letter-spacing="1" text-anchor="middle">COMPÁS ${b + 1}</text>`;
    }

    // 6. Renderizado de las notas y pulsos
    const stepWidth = barWidth / stepsPerBar;

    for (let s = 0; s < totalSteps; s++) {
      const stepInBar = s % stepsPerBar;
      const barIndex = Math.floor(s / stepsPerBar);
      const x = notesStartX + barIndex * barWidth + (stepInBar + 0.5) * stepWidth;

      const hasHihat = pattern.tracks.hihat && pattern.tracks.hihat[s];
      const hasSnare = pattern.tracks.snare && pattern.tracks.snare[s];
      const hasKick  = pattern.tracks.kick  && pattern.tracks.kick[s];
      const hasTom   = pattern.tracks.tom   && pattern.tracks.tom[s];

      // Indicadores sutiles de tiempo principal
      const isQuarterNote = (stepsPerBar === 16 && s % 4 === 0) || (stepsPerBar === 12 && s % 4 === 0);
      if (isQuarterNote) {
        svg += `<line x1="${x}" y1="${staveBottom + 5}" x2="${x}" y2="${staveBottom + 9}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
      }

      // Plica (stem) si hay notas en este pulso
      if (hasHihat || hasSnare || hasKick || hasTom) {
        let topY = staveBottom + 4;
        let bottomY = staveTop - 12;

        if (hasHihat) topY = Math.min(topY, yHihat);
        if (hasTom)   topY = Math.min(topY, yTom);
        if (hasSnare) topY = Math.min(topY, ySnare);
        if (hasKick)  bottomY = Math.max(bottomY, yKick);

        svg += `<line x1="${x + 4.5}" y1="${Math.min(yHihat, topY) - 4}" x2="${x + 4.5}" y2="${Math.max(yKick, bottomY) + 4}" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"/>`;
      }

      // Dibujar Hi-Hat / Platillo (Cruz 'x')
      if (hasHihat) {
        const r = 4;
        svg += `<line x1="${x - r}" y1="${yHihat - r}" x2="${x + r}" y2="${yHihat + r}" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round"/>`;
        svg += `<line x1="${x - r}" y1="${yHihat + r}" x2="${x + r}" y2="${yHihat - r}" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round"/>`;
      }

      // Dibujar Tom (Círculo cian/violeta)
      if (hasTom) {
        svg += `<circle cx="${x}" cy="${yTom}" r="4.2" fill="#A855F7" stroke="#FFFFFF" stroke-width="1.2"/>`;
      }

      // Dibujar Snare / Caja (Círculo blanco brillante)
      if (hasSnare) {
        svg += `<circle cx="${x}" cy="${ySnare}" r="4.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>`;
      }

      // Dibujar Kick / Bombo (Círculo Neón Verde)
      if (hasKick) {
        svg += `<circle cx="${x}" cy="${yKick}" r="4.8" fill="#00FF66" stroke="#000000" stroke-width="1.2"/>`;
      }
    }

    // 7. Anotación de texto inferior si existe
    if (pattern.annotation && pattern.annotation.trim()) {
      const escText = pattern.annotation.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      svg += `<text x="${notesStartX + 4}" y="${svgHeight - 4}" font-family="'Outfit', sans-serif" font-size="11" font-weight="700" fill="#FACC15" font-style="italic">💡 ${escText}</text>`;
    }

    svg += `</svg>`;
    return svg;
  }
}

window.drumNotationEngine = new DrumNotationEngine();
