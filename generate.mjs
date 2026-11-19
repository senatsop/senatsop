import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(ROOT, 'assets');
const PROFILE_PATH = join(ROOT, 'profile.json');

const THEMES = {
  dark: {
    bgTop: '#040712',
    bgMid: '#0A1124',
    bgBot: '#0F172A',
    border: 'rgba(148,163,184,0.22)',
    auroraA: '#38BDF8',
    auroraB: '#818CF8',
    auroraC: '#2DD4BF',
    sunCore: '#E0F2FE',
    sunGlow: '#38BDF8',
    star: '#E2E8F0',
    grid: 'rgba(56,189,248,0.18)',
    ridgeFar: '#101B36',
    ridgeFarStroke: 'rgba(129,140,248,0.32)',
    ridgeMid: '#0C162E',
    ridgeMidStroke: 'rgba(56,189,248,0.44)',
    ridgeNear: '#070E20',
    ridgeNearStroke: 'rgba(45,212,191,0.52)',
    cardFill: 'rgba(10,17,36,0.78)',
    cardStroke: 'rgba(148,163,184,0.24)',
    cardHighlight: 'rgba(255,255,255,0.16)',
    pillFill: 'rgba(45,212,191,0.12)',
    pillStroke: 'rgba(45,212,191,0.42)',
    pillText: '#5EEAD4',
    titleGradA: '#FFFFFF',
    titleGradB: '#BAE6FD',
    titleGradC: '#C7D2FE',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#38BDF8',
    accentAlt: '#818CF8',
    accentMint: '#2DD4BF',
    accentViolet: '#C084FC',
    track: 'rgba(148,163,184,0.18)',
    waveA: 'rgba(56,189,248,0.18)',
    waveB: 'rgba(129,140,248,0.22)',
    waveC: 'rgba(45,212,191,0.25)',
    bokeh: '#7DD3FC',
    dotGrid: 'rgba(148,163,184,0.18)',
    hud: 'rgba(56,189,248,0.45)',
  },
  light: {
    bgTop: '#F8FAFC',
    bgMid: '#F1F5F9',
    bgBot: '#E6EEFA',
    border: 'rgba(15,23,42,0.12)',
    auroraA: '#0EA5E9',
    auroraB: '#6366F1',
    auroraC: '#14B8A6',
    sunCore: '#FFFFFF',
    sunGlow: '#38BDF8',
    star: '#64748B',
    grid: 'rgba(99,102,241,0.14)',
    ridgeFar: '#D9E4F5',
    ridgeFarStroke: 'rgba(99,102,241,0.28)',
    ridgeMid: '#C8DAF3',
    ridgeMidStroke: 'rgba(14,165,233,0.38)',
    ridgeNear: '#DFEAFA',
    ridgeNearStroke: 'rgba(20,184,166,0.46)',
    cardFill: 'rgba(255,255,255,0.86)',
    cardStroke: 'rgba(15,23,42,0.12)',
    cardHighlight: 'rgba(255,255,255,0.95)',
    pillFill: 'rgba(13,148,136,0.10)',
    pillStroke: 'rgba(13,148,136,0.34)',
    pillText: '#0F766E',
    titleGradA: '#0F172A',
    titleGradB: '#0369A1',
    titleGradC: '#4338CA',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    accent: '#0284C7',
    accentAlt: '#4F46E5',
    accentMint: '#0D9488',
    accentViolet: '#7C3AED',
    track: 'rgba(15,23,42,0.10)',
    waveA: 'rgba(14,165,233,0.16)',
    waveB: 'rgba(99,102,241,0.18)',
    waveC: 'rgba(20,184,166,0.22)',
    bokeh: '#38BDF8',
    dotGrid: 'rgba(15,23,42,0.12)',
    hud: 'rgba(2,132,199,0.38)',
  },
};

const FONT_SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif`;
const FONT_MONO = `'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

