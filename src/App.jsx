import { useMemo, useState } from 'react'
import { useNotes, newItem } from './store.js'
import Editor from './Editor.jsx'

const TYPES = [
  ['note', '📝 Note'], ['checklist', '✅ Checklist / To-do'], ['conversation', '💬 Conversation'],
]

export default function App() {
  const { notes, save, remove } = useNotes()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | note | checklist | conversation | archived | tag:x
  const [openId, setOpenId] = useState(null)
  const [draft, setDraft] = useState(null)

  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes])
  const shown = notes
    .filter((n) => (filter === 'archived' ? n.archived : !n.archived))
    .filter((n) => filter === 'all' || filter === 'archived' || (filter.startsWith('tag:') ? n.tags.includes(filter.slice(4)) : n.type === filter))
    .filter((n) => {
      const s = q.toLowerCase()
      return !s || (n.title + n.body + n.items.map((i) => i.text).join(' ') + n.messages.map((m) => m.text).join(' ') + n.tags.join(' ')).toLowerCase().includes(s)
    })
    .sort((a, b) => b.pinned - a.pinned || b.updated - a.updated)

  const current = draft || notes.find((n) => n.id === openId)
  const create = (type) => { const n = newItem(type); setDraft(n) }
  const close = () => { setDraft(null); setOpenId(null) }
  const change = (n) => { save(n); if (draft) { setOpenId(n.id); setDraft(null) } }

  return (
    <div className="app">
      <aside>
        <h1>QuickNotes</h1>
        {TYPES.map(([t, l]) => <button key={t} className="new" onClick={() => create(t)}>+ {l}</button>)}
        <nav>
          {[['all', 'All'], ['note', 'Notes'], ['checklist', 'Checklists'], ['conversation', 'Conversations'], ['archived', 'Archive']].map(([k, l]) => (
            <a key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</a>
          ))}
          {tags.length > 0 && <small>Tags</small>}
          {tags.map((t) => <a key={t} className={filter === 'tag:' + t ? 'on' : ''} onClick={() => setFilter('tag:' + t)}>#{t}</a>)}
        </nav>
      </aside>
      <main>
        <input className="search" placeholder="🔍 Search notes, tasks, tags…" value={q} onChange={(e) => setQ(e.target.value)} />
        {shown.length === 0 && <p className="empty">Nothing here yet. Create a note, checklist or conversation to get started.</p>}
        <div className="grid">
          {shown.map((n) => {
            const done = n.items.filter((i) => i.done).length
            return (
              <div key={n.id} className="card" style={{ background: n.color }} onClick={() => setOpenId(n.id)}>
                {n.pinned && <span className="pin">📌</span>}
                <h3>{n.title || <i>Untitled</i>}</h3>
                {n.type === 'note' && <p className="pre">{n.body.slice(0, 220)}</p>}
                {n.type === 'checklist' && (
                  <>
                    <div className="bar"><div style={{ width: n.items.length ? (done / n.items.length) * 100 + '%' : 0 }} /></div>
                    <small>{done}/{n.items.length} done</small>
                    {n.items.slice(0, 5).map((i) => <div key={i.id} className={i.done ? 'strike' : ''}>{i.done ? '☑' : '☐'} {i.text}</div>)}
                  </>
                )}
                {n.type === 'conversation' && n.messages.slice(-3).map((m) => <div key={m.id}><b>{m.who}:</b> {m.text}</div>)}
                <div className="tags">{n.tags.map((t) => <span className="chip" key={t}>#{t}</span>)}</div>
              </div>
            )
          })}
        </div>
      </main>
      {current && <Editor key={current.id} note={current} onChange={change} onClose={close}
        onDelete={() => { remove(current.id); close() }} />}
    </div>
  )
}
