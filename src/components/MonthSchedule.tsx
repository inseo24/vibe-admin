'use client'

import { useState, useEffect } from 'react'
import { kstToday, toDateStr } from '@/lib/booking'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

// 공개 월간 스케줄: 승인된 예약을 날짜별로 보여주고, 마우스를 올리면 그 날 예약 시간이 툴팁으로 표시됨.
export default function MonthSchedule() {
  const today = kstToday()
  const [byDate, setByDate] = useState<Map<string, string[]>>(new Map())
  const [viewY, setViewY] = useState(today.y)
  const [viewM, setViewM] = useState(today.m)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/public-schedule')
      if (!res.ok) return
      const items: { scheduled_at: string }[] = await res.json()
      const map = new Map<string, string[]>()
      items.forEach((it) => {
        const ds = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date(it.scheduled_at))
        const arr = map.get(ds) ?? []
        arr.push(fmtTime(it.scheduled_at))
        map.set(ds, arr)
      })
      map.forEach((arr) => arr.sort())
      setByDate(map)
    }
    load()
  }, [])

  const firstWeekday = new Date(`${toDateStr(viewY, viewM, 1)}T00:00:00+09:00`).getUTCDay()
  const daysInMonth = new Date(viewY, viewM, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const canPrev = !(viewY === today.y && viewM === today.m)
  function prevMonth() {
    if (!canPrev) return
    if (viewM === 1) { setViewY(viewY - 1); setViewM(12) } else setViewM(viewM - 1)
  }
  function nextMonth() {
    if (viewM === 12) { setViewY(viewY + 1); setViewM(1) } else setViewM(viewM + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-6 mb-4">
        <button onClick={prevMonth} disabled={!canPrev}
          className="text-gray-400 disabled:opacity-30 hover:text-gray-700 text-lg px-2">‹</button>
        <span className="font-semibold">{viewY}.{viewM}</span>
        <button onClick={nextMonth}
          className="text-gray-400 hover:text-gray-700 text-lg px-2">›</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} />
          const ds = toDateStr(viewY, viewM, day)
          const times = byDate.get(ds) ?? []
          const isToday = ds === today.str
          const has = times.length > 0
          return (
            <div key={ds} className="group relative aspect-square">
              <div
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-sm transition ${
                  has ? 'bg-green-50 cursor-help' : ''
                } ${isToday ? 'ring-1 ring-blue-400' : ''}`}
              >
                <span className={isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}>{day}</span>
                {has && (
                  <span className="mt-0.5 text-[10px] text-green-600 font-medium">{times.length}건</span>
                )}
              </div>

              {/* 마우스 오버 툴팁: 그 날 예약된 시간들 (개인정보 없음) */}
              {has && (
                <div className="pointer-events-none absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg">
                  <div className="font-semibold mb-0.5">{viewM}/{day} 예약완료</div>
                  {times.map((t) => <div key={t}>{t}</div>)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-50 border border-green-200 inline-block" />예약완료 (마우스를 올리면 시간 표시)</span>
      </div>
    </div>
  )
}
