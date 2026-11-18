import { useEffect, useState } from 'react'

const KEY = 'quicknotes.v1'
export const uid = () => Math.random().toString(36).slice(2, 10)
export const COLORS = ['#ffffff', '#fff3b0', '#ffd6d6', '#d6f5d6', '#d6e8ff', '#ead6ff']

export function newItem(type) {
  return {
    id: uid(), type, title: '', body: '', items: [], messages: [],
    tags: [], color: COLORS[0], pinned: false, archived: false, updated: Date.now(),
  }
}

export function useNotes() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  })
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(notes)) }, [notes])
  const save = (n) => setNotes((all) => {
    const x = { ...n, updated: Date.now() }
    return all.some((a) => a.id === n.id) ? all.map((a) => (a.id === n.id ? x : a)) : [x, ...all]
  })
  const remove = (id) => setNotes((all) => all.filter((a) => a.id !== id))
  return { notes, save, remove }
}

// Plain-text rendering used for sharing / export.
export function toText(n) {
  const head = n.title ? n.title + '\n' + '='.repeat(n.title.length) + '\n' : ''
  if (n.type === 'checklist') return head + n.items.map((i) => `${i.done ? '[x]' : '[ ]'} ${i.text}`).join('\n')
  if (n.type === 'conversation') return head + n.messages.map((m) => `${m.who}: ${m.text}`).join('\n')
  return head + n.body
}
