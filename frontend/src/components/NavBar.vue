<template>
  <nav class="navbar">
    <div class="navbar-chrome">
      <span class="navbar-label">[ shorturl ]</span>

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
        @click="toggleDark()"
      >
        <span class="toggle-track" :class="{ 'toggle-track--dark': isDark }">
          <span class="toggle-thumb" :class="{ 'toggle-thumb--dark': isDark }">
            <Sun  v-if="!isDark" class="toggle-icon" :size="12" :stroke-width="2" />
            <Moon v-else         class="toggle-icon" :size="12" :stroke-width="2" />
          </span>
        </span>
        <span class="toggle-label">{{ isDark ? 'DARK' : 'LIGHT' }}</span>
      </button>
    </div>

    <div class="navbar-scanline" aria-hidden="true"></div>
  </nav>
</template>

<script setup lang="ts">
  import { useDark, useToggle } from '@vueuse/core'
  import { Moon, Sun } from 'lucide-vue-next'
  import { RouterLink } from 'vue-router'

  const isDark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
  })
  const toggleDark = useToggle(isDark)
</script>

<style scoped>
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
    color: var(--crt-highlight);
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
    padding: 0.05em 0.5em;
    transition: color 0.12s, text-shadow 0.12s, background 0.12s;
    /* focus style */
    outline: none;
  }

  /* Keyboard focus — terminal-style block cursor ring */
  .nav-link:focus-visible {
    outline: 1px solid var(--crt-border-bright);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--crt-glow);
  }

  .nav-bracket {
    color: var(--crt-highlight);
    transition: color 0.12s;
  }

  .nav-text {
    letter-spacing: 0.18em;
  }

  /* Active: MC-style filled block highlight */
  .nav-link--active {
    background: var(--crt-highlight);
    color: var(--crt-header-bg);
    text-shadow: none;
  }

  .nav-link--active .nav-bracket {
    color: var(--crt-header-bg);
    opacity: 0.6;
  }

  .nav-link:hover:not(.nav-link--active) .nav-bracket {
    color: var(--crt-highlight);
  }

  .nav-link:hover:not(.nav-link--active) {
    color: var(--crt-highlight);
    text-shadow: 0 0 6px var(--crt-glow), 0 0 18px var(--crt-glow-wide);
  }

  .nav-link:hover:not(.nav-link--active) .nav-text::after {
    content: '▮';
    margin-left: 3px;
    animation: blink 0.85s step-end infinite;
  }

  /* ─── Theme Toggle ───────────────────────────────── */
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
    color: var(--crt-highlight);
    padding: 0;
    animation: fadeInRight 0.5s ease both;
    transition: color 0.15s;
    outline: none;
  }

  .theme-toggle:focus-visible {
    outline: 1px solid var(--crt-border-bright);
    outline-offset: 4px;
    box-shadow: 0 0 0 2px var(--crt-glow);
  }

  .theme-toggle:hover {
    color: var(--crt-highlight);
  }

  .toggle-track {
    display: flex;
    align-items: center;
    width: 2.8em;
    height: 1.4em;
    border-radius: 0;
    border: 1px solid var(--crt-border-bright);
    background: var(--crt-bg-deep);
    padding: 0.1em;
    position: relative;
    transition: background 0.25s, border-color 0.25s;
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.4);
  }

  .toggle-track--dark {
    background: var(--crt-header-bg);
    border-color: var(--crt-highlight);
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

  .toggle-label {
    min-width: 2.8em;
    text-align: left;
  }

  /* ─── Scanline ───────────────────────────────────── */
  /* Raised above content but pointer-events none,
    lower opacity so it doesn't clip text rendering */
  .navbar-scanline {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0, 0, 0, 0.05) 3px,
      rgba(0, 0, 0, 0.05) 4px
    );
    z-index: 1;
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
</style>