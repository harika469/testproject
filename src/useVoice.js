import { useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition as NativeSR } from '@capacitor-community/speech-recognition'

// Voice-to-text: native Android speech dialog inside the app, Web Speech API in browsers.
export function useVoice(onText) {
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  const native = Capacitor.isNativePlatform()
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const startNative = async () => {
    try {
      const perm = await NativeSR.requestPermissions()
      if (perm.speechRecognition !== 'granted') return alert('Microphone permission is needed for voice input.')
      setListening(true)
      const res = await NativeSR.start({ language: navigator.language || 'en-US', maxResults: 1, popup: true, partialResults: false })
      if (res && res.matches && res.matches[0]) onText(res.matches[0])
    } catch (e) { /* cancelled */ } finally { setListening(false) }
  }

  const start = () => {
    if (native) return startNative()
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
  return { listening, supported: native || !!SR, toggle: () => (listening ? stop() : start()) }
}
