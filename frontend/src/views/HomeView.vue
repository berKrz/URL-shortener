<template>
  <div class="home">
    <fieldset class="home-fieldset">
      <legend class="home-legend">
        <span class="legend-text">[ SHORTURL ]</span>
      </legend>

      <div class="panel" :class="{ 'panel--error': urlStore.errors.longUrl }">
        <div class="panel-header">
          <span class="panel-label">ENTER LONG URL</span>
          <Transition name="err">
            <span v-if="urlStore.errors.longUrl" class="panel-error">
              <TriangleAlert :size="14" :stroke-width="2" class="mr-2"/>
              {{ urlStore.errors.longUrl }}
            </span>
            <span v-else class="panel-hint">paste or type below</span>
          </Transition>
        </div>
        <div class="input-row">
          <span class="input-prompt">$&gt;</span>
          <input
            v-model="longUrl"
            class="url-input"
            type="url"
            placeholder="https://example.com/very/long/url/that/needs/shortening"
            @input="urlStore.errors.longUrl = null"
            ref="inputLongURL"
            @keydown.enter="() => shorten()"
          />
        </div>
      </div>

      <div class="mode-row">
        <button
          class="mode-btn"
          :class="{ 'mode-btn--active': mode === 'auto' }"
          @click="mode = 'auto'"
        >
          <span class="mode-key">[1]</span>
          <span class="mode-label">AUTO</span>
          <span class="mode-desc">6-char generated</span>
        </button>
        <span class="mode-sep">│</span>
        <button
          class="mode-btn"
          :class="{ 'mode-btn--active': mode === 'custom' }"
          @click="mode = 'custom'"
        >
          <span class="mode-key">[2]</span>
          <span class="mode-label">CUSTOM</span>
          <span class="mode-desc">7-char chosen</span>
        </button>
      </div>

      <Transition name="panel-slide">
        <div v-if="mode === 'custom'" class="panel" :class="{ 'panel--error': urlStore.errors.customSlug }">
          <div class="panel-header">
            <span class="panel-label">CUSTOM SLUG</span>
            <Transition name="err">
              <span v-if="urlStore.errors.customSlug" class="panel-error">
                <TriangleAlert :size="14" :stroke-width="2" class="mr-2"/>
                {{ urlStore.errors.customSlug }}
              </span>
              <span v-else class="panel-hint">7–15 characters</span>
            </Transition>
          </div>
          <div class="input-row">
            <span class="input-prompt">$&gt;</span>
            <span class="input-base">url-shortener.com/</span>
            <input
              v-model="customSlug"
              class="url-input"
              type="text"
              placeholder="myCustomSlug"
              maxlength="15"
              @input="urlStore.errors.customSlug = null"
              @keydown.enter="() => shorten()"
            />
            <span class="char-counter">{{ customSlug.length }}/15</span>
          </div>
        </div>
      </Transition>

      <!-- Duplicate found panel -->
      <Transition name="panel-slide">
        <div v-if="duplicateUrl" class="panel panel--result" aria-live="polite">
          <div class="panel-header">
            <span class="panel-label">ALREADY SHORTENED</span>
            <span class="result-status">duplicate found</span>
          </div>
          <div class="result-row">
            <a class="result-url" :href="duplicateUrl" target="_blank" rel="noopener noreferrer">{{ duplicateUrl }}</a>
            <button class="result-action" @click="copy(duplicateUrl, true)">
              <Check v-if="copied" :size="14" :stroke-width="2" />
              <Copy  v-else        :size="14" :stroke-width="2" />
              {{ copied ? 'COPIED' : 'COPY' }}
            </button>
            <a class="result-action" :href="duplicateUrl" target="_blank" rel="noopener noreferrer" @click="promoteDuplicate">
              <ExternalLink :size="14" :stroke-width="2" />
              OPEN
            </a>
            <button class="result-action result-action--new" @click="() => shorten(true)">
              <Plus :size="14" :stroke-width="2" />
              CREATE NEW
            </button>
          </div>
        </div>
      </Transition>

      <!-- Result panel -->
      <Transition name="panel-slide">
        <div v-if="result" class="panel panel--result" aria-live="polite">
          <div class="panel-header">
            <span class="panel-label">SHORTENED URL</span>
            <div class="result-header-actions">
              <span class="result-status">ready</span>
              <button class="reset-btn" @click="reset">
                <RotateCcw :size="11" :stroke-width="2.5" />
                RESET
              </button>
            </div>
          </div>
          <div class="result-row">
            <a class="result-url" :href="result" target="_blank" rel="noopener noreferrer">{{ result }}</a>
            <button class="result-action" @click="copy(result)">
              <Check v-if="copied" :size="14" :stroke-width="2" />
              <Copy  v-else        :size="14" :stroke-width="2" />
              {{ copied ? 'COPIED' : 'COPY' }}
            </button>
            <a class="result-action" :href="result" target="_blank" rel="noopener noreferrer">
              <ExternalLink :size="14" :stroke-width="2" />
              OPEN
            </a>
          </div>
        </div>
      </Transition>

      <Transition name="panel-slide">
        <div v-if="urlStore.errorMessage" class="panel panel--error">
          <div class="panel-header">
            <span class="panel-error">
              <TriangleAlert :size="14" :stroke-width="2" />
              {{ urlStore.errorMessage }}
            </span>
            <button class="retry-btn" @click="() => shorten()" :disabled="loading">
              <RefreshCw :size="11" :stroke-width="2.5" />
              RETRY
            </button>
          </div>
        </div>
      </Transition>

      <div class="submit-row">
        <button class="submit-btn" @click="() => shorten()" :disabled="loading">
          <span class="submit-bracket">[</span>
          <span class="submit-text">{{ loading ? 'WORKING' + dotsText : 'SHORTEN' }}</span>
          <span class="submit-bracket">]</span>
          <span v-if="!loading" class="submit-cursor">{{ '▮' }}</span>
        </button>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
  import { useUrlStore } from '@/stores/urlStore'
  import { Check, Copy, ExternalLink, Plus, RefreshCw, RotateCcw, TriangleAlert } from 'lucide-vue-next'
  import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

  type Mode = 'auto' | 'custom'

  const urlStore     = useUrlStore()
  const mode         = ref<Mode>('auto')
  const longUrl      = ref('')
  const customSlug   = ref('')
  const result       = ref('')
  const copied       = ref(false)
  const loading      = ref(false)
  const inputLongURL = useTemplateRef<HTMLInputElement>('inputLongURL')

  // Duplicate state
  const duplicateUrl = ref('')

  // Loading animation
  const loadingFrame = ref(0)
  let loadingTimer: ReturnType<typeof setInterval> | null = null
  const dotsText     = computed(() => ['', '.', '..', '...'][loadingFrame.value])

  function startLoading() {
    loading.value      = true
    loadingFrame.value = 0
    loadingTimer = setInterval(() => {
      loadingFrame.value = (loadingFrame.value + 1) % 4
    }, 180)
  }

  function stopLoading() {
    if (loadingTimer) clearInterval(loadingTimer)
    loadingTimer = null
    loading.value = false
  }

  // Keyboard navigation
  function keyboardNavigation(e: KeyboardEvent) {
    // Ignore if an input or textarea is focused
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if (e.key === '1') {
      mode.value = 'auto'
    } else if (e.key === '2') {
      mode.value = 'custom'
    }
  }

  onMounted(() => {
    inputLongURL.value?.focus()
    window.addEventListener('keydown', keyboardNavigation)
  })

  onUnmounted(() => {
    if (loadingTimer) clearInterval(loadingTimer)
    window.removeEventListener('keydown', keyboardNavigation)
  })

  watch(mode, (newMode) => {
    if (newMode === 'auto') {
      customSlug.value = ''
      urlStore.clearFieldError('customSlug')
    }
  })

  async function shorten(force = false) {
    duplicateUrl.value = ''
    result.value       = ''
    startLoading()
    const outcome = await urlStore.shorten(longUrl.value, mode.value, customSlug.value, force)
    stopLoading()

    if (outcome.status === 'ok') {
      result.value = outcome.shortUrl
      copied.value = false
    } else if (outcome.status === 'duplicate') {
      duplicateUrl.value = outcome.existingShortUrl
      copied.value       = false
    }
  }

  // Promotes the duplicate to the result panel and bumps it in history.
  // Called by both COPY and OPEN on the duplicate panel.
  function promoteDuplicate() {
    urlStore.addOrTouchEntry({
      originalUrl: longUrl.value.trim(),
      shortUrl:    duplicateUrl.value,
      mode:        'auto',
    })
    result.value       = duplicateUrl.value
    duplicateUrl.value = ''
    copied.value       = false
  }

  // Unified copy — optionally promotes a duplicate to the result panel first.
  async function copy(url: string, promote = false) {
    if (promote) promoteDuplicate()
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }

  function reset() {
    result.value       = ''
    duplicateUrl.value = ''
    longUrl.value      = ''
    customSlug.value   = ''
    mode.value         = 'auto'
    copied.value       = false
    urlStore.errors.longUrl    = null
    urlStore.errors.customSlug = null
    urlStore.errorMessage      = null
    inputLongURL.value?.focus()
  }
