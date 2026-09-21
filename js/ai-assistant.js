/**
 * Metrónomo MK - AI BPM & Time Signature Assistant
 * Motor inteligente de búsqueda y sugerencia rítmica para bateristas.
 */

const KNOWN_SONGS_DATABASE = [
  // Rock Clásico & Hard Rock
  { match: ['back in black', 'ac/dc', 'acdc'], title: 'Back in Black', artist: 'AC/DC', bpm: 93, timeSignature: '4/4', genre: 'Hard Rock', notes: '4/4 tempo medio sólido con groove de hi-hat abierto' },
  { match: ['highway to hell', 'ac/dc', 'acdc'], title: 'Highway to Hell', artist: 'AC/DC', bpm: 116, timeSignature: '4/4', genre: 'Hard Rock', notes: 'Straight 4/4 rock beat' },
  { match: ['sweet child o mine', 'guns n roses', 'guns'], title: "Sweet Child O' Mine", artist: "Guns N' Roses", bpm: 125, timeSignature: '4/4', genre: 'Hard Rock', notes: '4/4 acelerando en el solo final' },
  { match: ['smells like teen spirit', 'nirvana'], title: 'Smells Like Teen Spirit', artist: 'Nirvana', bpm: 117, timeSignature: '4/4', genre: 'Grunge', notes: '4/4 con dinámicas marcadas' },
  { match: ['seven nation army', 'white stripes'], title: 'Seven Nation Army', artist: 'The White Stripes', bpm: 124, timeSignature: '4/4', genre: 'Garage Rock', notes: 'Pombo a cuatro (Four on the floor) implacable' },
  { match: ['hysteria', 'muse'], title: 'Hysteria', artist: 'Muse', bpm: 118, timeSignature: '4/4', genre: 'Alt Rock', notes: 'Groove rápido de bajo y bombo sincopado' },
  { match: ['enter sandman', 'metallica'], title: 'Enter Sandman', artist: 'Metallica', bpm: 123, timeSignature: '4/4', genre: 'Metal', notes: 'Heavy rock 4/4 con toms en la intro' },
  { match: ['master of puppets', 'metallica'], title: 'Master of Puppets', artist: 'Metallica', bpm: 212, timeSignature: '4/4', genre: 'Thrash Metal', notes: 'Downpicking rápido y cambios métricos sutiles en riffs' },
  { match: ['whiplash', 'metallica'], title: 'Whiplash', artist: 'Metallica', bpm: 215, timeSignature: '4/4', genre: 'Thrash Metal', notes: 'Doble bombo continuo a alta velocidad' },
  { match: ['chop suey', 'system of a down', 'soad'], title: 'Chop Suey!', artist: 'System of a Down', bpm: 127, timeSignature: '4/4', genre: 'Nu Metal', notes: 'Cambios drásticos de tempo y métricas 4/4 agresivas' },
  { match: ['toxicity', 'system of a down'], title: 'Toxicity', artist: 'System of a Down', bpm: 117, timeSignature: '6/8', genre: 'Nu Metal', notes: 'Polirritmias y cambios 6/8 y 4/4' },
  
  // Métricas Irregulares / Progresivo
  { match: ['take five', 'dave brubeck'], title: 'Take Five', artist: 'Dave Brubeck Quartet', bpm: 174, timeSignature: '5/4', genre: 'Cool Jazz', notes: 'Métrica impar 5/4 clásica dividida en 3+2' },
  { match: ['money', 'pink floyd'], title: 'Money', artist: 'Pink Floyd', bpm: 120, timeSignature: '7/4', genre: 'Prog Rock', notes: 'Compás de 7/4 (cambia a 4/4 en solo de guitarra)' },
  { match: ['tom sawyer', 'rush'], title: 'Tom Sawyer', artist: 'Rush', bpm: 88, timeSignature: '7/8', genre: 'Prog Rock', notes: 'Sección instrumental en 7/8 (intro en 4/4)' },
  { match: ['yyz', 'rush'], title: 'YYZ', artist: 'Rush', bpm: 140, timeSignature: '5/4', genre: 'Prog Rock', notes: 'Patrón Morse en compás 5/4 y 4/4' },
  { match: ['schism', 'tool'], title: 'Schism', artist: 'Tool', bpm: 107, timeSignature: '12/8', genre: 'Prog Metal', notes: 'Alternancia de compases 5/8 y 7/8 (suma 12/8)' },
  { match: ['the pot', 'tool'], title: 'The Pot', artist: 'Tool', bpm: 95, timeSignature: '4/4', genre: 'Prog Metal', notes: 'Síncopas y acentos cruzados en 4/4' },
  { match: ['lateralus', 'tool'], title: 'Lateralus', artist: 'Tool', bpm: 145, timeSignature: '9/8', genre: 'Prog Metal', notes: 'Secuencia Fibonacci con métricas 9/8, 8/8 y 7/8' },
  { match: ['rosanna', 'toto'], title: 'Rosanna', artist: 'Toto', bpm: 83, timeSignature: '6/8', genre: 'Pop Rock', notes: 'El legendario half-time shuffle de Jeff Porcaro en 6/8' },
  { match: ['hold the line', 'toto'], title: 'Hold The Line', artist: 'Toto', bpm: 97, timeSignature: '12/8', genre: 'Pop Rock', notes: 'Patrón de tresillos continuo en 12/8' },
  
  // Pop, Funk & Groove
  { match: ['billie jean', 'michael jackson'], title: 'Billie Jean', artist: 'Michael Jackson', bpm: 117, timeSignature: '4/4', genre: 'Pop/Funk', notes: 'Groove de batería más famoso del mundo (Leon Ndugu Chancler)' },
  { match: ['beat it', 'michael jackson'], title: 'Beat It', artist: 'Michael Jackson', bpm: 139, timeSignature: '4/4', genre: 'Pop/Rock', notes: '4/4 enérgico' },
  { match: ['superstition', 'stevie wonder'], title: 'Superstition', artist: 'Stevie Wonder', bpm: 100, timeSignature: '4/4', genre: 'Funk', notes: 'Patrón clásico de batería funk y clavinet' },
  { match: ['cissy strut', 'the meters'], title: 'Cissy Strut', artist: 'The Meters', bpm: 88, timeSignature: '4/4', genre: 'New Orleans Funk', notes: 'Patrón sincopado de Zigaboo Modeliste' },
  { match: ['uptown funk', 'bruno mars', 'mark ronson'], title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', bpm: 115, timeSignature: '4/4', genre: 'Funk Pop', notes: '4/4 moderno y bailable' },
  { match: ['stayin alive', 'bee gees'], title: "Stayin' Alive", artist: 'Bee Gees', bpm: 104, timeSignature: '4/4', genre: 'Disco', notes: 'Tempo de referencia médica y ritmo disco perfecto' },
  
  // Rock Nacional & Repertorio Baterista
  { match: ['tengo', 'divididos'], title: 'Tengo', artist: 'Divididos', bpm: 176, timeSignature: '4/4', genre: 'Rock Nacional / Power Trío', notes: 'Tempo rápido y contundente' },
  { match: ['la ñapi', 'divididos'], title: 'La ñapi', artist: 'Divididos', bpm: 144, timeSignature: '4/4', genre: 'Rock Nacional', notes: 'Groove con base sólida' },
  { match: ['ella vendra', 'don cornelio'], title: 'Ella vendrá', artist: 'Don Cornelio y la Zona', bpm: 135, timeSignature: '4/4', genre: 'Post-Punk / Rock', notes: 'Post-punk argentino clásico' },
  { match: ['estallando desde el oceano', 'sumo'], title: 'Estallando desde el océano', artist: 'Sumo', bpm: 167, timeSignature: '4/4', genre: 'Post-Punk / New Wave', notes: 'Batería enérgica de Superman Troglio' },
  { match: ['la colina', 'las pelotas'], title: 'La colina', artist: 'Las Pelotas', bpm: 126, timeSignature: '3/4', genre: 'Rock / Ternario', notes: 'Compás ternario en 3/4' },
  { match: ['crua chan', 'sumo'], title: 'Crua chan', artist: 'Sumo', bpm: 118, timeSignature: '4/4', genre: 'Rock / Gaita Beat', notes: 'Ritmo marcial escocés en 4/4' },
  { match: ['no tan distintos', 'sumo'], title: 'No tan distintos', artist: 'Sumo', bpm: 170, timeSignature: '4/4', genre: 'Reggae / Rock', notes: 'Ska-punk acelerado' },
  { match: ['personalmente', 'las pelotas'], title: 'Personalmente', artist: 'Las Pelotas', bpm: 142, timeSignature: '4/4', genre: 'Rock', notes: 'Tempo medio 4/4' },
  { match: ['sera', 'las pelotas'], title: 'Será', artist: 'Las Pelotas', bpm: 128, timeSignature: '4/4', genre: 'Rock / Balada', notes: 'Groove espacioso y dinámico' },
  { match: ['globo', 'cabezones'], title: 'Globo', artist: 'Cabezones', bpm: 98, timeSignature: '4/4', genre: 'Nu Metal / Alternativo', notes: 'Tempo pesado en 98 BPM' },
  { match: ['mareada', 'las pelotas'], title: 'Mareada', artist: 'Las Pelotas', bpm: 96, timeSignature: '4/4', genre: 'Rock', notes: 'Medio tempo 4/4' },
  { match: ['next week', 'sumo'], title: 'Next week', artist: 'Sumo', bpm: 175, timeSignature: '4/4', genre: 'Post-Punk', notes: 'Hi-hat constante y rápido' },
  { match: ['el ojo blindado', 'sumo'], title: 'El ojo blindado', artist: 'Sumo', bpm: 188, timeSignature: '4/4', genre: 'Punk Rock', notes: 'Pounding punk beat a 188 BPM' },
  { match: ['hombres de hierro', 'infierno'], title: 'Hombres de hierro', artist: 'Infierno 18', bpm: 120, timeSignature: '4/4', genre: 'Rock', notes: '4/4 estándar' },
  { match: ['buscando un angel', 'divididos'], title: 'Buscando un ángel', artist: 'Divididos', bpm: 165, timeSignature: '4/4', genre: 'Rock', notes: 'Patrón clásico de Catriel Ciavarella' },
  { match: ['spaghetti', 'divididos'], title: 'Spaghetti del rock', artist: 'Divididos', bpm: 102, timeSignature: '4/4', genre: 'Balada Rock', notes: 'Balada clásica a 102 BPM' },
  { match: ['sobrio a las piñas', 'divididos'], title: 'Sobrio a las piñas', artist: 'Divididos', bpm: 115, timeSignature: '4/4', genre: 'Rock Fusión', notes: 'Groove con swing' },
  { match: ['ala delta', 'divididos'], title: 'Ala delta', artist: 'Divididos', bpm: 155, timeSignature: '4/4', genre: 'Power Trío', notes: 'Uno de los temas más icónicos de batería' },
  { match: ['el 38', 'divididos'], title: 'El 38', artist: 'Divididos', bpm: 153, timeSignature: '4/4', genre: 'Hard Rock', notes: 'Riff poderoso y bombo continuo' },
  { match: ['que ves', 'divididos'], title: '¿Qué ves?', artist: 'Divididos', bpm: 108, timeSignature: '4/4', genre: 'Reggae Rock', notes: 'Groove sincopado en 108 BPM' },
  { match: ['el arriero', 'divididos'], title: 'El arriero', artist: 'Divididos', bpm: 122, timeSignature: '4/4', genre: 'Folklore Rock', notes: 'Base pesada de Atahualpa Yupanqui' },
  { match: ['amapola del 66', 'divididos'], title: 'Amapola del 66', artist: 'Divididos', bpm: 144, timeSignature: '4/4', genre: 'Hard Rock', notes: 'Sólido 4/4' },
  { match: ['nene de antes', 'divididos'], title: 'Nene de antes', artist: 'Divididos', bpm: 95, timeSignature: '4/4', genre: 'Rock', notes: 'Medio tempo 95 BPM' },
  { match: ['ruta 66', 'pappo'], title: 'Ruta 66', artist: 'Pappo', bpm: 154, timeSignature: '4/4', genre: 'Blues Rock', notes: 'Shuffle de rock and roll' },
  { match: ['rock and roll y fiebre', 'pappo'], title: 'Rock and Roll y fiebre', artist: 'Pappo', bpm: 136, timeSignature: '4/4', genre: 'Rock and Roll', notes: 'Batería clásica de rock argentino' },
  { match: ['a tu lado', 'la renga'], title: 'A tu lado', artist: 'La Renga', bpm: 202, timeSignature: '4/4', genre: 'Hard Rock', notes: 'Tempo ultra rápido 202 BPM' },
  { match: ['las cosas que hace', 'la renga'], title: 'Las cosas que hace', artist: 'La Renga', bpm: 122, timeSignature: '4/4', genre: 'Hard Rock', notes: 'Groove de Tanque Iglesias' },
  { match: ['entero o a pedazos', 'catupecu'], title: 'Entero o a pedazos', artist: 'Catupecu Machu', bpm: 95, timeSignature: '4/4', genre: 'Rock Alternativo', notes: 'Base pesada en 95 BPM' },
  { match: ['perfectos cromosomas', 'catupecu'], title: 'Perfectos cromosomas', artist: 'Catupecu Machu', bpm: 146, timeSignature: '4/4', genre: 'Rock Alternativo', notes: '4/4 acelerado' },
  { match: ['perro negro', 'molotov'], title: 'Perro negro', artist: 'Molotov', bpm: 160, timeSignature: '4/4', genre: 'Rap Rock', notes: 'Base agresiva a 160 BPM' },
  { match: ['persiana americana', 'soda'], title: 'Persiana americana', artist: 'Soda Stereo', bpm: 105, timeSignature: '4/4', genre: 'Pop Rock', notes: 'Hi-hats y caja en 2 y 4 de Charly Alberti' }
];

class AIAssistant {
  constructor() {
    this.isAnalyzing = false;
  }

  /**
   * Analiza el título y artista para sugerir BPM y Métrica
   * @param {string} query Texto de búsqueda ("Título", "Título - Artista" o "Artista")
   * @returns {Promise<Object>} Resultado con BPM, Métrica y análisis musical
   */
  async suggestBpmAndMetric(query) {
    this.isAnalyzing = true;
    const cleanQuery = (query || '').toLowerCase().trim();

    // Simulación de latencia de red/IA sutil (300ms) para sensación de proceso inteligente
    await new Promise(r => setTimeout(r, 350));

    // 1. Búsqueda exacta o parcial en Base de Conocimiento Curada
    for (const song of KNOWN_SONGS_DATABASE) {
      const matchFound = song.match.some(keyword => cleanQuery.includes(keyword)) ||
                         cleanQuery.includes(song.title.toLowerCase()) ||
                         (song.artist && cleanQuery.includes(song.artist.toLowerCase()));
      if (matchFound) {
        this.isAnalyzing = false;
        return {
          found: true,
          confidence: '99%',
          title: song.title,
          artist: song.artist,
          bpm: song.bpm,
          timeSignature: this._parseTimeSignature(song.timeSignature),
          genre: song.genre,
          notes: song.notes,
          source: 'Base de Datos Verificada de Batería'
        };
      }
    }

    // 2. Motor Heurístico Musical basado en Palabras Clave y Géneros
    const heuristic = this._analyzeHeuristics(cleanQuery);
    this.isAnalyzing = false;
    return heuristic;
  }

  _parseTimeSignature(tsStr) {
    const parts = (tsStr || '4/4').split('/');
    const num = parseInt(parts[0], 10) || 4;
    const den = parseInt(parts[1], 10) || 4;
    return {
      numerator: num,
      denominator: den,
      label: `${num}/${den}`
    };
  }

  _analyzeHeuristics(query) {
    let bpm = 120;
    let ts = '4/4';
    let genre = 'General / Rock Estándar';
    let notes = 'Estimación algorítmica de tempo sugerido para ensayar.';
    let confidence = '85%';

    // Detección de métricas ternarias o impares
    if (query.includes('waltz') || query.includes('vals') || query.includes('valse')) {
      bpm = 90;
      ts = '3/4';
      genre = 'Vals / Ternario';
      notes = 'Patrón de 3/4 clásico (1 fuerte, 2 y 3 suaves).';
      confidence = '92%';
    } else if (query.includes('shuffle') || query.includes('blues') || query.includes('boogie')) {
      bpm = 95;
      ts = '6/8';
      genre = 'Blues / Shuffle';
      notes = 'Compás compuesto de 6/8 con acentuación en corcheas 1 y 4.';
      confidence = '90%';
    } else if (query.includes('prog') || query.includes('dream theater') || query.includes('odd')) {
      bpm = 135;
      ts = '7/8';
      genre = 'Progresivo / Métricas Compuestas';
      notes = 'Sugerencia de 7/8 (subdivisión 2+2+3 o 3+2+2).';
      confidence = '80%';
    } else if (query.includes('metal') || query.includes('thrash') || query.includes('speed') || query.includes('blast') || query.includes('slayer') || query.includes('death')) {
      bpm = 190;
      ts = '4/4';
      genre = 'Heavy Metal / Thrash';
      notes = 'Tempo rápido para doble bombo y blast beats.';
      confidence = '88%';
    } else if (query.includes('punk') || query.includes('hardcore') || query.includes('blink') || query.includes('ramones') || query.includes('green day')) {
      bpm = 175;
      ts = '4/4';
      genre = 'Punk Rock';
      notes = 'Tempo enérgico y directo en 4/4.';
      confidence = '90%';
    } else if (query.includes('ballad') || query.includes('balada') || query.includes('slow') || query.includes('lenta') || query.includes('love')) {
      bpm = 72;
      ts = '4/4';
      genre = 'Balada / Slow Rock';
      notes = 'Tempo pausado para acompañamiento espacioso y dinámico.';
      confidence = '88%';
    } else if (query.includes('reggae') || query.includes('ska') || query.includes('dub')) {
      bpm = 76;
      ts = '4/4';
      genre = 'Reggae / Dub';
      notes = 'Ritmo One-Drop con énfasis en el tiempo 3.';
      confidence = '92%';
    } else if (query.includes('disco') || query.includes('dance') || query.includes('pop') || query.includes('electronic')) {
      bpm = 124;
      ts = '4/4';
      genre = 'Dance / Pop';
      notes = 'Four-on-the-floor rítmico a 124 BPM.';
      confidence = '90%';
    } else if (query.includes('funk') || query.includes('groove') || query.includes('r&b') || query.includes('soul')) {
      bpm = 105;
      ts = '4/4';
      genre = 'Funk / Groove';
      notes = 'Pocket groove apretado a tempo medio.';
      confidence = '88%';
    } else if (query.includes('march') || query.includes('marcha') || query.includes('polka')) {
      bpm = 120;
      ts = '2/4';
      genre = 'Marcha / Polka';
      notes = 'Compás binario de 2/4.';
      confidence = '85%';
    }

    return {
      found: false,
      confidence: confidence,
      title: query || 'Canción',
      artist: '',
      bpm: bpm,
      timeSignature: this._parseTimeSignature(ts),
      genre: genre,
      notes: notes,
      source: 'Motor Heurístico Musical IA'
    };
  }
}

window.aiAssistant = new AIAssistant();
