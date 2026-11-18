import { useRef, useState } from 'react'

// Voice-to-text using the browser Web Speech API.
export function useVoice(onText) {
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const start = () => {
    if (!SR) return alert('Voice input is not supported in this browser. Try Chrome or Edge.')
    const r = new SR()
    r.lang = navigator.language || 'en-US'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim())
      }
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    rec.current = r
    r.start()
    setListening(true)
  }
  const stop = () => rec.current && rec.current.stop()
  return { listening, supported: !!SR, toggle: () => (listening ? stop() : start()) }
}
