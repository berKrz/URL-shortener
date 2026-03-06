<template>
  <div class="history">
    <fieldset class="history-fieldset">
      <legend class="history-legend">
        <span class="legend-text">[ HISTORY ]</span>
      </legend>

      <div v-if="store.history.length === 0" class="empty-state">
        <span class="empty-prompt">$&gt;</span>
        <span class="empty-text">
          no urls shortened yet
          <span class="empty-text-underline">_</span>
        </span>
      </div>

      <template v-else>
        <div class="history-toolbar">
          <span class="history-count">
            {{ store.history.length }} record{{ store.history.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="entry-list">
          <TransitionGroup name="entry">
            <fieldset
              v-for="entry in [...store.history].reverse()"
              :key="entry.shortUrl"
              class="entry-fieldset"
              :class="`entry-fieldset--${entry.mode}`"
            >
              <legend class="entry-legend">
                {{ entry.mode }}
              </legend>

              <div class="entry-short-row">
                <a
                  class="entry-short"
                  :href="entry.shortUrl"
                  target="_blank"
                  rel="noopener"
                  title="Opens in a new tab"
                >{{ entry.shortUrl }}</a>
                <button class="entry-copy" @click="copy(entry)">
                  <Check v-if="copiedKey === entry.originalUrl + entry.createdAt" :size="13" :stroke-width="2" />
                  <Copy  v-else :size="13" :stroke-width="2" />
                </button>
              </div>

              <div class="entry-footer">
                <span class="entry-original">{{ entry.originalUrl }}</span>
                <span class="entry-date">{{ formatDate(entry.createdAt) }}</span>
              </div>

            </fieldset>
          </TransitionGroup>
        </div>
      </template>

    </fieldset>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useUrlStore } from '@/stores/urlStore'
  import { Copy, Check } from 'lucide-vue-next'
  import type { HistoryEntry } from '@/stores/urlStore'

  const store     = useUrlStore()
  const copiedKey = ref<string | null>(null)

  function formatDate(iso: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  }

  async function copy(entry: HistoryEntry) {
    await navigator.clipboard.writeText(entry.shortUrl)
    copiedKey.value = entry.originalUrl + entry.createdAt
    setTimeout(() => (copiedKey.value = null), 2000)
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

  .history {
    font-family: 'VT323', monospace;
    display: flex;
    flex-direction: column;
    max-width: 720px;
    margin: 2rem auto 0;
    padding: 0 1rem;
  }

  /* ─── Outer Fieldset + Legend ─────────────────────── */
  .history-fieldset {
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

  .history-legend {
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

  /* ─── Empty state ─────────────────────────────────── */
  .empty-state {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 1rem 0.2rem;
    opacity: 0.5;
  }

  .empty-prompt { color: var(--crt-text); font-size: 1.2rem; }

  .empty-text {
    color: var(--crt-text);
    font-size: 1.1rem;
    letter-spacing: 0.1em;
  }

  .empty-text-underline {
    animation: blink-text 1.2s step-end infinite;
  }

  /* ─── Toolbar ─────────────────────────────────────── */
  .history-toolbar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--crt-border-dim);
    padding-bottom: 0.6rem;
  }

  .history-count {
    color: var(--crt-text);
    font-size: 0.95rem;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  /* ─── Entry list ──────────────────────────────────── */
  .entry-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* ─── Entry fieldset ──────────────────────────────── */
  .entry-fieldset {
    border: 1px solid var(--crt-border-bright);  /* same for both modes — rolled back */
    background: rgba(0, 0, 0, 0.15);
    padding: 0.1rem 0.75rem 0.5rem;
    transition: border-color 0.15s;
  }

  .entry-fieldset:hover { border-color: var(--crt-text); }

  /* ─── Entry legend (the badge) ────────────────────── */
  .entry-legend {
    font-family: 'VT323', monospace;
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0 0.5em;
    margin-left: 0.25em;
    color: var(--crt-header-bg);
    line-height: 1.5;
    border: 1px solid var(--crt-text);
    border-bottom: none;
    background: var(--crt-text);
  }

  /* ─── Short URL row ───────────────────────────────── */
  .entry-short-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75em;
    padding: 0.3em 0 0.3em;
    border-bottom: 1px solid var(--crt-border-dim);
  }

  .entry-short {
    color: var(--crt-highlight);
    font-size: 1.35rem;
    letter-spacing: 0.1em;
    text-shadow: 0 0 8px var(--crt-glow);
    text-decoration: none;
    transition: text-shadow 0.12s;
    word-break: break-all;
    line-height: 1.1;
  }

  .entry-short:hover {
    text-shadow: 0 0 14px var(--crt-glow), 0 0 28px var(--crt-glow-wide);
  }

  .entry-copy {
    flex-shrink: 0;
    display: inline-flex;
    background: none;
    border: none;
    color: var(--crt-text);
    cursor: pointer;
    padding: 0.1em;
    opacity: 0.5;
    transition: color 0.12s, opacity 0.12s;
    outline: none;
  }

  .entry-copy:hover         { color: var(--crt-highlight); opacity: 1; }
  .entry-copy:focus-visible { outline: 1px solid var(--crt-highlight); outline-offset: 2px; }

  /* ─── Footer row ──────────────────────────────────── */
  .entry-footer {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1em;
    padding-top: 0.35em;
  }

  .entry-original {
    flex: 1;
    color: var(--crt-text);
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    opacity: 0.75;                /* was 0.55 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-date {
    flex-shrink: 0;
    color: var(--crt-text);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    opacity: 0.65;                /* was 0.45 */
    white-space: nowrap;
  }

  /* ─── TransitionGroup ─────────────────────────────── */
  .entry-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
  .entry-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
  .entry-enter-from   { opacity: 0; transform: translateY(-6px); }
  .entry-leave-to     { opacity: 0; transform: translateX(10px); }
  .entry-leave-active { position: absolute; width: 100%; }

  /* ─── Animations ──────────────────────────────────── */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes blink-text {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0; }
  }
</style>