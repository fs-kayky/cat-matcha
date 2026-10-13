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
    stage: document.querySelector('#stage-display'),
  };

  const levels = [
    {
      name: 'JARDIM DO CHÁ',
      theme: 'garden',
      width: 1160,
      ground: [[0, 260], [290, 540], [570, 830], [860, 1160]],
      platforms: [[115, 132, 58], [185, 112, 45], [340, 133, 56], [440, 112, 60], [635, 128, 72], [752, 110, 55], [930, 128, 65]],
      matchas: [[85, 153], [143, 120], [207, 100], [370, 121], [470, 100], [668, 116], [779, 98], [963, 116], [1066, 153]],
      spikes: [[405, 158, 13], [723, 158, 14]],
      enemies: [[321, 306, 384, 0.48], [898, 885, 976, 0.55]],
      checkpoints: [300, 600, 875],
    },
    {
      name: 'TELHADOS ROSADOS',
      theme: 'sunset',
      width: 1280,
      ground: [[0, 215], [255, 475], [518, 750], [790, 1005], [1046, 1280]],
      platforms: [[112, 129, 61], [300, 128, 68], [416, 112, 48], [559, 131, 69], [677, 113, 62], [835, 128, 73], [950, 112, 53], [1100, 127, 65]],
      matchas: [[78, 153], [140, 117], [328, 116], [439, 100], [586, 119], [705, 101], [863, 116], [976, 100], [1127, 115], [1210, 153]],
      spikes: [[377, 158, 14], [631, 158, 16], [917, 158, 15]],
      enemies: [[285, 270, 354, 0.58], [812, 801, 894, 0.66], [1090, 1070, 1170, 0.54]],
      checkpoints: [270, 535, 805, 1060],
    },
    {
      name: 'NOITE DAS ESTRELAS',
      theme: 'night',
      width: 1400,
      ground: [[0, 215], [263, 490], [537, 760], [808, 1030], [1080, 1400]],
      platforms: [[121, 128, 65], [310, 126, 65], [424, 112, 48], [590, 129, 69], [704, 112, 54], [856, 127, 68], [965, 112, 53], [1133, 126, 66], [1250, 112, 57]],
      matchas: [[92, 153], [151, 116], [338, 114], [448, 100], [620, 117], [729, 100], [881, 115], [991, 100], [1160, 114], [1278, 100], [1340, 153]],
      spikes: [[384, 158, 15], [655, 158, 15], [939, 158, 16], [1213, 158, 14]],
      enemies: [[288, 275, 362, 0.65], [558, 549, 635, 0.58], [823, 816, 913, 0.72], [1096, 1087, 1183, 0.68]],
      checkpoints: [276, 550, 820, 1092],
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
    elements.level.textContent = game.mode === 'menu' ? '— / 3' : `${game.levelIndex + 1} / 3`;
    elements.matchas.textContent = String(game.bankedScore + game.levelScore).padStart(2, '0');
    elements.lives.textContent = Array.from({ length: 3 }, (_, index) => index < game.lives ? '♥' : '♡').join(' ');
    elements.lives.setAttribute('aria-label', `${game.lives} ${game.lives === 1 ? 'vida' : 'vidas'}`);
    elements.stage.textContent = game.mode === 'menu' ? 'ESCOLHA SEU GATO' : game.level.name;
    elements.pause.disabled = game.mode === 'menu' || game.mode === 'gameover' || game.mode === 'victory';
    elements.pause.textContent = game.mode === 'paused' ? '▶' : 'Ⅱ';
    elements.pause.setAttribute('aria-label', game.mode === 'paused' ? 'Continuar jogo' : 'Pausar jogo');
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
    game.enemies = game.level.enemies.map(([x, min, max, speed]) => ({ x, min, max, speed, direction: 1 }));
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
    elements.modal.classList.add('hidden');
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
        eyebrow: 'AVENTURA COMPLETA ✦',
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
      eyebrow: `FASE ${game.levelIndex + 1} DE 3 CONCLUÍDA`,
      title: 'BOA, GATINHO!',
      message: 'A bandeira foi alcançada. Tem mais matcha pela frente!',
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

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function update() {
    game.tick += 1;
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
    const previousBottom = player.y + PLAYER_HEIGHT;
    player.vy = Math.min(player.vy + 0.27, 6.4);
    player.y += player.vy;
    player.grounded = false;

    const surfaces = [
      ...level.ground.map(([start, end]) => ({ x: start, w: end - start, y: GROUND_Y })),
      ...level.platforms.map(([x, y, w]) => ({ x, y, w })),
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

    for (let index = 0; index < level.matchas.length; index += 1) {
      if (game.collected[index]) continue;
      const [x, y] = level.matchas[index];
      if (overlaps({ x: player.x, y: player.y, w: PLAYER_WIDTH, h: PLAYER_HEIGHT }, { x: x - 7, y: y - 8, w: 15, h: 13 })) {
        game.collected[index] = true;
        game.levelScore += 1;
        spawnParticles(x, y, '#dcf3a3', 7);
        playSound(680 + game.levelScore * 25, 0.1);
        updateHud();
      }
    }

    for (const enemy of game.enemies) {
      enemy.x += enemy.speed * enemy.direction;
      if (enemy.x < enemy.min || enemy.x > enemy.max) enemy.direction *= -1;
      if (overlaps({ x: player.x + 2, y: player.y + 2, w: 10, h: 12 }, { x: enemy.x, y: GROUND_Y - 10, w: 12, h: 10 })) {
        damagePlayer();
        if (game.mode !== 'playing') return;
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

  function drawCloud(x, y, color) {
    fill(x + 5, y, 22, 5, color);
    fill(x, y + 5, 35, 7, color);
    fill(x + 7, y + 12, 23, 3, color);
  }

  function drawBackground(theme, camera) {
    const palettes = {
      garden: { sky: '#bedfda', high: '#d8eee1', low: '#f7e5ce', hill: '#9cc7ad', back: '#73ac92', cloud: '#fff8e9' },
      sunset: { sky: '#e7a6ae', high: '#f6c6ae', low: '#ffe5bc', hill: '#b98cad', back: '#8d729a', cloud: '#ffe9d4' },
      night: { sky: '#555278', high: '#777098', low: '#aa8da8', hill: '#514a79', back: '#393c65', cloud: '#b0a4c0' },
    };
    const colors = palettes[theme];
    fill(0, 0, WIDTH, 78, colors.sky);
    fill(0, 78, WIDTH, 54, colors.high);
    fill(0, 132, WIDTH, 60, colors.low);

    const orbX = Math.round(251 - camera * 0.035);
    if (theme === 'night') {
      fill(orbX, 20, 27, 27, '#f8eccd');
      fill(orbX + 19, 18, 10, 20, colors.sky);
      for (let index = 0; index < 22; index += 1) {
        const x = (index * 83 + 18 - camera * 0.08) % 380;
        const y = 10 + (index * 37) % 70;
        fill(x < 0 ? x + 380 : x, y, index % 4 === 0 ? 2 : 1, 2, '#fbe5cf');
      }
    } else {
      fill(orbX, 25, 26, 26, theme === 'garden' ? '#fff3bc' : '#ffe3a4');
      fill(orbX + 3, 22, 20, 3, theme === 'garden' ? '#fff3bc' : '#ffe3a4');
    }

    for (let index = 0; index < 7; index += 1) {
      const x = index * 78 - ((camera * 0.18) % 78) - 25;
      drawCloud(x, 23 + (index % 3) * 15, colors.cloud);
    }

    for (let index = 0; index < 9; index += 1) {
      const x = index * 58 - ((camera * 0.32) % 58) - 25;
      fill(x + 10, 103 - (index % 3) * 6, 36, 47, colors.hill);
      fill(x, 114 - (index % 3) * 6, 58, 38, colors.hill);
    }
    for (let index = 0; index < 10; index += 1) {
      const x = index * 46 - ((camera * 0.5) % 46) - 15;
      fill(x + 5, 134 - (index % 3) * 6, 34, 30, colors.back);
      fill(x, 145 - (index % 3) * 6, 46, 25, colors.back);
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
    } else {
      for (let index = 0; index < 8; index += 1) {
        const x = index * 66 - ((camera * 0.66) % 66);
        fill(x + 8, 122, 35, 44, '#333654');
        fill(x + 3, 119, 45, 5, '#2b304e');
        fill(x + 13, 134, 5, 7, '#eac59f');
        fill(x + 32, 134, 5, 7, '#eac59f');
      }
    }
  }

  function drawGround(start, end, camera, theme) {
    const x = start - camera;
    const width = end - start;
    const dark = theme === 'night' ? '#403d62' : theme === 'sunset' ? '#876579' : '#927b69';
    const dirt = theme === 'night' ? '#555276' : theme === 'sunset' ? '#aa7d81' : '#b99472';
    const grass = theme === 'night' ? '#a9a0cb' : theme === 'sunset' ? '#efb18d' : '#92be85';
    fill(x, GROUND_Y, width, HEIGHT - GROUND_Y, dark);
    fill(x, GROUND_Y, width, 5, grass);
    fill(x, GROUND_Y + 5, width, 4, dirt);
    for (let tile = Math.ceil(start / 16) * 16; tile < end; tile += 16) {
      fill(tile - camera + 4, GROUND_Y + 11, 4, 2, dirt);
      fill(tile - camera + 11, GROUND_Y + 19, 3, 2, dirt);
      fill(tile - camera, GROUND_Y + 5, 1, HEIGHT - GROUND_Y, '#51445c33');
    }
  }

  function drawPlatform(x, y, width, camera, theme) {
    const left = x - camera;
    fill(left, y, width, 9, '#44384c');
    fill(left + 1, y + 1, width - 2, 3, theme === 'night' ? '#b5a7d3' : theme === 'sunset' ? '#f0b69f' : '#a7d58f');
    fill(left + 2, y + 4, width - 4, 3, theme === 'night' ? '#6e648e' : theme === 'sunset' ? '#bb8590' : '#a88d79');
    for (let tile = 10; tile < width; tile += 17) fill(left + tile, y + 5, 2, 3, '#4a3b52');
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

  function drawEnemy(enemy, camera) {
    const x = Math.round(enemy.x - camera);
    const y = GROUND_Y - 10 + Math.round(Math.sin(game.tick * 0.12 + enemy.x) * 0.8);
    fill(x + 2, y, 8, 2, '#66516a');
    fill(x, y + 2, 12, 7, '#66516a');
    fill(x + 1, y + 2, 10, 5, '#cba2be');
    fill(x + 3, y + 4, 2, 2, '#382e45');
    fill(x + 8, y + 4, 2, 2, '#382e45');
    fill(x + 5, y + 7, 2, 1, '#9b6c92');
  }

  function drawFlag(x, camera, tick) {
    const left = Math.round(x - camera);
    fill(left, GROUND_Y - 39, 3, 39, '#493b53');
    fill(left + 3, GROUND_Y - 36, 19, 13, '#f2c8aa');
    fill(left + 3, GROUND_Y - 36, 18, 10, '#f7dba7');
    fill(left + 18 + Math.round(Math.sin(tick * 0.08)), GROUND_Y - 34, 5, 7, '#f7dba7');
    fill(left + 8, GROUND_Y - 33, 2, 2, '#ad7a91');
    fill(left + 14, GROUND_Y - 33, 2, 2, '#ad7a91');
    fill(left + 10, GROUND_Y - 29, 4, 1, '#ad7a91');
    fill(left - 4, GROUND_Y - 3, 10, 3, '#493b53');
  }

  function drawCat(x, y, character, facing = 1, frame = 0, target = context) {
    const outline = '#383140';
    const main = character === 'haru' ? '#3d3a47' : '#e68c4c';
    const shade = character === 'haru' ? '#252632' : '#b8653d';
    const white = '#fff3de';
    const collar = character === 'haru' ? '#f08ba8' : '#d94d56';
    const left = Math.round(x);
    const top = Math.round(y);
    const pixel = (px, py, w, h, color) => {
      target.fillStyle = color;
      target.fillRect(left + (facing === 1 ? px : 15 - px - w), top + py, w, h);
    };

    const legOffset = frame ? 1 : 0;
    pixel(12, 9, 3, 2, outline);
    pixel(13, 7, 2, 3, main);
    pixel(3, 0, 3, 5, outline);
    pixel(10, 0, 3, 5, outline);
    pixel(4, 1, 1, 2, character === 'haru' ? '#c785a4' : '#e8a281');
    pixel(11, 1, 1, 2, '#e8a281');
    pixel(2, 3, 12, 9, outline);
    pixel(3, 4, 10, 7, main);
    pixel(4, 7, 8, 4, white);
    pixel(1, 10, 13, 5, outline);
    pixel(2, 10, 11, 4, main);
    pixel(5, 11, 6, 3, white);
    pixel(3, 14 - legOffset, 3, 2 + legOffset, white);
    pixel(10, 14, 3, 2, white);
    if (character === 'haru') {
      pixel(3, 4, 3, 3, shade);
      pixel(10, 4, 3, 3, shade);
      pixel(7, 4, 3, 3, white);
    } else {
      pixel(5, 4, 2, 1, shade);
      pixel(9, 4, 2, 1, shade);
      pixel(3, 6, 2, 1, shade);
      pixel(11, 6, 2, 1, shade);
      pixel(3, 11, 2, 2, shade);
      pixel(11, 11, 2, 2, shade);
    }
    pixel(3, 9, 10, 2, collar);
    pixel(7, 10, 2, 2, '#f7d68f');
    pixel(5, 6, 2, 2, outline);
    pixel(10, 6, 2, 2, outline);
    pixel(8, 8, 2, 1, '#dc8192');
  }

  function drawDecorations(level, camera) {
    for (let x = 32; x < level.width; x += 71) {
      const onGround = level.ground.some(([start, end]) => x > start + 8 && x < end - 8);
      if (!onGround) continue;
      const screenX = x - camera;
      if (screenX < -10 || screenX > WIDTH + 10) continue;
      const flower = level.theme === 'night' ? '#d4bbdf' : level.theme === 'sunset' ? '#ffdfb2' : '#f7c8ce';
      fill(screenX + 2, GROUND_Y - 9, 1, 9, '#648875');
      fill(screenX, GROUND_Y - 12, 5, 5, flower);
      fill(screenX + 2, GROUND_Y - 10, 1, 1, '#f9edac');
    }
  }

  function render() {
    context.clearRect(0, 0, WIDTH, HEIGHT);

    if (game.mode === 'menu') {
      drawBackground('garden', game.tick * 0.23);
      drawGround(0, WIDTH, 0, 'garden');
      drawPlatform(78, 131, 57, 0, 'garden');
      drawPlatform(206, 121, 50, 0, 'garden');
      drawMatcha(106, 119, 0, game.tick);
      drawMatcha(233, 109, 0, game.tick);
      drawCat(31, 150, 'haru', 1, game.tick % 20 < 10 ? 0 : 1);
      drawCat(273, 150, 'barao', -1, game.tick % 20 < 10 ? 1 : 0);
      return;
    }

    const level = game.level;
    const camera = Math.round(game.camera);
    drawBackground(level.theme, camera);
    for (const [start, end] of level.ground) drawGround(start, end, camera, level.theme);
    for (const [x, y, width] of level.platforms) drawPlatform(x, y, width, camera, level.theme);
    drawDecorations(level, camera);
    for (const [x, y, width] of level.spikes) drawSpikes(x, y, width, camera);
    for (const enemy of game.enemies) drawEnemy(enemy, camera);
    for (let index = 0; index < level.matchas.length; index += 1) {
      if (!game.collected[index]) drawMatcha(...level.matchas[index], camera, game.tick);
    }
    drawFlag(level.width - 28, camera, game.tick);

    for (const particle of game.particles) fill(particle.x - camera, particle.y, 2, 2, particle.color);

    const player = game.player;
    if (player && (player.invincible === 0 || game.tick % 8 < 4)) {
      const walking = Math.abs(player.vx) > 0.4 && player.grounded && game.tick % 12 < 6;
      drawCat(player.x - camera, player.y, game.character, player.facing, walking ? 1 : 0);
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
