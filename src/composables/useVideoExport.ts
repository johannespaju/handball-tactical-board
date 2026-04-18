import { ref, watch } from 'vue'
import { usePlay, getKonvaStage } from './usePlay'

const isRecording = ref(false)

export function useVideoExport() {
  const { play, isPlaying, steps } = usePlay()
  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let rafId: number | null = null

  function compositeFrame(ctx: CanvasRenderingContext2D, stage: any) {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    ctx.clearRect(0, 0, w, h)
    for (const layer of stage.getLayers()) {
      const c = layer.getCanvas?.()
      const el = c?._canvas ?? c?.getElement?.() ?? (typeof layer.toCanvas === 'function' ? layer.toCanvas() : null)
      if (el) ctx.drawImage(el, 0, 0, el.width, el.height, 0, 0, w, h)
    }
  }

  function stopRecording() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
    mediaRecorder?.stop()
  }

  function exportVideo() {
    console.log('[export] click', { isRecording: isRecording.value, steps: steps.length })
    if (isRecording.value) {
      // Defensive: if a previous attempt left us stuck, recover.
      console.warn('[export] isRecording was true on entry — resetting')
      isRecording.value = false
    }
    if (steps.length <= 1) { console.warn('[export] need >1 step'); return }
    const stage = getKonvaStage()
    if (!stage) { console.warn('[export] no Konva stage'); return }

    const offscreen = document.createElement('canvas')
    offscreen.width = stage.width() || 900
    offscreen.height = stage.height() || 600
    const ctx = offscreen.getContext('2d')!

    // Draw the first frame before capturing so the stream has data immediately.
    try {
      compositeFrame(ctx, stage)
    } catch (err) {
      console.error('[export] initial composite failed', err)
      return
    }

    let stream: MediaStream
    try {
      stream = offscreen.captureStream(60)
    } catch (err) {
      console.error('[export] captureStream failed', err)
      return
    }

    const candidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ]
    const mimeType = candidates.find(m => MediaRecorder.isTypeSupported(m)) ?? ''
    try {
      mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
    } catch (err) {
      console.error('[export] MediaRecorder init failed', err)
      return
    }
    chunks = []

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    mediaRecorder.onerror = (e) => {
      console.error('[export] MediaRecorder error', e)
      isRecording.value = false
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
    }
    mediaRecorder.onstop = () => {
      isRecording.value = false
      if (!chunks.length) return
      const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || mimeType || 'video/webm' })
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `play-export.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    }

    function recordFrame() {
      compositeFrame(ctx, stage)
      rafId = requestAnimationFrame(recordFrame)
    }

    try {
      mediaRecorder.start()
    } catch (err) {
      console.error('[export] MediaRecorder.start failed', err)
      return
    }
    isRecording.value = true
    recordFrame()
    play()
  }

  watch(isPlaying, (val) => {
    if (!val && isRecording.value) stopRecording()
  })

  return { isRecording, exportVideo }
}
