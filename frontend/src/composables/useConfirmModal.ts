import { ref, readonly } from 'vue'

export type ModalType = 'entry' | 'history'

interface ModalState {
  type:     ModalType
  shortUrl: string   // only used when type === 'entry'
}

const isOpen   = ref(false)
const state    = ref<ModalState>({ type: 'entry', shortUrl: '' })
let   _resolve = (_: boolean) => {}

export function useConfirmModal() {
  function confirm(payload: ModalState): Promise<boolean> {
    state.value  = payload
    isOpen.value = true
    return new Promise<boolean>(res => { _resolve = res })
  }

  function settle(result: boolean) {
    isOpen.value = false
    _resolve(result)
  }

  return {
    isOpen:  readonly(isOpen),
    state:   readonly(state),
    confirm,
    settle,
  }
}