</script>

<style scoped>
  .home {
    font-family: 'VT323', monospace;
    display: flex;
    flex-direction: column;
    max-width: 720px;
    margin: 2rem auto 0;
    padding: 0 1rem;
  }

  /* ─── Fieldset ────────────────────────────────────── */
  .home-fieldset {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    border: 1px solid var(--crt-border-bright);
    border-top: 2px solid var(--crt-text);
    border-left: 2px solid var(--crt-text);
    padding: 1.2rem 1.2rem 1.4rem;
    border-radius: 0;
    animation: fadeIn 0.4s ease both;
    position: relative;
    background: rgba(0, 0, 0, 0.12);
    box-shadow:
      inset 0 0 24px rgba(0, 0, 0, 0.3),
      0 0 0 1px var(--crt-border-dim),
      0 4px 32px rgba(0, 0, 0, 0.35);
  }

  /* ─── Legend ──────────────────────────────────────── */
  .home-legend {
    font-family: 'VT323', monospace;
    font-size: 1.4rem;
    letter-spacing: 0.12em;
    padding: 0 0.6em;
    margin-left: 0.5em;
    color: var(--crt-text);
    background: var(--crt-header-bg);
    border: 1px solid var(--crt-border-bright);
    box-shadow: 0 0 10px var(--crt-glow-wide);
  }

  .legend-text {
    color: var(--crt-highlight);
    text-shadow: 0 0 10px var(--crt-glow), 0 0 24px var(--crt-glow-wide);
    letter-spacing: 0.2em;
  }

  /* ─── Panel ───────────────────────────────────────── */
  .panel {
    border: 1px solid var(--crt-border-bright);
    background: rgba(0, 0, 0, 0.15);
    animation: fadeIn 0.4s ease 0.1s both;
    transition: border-color 0.2s ease;
  }

  .panel--error  { border-color: var(--crt-error); }
  .panel--result { border-color: var(--crt-highlight); background: rgba(0, 0, 0, 0.2); }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.35em 0.9em;
    background: var(--crt-header-bg);
    font-size: 1rem;
    letter-spacing: 0.12em;
    min-height: 2em;
  }

  .panel-label { color: var(--crt-highlight); }

  .panel-hint {
    color: var(--crt-text);
    font-size: 0.9rem;
    letter-spacing: 0.08em;
  }

  .panel-error {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    color: var(--crt-error);
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    text-shadow: 0 0 6px var(--crt-error-glow);
    animation: errShake 0.3s ease both;
  }

  /* ─── Inputs ─────────────────────────────────────── */
  .input-row {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.6em 0.9em;
  }

  .input-prompt {
    color: var(--crt-text);
    font-size: 1.2rem;
    flex-shrink: 0;
    user-select: none;
  }

  .input-base {
    color: var(--crt-text);
    font-size: 1.2rem;
    letter-spacing: 0.05em;
    flex-shrink: 0;
    user-select: none;
    opacity: 0.7;
  }

  .url-input {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--crt-text);
    outline: none;
    font-family: 'VT323', monospace;
    font-size: 1.2rem;
    letter-spacing: 0.08em;
    color: var(--crt-highlight);
    caret-color: var(--crt-highlight);
    padding: 0.1em 0.2em;
    width: 100%;
    transition: border-color 0.15s, text-shadow 0.15s;
  }

  .url-input::placeholder { color: var(--crt-text); opacity: 0.55; }

  .url-input:focus {
    border-bottom-color: var(--crt-highlight);
    text-shadow: 0 0 6px var(--crt-glow);
  }

  .char-counter {
    flex-shrink: 0;
    color: var(--crt-text);
    font-size: 1rem;
    letter-spacing: 0.08em;
  }

  /* ─── Mode selector ───────────────────────────────── */
  .mode-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    letter-spacing: 0.1em;
    animation: fadeIn 0.4s ease 0.15s both;
    padding-top: 0.2rem;
  }

  .mode-sep { color: var(--crt-text); opacity: 0.6; }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 0.4em;
    background: none;
    border: 1px solid var(--crt-text);
    font-family: 'VT323', monospace;
    font-size: 1.1rem;
    letter-spacing: 0.1em;
    color: var(--crt-text);
    cursor: pointer;
    padding: 0.15em 0.6em;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
    outline: none;
  }

  .mode-btn:hover          { color: var(--crt-highlight); border-color: var(--crt-highlight); }
  .mode-btn:focus-visible  { outline: 1px solid var(--crt-highlight); outline-offset: 2px; }
  .mode-btn--active        { color: var(--crt-header-bg); background: var(--crt-text); border-color: var(--crt-text); }
  .mode-btn--active:hover  { color: var(--crt-header-bg); background: var(--crt-highlight); border-color: var(--crt-highlight); }

  .mode-key  { font-size: 0.95rem; opacity: 0.8; }
  .mode-desc { font-size: 0.9rem; opacity: 0.75; letter-spacing: 0.06em; }

  /* ─── Retry button ────────────────────────────────── */
  .retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    background: none;
    border: 1px solid var(--crt-error);
    font-family: 'VT323', monospace;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    color: var(--crt-error);
    cursor: pointer;
    padding: 0.05em 0.4em;
    transition: color 0.12s, background 0.12s, box-shadow 0.12s;
    outline: none;
    line-height: 1;
  }

  .retry-btn:hover         { background: var(--crt-error); color: var(--crt-header-bg); box-shadow: 0 0 8px var(--crt-error-glow); }
  .retry-btn:disabled      { opacity: 0.4; cursor: not-allowed; }
  .retry-btn:focus-visible { outline: 1px solid var(--crt-error); outline-offset: 2px; }

  /* ─── Submit ──────────────────────────────────────── */
  .submit-row {
    display: flex;
    animation: fadeIn 0.4s ease 0.2s both;
    padding-top: 0.2rem;
  }

  .submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    background: none;
    border: 1px solid var(--crt-text);
    font-family: 'VT323', monospace;
    font-size: 1.4rem;
    letter-spacing: 0.2em;
    color: var(--crt-text);
    cursor: pointer;
    padding: 0.2em 1.2em;
    transition: background 0.12s, color 0.12s, text-shadow 0.12s;
    outline: none;
    text-shadow: 0 0 6px var(--crt-glow);
  }

  .submit-btn:hover          { background: var(--crt-text); color: var(--crt-header-bg); text-shadow: none; }
  .submit-btn:focus-visible  { outline: 1px solid var(--crt-highlight); outline-offset: 3px; }
  .submit-btn:disabled       { cursor: not-allowed; opacity: 0.7; }
  .submit-btn:disabled:hover { background: none; color: var(--crt-text); text-shadow: 0 0 6px var(--crt-glow); }
  .submit-btn:disabled .submit-cursor { animation: none; }

  .submit-bracket { opacity: 0.7; }

  .submit-cursor {
    animation: blink 0.9s step-end infinite;
    margin-left: 0.1em;
    opacity: 0.8;
  }

  /* ─── Result ──────────────────────────────────────── */
  .result-status {
    color: var(--crt-text);
    font-size: 0.95rem;
    letter-spacing: 0.1em;
    text-shadow: 0 0 6px var(--crt-glow);
  }

  .result-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4em 0.75em;
    flex-wrap: wrap;
  }

  .result-url {
    flex: 1;
    color: var(--crt-highlight);
    font-size: 1.2rem;
    letter-spacing: 0.08em;
    text-shadow: 0 0 8px var(--crt-glow);
    word-break: break-all;
    text-decoration: none;
    transition: text-shadow 0.12s;
  }

  .result-url:hover { text-shadow: 0 0 14px var(--crt-glow), 0 0 28px var(--crt-glow-wide); }

  .result-header-actions {
    display: flex;
    align-items: center;
    gap: 0.75em;
  }

  .result-action {
    background: none;
    border: 1px solid var(--crt-text);
    font-family: 'VT323', monospace;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    color: var(--crt-text);
    cursor: pointer;
    padding: 0.1em 0.4em;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
    outline: none;
    white-space: nowrap;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
  }

  .result-action:hover         { color: var(--crt-header-bg); background: var(--crt-text); border-color: var(--crt-text); }
  .result-action:focus-visible { outline: 1px solid var(--crt-highlight); outline-offset: 2px; }

  /* Dim CREATE NEW slightly — it's a secondary action */
  .result-action--new {
    opacity: 0.6;
    font-size: 1rem;
  }

  .result-action--new:hover { opacity: 1; }

  /* ─── Reset button ────────────────────────────────── */
  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    background: none;
    border: 1px solid var(--crt-border-bright);
    font-family: 'VT323', monospace;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    color: var(--crt-border-bright);
    cursor: pointer;
    padding: 0.05em 0.4em;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
    outline: none;
    line-height: 1;
  }

  .reset-btn:hover         { color: var(--crt-error); border-color: var(--crt-error); box-shadow: 0 0 6px var(--crt-error-glow); }
  .reset-btn:focus-visible { outline: 1px solid var(--crt-error); outline-offset: 2px; }

  /* ─── Transitions ─────────────────────────────────── */
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.25s ease;
    max-height: 200px;
    overflow: hidden;
  }

  .panel-slide-enter-from,
  .panel-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px);
    max-height: 0;
  }

  .err-enter-active, .err-leave-active { transition: opacity 0.15s ease; }
  .err-enter-from,  .err-leave-to      { opacity: 0; }

  /* ─── Animations ──────────────────────────────────── */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes blink {
    0%, 100% { opacity: 0.8; }
    50%       { opacity: 0; }
  }

  @keyframes errShake {
    0%   { transform: translateX(0); }
    25%  { transform: translateX(-4px); }
    50%  { transform: translateX(4px); }
    75%  { transform: translateX(-3px); }
    100% { transform: translateX(0); }
  }
</style>