const STACK_LOGOS = {
  JavaScript: { logo: 'javascript', color: 'F7DF1E' },
  HTML5: { logo: 'html5', color: 'E34F26' },
  'Vibecoder with 10% skills': { logo: 'googlegemini', color: '2DD4BF' },
  'Vibecoder with no skills': { logo: 'googlegemini', color: '2DD4BF' },
  Claude: { logo: 'claude', color: 'D97706' },
  Codex: { logo: 'githubcopilot', color: '38BDF8' },
  CSS3: { logo: 'css', color: '1572B6' },
  TypeScript: { logo: 'typescript', color: '3178C6' },
  'Node.js': { logo: 'nodedotjs', color: '339933' },
  React: { logo: 'react', color: '61DAFB' },
  Git: { logo: 'git', color: 'F05032' },
  GitHub: { logo: 'github', color: 'FFFFFF' },
  'Discord Bots': { logo: 'discord', color: '5865F2' },
  'Web Apps': { logo: 'googlechrome', color: '38BDF8' },
  'Browser Games': { logo: 'webgl', color: '2DD4BF' },
  'SVG Motion': { logo: 'svg', color: '818CF8' },
  'Antigravity IDE': { logo: 'googlegemini', color: '38BDF8' },
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function shieldsLabel(value) {
  const safe = String(value)
    .replaceAll('-', '--')
    .replaceAll('_', '__')
    .replaceAll('/', '·')
    .replaceAll(' ', '_');
  return encodeURIComponent(safe);
}

function wrapText(text, maxChars, maxLines = 2) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  const usedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (lines.length < maxLines && current) {
    const rest = words.slice(usedWords).join(' ');
    lines.push(rest.length > maxChars ? rest.slice(0, maxChars - 1).trimEnd() + '…' : rest);
  }
  return lines;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Periodic harmonic ridge tiled across 2*period so translateX(-period) loops with zero seam.
function periodicRidgePath(period, totalHeight, baseY, harmonics, step = 20) {
  const points = [];
  for (let x = 0; x <= period * 2; x += step) {
    let y = baseY;
    for (const [amp, freq, phase] of harmonics) {
      y += amp * Math.sin((2 * Math.PI * freq * x) / period + phase);
    }
    points.push([x, Number(y.toFixed(1))]);
  }
  const strokeD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const fillD = `${strokeD} L${period * 2} ${totalHeight} L0 ${totalHeight} Z`;
  return { fillD, strokeD };
}

function renderStarfield(theme, count = 64, period = 1200, maxY = 235) {
  const rand = mulberry32(42);
  const stars = [];
  for (let i = 0; i < count; i++) {
    const x = Number((rand() * period).toFixed(1));
    const y = Number((16 + rand() * maxY).toFixed(1));
    const r = Number((0.6 + rand() * 1.45).toFixed(2));
    const op = Number((0.2 + rand() * 0.7).toFixed(2));
    stars.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${theme.star}" opacity="${op}"/>`);
    stars.push(`<circle cx="${(x + period).toFixed(1)}" cy="${y}" r="${r}" fill="${theme.star}" opacity="${op}"/>`);
  }
  return stars.join('\n      ');
}

function renderBokeh(theme, count = 18, period = 1200, height = 430) {
  const rand = mulberry32(1337);
  const items = [];
  for (let i = 0; i < count; i++) {
    const x = Number((rand() * period).toFixed(1));
    const y = Number((235 + rand() * (height - 250)).toFixed(1));
    const r = Number((1.5 + rand() * 3.6).toFixed(1));
    const op = Number((0.18 + rand() * 0.38).toFixed(2));
    const fill = i % 3 === 0 ? theme.accentMint : i % 2 === 0 ? theme.bokeh : theme.accentAlt;
    items.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${op}"/>`);
    items.push(`<circle cx="${(x + period).toFixed(1)}" cy="${y}" r="${r}" fill="${fill}" opacity="${op}"/>`);
  }
  return items.join('\n      ');
}

function renderShards(theme, period = 1200) {
  const coords = [
    [190, 210, 8],
    [470, 175, 11],
    [665, 128, 9],
    [712, 232, 7],
    [1040, 110, 10],
  ];
  return coords
    .flatMap(([x, y, s], i) => {
      const fill = i % 2 === 0 ? theme.accent : theme.accentAlt;
      const diamond = (ox) =>
        `<polygon points="${ox},${y - s} ${ox + s * 0.7},${y} ${ox},${y + s} ${ox - s * 0.7},${y}" fill="${fill}" fill-opacity="0.2" stroke="${fill}" stroke-opacity="0.55" stroke-width="1"/>`;
      return [diamond(x), diamond(x + period)];
    })
    .join('\n      ');
}

function renderPerspectiveGrid(theme, H) {
  const horizonY = 266;
  const centerX = 600;
  const verticals = [];
  for (let i = -9; i <= 9; i++) {
    const topX = centerX + i * 48;
    const botX = centerX + i * 168;
    verticals.push(`<line x1="${topX}" y1="${horizonY}" x2="${botX}" y2="${H}" stroke="${theme.grid}" stroke-width="1"/>`);
  }
  const horizontals = [0, 1, 2, 3, 4, 5].map(
    (idx) => `<line class="grid-scan grid-scan-${idx}" x1="0" y1="${horizonY}" x2="1200" y2="${horizonY}" stroke="${theme.grid}" stroke-width="1.1"/>`
  );
  return `${verticals.join('\n      ')}\n      ${horizontals.join('\n      ')}`;
}

function renderHeroSvg(profile, mode) {
  const t = THEMES[mode];
  const W = 1200;
  const H = 430;

  const far = periodicRidgePath(W, H, 248, [[24, 1, 0.3], [15, 2, 1.4], [7, 4, 0.8]]);
  const mid = periodicRidgePath(W, H, 294, [[19, 1, 2.2], [12, 3, 0.5], [5, 5, 1.9]]);
  const near = periodicRidgePath(W, H, 348, [[15, 2, 0.9], [9, 3, 2.7], [4, 6, 0.4]]);

  const taglineLines = wrapText(profile.tagline, 54, 2);
  const stackChips = Object.values(profile.techStack).flat().slice(0, 4);

  let chipX = 56;
  const chipsMarkup = stackChips
    .map((label) => {
      const w = Math.max(72, label.length * 7.6 + 26);
      const markup = `<g transform="translate(${chipX}, 338)">
        <rect width="${w}" height="28" rx="14" fill="${t.cardFill}" stroke="${t.cardStroke}"/>
        <text x="${(w / 2).toFixed(1)}" y="18" text-anchor="middle" fill="${t.textSecondary}" font-family="${FONT_MONO}" font-size="11" font-weight="600">${esc(label)}</text>
      </g>`;
      chipX += w + 10;
      return markup;
    })
    .join('\n      ');

  const bars = [18, 32, 22, 38, 28, 42, 30, 36, 20, 40, 26, 34].map((h, i) => {
    const bx = 24 + i * 14;
    const by = 236 - h;
    const fill = i % 3 === 0 ? t.accentMint : i % 2 === 0 ? t.accent : t.accentAlt;
    return `<rect class="eq-bar" style="animation-delay:${(i * 0.14).toFixed(2)}s" x="${bx}" y="${by}" width="7" height="${h}" rx="3.5" fill="${fill}" opacity="0.9"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(profile.name)} — ${esc(profile.role)}">
  <title>${esc(profile.name)} — ${esc(profile.role)}</title>
  <defs>
    <clipPath id="hero-clip">
      <rect width="${W}" height="${H}" rx="22"/>
    </clipPath>
    <clipPath id="card-clip">
      <rect width="388" height="292" rx="18"/>
    </clipPath>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bgTop}"/>
      <stop offset="55%" stop-color="${t.bgMid}"/>
      <stop offset="100%" stop-color="${t.bgBot}"/>
    </linearGradient>
    <radialGradient id="aurora-1" cx="20%" cy="18%" r="55%">
      <stop offset="0%" stop-color="${t.auroraA}" stop-opacity="${mode === 'dark' ? '0.28' : '0.18'}"/>
      <stop offset="100%" stop-color="${t.auroraA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aurora-2" cx="84%" cy="24%" r="52%">
      <stop offset="0%" stop-color="${t.auroraB}" stop-opacity="${mode === 'dark' ? '0.28' : '0.16'}"/>
      <stop offset="100%" stop-color="${t.auroraB}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aurora-3" cx="56%" cy="90%" r="50%">
      <stop offset="0%" stop-color="${t.auroraC}" stop-opacity="${mode === 'dark' ? '0.20' : '0.14'}"/>
      <stop offset="100%" stop-color="${t.auroraC}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eclipse-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${t.sunCore}" stop-opacity="${mode === 'dark' ? '0.55' : '0.75'}"/>
      <stop offset="32%" stop-color="${t.sunGlow}" stop-opacity="${mode === 'dark' ? '0.28' : '0.24'}"/>
      <stop offset="100%" stop-color="${t.sunGlow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="disk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.15"/>
      <stop offset="35%" stop-color="${t.accent}" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="65%" stop-color="${t.accent}" stop-opacity="0.9"/>
      <stop offset="85%" stop-color="${t.accentAlt}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.titleGradA}"/>
      <stop offset="52%" stop-color="${t.titleGradB}"/>
      <stop offset="100%" stop-color="${t.titleGradC}"/>
    </linearGradient>
    <linearGradient id="accent-bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="55%" stop-color="${t.accentAlt}"/>
      <stop offset="100%" stop-color="${t.accentMint}"/>
    </linearGradient>
    <linearGradient id="comet-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="${mode === 'dark' ? '0.16' : '0.45'}"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft-glow" x="-10%" y="-20%" width="120%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <style>
    .layer-stars  { animation: parallax-scroll 72s linear infinite; }
    .layer-far    { animation: parallax-scroll 44s linear infinite; }
    .layer-shards { animation: parallax-scroll 34s linear infinite; }
    .layer-mid    { animation: parallax-scroll 24s linear infinite; }
    .layer-near   { animation: parallax-scroll 14s linear infinite; }
    .layer-bokeh  { animation: parallax-scroll 9.5s linear infinite; }
    .aurora-drift { animation: aurora-breathe 14s ease-in-out infinite alternate; }
    .eclipse-pulse { animation: eclipse-breathe 9s ease-in-out infinite alternate; }
    .float-card   { animation: card-float 7.5s ease-in-out infinite; }
    .orbit-spin   { transform-origin: 0px 0px; animation: spin 16s linear infinite; }
    .orbit-rev    { transform-origin: 0px 0px; animation: spin-rev 11s linear infinite; }
    .pulse-dot    { animation: pulse 2.2s ease-in-out infinite; }
    .eq-bar       { transform-box: fill-box; transform-origin: bottom; animation: eq 2.4s ease-in-out infinite; }
    .card-sheen   { animation: sheen-sweep 6.5s ease-in-out infinite; }
    .prog-shimmer { animation: prog-sweep 2.8s linear infinite; }
    .comet-1      { animation: shoot 11s linear infinite; }
    .comet-2      { animation: shoot 16s linear 5s infinite; }

    .grid-scan   { animation: grid-depth 5.5s cubic-bezier(0.45, 0.05, 0.85, 0.45) infinite; }
    .grid-scan-0 { animation-delay: 0s; }
    .grid-scan-1 { animation-delay: -0.92s; }
    .grid-scan-2 { animation-delay: -1.84s; }
    .grid-scan-3 { animation-delay: -2.76s; }
    .grid-scan-4 { animation-delay: -3.68s; }
    .grid-scan-5 { animation-delay: -4.60s; }

    @keyframes parallax-scroll {
      from { transform: translateX(0px); }
      to   { transform: translateX(-${W}px); }
    }
    @keyframes aurora-breathe {
      0%   { transform: translate(0px, 0px) scale(1); opacity: 0.9; }
      100% { transform: translate(26px, -12px) scale(1.06); opacity: 1; }
    }
    @keyframes eclipse-breathe {
      0%   { opacity: 0.78; transform: translateY(0px); }
      100% { opacity: 1; transform: translateY(-6px); }
    }
    @keyframes card-float {
      0%, 100% { transform: translate(0px, 0px); }
      50%      { transform: translate(-4px, -9px); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes spin-rev {
      from { transform: rotate(360deg); }
      to   { transform: rotate(0deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @keyframes eq {
      0%, 100% { transform: scaleY(0.5); }
      50%      { transform: scaleY(1); }
    }
    @keyframes sheen-sweep {
      0%, 58% { transform: translateX(-440px); }
      100%    { transform: translateX(480px); }
    }
    @keyframes prog-sweep {
      0%   { transform: translateX(-80px); }
      100% { transform: translateX(240px); }
    }
    @keyframes shoot {
      0%        { transform: translate(-180px, -60px); opacity: 0; }
      4%        { opacity: 0.95; }
      16%       { transform: translate(420px, 140px); opacity: 0; }
      100%      { transform: translate(420px, 140px); opacity: 0; }
    }
    @keyframes grid-depth {
      0%   { transform: translateY(0px); opacity: 0; }
      15%  { opacity: 0.72; }
      100% { transform: translateY(168px); opacity: 0.92; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>

  <g clip-path="url(#hero-clip)">
    <!-- Layer 0: Deep Canvas & Breathing Aurora -->
    <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
    <g class="aurora-drift">
      <rect width="${W}" height="${H}" fill="url(#aurora-1)"/>
      <rect width="${W}" height="${H}" fill="url(#aurora-2)"/>
      <rect width="${W}" height="${H}" fill="url(#aurora-3)"/>
    </g>

    <!-- Layer 1: Deep Starfield & Shooting Comets -->
    <g class="layer-stars">
      ${renderStarfield(t)}
    </g>
    <g transform="translate(320, 48) rotate(18)">
      <rect class="comet-1" width="110" height="2" rx="1" fill="url(#comet-grad)"/>
    </g>
    <g transform="translate(680, 24) rotate(18)">
      <rect class="comet-2" width="90" height="1.8" rx="1" fill="url(#comet-grad)"/>
    </g>

    <!-- Zoomed-In Blue Black Hole (Gargantua Singularity) -->
    <g class="eclipse-pulse">
      <circle cx="620" cy="236" r="195" fill="url(#eclipse-glow)"/>
      <ellipse cx="620" cy="236" rx="225" ry="42" transform="rotate(-14 620 236)" fill="url(#disk-grad)" opacity="0.88"/>
      <path d="M 460 236 C 460 110 780 110 780 236 C 750 236 740 145 620 145 C 500 145 490 236 460 236 Z" fill="url(#disk-grad)" opacity="0.9"/>
      <path d="M 480 236 C 480 140 760 140 760 236" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.95"/>
      <path d="M 480 236 C 480 345 760 345 760 236" stroke="${t.accent}" stroke-width="2.5" fill="none" opacity="0.8"/>
      <circle cx="620" cy="236" r="76" fill="#000000"/>
      <circle cx="620" cy="236" r="78" fill="none" stroke="${t.accent}" stroke-width="3.5" opacity="0.7"/>
      <circle cx="620" cy="236" r="76.5" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.98"/>
      <circle cx="620" cy="236" r="74" fill="#000000"/>
      <path d="M 400 236 A 220 42 0 0 0 840 236 L 730 236 A 110 21 0 0 1 510 236 Z" transform="rotate(-14 620 236)" fill="url(#disk-grad)" opacity="0.95"/>
      <path d="M 420 236 A 200 38 0 0 0 820 236" transform="rotate(-14 620 236)" stroke="#ffffff" stroke-width="2.2" fill="none" opacity="0.92"/>
      <ellipse cx="530" cy="254" rx="45" ry="20" transform="rotate(-14 530 254)" fill="#ffffff" opacity="0.4"/>
      <circle cx="620" cy="236" r="55" fill="#000000"/>
    </g>

    <!-- Layer 2: Far Horizon Mountain Ridge -->
    <g class="layer-far">
      <path d="${far.fillD}" fill="${t.ridgeFar}" opacity="0.9"/>
      <path d="${far.strokeD}" fill="none" stroke="${t.ridgeFarStroke}" stroke-width="1.3"/>
    </g>

    <!-- Layer 2.5: Midground Floating Parallax Shards -->
    <g class="layer-shards">
      ${renderShards(t)}
    </g>

    <!-- Layer 3: Receding 3D Perspective Grid -->
    <g opacity="0.78">
      <line x1="0" y1="266" x2="${W}" y2="266" stroke="${t.accent}" stroke-opacity="0.35" stroke-width="1.2"/>
      ${renderPerspectiveGrid(t, H)}
    </g>

    <!-- Layer 4: Mid Topographic Ridge -->
    <g class="layer-mid">
      <path d="${mid.fillD}" fill="${t.ridgeMid}" opacity="0.92"/>
      <path d="${mid.strokeD}" fill="none" stroke="${t.ridgeMidStroke}" stroke-width="1.6"/>
    </g>

    <!-- Layer 5: Near Foreground Ridge -->
    <g class="layer-near">
      <path d="${near.fillD}" fill="${t.ridgeNear}" opacity="0.96"/>
      <path d="${near.strokeD}" fill="none" stroke="${t.ridgeNearStroke}" stroke-width="1.9"/>
    </g>

    <!-- Layer 6: Foreground Bokeh Depth Particles -->
    <g class="layer-bokeh">
      ${renderBokeh(t, 18, W, H)}
    </g>

    <!-- HUD Reticle Corners -->
    <g stroke="${t.hud}" stroke-width="1.5" fill="none" opacity="0.8">
      <path d="M22 36 V22 H36"/>
      <path d="M${W - 36} 22 H${W - 22} V36"/>
      <path d="M22 ${H - 36} V${H - 22} H36"/>
      <path d="M${W - 36} ${H - 22} H${W - 22} V${H - 36}"/>
    </g>

    <!-- Foreground Left: Typography Lockup -->
    <g>
      <rect x="56" y="50" width="${Math.max(180, profile.status.length * 7.6 + 46)}" height="28" rx="14" fill="${t.pillFill}" stroke="${t.pillStroke}"/>
      <circle class="pulse-dot" cx="74" cy="64" r="4" fill="${t.accentMint}"/>
      <text x="87" y="68" fill="${t.pillText}" font-family="${FONT_MONO}" font-size="11" font-weight="700" letter-spacing="1.2">${esc(profile.status)}</text>

      <text x="56" y="152" fill="url(#title-grad)" filter="url(#soft-glow)" font-family="${FONT_SANS}" font-size="60" font-weight="800" letter-spacing="-1.6">${esc(profile.name)}</text>
      <text x="56" y="192" fill="${t.accent}" font-family="${FONT_MONO}" font-size="16.5" font-weight="600" letter-spacing="0.4">${esc(profile.role)}</text>

      ${taglineLines
        .map(
          (line, idx) =>
            `<text x="56" y="${230 + idx * 25}" fill="${t.textSecondary}" font-family="${FONT_SANS}" font-size="16" font-weight="400">${esc(line)}</text>`
        )
        .join('\n      ')}

      <text x="56" y="308" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="12.5">@${esc(profile.handle)}  ·  ${esc(profile.location)}</text>

      ${chipsMarkup}
    </g>

    <!-- Foreground Right: Floating Spatial Glass Telemetry Card -->
    <g transform="translate(756, 62)">
      <g class="float-card">
        <rect width="388" height="292" rx="18" fill="${t.cardFill}" stroke="${t.cardStroke}" stroke-width="1.2"/>
        <line x1="20" y1="1" x2="368" y2="1" stroke="${t.cardHighlight}" stroke-width="1.2"/>

        <g clip-path="url(#card-clip)">
          <g transform="skewX(-18)">
            <rect class="card-sheen" x="0" y="0" width="120" height="292" fill="url(#sheen)"/>
          </g>
        </g>

        <circle cx="24" cy="24" r="4.5" fill="${t.accent}" opacity="0.9"/>
        <circle cx="39" cy="24" r="4.5" fill="${t.accentAlt}" opacity="0.9"/>
        <circle cx="54" cy="24" r="4.5" fill="${t.accentMint}" opacity="0.9"/>
        <text x="364" y="28" text-anchor="end" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="10.5" letter-spacing="1">SPATIAL // DEPTH 6X</text>
        <line x1="16" y1="42" x2="372" y2="42" stroke="${t.cardStroke}" stroke-width="1"/>

        <text x="24" y="68" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="10" letter-spacing="1">ACTIVE PIPELINES (3)</text>
        ${(profile.inProgress || [])
          .map((item, idx) => {
            const y = 88 + idx * 36;
            const pct = Math.max(0, Math.min(100, Number(item.progress ?? 80)));
            const fillW = Number(((186 * pct) / 100).toFixed(1));
            return `<text x="24" y="${y}" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="13" font-weight="700">${esc(item.name)}</text>
        <text x="210" y="${y}" text-anchor="end" fill="${t.accentMint}" font-family="${FONT_MONO}" font-size="10.5" font-weight="700">${pct}%</text>
        <rect x="24" y="${y + 7}" width="186" height="5.5" rx="2.75" fill="${t.track}"/>
        <rect x="24" y="${y + 7}" width="${fillW}" height="5.5" rx="2.75" fill="url(#accent-bar)"/>`;
          })
          .join('\n        ')}

        <text x="24" y="198" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="10" letter-spacing="0.8">SIGNAL CADENCE</text>
        ${bars.join('\n        ')}

        <g transform="translate(304, 152)">
          <circle r="56" fill="none" stroke="${t.cardStroke}" stroke-width="1" stroke-dasharray="3 4"/>
          <g class="orbit-spin">
            <circle r="41" fill="none" stroke="${t.accent}" stroke-width="1.5" stroke-dasharray="50 24" opacity="0.9"/>
            <circle cx="41" cy="0" r="3.8" fill="${t.accent}"/>
          </g>
          <g class="orbit-rev">
            <circle r="24" fill="none" stroke="${t.accentAlt}" stroke-width="1.5" stroke-dasharray="28 18" opacity="0.95"/>
            <circle cx="-24" cy="0" r="3.2" fill="${t.accentMint}"/>
          </g>
          <circle r="7.5" fill="url(#accent-bar)"/>
          <circle class="pulse-dot" r="14" fill="none" stroke="${t.accentMint}" stroke-width="1.3"/>
        </g>

        <line x1="16" y1="254" x2="372" y2="254" stroke="${t.cardStroke}" stroke-width="1"/>
        <text x="24" y="275" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="10.5">$ gh profile --user=${esc(profile.handle)} --parallax</text>
      </g>
    </g>

    <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>
  </g>
</svg>`;
}

function renderBentoSvg(profile, mode) {
  const t = THEMES[mode];
  const W = 1200;
  const H = 256;
  const focus = (profile.focus || []).slice(0, 3);
  const highlights = (profile.highlights || []).slice(0, 3);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Core Focus, Current Build, and Craft Matrix">
  <title>Profile Architecture Bento</title>
  <defs>
    <clipPath id="bento-clip">
      <rect width="${W}" height="${H}" rx="18"/>
    </clipPath>
    <pattern id="dot-pat" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.15" fill="${t.dotGrid}"/>
    </pattern>
    <linearGradient id="bento-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bgTop}"/>
      <stop offset="100%" stop-color="${t.bgBot}"/>
    </linearGradient>
    <linearGradient id="bar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="55%" stop-color="${t.accentAlt}"/>
      <stop offset="100%" stop-color="${t.accentMint}"/>
    </linearGradient>
    <linearGradient id="scan-beam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${t.accentMint}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${t.accentAlt}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bento-orb-1" cx="18%" cy="50%" r="36%">
      <stop offset="0%" stop-color="${t.auroraA}" stop-opacity="${mode === 'dark' ? '0.16' : '0.12'}"/>
      <stop offset="100%" stop-color="${t.auroraA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bento-orb-2" cx="82%" cy="50%" r="36%">
      <stop offset="0%" stop-color="${t.auroraB}" stop-opacity="${mode === 'dark' ? '0.16' : '0.12'}"/>
      <stop offset="100%" stop-color="${t.auroraB}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .bg-dots       { animation: drift-dots 26s linear infinite; }
    .bento-float-1 { animation: float-a 7s ease-in-out infinite; }
    .bento-float-2 { animation: float-b 8.5s ease-in-out infinite; }
    .bento-float-3 { animation: float-a 9.5s ease-in-out infinite; }
    .pulse         { animation: blink 2.2s ease-in-out infinite; }
    .cursor-blink  { animation: step-blink 1.1s steps(2, start) infinite; }
    .top-scanner   { animation: scan-x 6s ease-in-out infinite; }

    @keyframes drift-dots {
      from { transform: translate(0px, 0px); }
      to   { transform: translate(-48px, -24px); }
    }
    @keyframes float-a {
      0%, 100% { transform: translateY(0px); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes float-b {
      0%, 100% { transform: translateY(-3px); }
      50%      { transform: translateY(3px); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.28; }
    }
    @keyframes step-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0; }
    }
    @keyframes scan-x {
      0%   { transform: translateX(-260px); }
      100% { transform: translateX(${W + 80}px); }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>

  <g clip-path="url(#bento-clip)">
    <rect width="${W}" height="${H}" fill="url(#bento-bg)"/>
    <rect width="${W}" height="${H}" fill="url(#bento-orb-1)"/>
    <rect width="${W}" height="${H}" fill="url(#bento-orb-2)"/>
    <rect class="bg-dots" x="0" y="0" width="${W + 96}" height="${H + 48}" fill="url(#dot-pat)"/>
    <rect class="top-scanner" x="0" y="0" width="240" height="2" fill="url(#scan-beam)"/>

    <!-- Card 1: Core Focus -->
    <g transform="translate(20, 24)">
      <g class="bento-float-1">
        <rect width="374" height="208" rx="16" fill="${t.cardFill}" stroke="${t.cardStroke}" stroke-width="1.2"/>
        <line x1="18" y1="1" x2="356" y2="1" stroke="${t.cardHighlight}" stroke-width="1"/>
        <text x="24" y="34" fill="${t.accent}" font-family="${FONT_MONO}" font-size="11" font-weight="700" letter-spacing="1.2">01 // CORE FOCUS</text>
        <circle class="pulse" cx="346" cy="30" r="4" fill="${t.accent}"/>
        <line x1="24" y1="48" x2="350" y2="48" stroke="${t.cardStroke}"/>
        ${focus
          .map(
            (item, i) => `
        <g transform="translate(24, ${76 + i * 42})">
          <rect y="-11" width="24" height="24" rx="7" fill="${t.pillFill}" stroke="${t.pillStroke}"/>
          <text x="12" y="5" text-anchor="middle" fill="${t.pillText}" font-family="${FONT_MONO}" font-size="11" font-weight="700">${i + 1}</text>
          <text x="36" y="5" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="14" font-weight="500">${esc(item)}</text>
        </g>`
          )
          .join('')}
      </g>
    </g>

    <!-- Card 2: Currently Building / Active Pipelines -->
    <g transform="translate(413, 24)">
      <g class="bento-float-2">
        <rect width="374" height="208" rx="16" fill="${t.cardFill}" stroke="${t.cardStroke}" stroke-width="1.2"/>
        <line x1="18" y1="1" x2="356" y2="1" stroke="${t.cardHighlight}" stroke-width="1"/>
        <text x="24" y="34" fill="${t.accentMint}" font-family="${FONT_MONO}" font-size="11" font-weight="700" letter-spacing="1.2">02 // IN THE LAB (3 ACTIVE)</text>
        <circle class="pulse" cx="346" cy="30" r="4" fill="${t.accentMint}"/>
        <line x1="24" y1="48" x2="350" y2="48" stroke="${t.cardStroke}"/>

        ${(profile.inProgress || [])
          .map((item, idx) => {
            const y = 74 + idx * 44;
            const pct = Math.max(0, Math.min(100, Number(item.progress ?? 80)));
            const fillW = Number(((326 * pct) / 100).toFixed(1));
            const badgeW = Math.max(64, item.tag.length * 6.8 + 16);
            const dotFill = idx === 0 ? t.accent : idx === 1 ? t.accentMint : t.accentAlt;
            return `<g>
          <circle cx="28" cy="${y - 4}" r="3.2" fill="${dotFill}"/>
          <text x="38" y="${y}" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="14" font-weight="700">${esc(item.name)}</text>
          <rect x="188" y="${y - 12}" width="${badgeW}" height="16" rx="8" fill="${t.pillFill}" stroke="${t.pillStroke}"/>
          <text x="${188 + badgeW / 2}" y="${y}" text-anchor="middle" fill="${t.pillText}" font-family="${FONT_MONO}" font-size="9" font-weight="700">${esc(item.tag)}</text>
          <text x="350" y="${y}" text-anchor="end" fill="${t.accentMint}" font-family="${FONT_MONO}" font-size="11" font-weight="700">${pct}%</text>
          <rect x="24" y="${y + 7}" width="326" height="6" rx="3" fill="${t.track}"/>
          <rect x="24" y="${y + 7}" width="${fillW}" height="6" rx="3" fill="url(#bar-grad)"/>
        </g>`;
          })
          .join('\n        ')}
      </g>
    </g>

    <!-- Card 3: Signal Telemetry -->
    <g transform="translate(806, 24)">
      <g class="bento-float-3">
        <rect width="374" height="208" rx="16" fill="${t.cardFill}" stroke="${t.cardStroke}" stroke-width="1.2"/>
        <line x1="18" y1="1" x2="356" y2="1" stroke="${t.cardHighlight}" stroke-width="1"/>
        <text x="24" y="34" fill="${t.accentAlt}" font-family="${FONT_MONO}" font-size="11" font-weight="700" letter-spacing="1.2">03 // CRAFT MATRIX</text>
        <circle class="pulse" cx="346" cy="30" r="4" fill="${t.accentAlt}"/>
        <line x1="24" y1="48" x2="350" y2="48" stroke="${t.cardStroke}"/>
        ${highlights
          .map((h, i) => {
            const pct = Math.max(0, Math.min(100, Number(h.level ?? 80)));
            const y = 78 + i * 44;
            return `
        <text x="24" y="${y}" fill="${t.textSecondary}" font-family="${FONT_MONO}" font-size="11" font-weight="600" letter-spacing="0.6">${esc(h.label)}</text>
        <text x="350" y="${y}" text-anchor="end" fill="${t.textPrimary}" font-family="${FONT_MONO}" font-size="11" font-weight="700">${pct}%</text>
        <rect x="24" y="${y + 10}" width="326" height="8" rx="4" fill="${t.track}"/>
        <rect x="24" y="${y + 10}" width="${Number(((326 * pct) / 100).toFixed(1))}" height="8" rx="4" fill="url(#bar-grad)"/>`;
          })
          .join('')}
      </g>
    </g>

    <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="17.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>
  </g>
</svg>`;
}

function renderTriedLanguagesSvg(profile, mode) {
  const t = THEMES[mode];
  const W = 1200;
  const H = 224;
  const list = (profile.triedLanguages || []).slice(0, 6);
  const cardW = 374;
  const cardH = 88;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Languages Attempted While Vibecoding">
  <title>Tried Languages During Vibecoding</title>
  <defs>
    <clipPath id="tried-clip">
      <rect width="${W}" height="${H}" rx="18"/>
    </clipPath>
    <pattern id="dot-pat-tried" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.15" fill="${t.dotGrid}"/>
    </pattern>
    <linearGradient id="tried-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bgTop}"/>
      <stop offset="100%" stop-color="${t.bgBot}"/>
    </linearGradient>
    <linearGradient id="tried-scan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="#EF4444" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${t.accentAlt}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <style>
    .bg-dots { animation: drift-dots 26s linear infinite; }
    .scan-line { animation: scan-x 6s ease-in-out infinite; }
    .pulse-red { animation: blink-fast 1.6s ease-in-out infinite; }
    @keyframes drift-dots {
      from { transform: translate(0px, 0px); }
      to   { transform: translate(-48px, -24px); }
    }
    @keyframes scan-x {
      0%, 100% { transform: translateX(0px); opacity: 0.3; }
      50%      { transform: translateX(${W - 240}px); opacity: 0.95; }
    }
    @keyframes blink-fast {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>

  <g clip-path="url(#tried-clip)">
    <rect width="${W}" height="${H}" fill="url(#tried-bg)"/>
    <rect class="bg-dots" x="0" y="0" width="${W + 96}" height="${H + 48}" fill="url(#dot-pat-tried)"/>
    <rect class="scan-line" x="0" y="0" width="240" height="2" fill="url(#tried-scan)"/>

    <!-- Header bar -->
    <text x="24" y="24" fill="${t.accent}" font-family="${FONT_MONO}" font-size="11" font-weight="700" letter-spacing="1.4">// TRIAL_LAB // ACCURATE REPO TELEMETRY ACROSS ALL 21 REPOSITORIES</text>
    <rect x="${W - 240}" y="12" width="216" height="18" rx="9" fill="rgba(45,212,191,0.12)" stroke="rgba(45,212,191,0.35)"/>
    <circle class="pulse-red" cx="${W - 228}" cy="21" r="3" fill="#2DD4BF"/>
    <text x="${W - 216}" y="24" fill="#2DD4BF" font-family="${FONT_MONO}" font-size="9" font-weight="700">VERIFIED DATA // 21 REPOS</text>

    <!-- 6 Language Cards in 3x2 Grid -->
    ${list.map((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 20 + col * (cardW + 19);
      const y = 38 + row * (cardH + 10);
      const colorHex = '#' + (item.color || 'EF4444');
      const barW = Math.max(12, Math.round(((item.survival || 50) / 100) * (cardW - 32)));
      return `<g transform="translate(${x}, ${y})">
        <rect width="${cardW}" height="${cardH}" rx="12" fill="${t.cardFill}" stroke="${t.cardStroke}" stroke-width="1.1"/>
        <line x1="12" y1="1" x2="${cardW - 12}" y2="1" stroke="${t.cardHighlight}" stroke-width="1"/>
        <text x="16" y="27" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="15" font-weight="800">${esc(item.name)} <tspan fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="10" font-weight="500">(${esc(item.footprint)})</tspan></text>
        <rect x="${cardW - 124}" y="13" width="110" height="18" rx="9" fill="rgba(255,255,255,0.05)" stroke="${colorHex}66"/>
        <text x="${cardW - 69}" y="25" text-anchor="middle" fill="${colorHex}" font-family="${FONT_MONO}" font-size="8.5" font-weight="700">${esc(item.outcome)}</text>
        <text x="16" y="49" fill="${t.textSecondary}" font-family="${FONT_MONO}" font-size="10.5" font-weight="500">${esc(item.vibecoderLog)}</text>
        <rect x="16" y="64" width="${cardW - 32}" height="5" rx="2.5" fill="${t.track}"/>
        <rect x="16" y="64" width="${barW}" height="5" rx="2.5" fill="${colorHex}"/>
        <text x="${cardW - 16}" y="77" text-anchor="end" fill="${colorHex}" font-family="${FONT_MONO}" font-size="8" font-weight="700">${item.pct} · ${item.survival}% SURVIVAL</text>
      </g>`;
    }).join('\n    ')}

    <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="17.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>
  </g>
</svg>`;
}

function renderProjectCardSvg(project, index, mode) {
  const t = THEMES[mode];
  const W = 580;
  const H = 192;
  const accents = [t.accent, t.accentMint, t.accentAlt, t.accentViolet];
  const accent = accents[index % accents.length];
  const waveBack = periodicRidgePath(W, H, 152, [[9, 1, index * 0.9], [5, 2, 1.4]], 20);
  const waveFront = periodicRidgePath(W, H, 166, [[7, 2, index * 1.3], [3, 3, 0.5]], 20);
  const descLines = wrapText(project.description, 56, 2);
  const badgeW = Math.max(76, project.badge.length * 7.6 + 26);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(project.name)} — ${esc(project.description)}">
  <title>${esc(project.name)}</title>
  <defs>
    <clipPath id="pclip">
      <rect width="${W}" height="${H}" rx="18"/>
    </clipPath>
    <linearGradient id="pbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bgTop}"/>
      <stop offset="100%" stop-color="${t.bgBot}"/>
    </linearGradient>
    <radialGradient id="pglow" cx="92%" cy="10%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="${mode === 'dark' ? '0.26' : '0.16'}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="psheen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="${mode === 'dark' ? '0.10' : '0.32'}"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <style>
    .pw-slow  { animation: pscroll 22s linear infinite; }
    .pw-fast  { animation: pscroll-rev 13s linear infinite; }
    .p-sheen  { animation: psweep 8s ease-in-out ${index * 1.4}s infinite; }
    .p-dot    { animation: pblink 2.4s ease-in-out infinite; }

    @keyframes pscroll {
      from { transform: translateX(0px); }
      to   { transform: translateX(-${W}px); }
    }
    @keyframes pscroll-rev {
      from { transform: translateX(-${W}px); }
      to   { transform: translateX(0px); }
    }
    @keyframes psweep {
      0%, 66% { transform: translateX(-640px); }
      100%    { transform: translateX(680px); }
    }
    @keyframes pblink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>

  <g clip-path="url(#pclip)">
    <rect width="${W}" height="${H}" fill="url(#pbg)"/>
    <rect width="${W}" height="${H}" fill="url(#pglow)"/>

    <!-- Parallax micro-horizon ribbons -->
    <g class="pw-slow">
      <path d="${waveBack.fillD}" fill="${accent}" fill-opacity="${mode === 'dark' ? '0.09' : '0.08'}"/>
      <path d="${waveBack.strokeD}" fill="none" stroke="${accent}" stroke-opacity="0.24" stroke-width="1"/>
    </g>
    <g class="pw-fast">
      <path d="${waveFront.fillD}" fill="${accent}" fill-opacity="${mode === 'dark' ? '0.13' : '0.11'}"/>
      <path d="${waveFront.strokeD}" fill="none" stroke="${accent}" stroke-opacity="0.38" stroke-width="1.2"/>
    </g>

    <!-- Diagonal glass sheen -->
    <g transform="skewX(-18)">
      <rect class="p-sheen" x="0" y="0" width="110" height="${H}" fill="url(#psheen)"/>
    </g>

    <!-- Top Specular Line -->
    <line x1="22" y1="1" x2="${W - 22}" y2="1" stroke="${t.cardHighlight}" stroke-width="1.2"/>

    <!-- Index & Status Badge -->
    <text x="26" y="34" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="11" font-weight="600" letter-spacing="0.8">0${index + 1} // ${esc(project.repo)}</text>
    <rect x="${W - badgeW - 24}" y="17" width="${badgeW}" height="24" rx="12" fill="${t.cardFill}" stroke="${accent}" stroke-opacity="0.55"/>
    <circle class="p-dot" cx="${W - badgeW - 11}" cy="29" r="3.2" fill="${accent}"/>
    <text x="${W - badgeW / 2 - 18}" y="33" text-anchor="middle" fill="${accent}" font-family="${FONT_MONO}" font-size="10" font-weight="700" letter-spacing="0.8">${esc(project.badge)}</text>

    <!-- Title & Description -->
    <text x="26" y="74" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="23" font-weight="800" letter-spacing="-0.4">${esc(project.name)}</text>
    ${descLines
      .map(
        (line, idx) =>
          `<text x="26" y="${102 + idx * 21}" fill="${t.textSecondary}" font-family="${FONT_SANS}" font-size="14">${esc(line)}</text>`
      )
      .join('\n    ')}

    <!-- Footer Stack & Action Cue -->
    <text x="26" y="164" fill="${accent}" font-family="${FONT_MONO}" font-size="11.5" font-weight="600">${esc(project.stack)}</text>
    <text x="${W - 26}" y="164" text-anchor="end" fill="${t.textPrimary}" font-family="${FONT_MONO}" font-size="11" font-weight="700" opacity="0.85">OPEN REPO ↗</text>

    <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="17.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>
  </g>
</svg>`;
}

function renderFooterSvg(profile, mode) {
  const t = THEMES[mode];
  const W = 1200;
  const H = 140;

  const w1 = periodicRidgePath(W, H, 68, [[14, 1, 0.2], [7, 2, 1.8]]);
  const w2 = periodicRidgePath(W, H, 84, [[12, 2, 1.1], [6, 3, 0.4]]);
  const w3 = periodicRidgePath(W, H, 100, [[10, 1, 2.5], [5, 4, 1.2]]);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(profile.footerNote)}">
  <title>${esc(profile.name)} — Parallax Footer</title>
  <defs>
    <clipPath id="footer-clip">
      <rect width="${W}" height="${H}" rx="18"/>
    </clipPath>
    <linearGradient id="f-bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.bgTop}"/>
      <stop offset="50%" stop-color="${t.bgMid}"/>
      <stop offset="100%" stop-color="${t.bgTop}"/>
    </linearGradient>
  </defs>

  <style>
    .wave-slow { animation: wave-fwd 26s linear infinite; }
    .wave-mid  { animation: wave-rev 17s linear infinite; }
    .wave-fast { animation: wave-fwd 11s linear infinite; }
    .beacon    { animation: glow 2.4s ease-in-out infinite; }

    @keyframes wave-fwd {
      from { transform: translateX(0px); }
      to   { transform: translateX(-${W}px); }
    }
    @keyframes wave-rev {
      from { transform: translateX(-${W}px); }
      to   { transform: translateX(0px); }
    }
    @keyframes glow {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>

  <g clip-path="url(#footer-clip)">
    <rect width="${W}" height="${H}" fill="url(#f-bg)"/>

    <g class="wave-slow">
      <path d="${w1.fillD}" fill="${t.waveA}"/>
      <path d="${w1.strokeD}" fill="none" stroke="${t.accent}" stroke-opacity="0.38" stroke-width="1.2"/>
    </g>
    <g class="wave-mid">
      <path d="${w2.fillD}" fill="${t.waveB}"/>
      <path d="${w2.strokeD}" fill="none" stroke="${t.accentAlt}" stroke-opacity="0.42" stroke-width="1.2"/>
    </g>
    <g class="wave-fast">
      <path d="${w3.fillD}" fill="${t.waveC}"/>
      <path d="${w3.strokeD}" fill="none" stroke="${t.accentMint}" stroke-opacity="0.48" stroke-width="1.4"/>
    </g>

    <circle class="beacon" cx="${W / 2}" cy="44" r="4.2" fill="${t.accentMint}"/>
    <text x="${W / 2}" y="74" text-anchor="middle" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="15" font-weight="600">${esc(profile.footerNote)}</text>
    <text x="${W / 2}" y="99" text-anchor="middle" fill="${t.textMuted}" font-family="${FONT_MONO}" font-size="11.5">@${esc(profile.handle)}</text>

    <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="17.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>
  </g>
</svg>`;
}

function renderDividerSvg(depthCode, title, seed, mode) {
  const t = THEMES[mode];
  const W = 1200;
  const H = 82;
  const rand = mulberry32(seed);
  const slowDots = [];
  const fastStreaks = [];
  for (let i = 0; i < 24; i++) {
    const x = Number((28 + rand() * (W - 56)).toFixed(1));
    const y = Number((rand() * H).toFixed(1));
    const r = Number((0.8 + rand() * 1.3).toFixed(2));
    slowDots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${t.star}" opacity="0.45"/>`);
    slowDots.push(`<circle cx="${x}" cy="${(y + H).toFixed(1)}" r="${r}" fill="${t.star}" opacity="0.45"/>`);
  }
  for (let i = 0; i < 12; i++) {
    const x = Number((40 + rand() * (W - 80)).toFixed(1));
    const y = Number((rand() * H).toFixed(1));
    const len = Number((8 + rand() * 14).toFixed(1));
    const stroke = i % 2 === 0 ? t.accent : t.accentMint;
    fastStreaks.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${(y + len).toFixed(1)}" stroke="${stroke}" stroke-width="1.2" stroke-opacity="0.38" stroke-linecap="round"/>`);
    fastStreaks.push(`<line x1="${x}" y1="${(y + H).toFixed(1)}" x2="${x}" y2="${(y + H + len).toFixed(1)}" stroke="${stroke}" stroke-width="1.2" stroke-opacity="0.38" stroke-linecap="round"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(depthCode)} — ${esc(title)}">
  <title>${esc(title)}</title>
  <defs>
    <clipPath id="div-clip">
      <rect width="${W}" height="${H}" rx="16"/>
    </clipPath>
    <linearGradient id="div-bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.bgTop}"/>
      <stop offset="50%" stop-color="${t.bgMid}"/>
      <stop offset="100%" stop-color="${t.bgTop}"/>
    </linearGradient>
    <linearGradient id="div-line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${t.accentMint}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${t.accentAlt}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <style>
    .v-slow { animation: vflow 12s linear infinite; }
    .v-fast { animation: vflow 5.5s linear infinite; }
    .chev-1 { animation: chev-pulse 1.8s ease-in-out infinite; }
    .chev-2 { animation: chev-pulse 1.8s ease-in-out 0.45s infinite; }

    @keyframes vflow {
      from { transform: translateY(-${H}px); }
      to   { transform: translateY(0px); }
    }
    @keyframes chev-pulse {
      0%, 100% { opacity: 0.25; }
      50%      { opacity: 0.95; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  </style>

  <g clip-path="url(#div-clip)">
    <rect width="${W}" height="${H}" fill="url(#div-bg)"/>
    <g class="v-slow">
      ${slowDots.join('\n      ')}
    </g>
    <g class="v-fast">
      ${fastStreaks.join('\n      ')}
    </g>

    <line x1="60" y1="${H / 2}" x2="${W - 60}" y2="${H / 2}" stroke="url(#div-line)" stroke-width="1"/>
    <rect x="${W / 2 - 190}" y="17" width="380" height="48" rx="24" fill="${t.cardFill}" stroke="${t.cardStroke}" stroke-width="1.2"/>
    <text x="${W / 2}" y="38" text-anchor="middle" fill="${t.accent}" font-family="${FONT_MONO}" font-size="10.5" font-weight="700" letter-spacing="1.4">${esc(depthCode)}</text>
    <text x="${W / 2}" y="56" text-anchor="middle" fill="${t.textPrimary}" font-family="${FONT_SANS}" font-size="15" font-weight="700" letter-spacing="0.4">${esc(title)}</text>

    <path class="chev-1" d="M52 34 L58 40 L64 34" fill="none" stroke="${t.accentMint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="chev-2" d="M52 42 L58 48 L64 42" fill="none" stroke="${t.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="chev-1" d="M${W - 64} 34 L${W - 58} 40 L${W - 52} 34" fill="none" stroke="${t.accentMint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="chev-2" d="M${W - 64} 42 L${W - 58} 48 L${W - 52} 42" fill="none" stroke="${t.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>

    <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="15.5" fill="none" stroke="${t.border}" stroke-width="1.2"/>
  </g>
</svg>`;
}

function pictureBlock(name, alt, width = '100%') {
  return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/${name}-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/${name}-light.svg" />
  <img alt="${esc(alt)}" src="./assets/${name}-dark.svg" width="${width}" />
</picture>`;
}

function renderReadme(profile) {
  const navBadges = (profile.links || [])
    .map((l) => {
      const label = shieldsLabel(l.label);
      const color = (l.color || '0F172A').replace(/^#/, '');
      return `<a href="${esc(l.url)}"><img src="https://img.shields.io/badge/%E2%97%86-${label}-0B1226?style=for-the-badge&labelColor=${color}" alt="${esc(l.label)}" /></a>`;
    })
    .join('\n  ');

  const projects = profile.projects || [];
  const projectPairs = [];
  for (let i = 0; i < projects.length; i += 2) {
    const pair = projects.slice(i, i + 2);
    const links = pair.map((p, offset) => {
      const idx = i + offset;
      return `<a href="https://github.com/${esc(p.repo)}">${pictureBlock(`proj-${idx + 1}`, `${p.name} — ${p.description}`, '48.8%')}</a>`;
    });
    projectPairs.push(`<p align="center">\n  ${links.join('\n  &nbsp;\n  ')}\n</p>`);
  }

  const stackBadges = Object.values(profile.techStack || {})
    .flat()
    .map((tech) => {
      const meta = STACK_LOGOS[tech] || { logo: '', color: '38BDF8' };
      const label = shieldsLabel(tech);
      const logoParam = meta.logo ? `&logo=${encodeURIComponent(meta.logo)}&logoColor=${meta.color}` : '';
      return `<img src="https://img.shields.io/badge/${label}-0B1226?style=for-the-badge${logoParam}" alt="${esc(tech)}" />`;
    })
    .join('\n  ');

  return `<div align="center">

${pictureBlock('hero', `${profile.name} — ${profile.role}`)}

<br />

<p>
  ${navBadges}
</p>

<br />

${pictureBlock('bento', 'Core Focus, Active Build, and Craft Matrix')}

<br />

${pictureBlock('div-builds', 'Depth 02 — Featured Builds')}

${projectPairs.join('\n')}

<br />

${pictureBlock('div-stack', 'Depth 03 — Tech Stack & Arsenal')}

<p>
  ${stackBadges}
</p>

<br />

${pictureBlock('div-tried', 'Depth 04 — Tried Languages During Vibecoding')}

${pictureBlock('tried', 'Languages Attempted While Vibecoding With 10% Skills')}

<br />

${pictureBlock('div-telemetry', 'Depth 05 — Live Telemetry')}

<p>
  <img src="https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(profile.handle)}&show_icons=true&bg_color=060B18&title_color=38BDF8&icon_color=2DD4BF&text_color=CBD5E1&border_color=1E293B&border_radius=14" height="168" alt="GitHub Stats" />
  <img src="https://streak-stats.demolab.com/?user=${encodeURIComponent(profile.handle)}&background=060B18&border=1E293B&border_radius=14&ring=38BDF8&fire=2DD4BF&currStreakNum=F8FAFC&sideNums=F8FAFC&currStreakLabel=38BDF8&sideLabels=94A3B8&dates=64748B&stroke=1E293B" height="168" alt="GitHub Streak" />
</p>

<br />

${pictureBlock('footer', profile.footerNote)}

</div>
`;
}

function generate() {
  const profile = JSON.parse(readFileSync(PROFILE_PATH, 'utf8'));
  mkdirSync(ASSETS_DIR, { recursive: true });

  const outputs = [
    ['hero-dark.svg', renderHeroSvg(profile, 'dark')],
    ['hero-light.svg', renderHeroSvg(profile, 'light')],
    ['bento-dark.svg', renderBentoSvg(profile, 'dark')],
    ['bento-light.svg', renderBentoSvg(profile, 'light')],
    ['footer-dark.svg', renderFooterSvg(profile, 'dark')],
    ['footer-light.svg', renderFooterSvg(profile, 'light')],
    ['div-builds-dark.svg', renderDividerSvg('DEPTH // 02', 'FEATURED BUILDS', 101, 'dark')],
    ['div-builds-light.svg', renderDividerSvg('DEPTH // 02', 'FEATURED BUILDS', 101, 'light')],
    ['div-stack-dark.svg', renderDividerSvg('DEPTH // 03', 'TECH STACK & ARSENAL', 202, 'dark')],
    ['div-stack-light.svg', renderDividerSvg('DEPTH // 03', 'TECH STACK & ARSENAL', 202, 'light')],
    ['div-tried-dark.svg', renderDividerSvg('DEPTH // 04', 'TRIED LANGUAGES DURING VIBECODING', 303, 'dark')],
    ['div-tried-light.svg', renderDividerSvg('DEPTH // 04', 'TRIED LANGUAGES DURING VIBECODING', 303, 'light')],
    ['tried-dark.svg', renderTriedLanguagesSvg(profile, 'dark')],
    ['tried-light.svg', renderTriedLanguagesSvg(profile, 'light')],
    ['div-telemetry-dark.svg', renderDividerSvg('DEPTH // 05', 'LIVE TELEMETRY', 404, 'dark')],
    ['div-telemetry-light.svg', renderDividerSvg('DEPTH // 05', 'LIVE TELEMETRY', 404, 'light')],
  ];

  (profile.projects || []).forEach((p, idx) => {
    outputs.push([`proj-${idx + 1}-dark.svg`, renderProjectCardSvg(p, idx, 'dark')]);
    outputs.push([`proj-${idx + 1}-light.svg`, renderProjectCardSvg(p, idx, 'light')]);
  });

  for (const [file, content] of outputs) {
    writeFileSync(join(ASSETS_DIR, file), content, 'utf8');
  }

  const readme = renderReadme(profile);
  writeFileSync(join(ROOT, 'README.md'), readme, 'utf8');
  return { outputs, readme };
}

function selfCheck({ outputs, readme }) {
  for (const [file, svg] of outputs) {
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), `${file}: missing xmlns`);
    assert.ok(svg.endsWith('</svg>'), `${file}: unclosed svg`);
    assert.ok(!/<script[\s>]/i.test(svg), `${file}: forbidden <script> tag`);
    assert.ok(!/<foreignObject[\s>]/i.test(svg), `${file}: forbidden <foreignObject>`);
    assert.ok(!/https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg', '')), `${file}: external URL blocked in GitHub img SVG`);
    assert.ok(svg.includes('prefers-reduced-motion: reduce'), `${file}: missing reduced-motion accessibility rule`);
    assert.ok(!/<[^>]*\bclass="[^"]*"[^>]*\btransform="[^"]*"/i.test(svg), `${file}: class+transform conflict`);
    assert.ok(!/<[^>]*\btransform="[^"]*"[^>]*\bclass="[^"]*"/i.test(svg), `${file}: transform+class conflict`);
    const openG = (svg.match(/<g[\s>]/g) || []).length;
    const closeG = (svg.match(/<\/g>/g) || []).length;
    assert.equal(openG, closeG, `${file}: unbalanced <g> tags (${openG} vs ${closeG})`);
  }
  const refs = [...readme.matchAll(/\.\/assets\/[a-z0-9-]+\.svg/gi)].map((m) => m[0]);
  assert.ok(refs.length >= 24, 'README missing expected asset references');
  for (const ref of refs) {
    assert.ok(existsSync(join(ROOT, ref)), `README references missing file: ${ref}`);
  }
  assert.equal(esc(`<a & "b">`), '&lt;a &amp; &quot;b&quot;&gt;');
  console.log(`Generated ${outputs.length} parallax SVGs + README.md; all ${refs.length} asset checks passed.`);
}

const result = generate();
selfCheck(result);
