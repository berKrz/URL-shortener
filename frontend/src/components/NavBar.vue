<template>
  <nav class="navbar">
    <div class="navbar-chrome">
      <span class="navbar-label">[ SHORTURL ]</span>

      <div class="navbar-links">
        <RouterLink to="/" class="nav-link" active-class="nav-link--active">
          <span class="nav-bracket">[</span>
          <span class="nav-text">HOME</span>
          <span class="nav-bracket">]</span>
        </RouterLink>
        <span class="nav-sep">│</span>
        <RouterLink to="/history" class="nav-link" active-class="nav-link--active">
          <span class="nav-bracket">[</span>
          <span class="nav-text">HISTORY</span>
          <span class="nav-bracket">]</span>
        </RouterLink>
      </div>

      <button
        class="theme-toggle"
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} theme`"
        @click="handleThemeSwitch"
      >
        <span class="toggle-track" :class="{ 'toggle-track--dark': isDark }">
          <span class="toggle-thumb" :class="{ 'toggle-thumb--dark': isDark }">
            <svg v-if="!isDark" class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2"  x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34"/>
              <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
              <line x1="2"  y1="12" x2="5"  y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
              <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
        </span>
        <span class="toggle-label">{{ isDark ? 'DARK' : 'LITE' }}</span>
      </button>
    </div>

    <div class="navbar-scanline" aria-hidden="true"></div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)

function handleThemeSwitch() {
  const shell = document.querySelector('.crt-shell') as HTMLElement | null
  if (!shell) {
    toggleDark()
    return
  }

  // 1. Trigger the collapse animation
  shell.classList.add('crt-switching')

  // 2. Swap the theme at the midpoint (when screen is thinnest)
  setTimeout(() => {
    toggleDark()
  }, 220)

  // 3. Remove the class after full animation completes so it can retrigger
  setTimeout(() => {
    shell.classList.remove('crt-switching')
  }, 500)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

.navbar {
  font-family: 'VT323', monospace;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  background-color: var(--crt-header-bg);
  border-bottom: 2px solid var(--crt-border-bright);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 0 var(--crt-border-dim), 0 4px 16px rgba(0, 0, 0, 0.4);
}

.navbar-chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 1.5rem;
  gap: 1.5rem;
}

.navbar-label {
  color: var(--crt-label);
  font-size: 1.15rem;
  letter-spacing: 0.12em;
  white-space: nowrap;
  animation: fadeInLeft 0.5s ease both;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  animation: fadeInDown 0.5s ease 0.15s both;
}

.nav-sep {
  color: var(--crt-border-bright);
  font-size: 1.3rem;
  user-select: none;
  opacity: 0.7;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.1em;
  color: var(--crt-text);
  text-decoration: none;
  padding: 0.05em 0.35em;
  transition: color 0.12s, text-shadow 0.12s;
}

.nav-bracket {
  color: var(--crt-label);
  transition: color 0.12s;
}

.nav-text { letter-spacing: 0.18em; }

.nav-link:hover .nav-bracket,
.nav-link--active .nav-bracket { color: var(--crt-highlight); }

.nav-link:hover,
.nav-link--active {
  color: var(--crt-highlight);
  text-shadow: 0 0 6px var(--crt-glow), 0 0 18px var(--crt-glow-wide);
}

.nav-link--active .nav-text {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.nav-link:hover .nav-text::after {
  content: '▮';
  margin-left: 3px;
  animation: blink 0.85s step-end infinite;
}

/* ─── Theme Toggle ─────────────────────────────────── */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5em;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'VT323', monospace;
  font-size: 1.05rem;
  letter-spacing: 0.12em;
  color: var(--crt-label);
  padding: 0;
  animation: fadeInRight 0.5s ease both;
  transition: color 0.15s;
}

.theme-toggle:hover { color: var(--crt-highlight); }

.toggle-track {
  display: flex;
  align-items: center;
  width: 2.8em;
  height: 1.4em;
  border-radius: 0;
  border: 1px solid var(--crt-border-bright);
  background: var(--crt-bg-deep, #2d5570);
  padding: 0.1em;
  position: relative;
  transition: background 0.25s, border-color 0.25s;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.4);
}

.toggle-track--dark {
  background: var(--crt-header-bg);
  border-color: var(--crt-label);
}

.toggle-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.1em;
  height: 1.1em;
  background: var(--crt-text);
  color: var(--crt-header-bg);
  position: absolute;
  left: 0.12em;
  transition: left 0.22s cubic-bezier(0.4, 0, 0.2, 1), background 0.22s;
  box-shadow: 0 0 6px var(--crt-glow);
}

.toggle-thumb--dark {
  left: calc(100% - 1.22em);
  background: var(--crt-highlight);
  box-shadow: 0 0 8px var(--crt-glow);
}

.toggle-icon {
  width: 0.75em;
  height: 0.75em;
}

.toggle-label { min-width: 2.8em; text-align: left; }

/* ─── Scanline ─────────────────────────────────────── */
.navbar-scanline {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.08) 3px,
    rgba(0, 0, 0, 0.08) 4px
  );
  z-index: 10;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ─── CRT theme-switch animation ─────────────────────────────
   Collapses the screen to a line, then re-expands.
   The JS swaps data-theme at the 220ms midpoint (thinnest point).
─────────────────────────────────────────────────────────────── */
.crt-switching {
  animation: crtSwitch 0.5s ease forwards !important;
}

@keyframes crtSwitch {
  /* collapse to line */
  0%   { clip-path: inset(0% 0 0% 0); }
  40%  { clip-path: inset(48% 0 48% 0); }
  /* thinnest — theme swap happens here at 220ms */
  44%  { clip-path: inset(49.8% 0 49.8% 0); }
  /* re-expand with new theme */
  55%  { clip-path: inset(49.8% 0 49.8% 0); }
  80%  { clip-path: inset(5% 0 5% 0); }
  100% { clip-path: inset(0% 0 0% 0); }
}
</style>