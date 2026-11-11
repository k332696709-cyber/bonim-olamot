'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { SocialPost, TaggedProfile } from '@/types/hub'
import { createClient } from '@/lib/supabase/client'
import { useConfirm } from '@/components/ui/useConfirm'

const AUTHOR_COLORS = ['text-burgundy-600', 'text-navy-600', 'text-emerald-700', 'text-orange-700', 'text-purple-700', 'text-sky-700']

function authorColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AUTHOR_COLORS[h % AUTHOR_COLORS.length]
}

function dayLabel(d: Date, isHe: boolean): string {
  const today = new Date()
  const y = new Date()
  y.setDate(today.getDate() - 1)
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(d, today)) return isHe ? 'היום' : 'Today'
  if (same(d, y)) return isHe ? 'אתמול' : 'Yesterday'
  return d.toLocaleDateString(isHe ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const clock = (d: Date) => d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

interface SocialWallProps {
  posts: SocialPost[]
  currentUserName: string
  currentUserEmail: string
  currentMatchmakerId: string
  isAdmin?: boolean
  locale: string
  onNewPost: (post: SocialPost) => void
  onDeletePost?: (id: string) => void
  taggableProfiles: TaggedProfile[]
}

/**
 * The matchmakers' internal channel, styled like a group chat: bubbles, day separators, tags that
 * link to the candidate, and delete for your own messages (admin can delete any). Staff only.
 */
export function SocialWall({
  posts, currentUserName, currentUserEmail, currentMatchmakerId, isAdmin = false, locale,
  onNewPost, onDeletePost, taggableProfiles,
}: SocialWallProps) {
  const isHe = locale === 'he'
  const { confirm, dialog } = useConfirm(isHe)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [taggedProfiles, setTaggedProfiles] = useState<TaggedProfile[]>([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Oldest first, like a chat; the page keeps newest first.
  const ordered = useMemo(() => [...posts].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()), [posts])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [ordered.length])

  const filteredProfiles = taggableProfiles.filter((p) => {
    const matchesSearch = tagSearch === '' || p.name.includes(tagSearch)
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter
    return matchesSearch && matchesGender && !taggedProfiles.find((t) => t.id === p.id)
  }).slice(0, 10)

  const mine = (p: SocialPost) => (p.authorEmail && p.authorEmail === currentUserEmail) || (!p.authorEmail && p.author === currentUserName)

  async function handleSubmit() {
    if (!content.trim() || posting) return
    const text = content.trim()
    const tags = [...taggedProfiles]
    setPosting(true)
    setError('')
    const { data, error: err } = await createClient()
      .from('social_posts')
      .insert({ author_id: currentMatchmakerId || null, content: text, tagged_profiles: tags as any, is_announcement: false })
      .select('id, created_at')
      .single()
    setPosting(false)
    if (err || !data) {
      setError(isHe ? 'ההודעה לא נשלחה. נסו שוב.' : 'Message not sent. Try again.')
      return
    }
    setContent('')
    setTaggedProfiles([])
    onNewPost({
      id: data.id, author: currentUserName, authorEmail: currentUserEmail, content: text,
      taggedProfiles: tags, createdAt: new Date(data.created_at), isAnnouncement: false,
    })
  }

  async function handleDelete(post: SocialPost) {
    const ok = await confirm(isHe ? 'למחוק את ההודעה לכולם? אי אפשר לשחזר.' : 'Delete this message for everyone? This cannot be undone.', {
      danger: true, confirmLabel: isHe ? 'מחיקה' : 'Delete',
    })
    if (!ok) return
    setBusyId(post.id)
    setError('')
    const { error: err } = await createClient().from('social_posts').delete().eq('id', post.id)
    setBusyId(null)
    if (err) {
      setError(isHe ? 'המחיקה נכשלה.' : 'Delete failed.')
      return
    }
    onDeletePost?.(post.id)
  }

  let lastDay = ''

  return (
    <div className="rounded-[28px] bg-white shadow-card border border-gray-100 overflow-hidden flex flex-col" dir={isHe ? 'rtl' : 'ltr'}>
      {dialog}

      {/* Channel header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-navy-800 text-white">
        <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">#</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold leading-tight">{isHe ? 'ערוץ השדכנים' : 'Matchmakers channel'}</p>
          <p className="text-xs text-navy-200">{isHe ? 'פנימי: רק שדכנים ומנהל רואים' : 'Internal: matchmakers and admin only'}</p>
        </div>
        <span className="text-xs bg-white/10 rounded-full px-3 py-1 tabular-nums">{ordered.length}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-[420px] overflow-y-auto px-4 py-4 flex flex-col gap-1.5 bg-[#efeae2]">
        {ordered.length === 0 && (
          <div className="m-auto text-center text-sm text-gray-500 bg-white/70 rounded-2xl px-5 py-3">
            {isHe ? 'אין הודעות עדיין. אפשר לפתוח את השיחה.' : 'No messages yet. Start the conversation.'}
          </div>
        )}
        {ordered.map((post) => {
          const label = dayLabel(post.createdAt, isHe)
          const showDay = label !== lastDay
          lastDay = label
          const own = mine(post)
          const canDelete = own || isAdmin
          return (
            <div key={post.id} className="flex flex-col">
              {showDay && (
                <div className="self-center my-2 text-[11px] font-medium text-gray-600 bg-white/80 rounded-full px-3 py-1 shadow-sm">{label}</div>
              )}
              <div className={`group flex ${own ? 'justify-start' : 'justify-end'}`}>
                <div className={`relative max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm ${own ? 'bg-[#d9fdd3] rounded-ss-sm' : 'bg-white rounded-se-sm'}`}>
                  {!own && <p className={`text-xs font-bold mb-0.5 ${authorColor(post.author)}`}>{post.author}</p>}
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
                  {post.taggedProfiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {post.taggedProfiles.map((p) => (
                        <Link
                          key={p.id}
                          href={`/${locale}/matchmaker/profiles/${p.id}`}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${
                            p.gender === 'female'
                              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                              : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          @ {p.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-1">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        disabled={busyId === post.id}
                        className="text-[10px] text-gray-400 hover:text-burgundy-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                      >
                        {isHe ? 'מחיקה' : 'Delete'}
                      </button>
                    )}
                    <span className="text-[10px] text-gray-400 tabular-nums" dir="ltr">{clock(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 bg-[#f6f6f6] px-3 py-3">
        {error && <p className="text-xs text-burgundy-600 mb-2 px-1" role="alert">{error}</p>}
        {taggedProfiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 px-1">
            {taggedProfiles.map((p) => (
              <span
                key={p.id}
                className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                  p.gender === 'female' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                @ {p.name}
                <button type="button" onClick={() => setTaggedProfiles((prev) => prev.filter((t) => t.id !== p.id))} className="hover:opacity-60 font-bold text-xs">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => { setGenderFilter('all'); setTagSearch(''); setShowTagDropdown((v) => !v) }}
              title={isHe ? 'תייג מועמד/ת' : 'Tag a candidate'}
              className="w-11 h-11 rounded-full bg-white border border-navy-100 text-navy-600 font-bold hover:bg-navy-50 transition-colors"
            >
              @
            </button>
            {showTagDropdown && (
              <div className="absolute bottom-14 start-0 z-30 bg-white border border-gray-200 rounded-2xl shadow-lg w-72 p-2">
                <input
                  autoFocus
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder={isHe ? 'חיפוש שם...' : 'Search name...'}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl mb-2 outline-none focus:border-navy-400"
                />
                <div className="flex gap-1 mb-2">
                  {([
                    { key: 'all', label: isHe ? 'הכל' : 'All' },
                    { key: 'female', label: isHe ? 'מיועדות' : 'Women' },
                    { key: 'male', label: isHe ? 'מיועדים' : 'Men' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setGenderFilter(tab.key)}
                      className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${genderFilter === tab.key ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredProfiles.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">{isHe ? 'לא נמצא' : 'Not found'}</p>
                  ) : (
                    filteredProfiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setTaggedProfiles((prev) => [...prev, p]); setShowTagDropdown(false); setTagSearch(''); textareaRef.current?.focus() }}
                        className="w-full text-start text-xs px-2.5 py-2 rounded-lg hover:bg-navy-50 flex items-center gap-2 transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.gender === 'female' ? 'bg-red-400' : 'bg-blue-400'}`} />
                        <span className="font-medium text-gray-800 flex-1">{p.name}</span>
                        <span className="text-[10px] text-gray-400">{p.gender === 'female' ? (isHe ? 'מיועדת' : 'F') : isHe ? 'מיועד' : 'M'}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder={isHe ? 'כתבו הודעה לצוות...' : 'Write a message to the team...'}
            rows={1}
            maxLength={2000}
            className="flex-1 resize-none rounded-3xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-navy-400 max-h-32"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || posting}
            aria-label={isHe ? 'שליחה' : 'Send'}
            className="w-11 h-11 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className={`w-5 h-5 ${isHe ? '-scale-x-100' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 px-1">{isHe ? 'Enter לשליחה, Shift+Enter לשורה חדשה' : 'Enter to send, Shift+Enter for a new line'}</p>
      </div>
    </div>
  )
}
