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
      bonusBlocks: [[43, 121], [535, 120], [1063, 121]],
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
      bonusBlocks: [[53, 121], [570, 120], [1108, 121]],
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
    blocks: [],
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
    game.blocks = game.level.bonusBlocks.map(([x, y]) => ({ x, y, used: false, bump: 0 }));
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

  function awardMatcha(x, y) {
    game.levelScore += 1;
    spawnParticles(x, y, '#e5f79d', 9);
    playSound(680 + game.levelScore * 25, 0.1);
    updateHud();
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
      ...level.ground.map(([start, end]) => ({ x: start, w: end - start, y: GROUND_Y })),
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
      if (overlaps({ x: player.x + 2, y: player.y + 2, w: 10, h: 12 }, { x: enemy.x, y: GROUND_Y - 10, w: 12, h: 10 })) {
        if (fallingBeforeLanding && previousBottom <= GROUND_Y - 6) {
          enemy.defeated = true;
          player.y = GROUND_Y - 10 - PLAYER_HEIGHT;
          player.vy = -3.8;
          player.grounded = false;
          game.coyoteFrames = 0;
          spawnParticles(enemy.x + 6, GROUND_Y - 6, '#ffe3a8', 10);
          playSound(470, 0.1);
        } else {
          damagePlayer();
          if (game.mode !== 'playing') return;
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
    };
    const colors = palettes[theme];
    fill(0, 0, WIDTH, 72, colors.sky);
    fill(0, 72, WIDTH, 57, colors.high);
    fill(0, 129, WIDTH, 63, colors.low);
    fill(0, 71, WIDTH, 2, theme === 'night' ? '#4b538b' : '#bce7dc');

    const orbX = Math.round(251 - camera * 0.035);
    if (theme === 'night') {
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
    const palette = {
      garden: { edge: '#503e56', cap: '#438d54', grass: '#69c35c', shine: '#b0e67a', soil: '#bd875b', light: '#e0aa70', shadow: '#875b53' },
      sunset: { edge: '#5e4969', cap: '#c76e77', grass: '#efaa75', shine: '#ffd193', soil: '#ad6871', light: '#d5897a', shadow: '#79536a' },
      night: { edge: '#34365b', cap: '#62699a', grass: '#91b89a', shine: '#c4d4aa', soil: '#686899', light: '#9290b6', shadow: '#484a78' },
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

  function drawTeaHouse(x, camera, theme) {
    const left = Math.round(x - camera);
    const roof = theme === 'night' ? '#564a82' : theme === 'sunset' ? '#a85e79' : '#4d9f71';
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

  function drawEnemy(enemy, camera, theme) {
    const x = Math.round(enemy.x - camera);
    const y = GROUND_Y - 10 + Math.round(Math.sin(game.tick * 0.12 + enemy.x) * 0.6);
    const body = theme === 'night' ? '#a99bd0' : theme === 'sunset' ? '#f2a2ad' : '#d1a5cd';
    const light = theme === 'night' ? '#d0c4e6' : '#f5cada';
    fill(x + 3, y, 6, 2, '#574764');
    fill(x + 1, y + 2, 10, 3, '#574764');
    fill(x, y + 5, 12, 4, '#574764');
    fill(x + 2, y + 2, 8, 2, light);
    fill(x + 1, y + 4, 10, 4, body);
    fill(x + 2, y + 8, 3, 2, '#574764');
    fill(x + 8, y + 8, 3, 2, '#574764');
    fill(x + 3, y + 5, 2, 2, '#342c43');
    fill(x + 8, y + 5, 2, 2, '#342c43');
    fill(x + 5, y + 7, 2, 1, '#a56f9e');
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
    for (let x = 32; x < level.width; x += 71) {
      const onGround = level.ground.some(([start, end]) => x > start + 8 && x < end - 8);
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
    for (const [start, end] of level.ground) drawGround(start, end, camera, level.theme);
    for (const [x, y, width] of level.platforms) drawPlatform(x, y, width, camera, level.theme);
    for (const block of game.blocks) drawBonusBlock(block, camera, game.tick);
    drawDecorations(level, camera);
    for (const [x, y, width] of level.spikes) drawSpikes(x, y, width, camera);
    for (const enemy of game.enemies) {
      if (!enemy.defeated) drawEnemy(enemy, camera, level.theme);
    }
    for (let index = 0; index < level.matchas.length; index += 1) {
      if (!game.collected[index]) drawMatcha(...level.matchas[index], camera, game.tick);
    }
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
