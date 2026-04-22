'use client'

import { useState, useRef } from 'react'
import type { SocialPost, TaggedProfile } from '@/types/hub'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'

// Interleave female and male profiles so both genders appear in the
// default (empty-search) dropdown view, not just the first 8 females.
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = []
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (i < a.length) out.push(a[i])
    if (i < b.length) out.push(b[i])
  }
  return out
}

const ALL_TAGGABLE: TaggedProfile[] = interleave(
  MOCK_FEMALE_PROFILES.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    gender: 'female' as const,
  })),
  MOCK_MALE_PROFILES.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    gender: 'male' as const,
  })),
)

function timeAgo(date: Date, isHe: boolean): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return isHe ? 'עכשיו' : 'now'
  if (diffMin < 60) return isHe ? `לפני ${diffMin} ד׳` : `${diffMin}m ago`
  if (diffH < 24) return isHe ? `לפני ${diffH} שע׳` : `${diffH}h ago`
  return isHe ? `לפני ${diffD} ימים` : `${diffD}d ago`
}

function PostCard({ post, locale }: { post: SocialPost; locale: string }) {
  const isHe = locale === 'he'
  const initials = post.author.charAt(0)
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3" dir={isHe ? 'rtl' : 'ltr'}>
        <div className="w-9 h-9 rounded-full bg-navy-100 border border-navy-200 flex items-center justify-center
          text-sm font-bold text-navy-600 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-navy-700">{post.author}</span>
            {post.isAnnouncement && (
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                {isHe ? 'הודעה' : 'Announcement'}
              </span>
            )}
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt, isHe)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
          {post.taggedProfiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.taggedProfiles.map(p => (
                <span
                  key={p.id}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    p.gender === 'female'
                      ? 'bg-pink-50 border-pink-200 text-pink-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  @ {p.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SocialWallProps {
  posts: SocialPost[]
  currentUserName: string
  currentUserEmail: string
  locale: string
  onNewPost: (post: SocialPost) => void
}

export function SocialWall({ posts, currentUserName, currentUserEmail, locale, onNewPost }: SocialWallProps) {
  const isHe = locale === 'he'
  const [content, setContent] = useState('')
  const [taggedProfiles, setTaggedProfiles] = useState<TaggedProfile[]>([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredProfiles = ALL_TAGGABLE.filter(p => {
    const matchesSearch = tagSearch === '' || p.name.includes(tagSearch)
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter
    const notAlreadyTagged = !taggedProfiles.find(t => t.id === p.id)
    return matchesSearch && matchesGender && notAlreadyTagged
  }).slice(0, 10)

  function openTagDropdown() {
    setGenderFilter('all')
    setTagSearch('')
    setShowTagDropdown(v => !v)
  }

  function handleTagSelect(profile: TaggedProfile) {
    setTaggedProfiles(prev => [...prev, profile])
    setShowTagDropdown(false)
    setTagSearch('')
    setGenderFilter('all')
    textareaRef.current?.focus()
  }

  function removeTag(id: string) {
    setTaggedProfiles(prev => prev.filter(p => p.id !== id))
  }

  function handleSubmit() {
    if (!content.trim()) return
    onNewPost({
      id: `p_${Date.now()}`,
      author: currentUserName,
      authorEmail: currentUserEmail,
      content: content.trim(),
      taggedProfiles,
      createdAt: new Date(),
      isAnnouncement: false,
    })
    setContent('')
    setTaggedProfiles([])
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Composer ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4" dir={isHe ? 'rtl' : 'ltr'}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
          placeholder={isHe ? 'שתף עדכון, הערה, או בשורה...' : 'Share an update, note, or good news...'}
          rows={3}
          className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 outline-none leading-relaxed"
          dir={isHe ? 'rtl' : 'ltr'}
        />

        {taggedProfiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
            {taggedProfiles.map(p => (
              <span
                key={p.id}
                className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                  p.gender === 'female'
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                @ {p.name}
                <button type="button" onClick={() => removeTag(p.id)} className="hover:opacity-60 font-bold text-xs">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
          {/* Tag button */}
          <div className="relative">
            <button
              type="button"
              onClick={openTagDropdown}
              className="flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-700 transition-colors
                px-2.5 py-1.5 rounded-lg border border-navy-100 hover:border-navy-200 bg-navy-50"
            >
              <span className="font-bold">@</span>
              <span>{isHe ? 'תייג מועמד/ת' : 'Tag candidate'}</span>
            </button>

            {showTagDropdown && (
              <div
                className="absolute top-10 start-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg w-72 p-2"
                dir={isHe ? 'rtl' : 'ltr'}
              >
                {/* Search input */}
                <input
                  autoFocus
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  placeholder={isHe ? 'חפש שם...' : 'Search name...'}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg mb-2
                    outline-none focus:border-navy-400"
                  dir={isHe ? 'rtl' : 'ltr'}
                />

                {/* Gender filter tabs */}
                <div className="flex gap-1 mb-2">
                  {([
                    { key: 'all',    label: isHe ? 'הכל'       : 'All' },
                    { key: 'female', label: isHe ? 'מיועדות 👩' : 'Female 👩' },
                    { key: 'male',   label: isHe ? 'מיועדים 👨' : 'Male 👨' },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setGenderFilter(tab.key)}
                      className={`flex-1 text-[10px] font-semibold py-1 rounded-lg transition-colors
                        ${genderFilter === tab.key
                          ? 'bg-navy-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Results list */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredProfiles.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">
                      {isHe ? 'לא נמצא' : 'Not found'}
                    </p>
                  ) : (
                    filteredProfiles.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleTagSelect(p)}
                        className="w-full text-start text-xs px-2.5 py-2 rounded-lg hover:bg-navy-50
                          flex items-center gap-2 transition-colors border border-transparent
                          hover:border-navy-100"
                      >
                        {/* Gender dot */}
                        <span className={`w-2 h-2 rounded-full shrink-0
                          ${p.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`}
                        />
                        {/* Name */}
                        <span className="font-medium text-gray-800 flex-1">{p.name}</span>
                        {/* Gender label badge */}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0
                          ${p.gender === 'female'
                            ? 'bg-pink-50 text-pink-600 border border-pink-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}
                        >
                          {p.gender === 'female'
                            ? (isHe ? 'מיועדת' : 'F')
                            : (isHe ? 'מיועד'  : 'M')}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="text-xs font-semibold px-4 py-1.5 bg-navy-600 text-white rounded-lg
              hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isHe ? 'פרסם' : 'Post'}
          </button>
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pb-1">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {isHe ? 'אין פוסטים עדיין' : 'No posts yet'}
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} locale={locale} />)
        )}
      </div>
    </div>
  )
}
