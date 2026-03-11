<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.isOpen.value" class="modal-backdrop" @click.self="modal.settle(false)">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          ref="modalEl"
          @keydown.esc="modal.settle(false)"
          @keydown.enter="modal.settle(true)"
        >
          <!-- Scanlines overlay -->
          <div class="modal-scanlines" aria-hidden="true"></div>

          <!-- Title -->
          <div class="modal-header">
            <span :id="titleId" class="modal-title">
              {{ modal.state.value.type === 'entry' ? '[ REMOVE ENTRY ]' : '[ CLEAR HISTORY ]' }}
            </span>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <p class="modal-question">
              <template v-if="modal.state.value.type === 'entry'">
                are you sure you want to remove<br>
                <span class="modal-url">{{ modal.state.value.shortUrl }}</span><br>
                from your history?
              </template>
              <template v-else>
                are you sure you want to clear<br>
                your entire history?
              </template>
            </p>
          </div>

          <!-- Disclaimer -->
          <div class="modal-disclaimer">
            <span v-if="modal.state.value.type === 'entry'">
              removing this entry won't deactivate the shortened url
            </span>
            <span v-else>
              removing these entries won't deactivate those urls
            </span>
          </div>

          <!-- Action buttons -->
          <div class="modal-footer">
            <span class="modal-hints" aria-hidden="true">
              <kbd>esc</kbd> cancel &nbsp;·&nbsp; <kbd>enter</kbd> confirm
            </span>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--cancel" @click="modal.settle(false)">
                [ CANCEL ]
              </button>
              <button class="modal-btn modal-btn--confirm" @click="modal.settle(true)">
                [ CONFIRM ]
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useConfirmModal } from '@/composables/useConfirmModal'

  const modal   = useConfirmModal()
  const titleId = 'confirm-modal-title'
  const modalEl = ref<HTMLElement | null>(null)

  watch(modal.isOpen, (open) => {
    if (open) requestAnimationFrame(() => modalEl.value?.focus())
  })
</script>

<style scoped>
  /* ─── Backdrop ────────────────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
  }

  /* ─── Modal box ───────────────────────────────────── */
  .modal {
    font-family: 'VT323', monospace;
    min-width: 340px;
    max-width: 480px;
    width: 90%;
    background: var(--crt-header-bg);
    border: 1px solid var(--crt-border-bright);
    border-bottom: 2px solid var(--crt-border-bright);
    border-top: 2px solid var(--crt-highlight);
    border-left: 2px solid var(--crt-highlight);
    box-shadow:
      0 0 0 1px var(--crt-border-dim),
      0 0 32px rgba(0, 0, 0, 0.6),
      0 0 64px rgba(0, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    outline: none;
    position: relative;
    overflow: hidden;
    animation: modalFlicker 0.35s ease both;
  }

  /* ─── Scanlines overlay ───────────────────────────── */
  .modal-scanlines {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 10;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0, 0, 0, 0.07) 3px,
      rgba(0, 0, 0, 0.07) 4px
    );
  }

  /* ─── Header ───────────────────────────��──────────── */
  .modal-header {
    padding: 0.7rem 1rem 0.5rem;
    border-bottom: 1px solid var(--crt-border-dim);
    box-shadow: 0 1px 0 var(--crt-border-dim);
    position: relative;
    z-index: 20;
  }

  .modal-title {
    font-size: 1.3rem;
    letter-spacing: 0.18em;
    color: var(--crt-error);
    text-shadow:
      0 0 8px var(--crt-error-glow),
      0 0 20px var(--crt-error-glow);
    animation: textPulse 3s ease-in-out infinite;
  }

  /* ─── Body ────────────────────────────────────────── */
  .modal-body {
    padding: 1rem 1rem 0.5rem;
    position: relative;
    z-index: 20;
  }

  .modal-question {
    font-size: 1.15rem;
    letter-spacing: 0.08em;
    line-height: 1.55;
    color: var(--crt-highlight);
  }

  .modal-url {
    color: var(--crt-highlight);
    text-shadow: 0 0 8px var(--crt-glow);
    word-break: break-all;
  }

  /* ─── Disclaimer ──────────────────────────────────── */
  .modal-disclaimer {
    padding: 0.5rem 1rem 0.75rem;
    font-size: 0.88rem;
    letter-spacing: 0.07em;
    color: var(--crt-text);
    opacity: 0.7;
    border-bottom: 1px solid var(--crt-border-dim);
    position: relative;
    z-index: 20;
  }

  /* ─── Footer ──────────────────────────────────────── */
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    position: relative;
    z-index: 20;
  }

  /* Keyboard hint */
  .modal-hints {
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: var(--crt-text);
    opacity: 0.45;
    white-space: nowrap;
  }

  kbd {
    font-family: 'VT323', monospace;
    font-size: 0.78rem;
    border: 1px solid var(--crt-border-bright);
    padding: 0 0.3em;
    opacity: 0.8;
  }

  .modal-actions {
    display: flex;
    gap: 0.5rem;
  }

  .modal-btn {
    font-family: 'VT323', monospace;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.15em 0.4em;
    transition: color 0.12s, opacity 0.12s, text-shadow 0.12s;
    outline: none;
  }

  .modal-btn:focus-visible {
    outline: 1px solid var(--crt-highlight);
    outline-offset: 2px;
  }

  .modal-btn--cancel {
    color: var(--crt-text);
    opacity: 0.7;
  }

  .modal-btn--cancel:hover { color: var(--crt-highlight); opacity: 1; }

  .modal-btn--confirm {
    color: var(--crt-error);
    text-shadow: 0 0 8px var(--crt-error-glow);
  }

  .modal-btn--confirm:hover {
    text-shadow: 0 0 14px var(--crt-error-glow), 0 0 28px var(--crt-error-glow);
    opacity: 1;
  }

  /* ─── Transition ──────────────────────────────────── */
  .modal-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
  .modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
  .modal-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.98); }
  .modal-leave-to     { opacity: 0; transform: translateY(4px)  scale(0.98); }

  /* ─── Animations ──────────────────────────────────── */
  @keyframes modalFlicker {
    0%   { clip-path: inset(49% 0 49% 0); opacity: 0.4; }
    30%  { clip-path: inset(10% 0 10% 0); opacity: 0.8; }
    60%  { clip-path: inset(1%  0 1%  0); opacity: 0.95; }
    100% { clip-path: inset(0%  0 0%  0); opacity: 1; }
  }

  @keyframes textPulse {
    0%, 100% { text-shadow: 0 0 8px var(--crt-error-glow), 0 0 20px var(--crt-error-glow); }
    50%       { text-shadow: 0 0 4px var(--crt-error-glow), 0 0 10px var(--crt-error-glow); }
  }
</style>