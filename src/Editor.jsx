import { useState } from 'react'
import { COLORS, uid, toText } from './store.js'
import { useVoice } from './useVoice.js'

export default function Editor({ note, onChange, onClose, onDelete }) {
  const [n, setN] = useState(note)
  const [draft, setDraft] = useState('')
  const [who, setWho] = useState('Me')
  const [tag, setTag] = useState('')
  const set = (patch) => { const x = { ...n, ...patch }; setN(x); onChange(x) }

  const addItem = (text) => text && set({ items: [...n.items, { id: uid(), text, done: false }] })
  const addMsg = (text) => text && set({ messages: [...n.messages, { id: uid(), who, text }] })

  const onVoice = (t) => {
    if (n.type === 'note') setN((c) => { const x = { ...c, body: (c.body ? c.body + ' ' : '') + t }; onChange(x); return x })
    else setDraft((d) => (d ? d + ' ' : '') + t)
  }
  const voice = useVoice(onVoice)

  const share = async () => {
    const text = toText(n)
    if (navigator.share) { try { await navigator.share({ title: n.title || 'Note', text }); return } catch { return } }
    await navigator.clipboard.writeText(text); alert('Copied to clipboard — paste it anywhere to share.')
  }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([toText(n)], { type: 'text/plain' }))
    a.download = (n.title || 'note') + '.txt'; a.click()
  }
  const bullet = () => set({ body: n.body + (n.body && !n.body.endsWith('\n') ? '\n' : '') + '• ' })
  const onKey = (e) => {
    if (e.key === 'Enter' && /(^|\n)• [^\n]*$/.test(n.body.slice(0, e.target.selectionStart))) {
      e.preventDefault()
      const p = e.target.selectionStart
      set({ body: n.body.slice(0, p) + '\n• ' + n.body.slice(p) })
    }
  }
  const addTag = () => { const t = tag.trim().toLowerCase(); if (t && !n.tags.includes(t)) set({ tags: [...n.tags, t] }); setTag('') }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="editor" style={{ background: n.color }} onClick={(e) => e.stopPropagation()}>
        <input className="title" placeholder="Title" value={n.title} onChange={(e) => set({ title: e.target.value })} />

        {n.type === 'note' && (
          <textarea rows={10} placeholder="Write your note…  (use • for bullets)" value={n.body}
            onChange={(e) => set({ body: e.target.value })} onKeyDown={onKey} />
        )}

        {n.type === 'checklist' && (
          <div>
            {n.items.map((i) => (
              <div className={'row ' + (i.done ? 'done' : '')} key={i.id}>
                <input type="checkbox" checked={i.done}
                  onChange={() => set({ items: n.items.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)) })} />
                <input value={i.text} onChange={(e) => set({ items: n.items.map((x) => (x.id === i.id ? { ...x, text: e.target.value } : x)) })} />
                <button className="ghost" onClick={() => set({ items: n.items.filter((x) => x.id !== i.id) })}>✕</button>
              </div>
            ))}
            <div className="row">
              <input placeholder="Add item…" value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { addItem(draft.trim()); setDraft('') } }} />
              <button onClick={() => { addItem(draft.trim()); setDraft('') }}>Add</button>
            </div>
          </div>
        )}

        {n.type === 'conversation' && (
          <div>
            <div className="chat">
              {n.messages.map((m) => (
                <div key={m.id} className={'bubble ' + (m.who === 'Me' ? 'me' : '')}><b>{m.who}</b>{m.text}</div>
              ))}
            </div>
            <div className="row">
              <input style={{ maxWidth: 90 }} value={who} onChange={(e) => setWho(e.target.value)} title="Speaker" />
              <input placeholder="Message…" value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { addMsg(draft.trim()); setDraft('') } }} />
              <button onClick={() => { addMsg(draft.trim()); setDraft('') }}>Send</button>
            </div>
          </div>
        )}

        <div className="tags">
          {n.tags.map((t) => <span className="chip" key={t} onClick={() => set({ tags: n.tags.filter((x) => x !== t) })}>#{t} ✕</span>)}
          <input className="taginput" placeholder="+ tag" value={tag} onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()} />
        </div>

        <div className="toolbar">
          <button className={voice.listening ? 'rec' : ''} onClick={voice.toggle} title="Voice to text">
            {voice.listening ? '⏹ Stop' : '🎤 Voice'}
          </button>
          {n.type === 'note' && <button onClick={bullet}>• Bullet</button>}
          {COLORS.map((c) => <span key={c} className={'dot ' + (n.color === c ? 'sel' : '')} style={{ background: c }} onClick={() => set({ color: c })} />)}
          <span className="spacer" />
          <button onClick={() => set({ pinned: !n.pinned })}>{n.pinned ? '📌 Pinned' : '📍 Pin'}</button>
          <button onClick={share}>Share</button>
          <button onClick={download}>⬇ .txt</button>
          <button onClick={() => { set({ archived: !n.archived }); onClose() }}>{n.archived ? 'Unarchive' : 'Archive'}</button>
          <button className="danger" onClick={() => { if (confirm('Delete this item?')) onDelete() }}>Delete</button>
          <button className="primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
