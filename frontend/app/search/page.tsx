'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

const MOCK_LOCATIONS = [
  { id: 1, name: 'Stadtpark Mitte', tags: ['Park', 'Natur'] },
  { id: 2, name: 'Altes Rathaus', tags: ['Geschichte', 'Architektur'] },
  { id: 3, name: 'Hafenpromenade', tags: ['Wasser', 'Spaziergang'] },
  { id: 4, name: 'Kunstmuseum Nord', tags: ['Kunst', 'Kultur'] },
  { id: 5, name: 'Botanischer Garten', tags: ['Natur', 'Park'] },
]

const ALL_TAGS = [...new Set(MOCK_LOCATIONS.flatMap(loc => loc.tags))]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const router = useRouter()

  const results = useMemo(() => {
    return MOCK_LOCATIONS.filter(loc => {
      const matchesName = loc.name.toLowerCase().includes(query.toLowerCase())
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every(t => loc.tags.includes(t))
      return matchesName && matchesTags
    })
  }, [query, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-white w-screen overflow-x-hidden sm:w-full sm:max-w-lg sm:mx-auto sm:shadow-lg">

      
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3">

        {/* Zurück zu Suchfeld */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/map')}
            className="text-gray-500 text-xl"
          >
            ←
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              autoFocus
              type="text"
              placeholder="Suchen..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filter von Tags */}
        <div className="flex gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm border transition-all ${
                selectedTags.includes(tag)
                  ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Liste mit Orten */}
      <div>
        {results.length === 0 ? (
          <p className="text-center text-gray-400 text-sm pt-12">
            Keine Ergebnisse gefunden
          </p>
        ) : (
          results.map(loc => (
            <div
              key={loc.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-base">
                📍
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 mb-1">{loc.name}</p>
                <div className="flex gap-1 flex-wrap">
                  {loc.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-gray-300 text-sm">›</span>
            </div>
          ))
        )}
      </div>

      {/* Anzahl von Orten */}
      <p className="text-center text-xs text-gray-300 py-4">
        {results.length} {results.length === 1 ? 'Ort' : 'Orte'} gefunden
      </p>
    </div>
  )
}