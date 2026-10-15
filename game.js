(() => {
  'use strict';

  const canvas = document.querySelector('#game-canvas');
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const GROUND_Y = 166;
  const PLAYER_WIDTH = 14;
  const PLAYER_HEIGHT = 16;
  const BLOCK_SIZE = 16;
  const STORAGE_KEY = 'matcha-cat-quest-best';

  const elements = {
    menu: document.querySelector('#menu-screen'),
    modal: document.querySelector('#modal-screen'),
    modalEyebrow: document.querySelector('#modal-eyebrow'),
    modalTitle: document.querySelector('#modal-title'),
    modalMessage: document.querySelector('#modal-message'),
    modalStats: document.querySelector('#modal-stats'),
    modalPrimary: document.querySelector('#modal-primary'),
    modalSecondary: document.querySelector('#modal-secondary'),
    start: document.querySelector('#start-button'),
    pause: document.querySelector('#pause-button'),
    sound: document.querySelector('#sound-button'),
    level: document.querySelector('#level-display'),
    matchas: document.querySelector('#matcha-display'),
    lives: document.querySelector('#lives-display'),
    puzzle: document.querySelector('#puzzle-display'),
    puzzleHint: document.querySelector('#puzzle-hint'),
    puzzlePrompt: document.querySelector('#puzzle-prompt'),
    challenge: document.querySelector('#challenge-screen'),
    challengeEyebrow: document.querySelector('#challenge-eyebrow'),
    challengeTitle: document.querySelector('#challenge-title'),
    challengeInstruction: document.querySelector('#challenge-instruction'),
    challengeContent: document.querySelector('#challenge-content'),
    challengeFeedback: document.querySelector('#challenge-feedback'),
    challengeClose: document.querySelector('#challenge-close'),
    stage: document.querySelector('#stage-display'),
  };

  const levels = [
    {
      name: 'JARDIM DO CHÁ',
      theme: 'garden',
      width: 1160,
      ground: [[0, 260], [290, 540], [570, 830], [860, 1160]],
      platforms: [[115, 132, 58], [185, 112, 45], [340, 133, 56], [440, 112, 60], [635, 128, 72], [752, 110, 55], [930, 128, 65]],
      bonusBlocks: [[48, 121], [585, 120], [1018, 121]],
      puzzle: { type: 'mosaic', size: 2, pieces: [2, 0, 3, 1] },
      gateX: 1090,
      matchas: [[85, 153], [143, 120], [207, 100], [370, 121], [470, 100], [668, 116], [779, 98], [963, 116], [1066, 153]],
      spikes: [[405, 158, 13], [723, 158, 14]],
      traps: {
        crumbles: [[168, 42, 10]],
        popSpikes: [],
        fallingBlocks: [],
        fakeMatchas: [[805, 153]],
      },
      enemies: [[321, 306, 384, 0.48], [898, 885, 976, 0.55]],
      checkpoints: [300, 600, 875],
    },
    {
      name: 'TELHADOS ROSADOS',
      theme: 'sunset',
      width: 1280,
      ground: [[0, 215], [255, 475], [518, 750], [790, 1005], [1046, 1280]],
      platforms: [[112, 129, 61], [300, 128, 68], [416, 112, 48], [559, 131, 69], [677, 113, 62], [835, 128, 73], [950, 112, 53], [1100, 127, 65]],
      bonusBlocks: [[43, 121], [535, 120], [1063, 121]],
      puzzle: {
        type: 'trivia',
        questions: [
          { prompt: 'De qual chá é feito o matcha?', answers: ['Chá preto', 'Camomila', 'Chá verde'], correct: 2 },
          { prompt: 'O que ajuda a evitar grumos no matcha?', answers: ['Ferver o pó', 'Peneirar o pó', 'Adicionar sal'], correct: 1 },
        ],
      },
      gateX: 1202,
      matchas: [[78, 153], [140, 117], [328, 116], [439, 100], [586, 119], [705, 101], [863, 116], [976, 100], [1127, 115], [1210, 153]],
      spikes: [[377, 158, 14], [631, 158, 16], [917, 158, 15]],
      traps: {
        crumbles: [[168, 40, 9], [665, 40, 9]],
        popSpikes: [[969, 15, 928, 15]],
        fallingBlocks: [[1048, 1086]],
        fakeMatchas: [[746, 153]],
      },
      enemies: [[285, 270, 354, 0.58], [812, 801, 894, 0.66], [1090, 1070, 1170, 0.54]],
      checkpoints: [270, 535, 805, 1060],
    },
    {
      name: 'NOITE DAS ESTRELAS',
      theme: 'night',
      width: 1400,
      ground: [[0, 215], [263, 490], [537, 760], [808, 1030], [1080, 1400]],
      platforms: [[121, 128, 65], [310, 126, 65], [424, 112, 48], [590, 129, 69], [704, 112, 54], [856, 127, 68], [965, 112, 53], [1133, 126, 66], [1250, 112, 57]],
      bonusBlocks: [[53, 121], [570, 120], [1108, 121]],
      puzzle: { type: 'rhythm', beats: [0, 650, 1300, 2150], notes: [392, 494, 587, 494], tolerance: 230 },
      gateX: 1325,
      matchas: [[92, 153], [151, 116], [338, 114], [448, 100], [620, 117], [729, 100], [881, 115], [991, 100], [1160, 114], [1278, 100], [1340, 153]],
      spikes: [[384, 158, 15], [655, 158, 15], [939, 158, 16], [1213, 158, 14]],
      traps: {
        crumbles: [[164, 38, 8], [704, 38, 8]],
        popSpikes: [[1165, 16, 1128, 13]],
        fallingBlocks: [[400, 445], [950, 995]],
        fakeMatchas: [[1020, 153]],
      },
      enemies: [[288, 275, 362, 0.65], [558, 549, 635, 0.58], [823, 816, 913, 0.72], [1096, 1087, 1183, 0.68]],
      checkpoints: [276, 550, 820, 1092],
    },
    {
      name: 'VALE AMANHECENTE',
      theme: 'dawn',
      width: 1540,
      ground: [[0, 210], [256, 470], [520, 740], [790, 1010], [1060, 1275], [1325, 1540]],
      platforms: [[112, 127, 60], [300, 125, 67], [411, 111, 48], [565, 127, 69], [679, 111, 54], [835, 126, 70], [947, 110, 52], [1104, 126, 68], [1214, 109, 55], [1360, 124, 65]],
      bonusBlocks: [[48, 121], [535, 120], [1075, 121], [1340, 121]],
      puzzle: { type: 'mosaic', size: 3, pieces: [2, 0, 1, 4, 5, 3, 7, 8, 6] },
      gateX: 1460,
      matchas: [[87, 153], [139, 115], [326, 113], [435, 99], [590, 115], [705, 99], [866, 114], [972, 98], [1130, 114], [1240, 97], [1385, 112], [1500, 153]],
      spikes: [[382, 158, 17], [650, 158, 17], [921, 158, 18], [1185, 158, 17], [1410, 158, 15]],
      traps: {
        crumbles: [[161, 36, 7], [692, 36, 7], [959, 36, 7]],
        popSpikes: [[1120, 16, 1080, 12], [1370, 16, 1335, 12]],
        fallingBlocks: [[555, 600], [925, 970], [1340, 1380]],
        fakeMatchas: [[1250, 153], [1490, 153]],
      },
      enemies: [[284, 272, 357, 0.72], [548, 540, 630, 0.68], [817, 805, 902, 0.78], [1087, 1072, 1176, 0.75], [1346, 1337, 1420, 0.7]],
      checkpoints: [270, 535, 805, 1075, 1340],
    },
    {
      name: 'CÉU DE AURORA',
      theme: 'aurora',
      width: 1700,
      ground: [[0, 205], [255, 465], [520, 730], [785, 995], [1050, 1260], [1320, 1505], [1555, 1700]],
      platforms: [[110, 125, 62], [296, 123, 67], [408, 108, 48], [561, 124, 68], [672, 108, 54], [827, 123, 70], [940, 108, 51], [1092, 123, 68], [1200, 107, 56], [1355, 122, 69], [1450, 106, 50], [1580, 121, 60]],
      bonusBlocks: [[48, 121], [535, 120], [1065, 121], [1335, 121], [1570, 120]],
      puzzle: { type: 'rhythm', beats: [0, 550, 1100, 1850, 2400, 2950, 3700], notes: [392, 494, 587, 740, 587, 494, 392], tolerance: 210 },
      gateX: 1635,
      matchas: [[84, 153], [138, 113], [323, 111], [431, 96], [587, 112], [698, 96], [854, 111], [964, 96], [1118, 111], [1227, 95], [1380, 110], [1475, 94], [1605, 109], [1668, 153]],
      spikes: [[375, 158, 18], [644, 158, 19], [912, 158, 20], [1174, 158, 19], [1431, 158, 18], [1596, 158, 16]],
      traps: {
        crumbles: [[162, 34, 6], [685, 34, 6], [949, 34, 6], [1459, 34, 6]],
        popSpikes: [[555, 16, 525, 11], [1150, 16, 1108, 11], [1375, 16, 1345, 11]],
        fallingBlocks: [[280, 330], [650, 700], [1065, 1118], [1430, 1475]],
        fakeMatchas: [[1250, 153], [1497, 153], [1648, 153]],
      },
      enemies: [[281, 267, 355, 0.82], [543, 532, 625, 0.76], [811, 800, 896, 0.86], [1079, 1062, 1165, 0.8], [1340, 1329, 1423, 0.87], [1568, 1562, 1590, 0.78]],
      checkpoints: [270, 535, 800, 1065, 1335, 1570],
    },
  ];

  const game = {
    mode: 'menu',
    character: 'haru',
    levelIndex: 0,
    level: null,
    player: null,
    camera: 0,
    lives: 3,
    bankedScore: 0,
    levelScore: 0,
    collected: [],
    blocks: [],
    traps: { crumbles: [], popSpikes: [], fallingBlocks: [], fakeMatchas: [] },
    puzzleSolved: false,
    challengeState: null,
    enemies: [],
    checkpoint: 20,
    particles: [],
    tick: 0,
    muted: false,
    jumpBuffer: 0,
    coyoteFrames: 0,
    jumpHeld: false,
    jumpCut: false,
    input: { left: false, right: false, jump: false },
  };

  let audioContext;
  let modalPrimaryAction = () => {};
  let modalSecondaryAction = () => {};
  let lastTime = 0;
  let accumulatedTime = 0;
  let rhythmTimers = [];

  const puzzleNames = { mosaic: 'MOSAICO', trivia: 'TRIVIA', rhythm: 'RITMO' };

  function playSound(frequency, duration = 0.09, type = 'square', volume = 0.035) {
    if (game.muted) return;

    try {
      audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // O jogo continua normalmente se o navegador bloquear áudio.
    }
  }

  function updateHud() {
    elements.level.textContent = game.mode === 'menu' ? `— / ${levels.length}` : `${game.levelIndex + 1} / ${levels.length}`;
    elements.matchas.textContent = String(game.bankedScore + game.levelScore).padStart(2, '0');
    elements.lives.textContent = Array.from({ length: 3 }, (_, index) => index < game.lives ? '♥' : '♡').join(' ');
    elements.lives.setAttribute('aria-label', `${game.lives} ${game.lives === 1 ? 'vida' : 'vidas'}`);
    elements.stage.textContent = game.mode === 'menu' ? 'ESCOLHA SEU GATO' : game.level.name;
    elements.puzzle.textContent = game.mode === 'menu' ? '—' : game.puzzleSolved ? 'OK' : puzzleNames[game.level.puzzle.type];
    elements.puzzleHint.textContent = game.mode === 'menu' ? '' : game.puzzleSolved ?
      'PORTÃO ABERTO! SIGA PARA A BANDEIRA' : `RESOLVA O ${puzzleNames[game.level.puzzle.type]} NO PORTÃO`;
    elements.puzzleHint.classList.toggle('hidden', game.mode === 'menu');
    elements.pause.disabled = !['playing', 'paused'].includes(game.mode);
    elements.pause.textContent = game.mode === 'paused' ? '▶' : 'Ⅱ';
    elements.pause.setAttribute('aria-label', game.mode === 'paused' ? 'Continuar jogo' : 'Pausar jogo');
    updatePuzzlePrompt();
  }

  function selectCharacter(character) {
    game.character = character;
    document.querySelectorAll('.character-card').forEach((card) => {
      const selected = card.dataset.character === character;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    playSound(character === 'haru' ? 520 : 420, 0.06);
  }

  function loadLevel(index) {
    game.levelIndex = index;
    game.level = levels[index];
    game.levelScore = 0;
    game.lives = 3;
    game.checkpoint = 20;
    game.collected = game.level.matchas.map(() => false);
    game.blocks = game.level.bonusBlocks.map(([x, y]) => ({ x, y, used: false, bump: 0 }));
    game.traps = {
      crumbles: game.level.traps.crumbles.map(([x, width, delay]) => ({ x, width, delay, state: 'idle', timer: 0 })),
      popSpikes: game.level.traps.popSpikes.map(([x, width, triggerX, warning]) => ({ x, width, triggerX, warning, state: 'idle', timer: 0 })),
      fallingBlocks: game.level.traps.fallingBlocks.map(([triggerX, x]) => {
        const platform = game.level.platforms.find(([platformX, , width]) => x + 8 >= platformX && x + 8 < platformX + width);
        return { triggerX, x, y: 62, vy: 0, landingY: (platform ? platform[1] : GROUND_Y) - 16, state: 'idle', timer: 0 };
      }),
      fakeMatchas: game.level.traps.fakeMatchas.map(([x, y]) => ({ x, y, used: false })),
    };
    game.puzzleSolved = false;
    game.challengeState = null;
    clearRhythmTimers();
    game.enemies = game.level.enemies.map(([x, min, max, speed]) => ({ x, min, max, speed, direction: 1, defeated: false }));
    game.player = { x: 20, y: GROUND_Y - PLAYER_HEIGHT, vx: 0, vy: 0, facing: 1, grounded: true, invincible: 0 };
    game.camera = 0;
    game.particles = [];
    game.jumpBuffer = 0;
    game.coyoteFrames = 7;
    game.jumpHeld = false;
    game.jumpCut = false;
    game.input.left = false;
    game.input.right = false;
    game.input.jump = false;
    game.mode = 'playing';
    elements.menu.classList.add('hidden');
    elements.modal.classList.add('hidden');
    elements.challenge.classList.add('hidden');
    elements.puzzlePrompt.classList.add('hidden');
    updateHud();
  }

  function startGame() {
    game.bankedScore = 0;
    loadLevel(0);
    playSound(620, 0.11);
  }

  function goToMenu() {
    game.mode = 'menu';
    game.level = null;
    game.player = null;
    game.bankedScore = 0;
    game.levelScore = 0;
    game.lives = 3;
    clearRhythmTimers();
    elements.modal.classList.add('hidden');
    elements.challenge.classList.add('hidden');
    elements.puzzlePrompt.classList.add('hidden');
    elements.menu.classList.remove('hidden');
    updateHud();
  }

  function showModal({ eyebrow, title, message, stats = '', primary, onPrimary, secondary, onSecondary }) {
    elements.modalEyebrow.textContent = eyebrow;
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    elements.modalStats.textContent = stats;
    elements.modalPrimary.textContent = primary;
    elements.modalSecondary.textContent = secondary;
    modalPrimaryAction = onPrimary;
    modalSecondaryAction = onSecondary;
    elements.modal.classList.remove('hidden');
    updateHud();
  }

  function pauseGame() {
    if (game.mode === 'paused') {
      game.mode = 'playing';
      elements.modal.classList.add('hidden');
      updateHud();
      return;
    }
    if (game.mode !== 'playing') return;

    game.mode = 'paused';
    showModal({
      eyebrow: 'PAUSA PARA UM RONRONAR',
      title: 'JOGO PAUSADO',
      message: 'O matcha pode esperar um pouquinho.',
      primary: 'CONTINUAR',
      onPrimary: pauseGame,
      secondary: 'VOLTAR AO MENU',
      onSecondary: goToMenu,
    });
  }

  function completeLevel() {
    if (game.mode !== 'playing') return;
    game.mode = 'transition';
    game.bankedScore += game.levelScore;
    const collectedThisLevel = game.levelScore;
    playSound(660, 0.12);
    window.setTimeout(() => playSound(880, 0.18), 100);

    if (game.levelIndex === levels.length - 1) {
      game.mode = 'victory';
      let record = false;
      try {
        const best = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
        if (game.bankedScore > best) {
          window.localStorage.setItem(STORAGE_KEY, String(game.bankedScore));
          record = true;
        }
      } catch {
        // Armazenamento privado ou indisponível não afeta a partida.
      }
      showModal({
        eyebrow: '5 FASES COMPLETAS ✦',
        title: 'MIAU, VOCÊ VENCEU!',
        message: `${game.character === 'haru' ? 'Haru' : 'Barão'} encontrou todos os caminhos do chá. Hora de descansar!`,
        stats: `${game.bankedScore} MATCHAS NO TOTAL${record ? ' · NOVO RECORDE!' : ''}`,
        primary: 'JOGAR DE NOVO',
        onPrimary: startGame,
        secondary: 'ESCOLHER GATO',
        onSecondary: goToMenu,
      });
      return;
    }

    const nextIndex = game.levelIndex + 1;
    showModal({
      eyebrow: `FASE ${game.levelIndex + 1} DE ${levels.length} CONCLUÍDA`,
      title: 'BOA, GATINHO!',
      message: `A bandeira foi alcançada! Próxima fase: ${levels[nextIndex].name}. Resolva o desafio junto ao portão para seguir.`,
      stats: `+${collectedThisLevel} MATCHAS NESTA FASE · ${game.bankedScore} NO TOTAL`,
      primary: 'PRÓXIMA FASE ➜',
      onPrimary: () => loadLevel(nextIndex),
      secondary: 'VOLTAR AO MENU',
      onSecondary: goToMenu,
    });
  }

  function damagePlayer() {
    const player = game.player;
    if (player.invincible > 0 || game.mode !== 'playing') return;

    game.lives -= 1;
    playSound(150, 0.2, 'sawtooth', 0.025);
    spawnParticles(player.x + 7, player.y + 7, '#f6b2bc', 8);

    if (game.lives === 0) {
      game.mode = 'gameover';
      showModal({
        eyebrow: 'AS PATINHAS PRECISAM DESCANSAR',
        title: 'FIM DE JOGO',
        message: 'Tente de novo! Os matchas desta fase estarão esperando.',
        stats: `${game.bankedScore + game.levelScore} MATCHAS COLETADOS`,
        primary: 'TENTAR A FASE',
        onPrimary: () => loadLevel(game.levelIndex),
        secondary: 'VOLTAR AO MENU',
        onSecondary: goToMenu,
      });
      return;
    }

    player.x = game.checkpoint;
    player.y = GROUND_Y - PLAYER_HEIGHT;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.invincible = 90;
    game.camera = Math.max(0, Math.min(game.level.width - WIDTH, player.x - 90));
    updateHud();
  }

  function spawnParticles(x, y, color, count) {
    for (let index = 0; index < count; index += 1) {
      game.particles.push({
        x, y, color,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -Math.random() * 2.2,
        life: 20 + Math.random() * 12,
      });
    }
  }

  function awardMatcha(x, y) {
    game.levelScore += 1;
    spawnParticles(x, y, '#e5f79d', 9);
    playSound(680 + game.levelScore * 25, 0.1);
    updateHud();
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clearRhythmTimers() {
    rhythmTimers.forEach((timer) => window.clearTimeout(timer));
    rhythmTimers = [];
  }

  function isNearPuzzle() {
    return game.player && game.player.x + PLAYER_WIDTH >= game.level.gateX - 36;
  }

  function updatePuzzlePrompt() {
    elements.puzzlePrompt.classList.toggle('hidden', game.mode !== 'playing' || game.puzzleSolved || !isNearPuzzle());
  }

  function openPuzzle() {
    if (game.mode !== 'playing' || game.puzzleSolved || !isNearPuzzle()) return;

    const puzzle = game.level.puzzle;
    game.mode = 'puzzle';
    game.player.vx = 0;
    game.input.left = false;
    game.input.right = false;
    game.input.jump = false;
    elements.puzzlePrompt.classList.add('hidden');
    elements.challenge.classList.remove('hidden');
    elements.challengeEyebrow.textContent = `FASE ${game.levelIndex + 1} · PORTÃO DO CHÁ`;
    elements.challengeFeedback.textContent = '';
    elements.challengeClose.textContent = 'VOLTAR À FASE';

    if (puzzle.type === 'mosaic') {
      elements.challengeTitle.textContent = 'MONTE A IMAGEM';
      elements.challengeInstruction.textContent = 'Toque em duas peças para trocar de lugar. Use a imagem pequena como guia.';
      const pieces = game.challengeState?.type === 'mosaic' ? game.challengeState.pieces : [...puzzle.pieces];
      game.challengeState = { type: 'mosaic', pieces, selected: -1 };
      renderMosaic();
    } else if (puzzle.type === 'trivia') {
      elements.challengeTitle.textContent = 'TRIVIA DO MATCHA';
      const questionIndex = game.challengeState?.type === 'trivia' ? game.challengeState.questionIndex : 0;
      game.challengeState = { type: 'trivia', questionIndex };
      renderTrivia();
    } else {
      elements.challengeTitle.textContent = 'RITMO DO CHÁ';
      elements.challengeInstruction.textContent = 'Ouça a melodia e toque no tempo de cada nota. Use ESPAÇO ou o botão TOCAR.';
      game.challengeState = { type: 'rhythm', playing: false, beatIndex: 0, soundedIndex: 0, startTime: 0 };
      renderRhythm();
    }
    updateHud();
    elements.challengeContent.querySelectorAll('button')[0]?.focus?.();
  }

  function closePuzzle() {
    if (game.mode !== 'puzzle') return;
    clearRhythmTimers();
    game.mode = 'playing';
    game.input.left = false;
    game.input.right = false;
    game.input.jump = false;
    game.jumpHeld = false;
    elements.challenge.classList.add('hidden');
    updatePuzzlePrompt();
    updateHud();
    (game.puzzleSolved ? elements.pause : elements.puzzlePrompt).focus?.();
  }

  function solvePuzzle() {
    game.puzzleSolved = true;
    if (game.challengeState.type === 'rhythm') game.challengeState.playing = false;
    clearRhythmTimers();
    elements.challengeFeedback.textContent = 'PERFEITO! O PORTÃO ESTÁ ABERTO.';
    elements.challengeClose.textContent = 'CONTINUAR A AVENTURA';
    elements.challengeContent.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    spawnParticles(game.level.gateX + 8, GROUND_Y - 70, '#fbe49b', 20);
    playSound(740, 0.14);
    window.setTimeout(() => playSound(988, 0.18), 130);
    updateHud();
    elements.challengeClose.focus?.();
  }

  let mosaicArt;

  function getMosaicArt() {
    if (mosaicArt) return mosaicArt;
    mosaicArt = document.createElement('canvas');
    mosaicArt.width = 96;
    mosaicArt.height = 96;
    const art = mosaicArt.getContext('2d');
    art.imageSmoothingEnabled = false;
    const paint = (x, y, w, h, color) => {
      art.fillStyle = color;
      art.fillRect(x, y, w, h);
    };

    paint(0, 0, 96, 96, '#7bcbd7');
    paint(0, 57, 96, 39, '#6aa675');
    paint(0, 52, 96, 8, '#aed993');
    paint(69, 8, 17, 17, '#fff0ab');
    paint(72, 5, 11, 3, '#fff0ab');
    paint(10, 17, 22, 6, '#fff9e7');
    paint(14, 12, 14, 5, '#fff9e7');
    paint(5, 46, 17, 26, '#4b836b');
    paint(9, 33, 9, 18, '#4b836b');
    paint(13, 40, 3, 32, '#624d5b');
    paint(77, 43, 15, 31, '#d9a47b');
    paint(73, 39, 23, 6, '#73566b');
    paint(79, 48, 6, 7, '#f6dfb2');
    paint(52, 23, 8, 10, '#d68083');
    paint(67, 23, 8, 10, '#d68083');
    paint(53, 28, 21, 18, '#e7a069');
    paint(57, 39, 3, 3, '#3c3849');
    paint(68, 39, 3, 3, '#3c3849');
    paint(62, 43, 3, 2, '#d7798a');
    paint(31, 63, 39, 22, '#564960');
    paint(34, 65, 33, 15, '#fff5df');
    paint(37, 60, 27, 8, '#638e59');
    paint(41, 61, 19, 4, '#b4d881');
    paint(38, 80, 25, 6, '#d5b796');
    paint(27, 86, 49, 4, '#473f53');
    paint(6, 79, 4, 9, '#f6c3ce');
    paint(4, 76, 8, 5, '#f6c3ce');
    paint(85, 82, 4, 8, '#f6c3ce');
    paint(83, 79, 8, 5, '#f6c3ce');
    return mosaicArt;
  }

  function renderMosaic(focusPosition = -1) {
    const { pieces, selected } = game.challengeState;
    const size = game.level.puzzle.size;
    const art = getMosaicArt();
    const layout = document.createElement('div');
    layout.className = 'mosaic-layout';
    const reference = document.createElement('canvas');
    reference.className = 'mosaic-reference';
    reference.width = 96;
    reference.height = 96;
    reference.setAttribute('aria-label', 'Imagem montada de um gato, uma xícara de matcha e um jardim');
    reference.getContext('2d').drawImage(art, 0, 0);
    const board = document.createElement('div');
    board.className = 'mosaic-board';
    board.style.gridTemplateColumns = `repeat(${size}, var(--mosaic-piece-size))`;
    for (let position = 0; position < pieces.length; position += 1) {
      const piece = pieces[position];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mosaic-piece${selected === position ? ' selected' : ''}`;
      button.setAttribute('aria-label', `Peça ${piece + 1}, posição ${position + 1}`);
      const tile = document.createElement('canvas');
      const tileSize = 96 / size;
      tile.width = tileSize;
      tile.height = tileSize;
      tile.getContext('2d').drawImage(art, (piece % size) * tileSize, Math.floor(piece / size) * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);
      button.append(tile);
      button.addEventListener('click', () => chooseMosaicPiece(position));
      board.append(button);
    }
    layout.append(reference, board);
    elements.challengeContent.replaceChildren(layout);
    if (focusPosition >= 0) board.children[focusPosition]?.focus?.();
  }

  function chooseMosaicPiece(position) {
    if (game.mode !== 'puzzle' || game.puzzleSolved) return;
    const state = game.challengeState;
    if (state.selected === -1) {
      state.selected = position;
      playSound(420, 0.06);
    } else if (state.selected === position) {
      state.selected = -1;
    } else {
      [state.pieces[state.selected], state.pieces[position]] = [state.pieces[position], state.pieces[state.selected]];
      state.selected = -1;
      playSound(570, 0.07);
      if (state.pieces.every((piece, index) => piece === index)) {
        renderMosaic(position);
        solvePuzzle();
        return;
      }
    }
    renderMosaic(position);
  }

  function renderTrivia() {
    const { questionIndex } = game.challengeState;
    const questions = game.level.puzzle.questions;
    const question = questions[questionIndex];
    elements.challengeInstruction.textContent = `PERGUNTA ${questionIndex + 1} DE ${questions.length} · ${question.prompt}`;
    const options = document.createElement('div');
    options.className = 'trivia-options';
    question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trivia-option';
      button.textContent = answer;
      button.addEventListener('click', () => answerTrivia(index));
      options.append(button);
    });
    elements.challengeContent.replaceChildren(options);
  }

  function answerTrivia(answer) {
    if (game.mode !== 'puzzle' || game.puzzleSolved) return;
    const state = game.challengeState;
    const questions = game.level.puzzle.questions;
    if (answer !== questions[state.questionIndex].correct) {
      elements.challengeFeedback.textContent = 'NÃO FOI DESSA VEZ. TENTE OUTRA RESPOSTA.';
      playSound(180, 0.12, 'sawtooth', 0.02);
      return;
    }
    state.questionIndex += 1;
    playSound(620, 0.09);
    if (state.questionIndex === questions.length) {
      solvePuzzle();
    } else {
      elements.challengeFeedback.textContent = 'CERTO! MAIS UMA PERGUNTA.';
      renderTrivia();
    }
  }

  function renderRhythm() {
    const state = game.challengeState;
    const { beats } = game.level.puzzle;
    const area = document.createElement('div');
    area.className = 'rhythm-area';
    const track = document.createElement('div');
    track.className = 'rhythm-track';
    const lastBeat = beats[beats.length - 1];
    state.markers = beats.map((beat, index) => {
      const marker = document.createElement('span');
      marker.className = 'rhythm-marker';
      marker.style.left = `${7 + (beat / lastBeat) * 86}%`;
      marker.setAttribute('aria-label', `Nota ${index + 1}`);
      track.append(marker);
      return marker;
    });
    state.cursor = document.createElement('span');
    state.cursor.className = 'rhythm-cursor';
    state.cursor.style.left = '7%';
    track.append(state.cursor);
    const controls = document.createElement('div');
    controls.className = 'rhythm-controls';
    const listenButton = document.createElement('button');
    listenButton.type = 'button';
    listenButton.className = 'secondary-button';
    listenButton.textContent = 'OUVIR MELODIA';
    listenButton.addEventListener('click', listenRhythm);
    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.className = 'secondary-button';
    startButton.textContent = 'COMEÇAR';
    startButton.addEventListener('click', startRhythm);
    const tapButton = document.createElement('button');
    tapButton.type = 'button';
    tapButton.className = 'primary-button rhythm-tap';
    tapButton.textContent = 'TOCAR ♪';
    tapButton.disabled = true;
    tapButton.addEventListener('click', tapRhythm);
    controls.append(listenButton, startButton, tapButton);
    area.append(track, controls);
    elements.challengeContent.replaceChildren(area);
    state.listenButton = listenButton;
    state.startButton = startButton;
    state.tapButton = tapButton;
  }

  function listenRhythm() {
    if (game.mode !== 'puzzle' || game.puzzleSolved || game.challengeState.playing) return;
    clearRhythmTimers();
    const { beats, notes } = game.level.puzzle;
    elements.challengeFeedback.textContent = 'OUÇA AS NOTAS E REPITA O TEMPO.';
    beats.forEach((beat, index) => {
      rhythmTimers.push(window.setTimeout(() => playSound(notes[index], 0.16), beat + 250));
    });
  }

  function startRhythm() {
    if (game.mode !== 'puzzle' || game.puzzleSolved) return;
    clearRhythmTimers();
    const state = game.challengeState;
    state.playing = true;
    state.beatIndex = 0;
    state.soundedIndex = 0;
    state.startTime = performance.now() + 900;
    state.markers.forEach((marker) => marker.classList.remove('hit'));
    state.cursor.style.left = '7%';
    state.startButton.disabled = true;
    state.listenButton.disabled = true;
    state.tapButton.disabled = false;
    elements.challengeFeedback.textContent = 'PREPARE-SE... TOQUE QUANDO O MARCADOR CHEGAR À NOTA.';
  }

  function failRhythm() {
    const state = game.challengeState;
    state.playing = false;
    state.startButton.disabled = false;
    state.listenButton.disabled = false;
    state.tapButton.disabled = true;
    state.startButton.textContent = 'TENTAR DE NOVO';
    elements.challengeFeedback.textContent = 'FORA DO RITMO. OUÇA E TENTE DE NOVO.';
    playSound(190, 0.14, 'sawtooth', 0.02);
  }

  function tapRhythm() {
    if (game.mode !== 'puzzle' || game.puzzleSolved) return;
    const state = game.challengeState;
    if (state.type !== 'rhythm' || !state.playing) return;
    const { beats, tolerance } = game.level.puzzle;
    const difference = performance.now() - (state.startTime + beats[state.beatIndex]);
    if (Math.abs(difference) > tolerance) {
      failRhythm();
      return;
    }
    state.markers[state.beatIndex].classList.add('hit');
    state.beatIndex += 1;
    playSound(game.level.puzzle.notes[state.beatIndex - 1], 0.08, 'triangle', 0.02);
    if (state.beatIndex === beats.length) {
      solvePuzzle();
    } else {
      elements.challengeFeedback.textContent = `${state.beatIndex} DE ${beats.length} NOTAS NO TEMPO!`;
    }
  }

  function updateRhythm() {
    const state = game.challengeState;
    if (!state || state.type !== 'rhythm' || !state.playing) return;
    const { beats, notes, tolerance } = game.level.puzzle;
    const elapsed = performance.now() - state.startTime;
    while (state.soundedIndex < beats.length && elapsed >= beats[state.soundedIndex]) {
      playSound(notes[state.soundedIndex], 0.12);
      state.soundedIndex += 1;
    }
    const position = Math.max(0, Math.min(1, elapsed / beats[beats.length - 1]));
    state.cursor.style.left = `${7 + position * 86}%`;
    if (elapsed > beats[state.beatIndex] + tolerance) failRhythm();
  }

  function getSolidGroundSegments(level) {
    let segments = level.ground;
    for (const trap of game.traps.crumbles) {
      if (trap.state !== 'collapsed') continue;
      segments = segments.flatMap(([start, end]) => {
        if (trap.x >= end || trap.x + trap.width <= start) return [[start, end]];
        const remaining = [];
        if (start < trap.x) remaining.push([start, trap.x]);
        if (trap.x + trap.width < end) remaining.push([trap.x + trap.width, end]);
        return remaining;
      });
    }
    return segments;
  }

  function updateTraps(player) {
    const playerBounds = { x: player.x + 2, y: player.y + 2, w: 10, h: 13 };
    for (const trap of game.traps.crumbles) {
      if (trap.state === 'idle' && player.grounded && player.y + PLAYER_HEIGHT === GROUND_Y &&
        player.x + PLAYER_WIDTH / 2 >= trap.x && player.x + PLAYER_WIDTH / 2 < trap.x + trap.width) {
        trap.state = 'cracking';
        trap.timer = trap.delay;
        playSound(220, 0.06);
      } else if (trap.state === 'cracking' && --trap.timer <= 0) {
        trap.state = 'collapsed';
        trap.timer = 110;
        spawnParticles(trap.x + trap.width / 2, GROUND_Y + 2, '#bd875b', 12);
        playSound(120, 0.13, 'sawtooth', 0.02);
      } else if (trap.state === 'collapsed' && --trap.timer <= 0) {
        trap.state = 'idle';
      }
    }

    for (const trap of game.traps.popSpikes) {
      if (trap.state === 'idle' && player.x + PLAYER_WIDTH >= trap.triggerX && player.x < trap.x + trap.width + 16) {
        trap.state = 'warning';
        trap.timer = trap.warning;
        playSound(280, 0.07);
      } else if (trap.state === 'warning' && --trap.timer <= 0) {
        trap.state = 'active';
        trap.timer = 75;
        playSound(510, 0.08, 'sawtooth', 0.025);
      } else if (trap.state === 'active' && --trap.timer <= 0) {
        trap.state = 'spent';
      }
      if (trap.state === 'active' && overlaps(playerBounds, { x: trap.x, y: GROUND_Y - 11, w: trap.width, h: 11 })) {
        damagePlayer();
        return true;
      }
    }

    for (const trap of game.traps.fallingBlocks) {
      if (trap.state === 'idle' && player.x + PLAYER_WIDTH >= trap.triggerX && player.x < trap.x + 24) {
        trap.state = 'falling';
        trap.y = 62;
        trap.vy = 1.2;
        playSound(260, 0.08);
      } else if (trap.state === 'falling') {
        trap.vy = Math.min(trap.vy + 0.38, 6.4);
        trap.y = Math.min(trap.y + trap.vy, trap.landingY);
        if (trap.y === trap.landingY) {
          trap.state = 'landed';
          trap.timer = 80;
          spawnParticles(trap.x + 8, trap.y + 15, '#a6a2b2', 8);
          playSound(110, 0.12, 'sawtooth', 0.025);
        }
      } else if (trap.state === 'landed' && --trap.timer <= 0) {
        trap.state = 'spent';
      }
      if ((trap.state === 'falling' || trap.state === 'landed') &&
        overlaps(playerBounds, { x: trap.x, y: trap.y, w: 16, h: 16 })) {
        damagePlayer();
        return true;
      }
    }

    for (const trap of game.traps.fakeMatchas) {
      if (trap.used || !overlaps(playerBounds, { x: trap.x - 7, y: trap.y - 8, w: 15, h: 13 })) continue;
      trap.used = true;
      spawnParticles(trap.x, trap.y, '#b283ca', 12);
      playSound(180, 0.15, 'sawtooth', 0.025);
      damagePlayer();
      return true;
    }
    return false;
  }

  function update() {
    game.tick += 1;
    if (game.mode === 'puzzle') {
      updateRhythm();
      return;
    }
    if (game.mode !== 'playing') return;

    const player = game.player;
    const level = game.level;
    const targetSpeed = (Number(game.input.right) - Number(game.input.left)) * 2.35;
    player.vx += (targetSpeed - player.vx) * (targetSpeed === 0 ? 0.28 : 0.38);
    if (Math.abs(player.vx) < 0.05) player.vx = 0;
    if (player.vx > 0.2) player.facing = 1;
    if (player.vx < -0.2) player.facing = -1;

    if (game.input.jump && !game.jumpHeld) {
      game.jumpBuffer = 8;
      game.jumpHeld = true;
    } else if (!game.input.jump) {
      game.jumpHeld = false;
    }

    if (player.grounded) game.coyoteFrames = 7;
    else game.coyoteFrames = Math.max(0, game.coyoteFrames - 1);

    if (game.jumpBuffer > 0 && game.coyoteFrames > 0) {
      player.vy = -5.8;
      player.grounded = false;
      game.coyoteFrames = 0;
      game.jumpBuffer = 0;
      game.jumpCut = false;
      playSound(370, 0.075);
    }
    game.jumpBuffer = Math.max(0, game.jumpBuffer - 1);

    if (!game.input.jump && player.vy < -2.4 && !game.jumpCut) {
      player.vy *= 0.66;
      game.jumpCut = true;
    }

    player.x = Math.max(0, Math.min(level.width - PLAYER_WIDTH, player.x + player.vx));
    if (!game.puzzleSolved && player.x + PLAYER_WIDTH > level.gateX) {
      player.x = level.gateX - PLAYER_WIDTH;
      player.vx = 0;
    }
    const previousTop = player.y;
    const previousBottom = player.y + PLAYER_HEIGHT;
    player.vy = Math.min(player.vy + 0.27, 6.4);
    player.y += player.vy;
    const fallingBeforeLanding = player.vy > 0.5;
    player.grounded = false;

    if (player.vy < 0) {
      for (const block of game.blocks) {
        const hitFromBelow = previousTop >= block.y + BLOCK_SIZE - 2 &&
          player.y <= block.y + BLOCK_SIZE &&
          player.x + PLAYER_WIDTH > block.x + 2 && player.x < block.x + BLOCK_SIZE - 2;
        if (!hitFromBelow) continue;

        player.y = block.y + BLOCK_SIZE;
        player.vy = 0.7;
        game.jumpCut = true;
        block.bump = 8;
        if (!block.used) {
          block.used = true;
          awardMatcha(block.x + BLOCK_SIZE / 2, block.y - 2);
        } else {
          playSound(210, 0.06);
        }
        break;
      }
    }

    const surfaces = [
      ...getSolidGroundSegments(level).map(([start, end]) => ({ x: start, w: end - start, y: GROUND_Y })),
      ...level.platforms.map(([x, y, w]) => ({ x, y, w })),
      ...game.blocks.map((block) => ({ x: block.x, y: block.y, w: BLOCK_SIZE })),
    ];
    for (const surface of surfaces) {
      const landed = player.vy >= 0 && previousBottom <= surface.y + 2 &&
        player.y + PLAYER_HEIGHT >= surface.y &&
        player.x + PLAYER_WIDTH > surface.x + 2 && player.x < surface.x + surface.w - 2;
      if (landed) {
        player.y = surface.y - PLAYER_HEIGHT;
        player.vy = 0;
        player.grounded = true;
        break;
      }
    }

    if (player.invincible > 0) player.invincible -= 1;
    if (player.y > HEIGHT + 20) {
      damagePlayer();
      return;
    }

    if (updateTraps(player)) return;

    for (let index = 0; index < level.matchas.length; index += 1) {
      if (game.collected[index]) continue;
      const [x, y] = level.matchas[index];
      if (overlaps({ x: player.x, y: player.y, w: PLAYER_WIDTH, h: PLAYER_HEIGHT }, { x: x - 7, y: y - 8, w: 15, h: 13 })) {
        game.collected[index] = true;
        awardMatcha(x, y);
      }
    }

    for (const block of game.blocks) block.bump = Math.max(0, block.bump - 1);

    for (const enemy of game.enemies) {
      if (enemy.defeated) continue;
      enemy.x += enemy.speed * enemy.direction;
      if (enemy.x < enemy.min || enemy.x > enemy.max) enemy.direction *= -1;
      if (overlaps({ x: player.x + 2, y: player.y + 2, w: 10, h: 12 }, { x: enemy.x, y: GROUND_Y - 20, w: 16, h: 20 })) {
        if (fallingBeforeLanding && previousBottom <= GROUND_Y - 16) {
          enemy.defeated = true;
          player.y = GROUND_Y - 20 - PLAYER_HEIGHT;
          player.vy = -3.8;
          player.grounded = false;
          game.coyoteFrames = 0;
          spawnParticles(enemy.x + 8, GROUND_Y - 12, '#ffe3a8', 10);
          playSound(470, 0.1);
        } else {
          damagePlayer();
          return;
        }
      }
    }

    for (const [x, y, w] of level.spikes) {
      if (overlaps({ x: player.x + 2, y: player.y + 3, w: 10, h: 12 }, { x, y, w, h: 8 })) {
        damagePlayer();
        if (game.mode !== 'playing') return;
      }
    }

    for (const checkpoint of level.checkpoints) {
      if (player.x >= checkpoint && checkpoint > game.checkpoint) game.checkpoint = checkpoint;
    }

    updatePuzzlePrompt();

    if (player.x + PLAYER_WIDTH >= level.width - 31 && player.y < GROUND_Y && player.y + PLAYER_HEIGHT > GROUND_Y - 34) {
      completeLevel();
      return;
    }

    const cameraTarget = Math.max(0, Math.min(level.width - WIDTH, player.x - WIDTH * 0.37));
    game.camera += (cameraTarget - game.camera) * 0.12;

    game.particles = game.particles.filter((particle) => particle.life > 0);
    for (const particle of game.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.08;
      particle.life -= 1;
    }
  }

  function fill(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }

  function drawCloud(x, y, color, shadow) {
    fill(x + 7, y + 1, 15, 4, shadow);
    fill(x + 3, y + 5, 28, 9, shadow);
    fill(x + 8, y + 13, 21, 3, shadow);
    fill(x + 7, y, 15, 4, color);
    fill(x + 3, y + 4, 28, 8, color);
    fill(x, y + 7, 36, 5, color);
    fill(x + 6, y + 12, 23, 2, color);
    fill(x + 8, y + 2, 7, 1, '#ffffff');
  }

  function drawBackground(theme, camera) {
    const palettes = {
      garden: { sky: '#70cbe2', high: '#a1e4dc', low: '#e6efbd', hill: '#8acb91', hillLight: '#afe0a1', back: '#56aa82', cloud: '#fffdf0', cloudShade: '#c4e4d9' },
      sunset: { sky: '#dd7896', high: '#f4a381', low: '#ffd5a0', hill: '#c18caa', hillLight: '#dfa5ae', back: '#896e9e', cloud: '#ffeed8', cloudShade: '#eab9b9' },
      night: { sky: '#303c74', high: '#5d5e9b', low: '#9280b4', hill: '#565b9a', hillLight: '#797ab2', back: '#343e77', cloud: '#c8bbdb', cloudShade: '#867da9' },
      dawn: { sky: '#ef9b90', high: '#f8c4a2', low: '#f8e5b6', hill: '#b9aab0', hillLight: '#e3c9ae', back: '#8d9b97', cloud: '#fff2d6', cloudShade: '#e7bdaa' },
      aurora: { sky: '#263859', high: '#365b70', low: '#5d8a8a', hill: '#4c7482', hillLight: '#78a69b', back: '#2c5266', cloud: '#b4d9ce', cloudShade: '#6b9b9e' },
    };
    const colors = palettes[theme];
    fill(0, 0, WIDTH, 72, colors.sky);
    fill(0, 72, WIDTH, 57, colors.high);
    fill(0, 129, WIDTH, 63, colors.low);
    fill(0, 71, WIDTH, 2, theme === 'night' || theme === 'aurora' ? '#4b538b' : '#bce7dc');

    if (theme === 'aurora') {
      for (let index = 0; index < 5; index += 1) {
        const x = index * 88 - ((camera * 0.12) % 88) - 25;
        fill(x + 12, 9, 18, 76, '#4ba99a');
        fill(x + 17, 6, 9, 70, '#8cc9aa');
        fill(x + 27, 15, 9, 66, '#779dc0');
        fill(x + 12, 75, 24, 8, colors.high);
      }
    }

    const orbX = Math.round(251 - camera * 0.035);
    if (theme === 'night' || theme === 'aurora') {
      fill(orbX - 2, 18, 31, 31, '#8d82aa');
      fill(orbX, 20, 27, 27, '#f9edc5');
      fill(orbX + 20, 17, 10, 22, colors.sky);
      fill(orbX + 4, 25, 3, 3, '#e8dcb6');
      for (let index = 0; index < 26; index += 1) {
        const x = (index * 83 + 18 - camera * 0.08) % 380;
        const y = 10 + (index * 37) % 70;
        const starX = x < 0 ? x + 380 : x;
        fill(starX, y, index % 4 === 0 ? 3 : 1, 1, '#fff0c8');
        if (index % 4 === 0) fill(starX + 1, y - 1, 1, 3, '#fff0c8');
      }
    } else {
      const sun = theme === 'garden' ? '#fff3a9' : '#ffe29a';
      fill(orbX - 5, 30, 36, 16, '#ffffff44');
      fill(orbX, 24, 26, 26, sun);
      fill(orbX + 3, 21, 20, 3, sun);
      fill(orbX + 3, 50, 20, 3, sun);
      fill(orbX - 3, 32, 3, 9, sun);
      fill(orbX + 26, 32, 3, 9, sun);
    }

    for (let index = 0; index < 7; index += 1) {
      const x = index * 78 - ((camera * 0.18) % 78) - 25;
      drawCloud(x, 23 + (index % 3) * 15, colors.cloud, colors.cloudShade);
    }

    for (let index = 0; index < 9; index += 1) {
      const x = index * 58 - ((camera * 0.32) % 58) - 25;
      const top = 104 - (index % 3) * 5;
      fill(x + 18, top, 22, 62, colors.hill);
      fill(x + 10, top + 8, 38, 54, colors.hill);
      fill(x + 2, top + 18, 54, 44, colors.hill);
      fill(x + 18, top + 2, 7, 27, colors.hillLight);
      fill(x + 10, top + 20, 4, 22, colors.hillLight);
      fill(x + 29, top + 32, 4, 3, colors.hillLight);
      fill(x + 39, top + 39, 3, 3, colors.hillLight);
    }
    for (let index = 0; index < 10; index += 1) {
      const x = index * 46 - ((camera * 0.5) % 46) - 15;
      const top = 133 - (index % 3) * 5;
      fill(x + 7, top, 32, 33, colors.back);
      fill(x, top + 10, 46, 24, colors.back);
      fill(x + 15, top + 4, 3, 3, colors.hillLight);
      fill(x + 31, top + 14, 3, 3, colors.hillLight);
    }

    if (theme === 'garden') {
      for (let index = 0; index < 7; index += 1) {
        const x = index * 75 - ((camera * 0.65) % 75) + 9;
        fill(x + 14, 132, 4, 34, '#728d73');
        fill(x + 5, 117, 22, 17, '#f3aeba');
        fill(x, 125, 32, 12, '#f3aeba');
        fill(x + 11, 111, 13, 7, '#f8c9c9');
      }
    } else if (theme === 'sunset') {
      for (let index = 0; index < 8; index += 1) {
        const x = index * 64 - ((camera * 0.66) % 64);
        fill(x, 126 + (index % 3) * 5, 45, 40, '#755f83');
        fill(x - 4, 124 + (index % 3) * 5, 53, 4, '#624f74');
        fill(x + 8, 137 + (index % 3) * 5, 5, 7, '#f6cc9e');
        fill(x + 27, 137 + (index % 3) * 5, 5, 7, '#f6cc9e');
      }
    } else if (theme === 'night') {
      for (let index = 0; index < 8; index += 1) {
        const x = index * 66 - ((camera * 0.66) % 66);
        fill(x + 8, 122, 35, 44, '#333654');
        fill(x + 3, 119, 45, 5, '#2b304e');
        fill(x + 13, 134, 5, 7, '#eac59f');
        fill(x + 32, 134, 5, 7, '#eac59f');
      }
    } else {
      for (let index = 0; index < 8; index += 1) {
        const x = index * 66 - ((camera * 0.66) % 66);
        const top = 124 + (index % 3) * 4;
        fill(x + 4, top, 48, 42, theme === 'dawn' ? '#9b9098' : '#284d60');
        fill(x + 8, top - 5, 40, 6, theme === 'dawn' ? '#e9b9a6' : '#567e83');
        fill(x + 15, top + 12, 5, 7, '#f7d5ab');
        fill(x + 35, top + 12, 5, 7, '#f7d5ab');
      }
    }
  }

  function drawGround(start, end, camera, theme) {
    const palette = {
      garden: { edge: '#503e56', cap: '#438d54', grass: '#69c35c', shine: '#b0e67a', soil: '#bd875b', light: '#e0aa70', shadow: '#875b53' },
      sunset: { edge: '#5e4969', cap: '#c76e77', grass: '#efaa75', shine: '#ffd193', soil: '#ad6871', light: '#d5897a', shadow: '#79536a' },
      night: { edge: '#34365b', cap: '#62699a', grass: '#91b89a', shine: '#c4d4aa', soil: '#686899', light: '#9290b6', shadow: '#484a78' },
      dawn: { edge: '#674d66', cap: '#b66c77', grass: '#e9a68d', shine: '#ffe2a8', soil: '#ac806f', light: '#d7a18c', shadow: '#795e69' },
      aurora: { edge: '#243a59', cap: '#3e8e82', grass: '#73b59d', shine: '#a9d9ad', soil: '#436b70', light: '#6f9d8d', shadow: '#365768' },
    }[theme];
    fill(start - camera, GROUND_Y, end - start, HEIGHT - GROUND_Y, palette.edge);

    for (let tile = start; tile < end; tile += 16) {
      const left = Math.round(tile - camera);
      if (left > WIDTH || left + 16 < 0) continue;
      const width = Math.min(16, end - tile);
      fill(left + 1, GROUND_Y + 4, width - 1, HEIGHT - GROUND_Y - 4, palette.soil);
      fill(left, GROUND_Y, width, 2, palette.cap);
      fill(left, GROUND_Y + 2, width, 3, palette.grass);
      if (width > 3) fill(left + 2, GROUND_Y + 2, Math.min(8, width - 2), 1, palette.shine);
      if (width > 8) fill(left + 3, GROUND_Y + 7, 5, 2, palette.light);
      if (width > 14) fill(left + 10, GROUND_Y + 12, 4, 2, palette.shadow);
      if (width > 6) fill(left + 2, GROUND_Y + 19, 4, 2, palette.shadow);
      if (width > 12) fill(left + 8, GROUND_Y + 22, 4, 2, palette.light);
      fill(left, GROUND_Y + 5, 1, HEIGHT - GROUND_Y - 5, palette.edge);
      fill(left + 1, GROUND_Y + 15, Math.max(0, width - 1), 1, palette.shadow);
    }
  }

  function drawPlatform(x, y, width, camera, theme) {
    const palette = {
      garden: { face: '#c58867', top: '#f4c294', edge: '#755166', shadow: '#a06a5f' },
      sunset: { face: '#bd707c', top: '#f5ad90', edge: '#684b70', shadow: '#925c76' },
      night: { face: '#7472a3', top: '#b9a7c4', edge: '#46466d', shadow: '#595782' },
      dawn: { face: '#bc877d', top: '#f1c1a0', edge: '#735269', shadow: '#956976' },
      aurora: { face: '#548b86', top: '#a5cbb0', edge: '#30546c', shadow: '#3a6c75' },
    }[theme];
    fill(x - camera, y, width, 10, palette.edge);
    for (let offset = 0; offset < width; offset += 16) {
      const left = Math.round(x + offset - camera);
      const tileWidth = Math.min(16, width - offset);
      if (tileWidth < 4) continue;
      fill(left + 1, y + 1, tileWidth - 2, 7, palette.face);
      fill(left + 2, y + 1, tileWidth - 3, 2, palette.top);
      if (tileWidth > 9) fill(left + 4, y + 4, 5, 1, palette.shadow);
      if (tileWidth > 14) fill(left + 10, y + 6, 4, 1, palette.shadow);
      fill(left + 1, y + 8, tileWidth - 2, 1, palette.shadow);
    }
  }

  function drawBonusBlock(block, camera, tick) {
    const offset = block.bump > 0 ? Math.round(Math.sin(block.bump * Math.PI / 8) * 3) : 0;
    const x = Math.round(block.x - camera);
    const y = block.y - offset;
    const edge = block.used ? '#5e5a70' : '#81515d';
    const face = block.used ? '#a7a2a3' : '#f8bc56';
    fill(x, y, BLOCK_SIZE, BLOCK_SIZE, edge);
    fill(x + 1, y + 1, 14, 13, face);
    fill(x + 2, y + 2, 11, 2, block.used ? '#c4bdb5' : '#ffe38b');
    fill(x + 2, y + 13, 12, 1, block.used ? '#817b84' : '#c17c55');
    fill(x + 2, y + 3, 2, 2, edge);
    fill(x + 12, y + 11, 2, 2, edge);

    if (block.used) {
      fill(x + 6, y + 5, 4, 5, '#77727c');
      return;
    }
    fill(x + 5, y + 5, 6, 5, '#467b4a');
    fill(x + 6, y + 5, 4, 3, '#8ecb67');
    fill(x + 7, y + 4, 2, 2, '#d8ed91');
    fill(x + 7, y + 10, 2, 2, '#fff0bd');
    if (tick % 48 < 24) fill(x + 12, y + 3, 2, 2, '#fff2b0');
  }

  const tinyGlyphs = {
    D: ['110', '101', '101', '101', '110'],
    O: ['111', '101', '101', '101', '111'],
    V: ['101', '101', '101', '101', '010'],
    E: ['111', '100', '110', '100', '111'],
  };

  function drawTinyText(text, x, y, color) {
    for (let letter = 0; letter < text.length; letter += 1) {
      const glyph = tinyGlyphs[text[letter]];
      for (let row = 0; row < glyph.length; row += 1) {
        for (let column = 0; column < 3; column += 1) {
          if (glyph[row][column] === '1') fill(x + letter * 4 + column, y + row, 1, 1, color);
        }
      }
    }
  }

  function drawGate(x, camera, open) {
    const left = Math.round(x - camera);
    if (left < -20 || left > WIDTH + 20) return;
    if (open) {
      fill(left - 2, 0, 3, GROUND_Y, '#35465e');
      fill(left + 15, 0, 3, GROUND_Y, '#35465e');
      fill(left, 0, 16, 5, '#a6b9bc');
      for (let y = 17; y < GROUND_Y - 8; y += 24) {
        fill(left + 4, y, 2, 2, '#e5f4c1');
        fill(left + 10, y + 8, 2, 2, '#b7e8ba');
      }
      return;
    }
    fill(left - 2, 0, 20, GROUND_Y, '#35465e');
    fill(left, 0, 16, GROUND_Y, '#a6b9bc');
    fill(left + 2, 0, 12, GROUND_Y, '#4f718a');
    fill(left + 4, 0, 8, GROUND_Y, '#d0d5be');
    for (let y = 8; y < GROUND_Y - 8; y += 16) {
      fill(left + 4, y, 8, 8, '#647baf');
      fill(left + 6, y + 2, 4, 4, game.tick % 32 < 16 ? '#d5e4f7' : '#a8c5ec');
    }
  }

  function drawTeaHouse(x, camera, theme) {
    const left = Math.round(x - camera);
    const roof = {
      garden: '#4d9f71', sunset: '#a85e79', night: '#564a82',
      dawn: '#ba767c', aurora: '#3d8e81',
    }[theme];
    fill(left + 5, 126, 38, 40, '#614d64');
    fill(left + 8, 129, 32, 37, '#f0cfaa');
    fill(left + 10, 132, 28, 2, '#fff0c6');
    fill(left + 1, 122, 46, 6, '#493c59');
    fill(left + 5, 116, 38, 7, roof);
    fill(left + 10, 112, 28, 5, roof);
    fill(left + 15, 109, 18, 4, roof);
    fill(left + 1, 122, 46, 2, '#d1bb91');
    fill(left + 17, 141, 15, 25, '#6e5167');
    fill(left + 20, 143, 9, 23, '#986d6a');
    fill(left + 7, 139, 7, 8, '#83ad8b');
    fill(left + 35, 139, 7, 8, '#83ad8b');
    fill(left + 23, 148, 2, 2, '#f8d594');
  }

  function drawMatcha(x, y, camera, tick) {
    const left = Math.round(x - camera - 7);
    const top = Math.round(y - 8 + Math.sin((tick + x * 3) * 0.075) * 1.4);

    fill(left + 1, top, 2, 2, '#fff3bd');
    fill(left + 2, top - 1, 1, 4, '#fff3bd');
    fill(left + 3, top + 2, 9, 1, '#695967');
    fill(left + 2, top + 3, 11, 3, '#6e9251');
    fill(left + 3, top + 3, 9, 3, '#a8ca75');
    fill(left + 4, top + 3, 3, 1, '#d7e9a0');
    fill(left + 8, top + 4, 3, 1, '#65874b');
    fill(left + 5, top + 5, 5, 1, '#c9dc91');
    fill(left + 2, top + 6, 11, 1, '#6a5765');
    fill(left + 3, top + 6, 9, 1, '#fdf1dc');
    fill(left + 3, top + 7, 9, 3, '#e8d5bd');
    fill(left + 4, top + 7, 2, 3, '#fff8e9');
    fill(left + 10, top + 7, 2, 3, '#c5ac9e');
    fill(left + 4, top + 10, 7, 1, '#6a5765');
    fill(left + 5, top + 10, 5, 1, '#e8d5bd');
    fill(left + 12, top + 6, 2, 1, '#6a5765');
    fill(left + 13, top + 7, 2, 3, '#6a5765');
    fill(left + 12, top + 9, 2, 1, '#fdf1dc');
    fill(left + 3, top + 11, 9, 1, '#6a5765');
    fill(left + 5, top + 11, 5, 1, '#f7e6ca');
  }

  function drawSpikes(x, y, width, camera) {
    fill(x - camera, y + 6, width, 2, '#66475d');
    for (let offset = 0; offset < width - 2; offset += 5) {
      fill(x - camera + offset + 2, y, 2, 2, '#fce1d5');
      fill(x - camera + offset + 1, y + 2, 4, 4, '#e88296');
    }
  }

  function drawCrumble(trap, camera) {
    if (trap.state === 'collapsed') return;
    const x = Math.round(trap.x - camera);
    const warning = trap.state === 'cracking' && game.tick % 6 < 3;
    fill(x, GROUND_Y, trap.width, 3, warning ? '#f4bd82' : '#9ecb7a');
    for (let offset = 4; offset < trap.width - 2; offset += 8) {
      fill(x + offset, GROUND_Y + 3, 2, 5, '#6c5660');
      fill(x + offset + 2, GROUND_Y + 7, 3, 2, '#6c5660');
    }
  }

  function drawPopSpike(trap, camera) {
    if (trap.state === 'spent') return;
    if (trap.state === 'active') {
      drawSpikes(trap.x, GROUND_Y - 11, trap.width, camera);
      return;
    }
    const color = trap.state === 'warning' && game.tick % 6 < 3 ? '#ffe7b5' : '#b96d8b';
    fill(trap.x - camera, GROUND_Y - 2, trap.width, 2, color);
    fill(trap.x - camera + 3, GROUND_Y - 4, 3, 2, color);
  }

  function drawFallingBlock(trap, camera) {
    if (trap.state !== 'falling' && trap.state !== 'landed') return;
    const x = Math.round(trap.x - camera);
    const y = Math.round(trap.y);
    fill(x, trap.landingY + 15, 16, 2, '#51465d');
    fill(x, y, 16, 16, '#473f59');
    fill(x + 2, y + 2, 12, 11, '#979bb0');
    fill(x + 2, y + 2, 12, 2, '#d5cfcb');
    fill(x + 6, y + 4, 4, 5, '#51465d');
    fill(x + 7, y + 10, 2, 2, '#51465d');
  }

  function drawFakeMatcha(trap, camera) {
    if (trap.used) return;
    drawMatcha(trap.x, trap.y, camera, game.tick);
    const x = Math.round(trap.x - camera - 7);
    const y = Math.round(trap.y - 8 + Math.sin((game.tick + trap.x * 3) * 0.075) * 1.4);
    fill(x + 5, y + 7, 2, 2, '#a4559d');
    fill(x + 9, y + 7, 2, 2, '#a4559d');
    fill(x + 7, y + 10, 2, 1, '#a4559d');
    fill(x + 12, y + 1, 2, 2, '#dc91d2');
  }

  function drawEnemy(enemy, camera, character) {
    const x = Math.round(enemy.x - camera);
    const y = GROUND_Y - 20 + Math.round(Math.sin(game.tick * 0.12 + enemy.x) * 0.6);
    if (character === 'barao') {
      fill(x + 4, y, 8, 2, '#234771');
      fill(x + 5, y - 2, 6, 2, '#729bc3');
      fill(x + 2, y + 2, 12, 17, '#405478');
      fill(x + 3, y + 3, 10, 15, '#f4f1e9');
      fill(x + 4, y + 4, 8, 2, '#c6d7df');
      fill(x + 4, y + 8, 8, 7, '#d9e2e2');
      fill(x + 7, y + 6, 3, 2, '#d4ad5e');
      drawTinyText('DOVE', x, y + 9, '#315b83');
      fill(x + 2, y + 18, 4, 2, '#3b4a65');
      fill(x + 10, y + 18, 4, 2, '#3b4a65');
    } else {
      fill(x + 4, y, 8, 3, '#453647');
      fill(x + 3, y + 2, 10, 6, '#6d4d52');
      fill(x + 4, y + 4, 8, 5, '#e6ae8f');
      fill(x + 5, y + 6, 2, 1, '#363543');
      fill(x + 10, y + 6, 2, 1, '#363543');
      fill(x + 3, y + 9, 10, 9, '#f6f3e9');
      fill(x + 5, y + 10, 6, 8, '#78b8a6');
      fill(x + 7, y + 9, 2, 8, '#f6f3e9');
      fill(x + 2, y + 11, 2, 5, '#f6f3e9');
      fill(x + 12, y + 11, 2, 5, '#f6f3e9');
      fill(x + 10, y + 11, 2, 2, '#e98893');
      fill(x + 4, y + 18, 4, 2, '#424460');
      fill(x + 9, y + 18, 4, 2, '#424460');
    }
  }

  function drawFlag(x, camera, tick) {
    const left = Math.round(x - camera);
    fill(left - 2, GROUND_Y - 53, 7, 4, '#493b53');
    fill(left, GROUND_Y - 50, 3, 50, '#493b53');
    fill(left + 1, GROUND_Y - 49, 1, 45, '#e5d1a7');
    fill(left + 3, GROUND_Y - 47, 20, 14, '#493b53');
    fill(left + 4, GROUND_Y - 46, 18, 11, '#67b56b');
    fill(left + 21 + Math.round(Math.sin(tick * 0.08)), GROUND_Y - 44, 5, 8, '#67b56b');
    fill(left + 8, GROUND_Y - 43, 10, 4, '#bde48a');
    fill(left + 10, GROUND_Y - 39, 6, 2, '#f5e6ae');
    fill(left - 5, GROUND_Y - 4, 13, 4, '#493b53');
  }

  function drawCat(x, y, character, facing = 1, frame = 0, target = context) {
    const outline = '#383140';
    const main = character === 'haru' ? '#3d3a47' : '#e68c4c';
    const shade = character === 'haru' ? '#252632' : '#b8653d';
    const light = character === 'haru' ? '#656274' : '#ffc17f';
    const white = '#fff3de';
    const collar = character === 'haru' ? '#f08ba8' : '#d94d56';
    const left = Math.round(x);
    const top = Math.round(y);
    const pixel = (px, py, w, h, color) => {
      target.fillStyle = color;
      target.fillRect(left + (facing === 1 ? px : 15 - px - w), top + py, w, h);
    };

    const legOffset = frame === 1 ? 1 : frame === 2 ? 2 : 0;
    pixel(12, frame === 2 ? 7 : 9, 3, 2, outline);
    pixel(13, frame === 2 ? 5 : 7, 2, 4, main);
    pixel(3, 0, 3, 5, outline);
    pixel(10, 0, 3, 5, outline);
    pixel(4, 1, 1, 2, character === 'haru' ? '#c785a4' : '#e8a281');
    pixel(11, 1, 1, 2, '#e8a281');
    pixel(2, 3, 12, 9, outline);
    pixel(3, 4, 10, 7, main);
    pixel(4, 4, 8, 1, light);
    pixel(4, 7, 8, 4, white);
    pixel(1, 10, 13, 5, outline);
    pixel(2, 10, 11, 4, main);
    pixel(5, 11, 6, 3, white);
    pixel(3, 14 - legOffset, 3, 2, white);
    pixel(10, frame === 2 ? 12 : 14, 3, 2, white);
    if (character === 'haru') {
      pixel(3, 4, 3, 3, shade);
      pixel(10, 4, 3, 3, shade);
      pixel(7, 4, 3, 3, white);
      pixel(3, 5, 2, 1, light);
      pixel(10, 5, 2, 1, light);
      pixel(3, 11, 2, 2, shade);
      pixel(11, 11, 2, 2, light);
    } else {
      pixel(5, 4, 2, 1, shade);
      pixel(9, 4, 2, 1, shade);
      pixel(3, 6, 2, 1, shade);
      pixel(11, 6, 2, 1, shade);
      pixel(3, 11, 2, 2, shade);
      pixel(11, 11, 2, 2, shade);
      pixel(4, 5, 2, 1, light);
      pixel(10, 5, 2, 1, light);
      pixel(5, 11, 1, 2, light);
      pixel(10, 11, 1, 2, light);
    }
    pixel(3, 9, 10, 2, collar);
    pixel(7, 10, 2, 2, '#f7d68f');
    pixel(5, 6, 2, 2, outline);
    pixel(10, 6, 2, 2, outline);
    pixel(5, 6, 1, 1, '#fffdf2');
    pixel(10, 6, 1, 1, '#fffdf2');
    pixel(8, 8, 2, 1, '#dc8192');
    pixel(1, 8, 2, 1, '#d6b5ae');
    pixel(12, 8, 2, 1, '#d6b5ae');
  }

  function drawDecorations(level, camera) {
    const solidGround = getSolidGroundSegments(level);
    for (let x = 32; x < level.width; x += 71) {
      const onGround = solidGround.some(([start, end]) => x > start + 8 && x < end - 8);
      if (!onGround) continue;
      const screenX = x - camera;
      if (screenX < -10 || screenX > WIDTH + 10) continue;
      const flower = level.theme === 'night' ? '#d4bbdf' : level.theme === 'sunset' ? '#ffdfb2' : '#f7c8ce';
      const leaf = level.theme === 'night' ? '#8cbbac' : '#4fa771';
      fill(screenX + 2, GROUND_Y - 10, 1, 10, leaf);
      fill(screenX, GROUND_Y - 5, 3, 2, leaf);
      fill(screenX + 3, GROUND_Y - 7, 3, 2, leaf);
      fill(screenX, GROUND_Y - 13, 5, 5, flower);
      fill(screenX + 2, GROUND_Y - 15, 1, 9, flower);
      fill(screenX + 2, GROUND_Y - 11, 1, 1, '#ffe2a7');

      if (Math.floor(x / 71) % 3 === 0) {
        fill(screenX + 14, GROUND_Y - 8, 20, 8, '#3b765d');
        fill(screenX + 17, GROUND_Y - 11, 14, 7, '#62ad70');
        fill(screenX + 20, GROUND_Y - 12, 8, 4, '#9fd47f');
        fill(screenX + 23, GROUND_Y - 8, 2, 2, '#d7e995');
      }
    }
  }

  function render() {
    context.clearRect(0, 0, WIDTH, HEIGHT);

    if (game.mode === 'menu') {
      drawBackground('garden', game.tick * 0.23);
      drawTeaHouse(238, 0, 'garden');
      drawGround(0, WIDTH, 0, 'garden');
      drawPlatform(78, 131, 57, 0, 'garden');
      drawPlatform(206, 121, 50, 0, 'garden');
      drawBonusBlock({ x: 169, y: 121, used: false, bump: 0 }, 0, game.tick);
      drawMatcha(106, 119, 0, game.tick);
      drawMatcha(233, 109, 0, game.tick);
      drawCat(31, 150, 'haru', 1, game.tick % 20 < 10 ? 0 : 1);
      drawCat(273, 150, 'barao', -1, game.tick % 20 < 10 ? 1 : 0);
      return;
    }

    const level = game.level;
    const camera = Math.round(game.camera);
    drawBackground(level.theme, camera);
    drawTeaHouse(level.width - 105, camera, level.theme);
    for (const [start, end] of getSolidGroundSegments(level)) drawGround(start, end, camera, level.theme);
    for (const [x, y, width] of level.platforms) drawPlatform(x, y, width, camera, level.theme);
    for (const block of game.blocks) drawBonusBlock(block, camera, game.tick);
    drawDecorations(level, camera);
    for (const [x, y, width] of level.spikes) drawSpikes(x, y, width, camera);
    for (const trap of game.traps.crumbles) drawCrumble(trap, camera);
    for (const trap of game.traps.popSpikes) drawPopSpike(trap, camera);
    for (const trap of game.traps.fallingBlocks) drawFallingBlock(trap, camera);
    for (const enemy of game.enemies) {
      if (!enemy.defeated) drawEnemy(enemy, camera, game.character);
    }
    for (let index = 0; index < level.matchas.length; index += 1) {
      if (!game.collected[index]) drawMatcha(...level.matchas[index], camera, game.tick);
    }
    for (const trap of game.traps.fakeMatchas) drawFakeMatcha(trap, camera);
    drawGate(level.gateX, camera, game.puzzleSolved);
    drawFlag(level.width - 28, camera, game.tick);

    for (const particle of game.particles) fill(particle.x - camera, particle.y, 2, 2, particle.color);

    const player = game.player;
    if (player && (player.invincible === 0 || game.tick % 8 < 4)) {
      const walking = Math.abs(player.vx) > 0.4 && player.grounded && game.tick % 12 < 6;
      const frame = player.grounded ? (walking ? 1 : 0) : 2;
      drawCat(player.x - camera, player.y, game.character, player.facing, frame);
    }
  }

  function loop(timestamp) {
    const elapsed = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;
    accumulatedTime += elapsed;
    while (accumulatedTime >= 1000 / 60) {
      update();
      accumulatedTime -= 1000 / 60;
    }
    render();
    window.requestAnimationFrame(loop);
  }

  function drawPreviews() {
    document.querySelectorAll('.character-preview').forEach((preview) => {
      const previewContext = preview.getContext('2d');
      previewContext.imageSmoothingEnabled = false;
      previewContext.fillStyle = preview.dataset.preview === 'haru' ? '#f5d8df' : '#f9dfbd';
      previewContext.fillRect(0, 0, 48, 48);
      previewContext.save();
      previewContext.scale(2, 2);
      drawCat(4, 3, preview.dataset.preview, 1, 0, previewContext);
      previewContext.restore();
    });
  }

  document.querySelectorAll('.character-card').forEach((card) => {
    card.addEventListener('click', () => selectCharacter(card.dataset.character));
  });
  elements.start.addEventListener('click', startGame);
  elements.pause.addEventListener('click', pauseGame);
  elements.puzzlePrompt.addEventListener('click', openPuzzle);
  elements.challengeClose.addEventListener('click', closePuzzle);
  elements.modalPrimary.addEventListener('click', () => modalPrimaryAction());
  elements.modalSecondary.addEventListener('click', () => modalSecondaryAction());
  elements.sound.addEventListener('click', () => {
    game.muted = !game.muted;
    elements.sound.textContent = game.muted ? '♪̸' : '♫';
    elements.sound.setAttribute('aria-label', game.muted ? 'Ativar som' : 'Desativar som');
    if (!game.muted) playSound(540, 0.07);
  });

  const keyToControl = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  };
  const pressedKeys = new Set();

  window.addEventListener('keydown', (event) => {
    if (game.mode === 'puzzle') {
      if (event.code === 'Escape' || event.code === 'KeyP') {
        event.preventDefault();
        if (!event.repeat) closePuzzle();
      } else if (game.challengeState.type === 'rhythm' && game.challengeState.playing && (event.code === 'Space' || event.code === 'KeyE')) {
        event.preventDefault();
        if (!event.repeat) tapRhythm();
      }
      return;
    }
    if (event.code === 'KeyE' && game.mode === 'playing' && isNearPuzzle()) {
      event.preventDefault();
      if (!event.repeat) openPuzzle();
      return;
    }
    if (keyToControl[event.code] || event.code === 'KeyP' || event.code === 'Escape') event.preventDefault();
    if (event.code === 'KeyP' || event.code === 'Escape') {
      if (!event.repeat) pauseGame();
      return;
    }
    if (!keyToControl[event.code]) return;
    pressedKeys.add(event.code);
    game.input[keyToControl[event.code]] = true;
  });

  window.addEventListener('keyup', (event) => {
    const control = keyToControl[event.code];
    if (!control) return;
    pressedKeys.delete(event.code);
    game.input[control] = [...pressedKeys].some((code) => keyToControl[code] === control);
  });

  window.addEventListener('blur', () => {
    pressedKeys.clear();
    game.input.left = false;
    game.input.right = false;
    game.input.jump = false;
  });

  document.querySelectorAll('[data-control]').forEach((button) => {
    const control = button.dataset.control;
    const release = (event) => {
      event.preventDefault();
      game.input[control] = false;
      button.classList.remove('pressed');
    };
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if (game.mode === 'puzzle') {
        if (control === 'jump') tapRhythm();
        return;
      }
      button.setPointerCapture(event.pointerId);
      game.input[control] = true;
      button.classList.add('pressed');
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });

  drawPreviews();
  updateHud();
  window.requestAnimationFrame(loop);
})();
