<template>
  <div class="crt-shell">
    <div class="crt-vignette" aria-hidden="true"></div>
    <div class="crt-scanlines" aria-hidden="true"></div>
    <div class="crt-switch" :class="{ 'crt-switch--active': isSwitching }" aria-hidden="true"></div>

    <header class="app-header">
      <NavBar />
    </header>

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <span class="footer-text">made by <span class="footer-author">berKrz</span></span>
    </footer>

    <ConfirmModal />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useDark } from '@vueuse/core'
  import NavBar      from './components/NavBar.vue'
  import ConfirmModal from './components/ConfirmModal.vue'

  const isDark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
  })

  const isSwitching = ref(false)
  watch(isDark, () => {
    isSwitching.value = true
    setTimeout(() => (isSwitching.value = false), 500)
  })
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

  /* ════════════════════════════════════════════════════
    LIGHT THEME
  ════════════════════════════════════════════════════ */
  :root,
  [data-theme='light'] {
    --crt-bg:            #3b6e8f;
    --crt-bg-deep:       #2d5570;
    --crt-header-bg:     #1a3a52;
    --crt-text:          #c8eaff;
    --crt-highlight:     #ffffff;
    --crt-border-bright: #5ba3c9;
    --crt-border-dim:    #28607f;
    --crt-glow:          rgba(200, 234, 255, 0.5);
    --crt-glow-wide:     rgba(200, 234, 255, 0.18);
    --crt-error:         #ff6b6b;
    --crt-error-glow:    rgba(255, 107, 107, 0.4);
  }

  /* ════════════════════════════════════════════════════
    DARK THEME
  ════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --crt-bg:            #0c1a2e;
    --crt-bg-deep:       #08111f;
    --crt-header-bg:     #0a1628;
    --crt-text:          #4ab3e8;
    --crt-highlight:     #7dd4f8;
    --crt-border-bright: #1e5080;
    --crt-border-dim:    #143350;
    --crt-glow:          rgba(74, 179, 232, 0.55);
    --crt-glow-wide:     rgba(74, 179, 232, 0.2);
    --crt-error:         #ff4444;
    --crt-error-glow:    rgba(255, 68, 68, 0.35);
  }

  /* ─── Reset ───────────────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    width: 100%;
    height: 100%;
    overflow: hidden !important;
    background-color: var(--crt-bg-deep);
  }

  #app {
    width: 100%;
    height: 100%;
  }

  .crt-shell {
    font-family: 'VT323', monospace;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    color: var(--crt-text);
    background: radial-gradient(
      ellipse 90% 60% at 50% 35%,
      color-mix(in srgb, var(--crt-bg) 80%, white 20%) 0%,
      var(--crt-bg) 45%,
      var(--crt-bg-deep) 100%
    );
    transition: background 0.4s ease, color 0.4s ease;
    animation: bootUp 0.7s ease both;
    overflow: hidden !important;
  }

  .app-header {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .app-main {
    flex: 1;
    overflow: hidden !important;
    padding: 1.5rem;
  }

  .app-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.3em 1.5rem;
    background: var(--crt-header-bg);
    border-top: 1px solid var(--crt-border-dim);
    font-family: 'VT323', monospace;
    font-size: 1rem;
    letter-spacing: 0.12em;
  }

  .footer-text {
    color: var(--crt-highlight);
  }

  .footer-author {
    color: var(--crt-text);
    text-shadow: 0 0 6px var(--crt-glow);
    letter-spacing: 0.18em;
  }

  /* ─── Overlays ────────────────────────────────────── */
  .crt-switch {
    pointer-events: none;
    position: fixed;
    inset: 0;
    background: var(--crt-bg-deep);
    z-index: 300;
    clip-path: inset(50% 0 50% 0);
    opacity: 0;
  }

  .crt-switch--active {
    animation: crtSwitch 0.5s ease both;
  }

  .crt-scanlines {
    pointer-events: none;
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0, 0, 0, 0.09) 3px,
      rgba(0, 0, 0, 0.09) 4px
    );
    z-index: 200;
  }

  .crt-vignette {
    pointer-events: none;
    position: fixed;
    inset: 0;
    background: radial-gradient(
      ellipse 100% 100% at 50% 50%,
      transparent 55%,
      rgba(0, 0, 0, 0.45) 100%
    );
    z-index: 199;
  }

  /* ─── Page transition ─────────────────────────────── */
  .page-enter-active,
  .page-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
  .page-enter-from   { opacity: 0; transform: translateY(6px); }
  .page-leave-to     { opacity: 0; transform: translateY(-6px); }

  /* ─── Animations ──────────────────────────────────── */
  @keyframes bootUp {
    0%   { clip-path: inset(49.8% 0 49.8% 0); }
    35%  { clip-path: inset(18% 0 18% 0); }
    65%  { clip-path: inset(2% 0 2% 0); }
    100% { clip-path: inset(0% 0 0% 0); }
  }

  @keyframes crtSwitch {
    0%   { clip-path: inset(0% 0 0% 0);       opacity: 1; }
    40%  { clip-path: inset(49.8% 0 49.8% 0); opacity: 1; }
    60%  { clip-path: inset(49.8% 0 49.8% 0); opacity: 1; }
    100% { clip-path: inset(0% 0 0% 0);       opacity: 0; }
  }
</style>