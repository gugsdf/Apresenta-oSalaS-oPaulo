/* =========================================================
   ORQUESTRA INTERATIVA — script principal
   ========================================================= */

/* ---------- ÁUDIO ---------- */
let audioCtx = null;
function ctx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  return audioCtx;
}
function tone(freq, dur=0.5, type='sine', gainAmt=0.5){
  try{
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(gainAmt, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  }catch(e){}
}
function noiseHit(dur=0.25, filterFreq=1200){
  try{
    const c = ctx();
    const bufferSize = c.sampleRate * dur;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.6, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime+dur);
    src.connect(filt); filt.connect(gain); gain.connect(c.destination);
    src.start();
  }catch(e){}
}

/* ---------- DADOS DOS INSTRUMENTOS ---------- */
const instrumentos = {
  violino:{nome:'Violino',familia:'cordas',emoji:'🎻',faixa:'196–3136 Hz',freq:660,
    desc:'Cordas curtas e finas vibram rapidamente, dando o som mais agudo e brilhante das cordas.',
    curiosidades:['4 cordas afinadas em quintas','O arco mantém a vibração contínua','Cordas curtas = frequência alta'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/ViolinVN.png/200px-ViolinVN.png'},
  viola:{nome:'Viola',familia:'cordas',emoji:'🎻',faixa:'130–2080 Hz',freq:400,
    desc:'Maior que o violino, produz um som mais quente e um pouco mais grave.',
    curiosidades:['Timbre aveludado','Corpo maior que o do violino'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Viola_VL100.png/200px-Viola_VL100.png'},
  violoncelo:{nome:'Violoncelo',familia:'cordas',emoji:'🎻',faixa:'65–800 Hz',freq:300,
    desc:'Tocado entre as pernas, aproxima-se da voz humana grave. Cordas longas e espessas.',
    curiosidades:['Registro próximo do barítono','Muito usado em melodias expressivas'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cello_front_side.png/200px-Cello_front_side.png'},
  contrabaixo:{nome:'Contrabaixo',familia:'cordas',emoji:'🎻',faixa:'41–300 Hz',freq:170,
    desc:'O maior e mais grave das cordas — a base harmônica da orquestra.',
    curiosidades:['Cordas longuíssimas','Fundamenta a harmonia'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Double_bass_cs.jpg/200px-Double_bass_cs.jpg'},
  harpa:{nome:'Harpa',familia:'cordas',emoji:'🎻',faixa:'32–3520 Hz',freq:440,
    desc:'As cordas são pinçadas diretamente pelos dedos, sem arco — som suave, brilhante e muito harmonioso.',
    curiosidades:['Possui geralmente 47 cordas e 7 pedais','Os pedais alteram a afinação durante a execução','Classificada como cordas pinçadas (dedilhado)'],
    imagem:'https://commons.wikimedia.org/wiki/Special:FilePath/Harp.svg'},
  piano:{nome:'Piano',familia:'cordas',emoji:'🎹',faixa:'27–4186 Hz',freq:440,
    desc:'Ao pressionar uma tecla, um martelo revestido de feltro golpeia a corda correspondente, fazendo-a vibrar.',
    curiosidades:['Tem aproximadamente 230 cordas','Embora seja da família das cordas, funciona por percussão','Some ao palco apenas quando a obra exige'],
    imagem:'https://commons.wikimedia.org/wiki/Special:FilePath/Grand%20piano%20and%20upright%20piano.jpg'},
  flauta:{nome:'Flauta',familia:'madeiras',emoji:'🪈',faixa:'262–2093 Hz',freq:900,
    desc:'Tubo aberto nas duas pontas; o ar é cortado na borda do bocal (embocadura livre).',
    curiosidades:['Sem palheta','Som cristalino'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flute_VL100.png/200px-Flute_VL100.png'},
  flautim:{nome:'Flautim',familia:'madeiras',emoji:'🪈',faixa:'587–4186 Hz',freq:1400,
    desc:'Flauta em miniatura — o instrumento mais agudo da orquestra.',
    curiosidades:['Tubo curtíssimo','Corta acima de toda a orquestra'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Piccolo.jpg/200px-Piccolo.jpg'},
  clarinete:{nome:'Clarinete',familia:'madeiras',emoji:'🎵',faixa:'165–1568 Hz',freq:500,
    desc:'Usa palheta simples: uma única lâmina vibra contra o bocal.',
    curiosidades:['Tubo fechado em uma ponta','Timbre quente e versátil'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/ClarinetMib.jpg/200px-ClarinetMib.jpg'},
  fagote:{nome:'Fagote',familia:'madeiras',emoji:'🎶',faixa:'87–698 Hz',freq:250,
    desc:'Palheta dupla e tubo comprido dobrado — o grave das madeiras.',
    curiosidades:['Maior instrumento de madeira','Palheta dupla'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Fagott_VL100.png/200px-Fagott_VL100.png'},
  trompete:{nome:'Trompete',familia:'metais',emoji:'🎺',faixa:'166–1865 Hz',freq:500,
    desc:'Tubo reto com válvulas; lábios vibrando no bocal criam o som.',
    curiosidades:['Som brilhante e penetrante','Muito usado em fanfarras'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Trumpet_VL100.png/200px-Trumpet_VL100.png'},
  trompa:{nome:'Trompa',familia:'metais',emoji:'🎺',faixa:'93–1865 Hz',freq:350,
    desc:'Tubo longo enroscado; some entre o quente e o brilhante.',
    curiosidades:['Tubo mais longo dos metais comuns','Muito flexível'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/FrenchHorn.jpg/200px-FrenchHorn.jpg'},
  trombone:{nome:'Trombone',familia:'metais',emoji:'🎺',faixa:'87–932 Hz',freq:250,
    desc:'A vara deslizante muda o comprimento do tubo de forma contínua.',
    curiosidades:['Único metal com vara','Som glorioso e expressivo'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Trombone_VL100.png/200px-Trombone_VL100.png'},
  tuba:{nome:'Tuba',familia:'metais',emoji:'🎺',faixa:'29–372 Hz',freq:150,
    desc:'O maior metal; tubo longuíssimo produz as notas mais graves da orquestra.',
    curiosidades:['Fundamento grave dos metais','Tubo enrolado gigante'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Tuba_VL100.png/200px-Tuba_VL100.png'},
  timpanos:{nome:'Tímpanos',familia:'percussao',emoji:'🥁',faixa:'90–400 Hz',freq:150,
    desc:'Pele tensionada afinável — altura definida, som grave e ressonante.',
    curiosidades:['Pode ser afinado a uma nota exata','Pele maior = som mais grave'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Timpani.jpg/200px-Timpani.jpg'},
  caixa:{nome:'Caixa',familia:'percussao',emoji:'🥁',faixa:'200–2000 Hz',freq:700,
    desc:'Tambor pequeno com fitas metálicas — altura indefinida, som seco.',
    curiosidades:['Fitas metálicas (esteira)','Essencial para marcar ritmo'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Snare_drum.png/200px-Snare_drum.png'},
  pratos:{nome:'Pratos',familia:'percussao',emoji:'🥁',faixa:'400–5000 Hz',freq:2200,
    desc:'Dois discos de metal — altura indefinida, som brilhante e prolongado.',
    curiosidades:['Metal vibra em várias frequências ao mesmo tempo','Cria clima e clímax'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Cymbals.jpg/200px-Cymbals.jpg'},
  bombo:{nome:'Bombo',familia:'percussao',emoji:'🥁',faixa:'40–200 Hz',freq:70,
    desc:'O maior tambor — altura indefinida, som profundo que se sente no peito.',
    curiosidades:['Batida fundamental','Membrana enorme'],
    imagem:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BassDrum.jpg/200px-BassDrum.jpg'},
  pandeiro:{nome:'Pandeiro',familia:'percussao',emoji:'🥁',faixa:'300–3000 Hz',freq:1000,
    desc:'O músico bate, sacode ou esfrega a membrana, fazendo vibrar tanto a pele quanto as platinelas metálicas ao redor.',
    curiosidades:['Combina membrana + platinelas (chocalho)','Mais comum na música popular, mas aparece em algumas obras orquestrais'],
    imagem:'https://commons.wikimedia.org/wiki/Special:FilePath/Pandeiro.svg'}
};

/* ---------- ÍCONES SVG CUSTOMIZADOS POR INSTRUMENTO ---------- */
const instrumentIcons = {
  // CORDAS
  violino: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <rect x="30" y="16" width="4" height="6" rx="1" fill="currentColor" opacity="0.6"/>
    <path d="M22 22c0 0-2 6-2 12s2 12 2 12h20c0 0 2-6 2-12s-2-12-2-12H22z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <path d="M24 28c4-2 12-2 16 0" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <path d="M24 38c4 2 12 2 16 0" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <ellipse cx="32" cy="33" rx="3" ry="2" fill="currentColor" opacity="0.4"/>
    <line x1="28" y1="22" x2="28" y2="46" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="32" y1="22" x2="32" y2="46" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="36" y1="22" x2="36" y2="46" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <path d="M24 46v8c0 2 3.5 4 8 4s8-2 8-4v-8" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
    <path d="M10 30l8 3M10 36l8-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
  viola: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4v11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <rect x="29" y="15" width="6" height="5" rx="1" fill="currentColor" opacity="0.6"/>
    <path d="M20 20c0 0-2 7-2 14s2 14 2 14h24c0 0 2-7 2-14s-2-14-2-14H20z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <path d="M22 27c5-2 15-2 20 0" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <path d="M22 41c5 2 15 2 20 0" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <ellipse cx="32" cy="34" rx="3.5" ry="2.5" fill="currentColor" opacity="0.4"/>
    <line x1="27" y1="20" x2="27" y2="48" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="32" y1="20" x2="32" y2="48" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="37" y1="20" x2="37" y2="48" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <path d="M22 48v6c0 2 4.5 4 10 4s10-2 10-4v-6" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
    <path d="M8 30l8 4M8 38l8-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
  violoncelo: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 2v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="29" y="10" width="6" height="5" rx="1" fill="currentColor" opacity="0.6"/>
    <path d="M18 15c0 0-3 8-3 17s3 17 3 17h28c0 0 3-8 3-17s-3-17-3-17H18z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="32" cy="32" rx="4" ry="3" fill="currentColor" opacity="0.4"/>
    <line x1="26" y1="15" x2="26" y2="49" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="32" y1="15" x2="32" y2="49" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="38" y1="15" x2="38" y2="49" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <path d="M20 49v6c0 2 5 4 12 4s12-2 12-4v-6" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
    <line x1="32" y1="59" x2="32" y2="63" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  contrabaixo: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 1v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <rect x="28" y="8" width="8" height="5" rx="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M16 13c0 0-4 9-4 19s4 19 4 19h32c0 0 4-9 4-19s-4-19-4-19H16z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="32" cy="32" rx="5" ry="3.5" fill="currentColor" opacity="0.4"/>
    <line x1="24" y1="13" x2="24" y2="51" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <line x1="32" y1="13" x2="32" y2="51" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <line x1="40" y1="13" x2="40" y2="51" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <path d="M18 51v5c0 2 6 4 14 4s14-2 14-4v-5" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
    <line x1="32" y1="60" x2="32" y2="64" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  harpa: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 58V10c0-3 2-5 5-5h4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M25 5c10 0 22 8 26 20s2 30-2 33" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M16 58h35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="12" x2="20" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="24" y1="10" x2="24" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="28" y1="9" x2="28" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="32" y1="10" x2="32" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="36" y1="12" x2="36" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="16" x2="40" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="44" y1="22" x2="44" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <line x1="48" y1="30" x2="48" y2="56" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
    <circle cx="16" cy="58" r="2" fill="currentColor" opacity="0.4"/>
  </svg>`,
  piano: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="52" height="30" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
    <line x1="14" y1="18" x2="14" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <line x1="22" y1="18" x2="22" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <line x1="30" y1="18" x2="30" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <line x1="38" y1="18" x2="38" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <line x1="46" y1="18" x2="46" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <line x1="54" y1="18" x2="54" y2="48" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <rect x="11" y="18" width="4" height="18" rx="0.5" fill="currentColor" opacity="0.5"/>
    <rect x="19" y="18" width="4" height="18" rx="0.5" fill="currentColor" opacity="0.5"/>
    <rect x="33" y="18" width="4" height="18" rx="0.5" fill="currentColor" opacity="0.5"/>
    <rect x="41" y="18" width="4" height="18" rx="0.5" fill="currentColor" opacity="0.5"/>
    <rect x="49" y="18" width="4" height="18" rx="0.5" fill="currentColor" opacity="0.5"/>
    <path d="M6 48h52v4H6z" fill="currentColor" opacity="0.15"/>
    <path d="M20 10c4-2 8-2 12 0v8H20v-8z" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  // MADEIRAS
  flauta: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="28" width="48" height="8" rx="4" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <circle cx="18" cy="32" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="26" cy="32" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="34" cy="32" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="42" cy="32" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="50" cy="32" r="2" fill="currentColor" opacity="0.6"/>
    <ellipse cx="10" cy="32" rx="2" ry="3" fill="currentColor" opacity="0.3"/>
    <line x1="14" y1="28" x2="14" y2="36" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>
  </svg>`,
  flautim: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="30" width="40" height="6" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <circle cx="22" cy="33" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="30" cy="33" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="38" cy="33" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="46" cy="33" r="1.5" fill="currentColor" opacity="0.6"/>
    <ellipse cx="14" cy="33" rx="1.5" ry="2.5" fill="currentColor" opacity="0.3"/>
    <path d="M8 25l4 5M8 41l4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
  </svg>`,
  clarinete: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 6c0 0-1 2-1 4v40c0 2 2 6 5 8s5-1 5-3V10c0-2-1-4-1-4h-8z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="18" r="1.8" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="26" r="1.8" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="34" r="1.8" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="42" r="1.8" fill="currentColor" opacity="0.6"/>
    <rect x="29" y="6" width="6" height="4" rx="1" fill="currentColor" opacity="0.4"/>
    <path d="M30 50c0 2 1 4 2 6s2-1 2-3" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <ellipse cx="32" cy="56" rx="5" ry="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  fagote: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8v44c0 2 2 6 4 6h8c2 0 4-4 4-6V8" stroke="currentColor" stroke-width="2.5" fill="currentColor" opacity="0.12"/>
    <path d="M28 8h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="18" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="26" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="34" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="42" r="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M26 10c-2 0-4 1-4 3v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M38 10c2 0 4 1 4 3v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    <ellipse cx="32" cy="56" rx="8" ry="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  // METAIS
  trompete: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 30h28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 24c0 0 8 0 12 4s8 12 8 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="currentColor" opacity="0.1"/>
    <path d="M36 36l20 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="18" cy="26" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="24" cy="26" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="30" cy="26" r="2" fill="currentColor" opacity="0.5"/>
    <path d="M8 30c-1 0-2 1-2 2s1 2 2 2" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.3"/>
  </svg>`,
  trompa: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 16c0 0-8 4-8 16s8 16 8 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="currentColor" opacity="0.1"/>
    <path d="M20 16c8-4 20-2 24 6s4 18-4 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="28" cy="32" rx="10" ry="12" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="2"/>
    <circle cx="28" cy="32" r="4" fill="currentColor" opacity="0.2"/>
    <path d="M40 24c4 0 8 2 10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <circle cx="16" cy="20" r="1.5" fill="currentColor" opacity="0.5"/>
    <circle cx="16" cy="26" r="1.5" fill="currentColor" opacity="0.5"/>
    <circle cx="16" cy="32" r="1.5" fill="currentColor" opacity="0.5"/>
  </svg>`,
  trombone: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 20h36v24H8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="currentColor" opacity="0.1"/>
    <path d="M44 20c6 0 10 4 10 12s-4 12-10 12" stroke="currentColor" stroke-width="2.5" fill="currentColor" opacity="0.1"/>
    <line x1="8" y1="24" x2="38" y2="24" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
    <line x1="8" y1="40" x2="38" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
    <path d="M14 20v-4M20 20v-4M26 20v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <ellipse cx="52" cy="32" rx="4" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
  </svg>`,
  tuba: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="32" rx="18" ry="22" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2.5"/>
    <ellipse cx="32" cy="32" rx="10" ry="14" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <circle cx="32" cy="32" r="5" fill="currentColor" opacity="0.15"/>
    <circle cx="24" cy="18" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="32" cy="14" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="40" cy="18" r="2" fill="currentColor" opacity="0.5"/>
    <path d="M14 44c-4 2-6 6-4 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M50 44c4 2 6 6 4 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  // PERCUSSÃO
  timpanos: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="20" rx="20" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <path d="M12 20v16c0 4 9 8 20 8s20-4 20-8V20" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.1"/>
    <ellipse cx="32" cy="36" rx="20" ry="4" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1" opacity="0.3"/>
    <path d="M16 18l-6 6M48 18l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <circle cx="10" cy="24" r="2" fill="currentColor" opacity="0.4"/>
    <circle cx="54" cy="24" r="2" fill="currentColor" opacity="0.4"/>
    <path d="M12 44v4M52 44v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
  </svg>`,
  caixa: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="18" rx="20" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
    <path d="M12 18v24c0 4 9 8 20 8s20-4 20-8V18" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.1"/>
    <line x1="14" y1="34" x2="50" y2="34" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="14" y1="37" x2="50" y2="37" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <line x1="14" y1="40" x2="50" y2="40" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    <path d="M20 14l-4 8M44 14l4 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <circle cx="16" cy="22" r="2" fill="currentColor" opacity="0.4"/>
    <circle cx="48" cy="22" r="2" fill="currentColor" opacity="0.4"/>
  </svg>`,
  pratos: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="28" rx="18" ry="6" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2" transform="rotate(-15 24 28)"/>
    <ellipse cx="40" cy="36" rx="18" ry="6" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2" transform="rotate(15 40 36)"/>
    <circle cx="24" cy="28" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="40" cy="36" r="3" fill="currentColor" opacity="0.3"/>
    <path d="M20 18l-4 4M44 46l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <path d="M10 30c-2 0-3 1-3 2M54 34c2 0 3 1 3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
  </svg>`,
  bombo: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="16" rx="22" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2.5"/>
    <path d="M10 16v28c0 4 10 8 22 8s22-4 22-8V16" stroke="currentColor" stroke-width="2.5" fill="currentColor" opacity="0.1"/>
    <ellipse cx="32" cy="44" rx="22" ry="6" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <line x1="32" y1="8" x2="32" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    <circle cx="32" cy="8" r="3" fill="currentColor" opacity="0.3"/>
    <path d="M16 22v16M48 22v16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
  </svg>`,
  pandeiro: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="14" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <circle cx="18" cy="20" r="2.5" fill="currentColor" opacity="0.4"/>
    <circle cx="46" cy="20" r="2.5" fill="currentColor" opacity="0.4"/>
    <circle cx="18" cy="44" r="2.5" fill="currentColor" opacity="0.4"/>
    <circle cx="46" cy="44" r="2.5" fill="currentColor" opacity="0.4"/>
    <circle cx="12" cy="32" r="2.5" fill="currentColor" opacity="0.4"/>
    <circle cx="52" cy="32" r="2.5" fill="currentColor" opacity="0.4"/>
    <path d="M24 18l-2 4M40 18l2 4M24 46l-2-4M40 46l2-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
  </svg>`
};

/* ---------- NAVBAR ---------- */
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', ()=>{
  mainNav.classList.toggle('scrolled', window.scrollY > 40);
});
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
navToggle.setAttribute('aria-expanded','false');
navToggle.addEventListener('click', ()=>{
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded','false');
}));

/* ---------- HERO BUTTONS ---------- */
document.getElementById('btnEntrar').addEventListener('click', ()=>{
  ctx();
  document.getElementById('som').scrollIntoView({behavior:'smooth'});
});
document.getElementById('btnExplorar').addEventListener('click', ()=>{
  document.getElementById('palco').scrollIntoView({behavior:'smooth'});
});

/* ---------- HERO CANVAS: ondas concêntricas ---------- */
(function heroCanvas(){
  const canvas = document.getElementById('heroCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  let t = 0;
  function draw(){
    t += 0.012;
    c.clearRect(0,0,w,h);
    const cx = w/2, cy = h*0.45;
    for(let i=0;i<6;i++){
      const phase = (t + i*0.5) % 3;
      const r = phase * (Math.max(w,h)*0.4);
      const alpha = Math.max(0, 0.35 - phase*0.12);
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI*2);
      c.strokeStyle = `rgba(201,160,78,${alpha})`;
      c.lineWidth = 1.4;
      c.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- SOM CANVAS: objeto -> vibração -> ondas -> ouvido ---------- */
(function somCanvas(){
  const canvas = document.getElementById('somCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  let t = 0;
  function draw(){
    t += 0.05;
    c.clearRect(0,0,w,h);
    const sx = w*0.22, sy = h*0.5;
    const wobble = Math.sin(t*4) * 6;
    // esfera vibrando
    c.beginPath();
    c.arc(sx + wobble*0.3, sy, 22, 0, Math.PI*2);
    c.fillStyle = '#c9a04e';
    c.fill();
    // ondas
    for(let i=0;i<4;i++){
      const phase = (t*0.6 + i*0.9) % 3.6;
      const r = 26 + phase*30;
      const alpha = Math.max(0, 0.5 - phase*0.14);
      if(alpha<=0) continue;
      c.beginPath();
      c.arc(sx, sy, r, -1.1, 1.1);
      c.strokeStyle = `rgba(233,200,119,${alpha})`;
      c.lineWidth = 2;
      c.stroke();
    }
    // ouvido (estilizado)
    const ex = w*0.82, ey = h*0.5;
    c.beginPath();
    c.ellipse(ex, ey, 16, 26, 0, 0, Math.PI*2);
    c.strokeStyle = '#8fa0b0';
    c.lineWidth = 2;
    c.stroke();
    c.beginPath();
    c.arc(ex-2, ey, 8, 0.3, Math.PI*1.4);
    c.stroke();
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- PROPAGAÇÃO CANVAS ---------- */
(function propCanvas(){
  const canvas = document.getElementById('propCanvas');
  const c = canvas.getContext('2d');
  let w,h, running = false, t0 = 0;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  const cols = 26, rows = 8;
  const particles = [];
  function initParticles(){
    particles.length = 0;
    for(let r=0;r<rows;r++){
      for(let col=0; col<cols; col++){
        particles.push({ baseX: (col/cols)*w + w*0.02, y: (r/rows)*h + h*0.06, col });
      }
    }
  }
  resize(); initParticles();
  window.addEventListener('resize', initParticles);

  function draw(){
    c.clearRect(0,0,w,h);
    const elapsed = running ? (performance.now() - t0)/1000 : -1;
    particles.forEach(p=>{
      let dx = 0;
      if(running){
        const wave = elapsed*230 - p.col*14;
        dx = Math.sin(wave*0.14) * 10 * Math.exp(-Math.max(0,(elapsed*260 - p.col*16))/900);
        if(wave < -40) dx = 0;
      }
      c.beginPath();
      c.arc(p.baseX + dx, p.y, 3.4, 0, Math.PI*2);
      c.fillStyle = 'rgba(233,200,119,0.85)';
      c.fill();
    });
    // ouvido à direita
    c.beginPath();
    c.ellipse(w*0.94, h/2, 12, 22, 0, 0, Math.PI*2);
    c.strokeStyle = '#8fa0b0';
    c.lineWidth = 2;
    c.stroke();
    requestAnimationFrame(draw);
  }
  draw();

  document.getElementById('btnProduzirSom').addEventListener('click', ()=>{
    running = true; t0 = performance.now();
    tone(180, 0.6, 'sine', 0.3);
  });
  document.getElementById('btnRepetirProp').addEventListener('click', ()=>{
    running = true; t0 = performance.now();
    tone(180, 0.6, 'sine', 0.3);
  });
})();

/* ---------- STAGE SVG (palco + instrumentos) ---------- */
const zones = [
  {id:'percussao', label:'Percussão', cx:450, cy:95,  rx:360, ry:65, color:'rgba(193,88,79,0.16)'},
  {id:'metais',    label:'Metais',    cx:450, cy:215, rx:290, ry:80, color:'rgba(201,160,78,0.18)'},
  {id:'madeiras',  label:'Madeiras',  cx:450, cy:335, rx:250, ry:75, color:'rgba(63,145,134,0.16)'},
  {id:'cordas',    label:'Cordas',    cx:450, cy:465, rx:330, ry:110,color:'rgba(159,122,220,0.16)'},
  {id:'maestro',   label:'Maestro',   cx:450, cy:565, rx:55,  ry:35, color:'rgba(242,234,217,0.16)'}
];

function setStageHint(text){
  const hint = document.getElementById('stageHint');
  if(hint) hint.textContent = text;
}

function buildStageSvg(svgEl, clickable){
  svgEl.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  zones.forEach(z=>{
    const g = document.createElementNS(ns,'g');
    g.setAttribute('class','stage-region');
    const el = document.createElementNS(ns,'ellipse');
    el.setAttribute('cx', z.cx); el.setAttribute('cy', z.cy);
    el.setAttribute('rx', z.rx); el.setAttribute('ry', z.ry);
    el.setAttribute('fill', z.color);
    el.setAttribute('stroke', 'rgba(201,160,78,0.35)');
    el.setAttribute('stroke-width','1');
    g.appendChild(el);
    const label = document.createElementNS(ns,'text');
    label.setAttribute('x', z.cx); label.setAttribute('y', z.cy - z.ry - 8);
    label.setAttribute('class','stage-label');
    label.textContent = z.label;
    g.appendChild(label);
    if(clickable && z.id !== 'maestro'){
      g.setAttribute('role','button');
      g.setAttribute('tabindex','0');
      g.setAttribute('aria-label', `Explorar ${z.label}`);
      g.addEventListener('click', ()=> openFamilyModal(z.id));
      g.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openFamilyModal(z.id); }});
      g.addEventListener('mouseenter', ()=> setStageHint(`Clique para explorar ${z.label}`));
      g.addEventListener('mouseleave', ()=> setStageHint('Toque em uma área do palco'));
    } else if(clickable){
      g.setAttribute('role','button');
      g.setAttribute('tabindex','0');
      g.setAttribute('aria-label', `Saiba mais sobre o Maestro`);
      g.addEventListener('click', ()=> openMaestroModal());
      g.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openMaestroModal(); }});
      g.addEventListener('mouseenter', ()=> setStageHint('Clique para saber o papel do maestro'));
      g.addEventListener('mouseleave', ()=> setStageHint('Toque em uma área do palco'));
    }
    svgEl.appendChild(g);
  });
}
buildStageSvg(document.getElementById('stageSvg'), true);
document.getElementById('stageSvg').addEventListener('click', (e)=>{
  const hint = document.getElementById('stageHint');
  hint.textContent = 'Explore os outros naipes clicando no palco';
});

/* Posições seguem a disposição real da Sala São Paulo:
   1ª fileira (mais perto do maestro) — Cordas: 1os violinos (esquerda da plateia) → 2os violinos → violas (centro) → violoncelos → contrabaixos (canto direito, atrás dos violoncelos) → harpa (atrás dos violoncelos/contrabaixos)
   2ª fileira — Madeiras: flautim/flauta, clarinetes, fagotes
   3ª fileira — Metais: trompas (mais próximas das madeiras), trompetes, trombones, tuba (mais ao fundo)
   4ª fileira (mais ao fundo) — Percussão: tímpanos, piano (quando a obra exige), caixa, pratos, bombo */
const instrumentPositions = [
  // Percussão (fundo do palco)
  {id:'timpanos', x:170, y:100},{id:'caixa', x:330, y:82},{id:'piano', x:450, y:110},{id:'pratos', x:570, y:82},{id:'bombo', x:730, y:100},
  // Metais
  {id:'trompa', x:250, y:245},{id:'trompete', x:400, y:200},{id:'trombone', x:540, y:200},{id:'tuba', x:670, y:180},
  // Madeiras
  {id:'flauta', x:340, y:340},{id:'clarinete', x:450, y:328},{id:'fagote', x:570, y:340},
  // Cordas — 1ª fileira, esquerda (plateia) → direita
  {id:'violino', x:170, y:500, label:'1ºs Violinos'},
  {id:'violino', x:300, y:475, label:'2ºs Violinos'},
  {id:'viola', x:450, y:465},
  {id:'violoncelo', x:600, y:475},
  {id:'contrabaixo', x:720, y:440},
  {id:'harpa', x:700, y:395}
];

function buildInstrumentsSvg(){
  const svg = document.getElementById('instrumentsSvg');
  svg.innerHTML = '';
  const ns='http://www.w3.org/2000/svg';
  // faint zone backgrounds (non-clickable, for context)
  zones.filter(z=>z.id!=='maestro').forEach(z=>{
    const el = document.createElementNS(ns,'ellipse');
    el.setAttribute('cx', z.cx); el.setAttribute('cy', z.cy);
    el.setAttribute('rx', z.rx); el.setAttribute('ry', z.ry);
    el.setAttribute('fill', z.color.replace(/[\d.]+\)$/, '0.06)'));
    el.setAttribute('stroke','none');
    svg.appendChild(el);
  });
  instrumentPositions.forEach(p=>{
    const inst = instrumentos[p.id];
    if(!inst) return;
    const displayName = p.label || inst.nome;
    const g = document.createElementNS(ns,'g');
    g.setAttribute('class','inst-dot');
    g.setAttribute('role','button');
    g.setAttribute('tabindex','0');
    g.setAttribute('aria-label', `${displayName}, ${inst.familia}`);
    g.setAttribute('title', `${displayName} — clique para saber mais`);
    const circle = document.createElementNS(ns,'circle');
    circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y); circle.setAttribute('r', 7);
    circle.setAttribute('fill', 'rgba(201,160,78,0.85)');
    g.appendChild(circle);
    // Usar SVG icon se disponível, senão emoji
    if(instrumentIcons[p.id]) {
      const iconGroup = document.createElementNS(ns,'foreignObject');
      iconGroup.setAttribute('x', p.x - 12); iconGroup.setAttribute('y', p.y - 26);
      iconGroup.setAttribute('width', 24); iconGroup.setAttribute('height', 24);
      const div = document.createElement('div');
      div.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
      div.className = 'inst-icon-mini';
      div.innerHTML = instrumentIcons[p.id];
      iconGroup.appendChild(div);
      g.appendChild(iconGroup);
    } else {
      const text = document.createElementNS(ns,'text');
      text.setAttribute('x', p.x); text.setAttribute('y', p.y - 14);
      text.textContent = inst.emoji;
      g.appendChild(text);
    }
    g.addEventListener('click', ()=> openInstrumentModal(p.id));
    g.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); openInstrumentModal(p.id); }});
    g.addEventListener('mouseenter', ()=> document.getElementById('stageHint').textContent = `Clique para explorar ${displayName}`);
    g.addEventListener('mouseleave', ()=> document.getElementById('stageHint').textContent = 'Toque em uma área do palco');
    svg.appendChild(g);
  });
}
buildInstrumentsSvg();

/* ---------- MODAL GENÉRICO ---------- */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalBody = document.getElementById('modalBody');
document.getElementById('modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e)=>{ if(e.target === modalBackdrop) closeModal(); });
function openModal(html){ modalBody.innerHTML = html; modalBackdrop.classList.add('open'); document.body.classList.add('modal-open'); }
function closeModal(){ modalBackdrop.classList.remove('open'); document.body.classList.remove('modal-open'); }
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal(); });

const familyInfo = {
  cordas:{title:'Família das Cordas', text:'O som nasce da vibração de uma corda tensionada. Ela pode ser friccionada pelo arco, dedilhada, pinçada ou percutida — e o corpo de madeira (ou a caixa de ressonância) amplifica e colore o timbre.', items:['Violino — agudo e brilhante (fricção)','Viola — médio e aveludado (fricção)','Violoncelo — grave e expressivo (fricção)','Contrabaixo — fundamento grave (fricção)','Harpa — cordas pinçadas pelos dedos','Piano — cordas percutidas por martelos']},
  madeiras:{title:'Família das Madeiras', text:'Uma coluna de ar vibra dentro de um tubo. A vibração pode começar numa embocadura livre, numa palheta simples ou numa palheta dupla.', items:['Flauta — embocadura livre','Clarinete — palheta simples','Fagote — palheta dupla, grave']},
  metais:{title:'Família dos Metais', text:'Os lábios do músico vibram contra o bocal. O tubo amplifica essa vibração, e válvulas ou vara mudam o comprimento do caminho do ar.', items:['Trompete — brilhante e agudo','Trompa — quente e flexível','Trombone — vara deslizante','Tuba — grave e potente']},
  percussao:{title:'Família da Percussão', text:'O som nasce de impacto, raspagem ou agitação. Alguns instrumentos têm altura definida (como os tímpanos); outros criam textura e ritmo.', items:['Tímpanos — altura definida','Caixa — som seco e rítmico','Pratos — brilho e sustentação','Bombo — grave e fundamental']}
};
function openFamilyModal(id){
  const f = familyInfo[id];
  openModal(`<h3>${f.title}</h3><p>${f.text}</p><ul>${f.items.map(i=>`<li>${i}</li>`).join('')}</ul>`);
}
function openMaestroModal(){
  openModal(`<h3>O Maestro</h3><p>Posicionado de frente para toda a orquestra, o maestro não produz som — ele sincroniza tempo, dinâmica e entradas de cada naipe para que dezenas de instrumentos soem como um só.</p>`);
}
function openInstrumentModal(id){
  const inst = instrumentos[id];
  if(!inst) return;
  const iconHtml = instrumentIcons[id] 
    ? `<div class="modal-icon-svg">${instrumentIcons[id]}</div>`
    : '';
  openModal(`
    <span class="m-tag">${inst.familia}</span>
    <h3>${inst.nome}</h3>
    ${iconHtml}
    <img src="${inst.imagem}" alt="${inst.nome}">
    <p>${inst.desc}</p>
    <ul>${inst.curiosidades.map(c=>`<li>${c}</li>`).join('')}</ul>
    <p style="font-family:var(--font-mono);color:var(--gold);font-size:0.8rem;">${inst.faixa}</p>
    <div class="m-actions"><button class="btn-solid" id="modalPlayBtn">Ouvir</button></div>
  `);
  document.getElementById('modalPlayBtn').addEventListener('click', ()=> tone(inst.freq, 0.9, 'triangle', 0.4));
}

/* ---------- CORDAS: string lab ---------- */
(function stringLab(){
  const canvas = document.getElementById('stringCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  const inputL = document.getElementById('strLength');
  const inputT = document.getElementById('strTension');
  const inputMu = document.getElementById('strThickness');
  const freqVal = document.getElementById('strFreqVal');
  const scaleFill = document.getElementById('stringScaleFill');

  let currentFreq = 220;
  let t = 0;

  function compute(){
    const L = inputL.value / 50;         // 0.4 – 2.0 m
    const T = parseFloat(inputT.value);  // 100 – 1000 N
    const mu = inputMu.value / 1000;     // densidade linear
    const f = (1/(2*L)) * Math.sqrt(T/mu);
    currentFreq = f;
    freqVal.textContent = Math.round(f);
    const pct = Math.min(100, Math.max(0, (Math.log(f) - Math.log(50)) / (Math.log(2000) - Math.log(50)) * 100));
    scaleFill.style.left = pct + '%';
  }
  [inputL, inputT, inputMu].forEach(i=> i.addEventListener('input', compute));
  compute();

  function draw(){
    t += 0.06;
    c.clearRect(0,0,w,h);
    const amp = Math.min(40, 5 + parseFloat(inputT.value)/40);
    const cyclesVisual = Math.max(1, Math.min(6, currentFreq/150));
    c.beginPath();
    for(let x=0;x<=w;x++){
      const frac = x/w;
      const env = Math.sin(frac*Math.PI);
      const y = h/2 + env * amp * Math.sin(frac*Math.PI*2*cyclesVisual + t*4);
      if(x===0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.strokeStyle = '#e9c877';
    c.lineWidth = 2.5;
    c.stroke();
    // anchors
    c.fillStyle = '#8a6a2e';
    c.fillRect(0, h/2-4, 6, 8);
    c.fillRect(w-6, h/2-4, 6, 8);
    requestAnimationFrame(draw);
  }
  draw();

  document.getElementById('btnOuvirCorda').addEventListener('click', ()=> tone(currentFreq, 1.1, 'sawtooth', 0.3));
})();

/* ---------- METAIS: trompete SVG ---------- */
(function trumpetLab(){
  let tubeCount = 2;
  const countEl = document.getElementById('tuboCount');
  const freqEl = document.getElementById('tuboFreq');
  const svg = document.getElementById('trumpetSvg');
  const ns = 'http://www.w3.org/2000/svg';

  function baseFreq(){ return 900 / tubeCount; }

  function render(){
    svg.innerHTML = '';
    const segs = tubeCount;
    const totalW = 60 + segs*70;
    const startX = (500 - totalW)/2 + 20;
    let x = startX;
    for(let i=0;i<segs;i++){
      const rect = document.createElementNS(ns,'rect');
      rect.setAttribute('x', x); rect.setAttribute('y', 90);
      rect.setAttribute('width', 60); rect.setAttribute('height', 40);
      rect.setAttribute('rx', 18);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', '#c9a04e');
      rect.setAttribute('stroke-width','2.5');
      svg.appendChild(rect);
      const air = document.createElementNS(ns,'rect');
      air.setAttribute('class','trumpet-air');
      air.setAttribute('x', x+8); air.setAttribute('y', 106);
      air.setAttribute('width', 44); air.setAttribute('height', 8);
      air.setAttribute('rx', 4);
      air.setAttribute('fill', 'rgba(159,196,255,0.55)');
      svg.appendChild(air);
      x += 66;
    }
    // bell
    const bell = document.createElementNS(ns,'path');
    bell.setAttribute('d', `M${x} 92 Q ${x+60} 100 ${x+60} 60 L ${x+60} 160 Q ${x+60} 120 ${x} 138 Z`);
    bell.setAttribute('fill', 'none');
    bell.setAttribute('stroke', '#e9c877');
    bell.setAttribute('stroke-width','2.5');
    svg.appendChild(bell);
    // mouthpiece
    const mp = document.createElementNS(ns,'circle');
    mp.setAttribute('cx', startX-12); mp.setAttribute('cy', 110); mp.setAttribute('r', 8);
    mp.setAttribute('fill', '#8a6a2e');
    svg.appendChild(mp);

    countEl.textContent = tubeCount;
    freqEl.textContent = Math.round(baseFreq());
  }
  render();

  document.getElementById('btnAdicionarTubo').addEventListener('click', ()=>{
    if(tubeCount < 6){ tubeCount++; render(); }
  });
  document.getElementById('btnRemoverTubo').addEventListener('click', ()=>{
    if(tubeCount > 1){ tubeCount--; render(); }
  });
  document.getElementById('btnOuvirTrompete').addEventListener('click', ()=> tone(baseFreq(), 0.8, 'square', 0.25));
})();

/* ---------- BERNOULLI ---------- */
(function bernoulli(){
  const canvas = document.getElementById('bernoulliCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  const speedInput = document.getElementById('airSpeed');
  const pressureVal = document.getElementById('pressureVal');
  const lipState = document.getElementById('lipState');

  const particles = Array.from({length:40}, ()=>({ x: Math.random(), y: Math.random(), spd: 0.5+Math.random() }));

  function draw(){
    const speed = parseFloat(speedInput.value);
    c.clearRect(0,0,w,h);
    // constriction tube
    const midY = h/2;
    const neckHalf = 14;
    c.beginPath();
    c.moveTo(0, midY-40); c.quadraticCurveTo(w*0.4, midY-neckHalf, w*0.5, midY-neckHalf);
    c.lineTo(w*0.5, midY-neckHalf);
    c.quadraticCurveTo(w*0.6, midY-neckHalf, w, midY-40);
    c.moveTo(0, midY+40); c.quadraticCurveTo(w*0.4, midY+neckHalf, w*0.5, midY+neckHalf);
    c.quadraticCurveTo(w*0.6, midY+neckHalf, w, midY+40);
    c.strokeStyle = 'rgba(201,160,78,0.5)';
    c.lineWidth = 2;
    c.stroke();

    particles.forEach(p=>{
      p.x += (0.003 + speed*0.002) * p.spd;
      if(p.x > 1) p.x = 0;
      const narrow = Math.abs(p.x - 0.5) < 0.12;
      const py = midY + (p.y-0.5) * (narrow ? neckHalf*1.6 : 70);
      c.beginPath();
      c.arc(p.x*w, py, narrow ? 3.4 : 2.2, 0, Math.PI*2);
      c.fillStyle = narrow ? 'rgba(233,200,119,0.9)' : 'rgba(143,160,176,0.6)';
      c.fill();
    });

    const pressure = Math.max(10, 100 - speed*8);
    pressureVal.textContent = pressure + '%';
    lipState.textContent = speed > 5 ? 'vibrando rápido' : (speed > 2 ? 'vibrando' : 'parados');

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- MADEIRAS: wood tabs ---------- */
(function woodLab(){
  const canvas = document.getElementById('woodCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  let mode = 'livre';
  let t = 0;

  function draw(){
    t += 0.08;
    c.clearRect(0,0,w,h);
    const cx = w/2, cy = h/2;

    if(mode === 'livre'){
      // ar cruzando uma borda
      c.beginPath();
      c.moveTo(cx-140, cy);
      c.lineTo(cx+140, cy);
      c.strokeStyle = 'rgba(159,196,255,0.5)';
      c.lineWidth = 3;
      c.stroke();
      for(let i=0;i<5;i++){
        const off = Math.sin(t*3+i)*10;
        c.beginPath();
        c.moveTo(cx-100+i*40, cy-30+off);
        c.lineTo(cx-100+i*40, cy+30-off);
        c.strokeStyle = 'rgba(233,200,119,0.5)';
        c.lineWidth = 2;
        c.stroke();
      }
      c.fillStyle = '#8fa0b0';
      c.font = '13px Manrope';
      c.textAlign = 'center';
      c.fillText('ar cortado na borda do bocal', cx, cy+70);
    }
    if(mode === 'simples'){
      const flap = Math.sin(t*6)*18;
      c.beginPath();
      c.moveTo(cx-10, cy-40);
      c.lineTo(cx-10, cy+40+flap);
      c.strokeStyle = '#e9c877';
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.stroke();
      c.beginPath();
      c.moveTo(cx+10, cy-40);
      c.lineTo(cx+10, cy+40);
      c.strokeStyle = 'rgba(201,160,78,0.5)';
      c.lineWidth = 6;
      c.stroke();
      c.fillStyle = '#8fa0b0';
      c.font = '13px Manrope';
      c.textAlign = 'center';
      c.fillText('uma palheta vibra contra o bocal', cx, cy+80);
    }
    if(mode === 'dupla'){
      const flap = Math.sin(t*6)*14;
      c.beginPath();
      c.moveTo(cx-8, cy-40); c.lineTo(cx-8-flap*0.4, cy+40);
      c.strokeStyle = '#e9c877'; c.lineWidth = 6; c.lineCap='round'; c.stroke();
      c.beginPath();
      c.moveTo(cx+8, cy-40); c.lineTo(cx+8+flap*0.4, cy+40);
      c.strokeStyle = '#e9c877'; c.lineWidth = 6; c.stroke();
      c.fillStyle = '#8fa0b0';
      c.font = '13px Manrope';
      c.textAlign = 'center';
      c.fillText('duas palhetas vibram uma contra a outra', cx, cy+80);
    }
    requestAnimationFrame(draw);
  }
  draw();

  document.querySelectorAll('.wood-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.wood-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.wood;
      tone(mode==='livre'?900: mode==='simples'?500:280, 0.5, 'triangle', 0.25);
    });
  });
})();

/* ---------- PERCUSSÃO ---------- */
(function percRow(){
  const row = document.getElementById('percRow');
  const perc = ['timpanos','caixa','pratos','bombo','pandeiro'];
  perc.forEach(id=>{
    const inst = instrumentos[id];
    const div = document.createElement('div');
    div.className = 'perc-item';
    const iconHtml = instrumentIcons[id] 
      ? `<span class="perc-icon-svg">${instrumentIcons[id]}</span>`
      : `<span class="perc-emoji">${inst.emoji}</span>`;
    div.innerHTML = `${iconHtml}<h4>${inst.nome}</h4><p>${inst.faixa}</p>`;
    div.addEventListener('click', ()=>{
      div.classList.add('hit');
      setTimeout(()=> div.classList.remove('hit'), 200);
      noiseHit(0.3, inst.freq);
      tone(inst.freq, 0.3, 'sine', 0.15);
    });
    row.appendChild(div);
  });
})();

/* ---------- FREQUÊNCIA slider ---------- */
(function freqSection(){
  const order = ['tuba','contrabaixo','violoncelo','violino','flauta','flautim'];
  const slider = document.getElementById('freqSlider');
  const emojiEl = document.getElementById('freqEmoji');
  const nameEl = document.getElementById('freqName');
  const hzEl = document.getElementById('freqHz');
  const descEl = document.getElementById('freqDesc');
  const canvas = document.getElementById('freqWaveCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  let currentFreq = 150;
  function update(){
    const inst = instrumentos[order[slider.value]];
    const key = order[slider.value];
    if(instrumentIcons[key]) {
      emojiEl.innerHTML = instrumentIcons[key];
      emojiEl.className = 'freq-icon-svg';
    } else {
      emojiEl.textContent = inst.emoji;
      emojiEl.className = 'freq-emoji';
    }
    nameEl.textContent = inst.nome;
    hzEl.textContent = inst.faixa;
    descEl.textContent = inst.desc;
    currentFreq = inst.freq;
    tone(inst.freq, 0.5, 'triangle', 0.3);
  }
  slider.addEventListener('input', update);
  update();

  let t = 0;
  function draw(){
    t += 0.05;
    c.clearRect(0,0,w,h);
    const cycles = Math.max(1, Math.min(14, currentFreq/120));
    c.beginPath();
    for(let x=0;x<=w;x++){
      const frac = x/w;
      const y = h/2 + Math.sin(frac*Math.PI*2*cycles + t*3) * (h*0.32);
      if(x===0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.strokeStyle = '#c9a04e';
    c.lineWidth = 2;
    c.stroke();
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- MATEMÁTICA ---------- */
(function mathSection(){
  // onda de referência (Mersenne)
  const canvas = document.getElementById('mersenneRefCanvas');
  const c = canvas.getContext('2d');
  let w,h,t=0;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  function draw(){
    t += 0.05;
    c.clearRect(0,0,w,h);
    c.beginPath();
    for(let x=0;x<=w;x++){
      const frac = x/w;
      const y = h/2 + Math.sin(frac*Math.PI*2*4 + t*3) * (h*0.32);
      if(x===0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.strokeStyle = '#e9c877';
    c.lineWidth = 2;
    c.stroke();
    requestAnimationFrame(draw);
  }
  draw();

  // piano temperado
  const pianoRow = document.getElementById('mathPiano');
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  notes.forEach((n, idx)=>{
    const freq = 440 * Math.pow(2, (idx-9)/12);
    const key = document.createElement('div');
    key.className = 'piano-key';
    key.textContent = n;
    key.addEventListener('click', ()=>{
      tone(freq, 0.5, 'sine', 0.35);
      key.classList.add('lit');
      setTimeout(()=> key.classList.remove('lit'), 200);
    });
    pianoRow.appendChild(key);
  });

  // tubo aberto/fechado
  const tubeL = document.getElementById('mathTubeL');
  const openEl = document.getElementById('mathTubeOpen');
  const closedEl = document.getElementById('mathTubeClosed');
  function updateTube(){
    const L = tubeL.value/100;
    const v = 343;
    openEl.textContent = Math.round(v/(2*L));
    closedEl.textContent = Math.round(v/(4*L));
  }
  tubeL.addEventListener('input', updateTube);
  updateTube();
})();

/* ---------- QUIZ ---------- */
const quizData = [
  {q:'Qual instrumento produz o som mais grave das cordas?', opts:['Violino','Viola','Contrabaixo','Violoncelo'], correct:2},
  {q:'O flautim é:', opts:['Uma flauta pequena e aguda','Um clarinete grave','Um tipo de fagote','Um oboé'], correct:0},
  {q:'Qual é o instrumento mais grave da orquestra?', opts:['Trombone','Tuba','Contrabaixo','Fagote'], correct:1},
  {q:'A trompa tem som mais grave ou agudo que o trompete?', opts:['Mais agudo','Mais grave','Igual','Varia muito'], correct:1},
  {q:'Quantas cordas tem um violino?', opts:['3','4','6','8'], correct:1},
  {q:'O clarinete usa qual tipo de palheta?', opts:['Nenhuma','Palheta simples','Palheta dupla','Duas simples'], correct:1},
  {q:'Qual família usa "vara deslizante"?', opts:['Cordas','Madeiras','Metais (trombone)','Percussão'], correct:2},
  {q:'Qual instrumento é tocado entre as pernas?', opts:['Violino','Violoncelo','Viola','Harpa'], correct:1},
  {q:'Os tímpanos têm:', opts:['Altura indefinida','Altura definida (afinável)','Nenhum som','Só ritmo'], correct:1},
  {q:'Qual a frequência de referência do Lá central?', opts:['220 Hz','330 Hz','440 Hz','880 Hz'], correct:2}
];
let quizIdx = 0, quizScore = 0;
const quizIntro = document.getElementById('quizIntro');
const quizGame = document.getElementById('quizGame');
const quizResult = document.getElementById('quizResult');

document.getElementById('btnStartQuiz').addEventListener('click', ()=>{
  quizIdx = 0; quizScore = 0;
  quizIntro.style.display = 'none';
  quizResult.style.display = 'none';
  quizGame.style.display = 'block';
  loadQuizQuestion();
});
document.getElementById('btnRetryQuiz').addEventListener('click', ()=>{
  quizResult.style.display = 'none';
  quizIntro.style.display = 'block';
});

function loadQuizQuestion(){
  const q = quizData[quizIdx];
  document.getElementById('quizCount').textContent = `Pergunta ${quizIdx+1} de ${quizData.length}`;
  document.getElementById('quizBarFill').style.width = ((quizIdx)/quizData.length*100) + '%';
  document.getElementById('quizQ').textContent = q.q;
  const optsDiv = document.getElementById('quizOpts');
  optsDiv.innerHTML = '';
  q.opts.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', ()=> answerQuiz(i, btn, q));
    optsDiv.appendChild(btn);
  });
}
function answerQuiz(i, btn, q){
  const allBtns = document.querySelectorAll('#quizOpts .quiz-opt');
  allBtns.forEach(b=> b.disabled = true);
  if(i === q.correct){
    btn.classList.add('correct');
    quizScore++;
    tone(660, 0.15, 'sine', 0.3);
    setTimeout(()=> tone(880, 0.2, 'sine', 0.3), 120);
  } else {
    btn.classList.add('wrong');
    allBtns[q.correct].classList.add('correct');
    tone(180, 0.35, 'sawtooth', 0.3);
  }
  setTimeout(()=>{
    quizIdx++;
    if(quizIdx < quizData.length) loadQuizQuestion();
    else showQuizResult();
  }, 900);
}
function showQuizResult(){
  quizGame.style.display = 'none';
  quizResult.style.display = 'block';
  document.getElementById('quizBarFill').style.width = '100%';
  const pct = quizScore/quizData.length*100;
  const title = document.getElementById('quizResultTitle');
  const trophy = document.getElementById('quizTrophy');
  if(pct===100){ title.textContent='Perfeito!'; trophy.textContent='🏆'; fireConfetti(); }
  else if(pct>=80){ title.textContent='Excelente!'; trophy.textContent='🥇'; fireConfetti(); }
  else if(pct>=60){ title.textContent='Bom trabalho!'; trophy.textContent='🥈'; }
  else { title.textContent='Continue explorando!'; trophy.textContent='🎯'; }
  document.getElementById('quizResultMsg').textContent = `Você acertou ${quizScore} de ${quizData.length} perguntas.`;
}

/* ---------- CONFETE ---------- */
function fireConfetti(){
  const canvas = document.getElementById('confettiCanvas');
  const c = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
  const colors = ['#c9a04e','#e9c877','#3f9186','#f2ead9'];
  const pieces = Array.from({length:80}, ()=>({
    x: Math.random()*canvas.width, y: -20-Math.random()*canvas.height*0.5,
    vy: 2+Math.random()*3, vx: (Math.random()-0.5)*2,
    size: 4+Math.random()*4, color: colors[Math.floor(Math.random()*colors.length)],
    rot: Math.random()*360, vr: (Math.random()-0.5)*10
  }));
  let frame = 0;
  function step(){
    frame++;
    c.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      c.save();
      c.translate(p.x,p.y); c.rotate(p.rot*Math.PI/180);
      c.fillStyle = p.color;
      c.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      c.restore();
    });
    if(frame < 150) requestAnimationFrame(step);
    else c.clearRect(0,0,canvas.width,canvas.height);
  }
  step();
}

/* ---------- FINALE ---------- */
(function finale(){
  const canvas = document.getElementById('finaleCanvas');
  const c = canvas.getContext('2d');
  let w,h;
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  const dots = Array.from({length:22}, ()=>({x:Math.random(), y:Math.random(), p: Math.random()*Math.PI*2}));
  let t=0;
  function draw(){
    t+=0.02;
    c.clearRect(0,0,w,h);
    dots.forEach(d=>{
      const glow = (Math.sin(t+d.p)+1)/2;
      c.beginPath();
      c.arc(d.x*w, d.y*h, 2+glow*3, 0, Math.PI*2);
      c.fillStyle = `rgba(201,160,78,${0.15+glow*0.4})`;
      c.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  const words = document.querySelectorAll('.finale-words span');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        words.forEach((w,i)=> setTimeout(()=> w.classList.add('show'), i*500));
        observer.disconnect();
      }
    });
  }, {threshold:0.5});
  observer.observe(document.getElementById('conclusao'));
})();

/* ---------- GSAP SCROLL REVEALS ---------- */
window.addEventListener('load', ()=>{
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const targets = document.querySelectorAll('.beat-text, .beat-stage, .section-heading, .lab-controls, .lab-visual, .math-block, .wood-tabs, .wood-visual, .perc-row, .quiz-box');
    targets.forEach(el=>{
      gsap.fromTo(el, {opacity:0, y:26}, {
        opacity:1, y:0, duration:0.8, ease:'power2.out',
        scrollTrigger:{ trigger: el, start:'top 85%' }
      });
    });
  }
});