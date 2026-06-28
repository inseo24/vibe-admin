'use client'

import { useState, useEffect } from 'react'
import { slotsForDate, kstToday, BOOKING_RANGE_DAYS, coveredInstants } from '@/lib/booking'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

type Status = 'requested' | 'approved'

interface Props {
  // public: 승인된 예약만 (예약완료) / booking: 예약중 + 승인 모두
  mode: 'public' | 'booking'
  days?: number
}

export default function ScheduleGrid({ mode, days = 7 }: Props) {
  const [occupied, setOccupied] = useState<Map<number, Status>>(new Map())
  const [loading, setLoading] = useState(true)

  const today = kstToday()

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const map = new Map<number, Status>()
      try {
        if (mode === 'public') {
          // 공개: 승인된 예약만 (소요시간만큼 슬롯 확장)
          const res = await fetch('/api/public-schedule')
          if (res.ok) {
            const items: { scheduled_at: string; duration: number }[] = await res.json()
            items.forEach((it) =>
              coveredInstants(it.scheduled_at, it.duration ?? 30).forEach((t) => map.set(t, 'approved'))
            )
          }
        } else {
          // 예약 화면: 예약중 + 승인 (소요시간만큼 슬롯 확장)
          const res = await fetch(`/api/availability?from=${today.str}&days=${days}`)
          if (res.ok) {
            const { slots } = await res.json()
            ;(slots as { at: string; status: Status; duration: number }[]).forEach((s) =>
              coveredInstants(s.at, s.duration ?? 30).forEach((t) => {
                // 승인이 예약중을 덮어쓰도록 (같은 칸이면 승인 우선)
                if (s.status === 'approved' || !map.has(t)) map.set(t, s.status)
              })
            )
          }
        }
      } finally {
        if (active) {
          setOccupied(map)
          setLoading(false)
        }
      }
    }
    load()
    return () => { active = false }
  }, [mode, days, today.str])

  // 표시할 날짜들 (오늘부터 days일)
  const base = new Date(`${today.str}T00:00:00+09:00`)
  const cap = Math.min(days, BOOKING_RANGE_DAYS)
  const dayList = Array.from({ length: cap }, (_, i) => {
    const ds = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date(base.getTime() + i * 86400000)
    )
    const [, m, d] = ds.split('-').map(Number)
    const wd = new Date(`${ds}T00:00:00+09:00`).getUTCDay()
    return { ds, label: `${m}/${d}`, wd }
  })

  const timeRows = slotsForDate(today.str).map((s) => s.label)
  const now = Date.now()

  const statusLabel = (st: Status) => (st === 'approved' ? '예약완료' : '예약중')

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center select-none" style={{ minWidth: 360 }}>
        <thead>
          <tr>
            <th className="w-12 text-[10px] text-gray-400 font-normal p-1"></th>
            {dayList.map((d) => (
              <th key={d.ds} className="p-1 text-xs font-medium">
                <div className={d.wd === 0 ? 'text-red-400' : d.wd === 6 ? 'text-blue-400' : 'text-gray-600'}>
                  {WEEKDAYS[d.wd]}
                </div>
                <div className="text-gray-400 text-[10px]">{d.label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeRows.map((time) => (
            <tr key={time}>
              <td className="text-[10px] text-gray-400 pr-1 text-right align-middle">{time}</td>
              {dayList.map((d) => {
                const iso = `${d.ds}T${time}:00+09:00`
                const instant = new Date(iso).getTime()
                const st = occupied.get(instant)
                const past = instant < now
                let cls = 'bg-gray-50'
                let tip = `${d.label} ${time} · 예약 가능`
                if (st === 'approved') { cls = 'bg-green-400'; tip = `${d.label} ${time} · 예약완료` }
                else if (st === 'requested') { cls = 'bg-yellow-300'; tip = `${d.label} ${time} · 예약중` }
                else if (past) { cls = 'bg-gray-100' ; tip = `${d.label} ${time} · 지난 시간` }
                return (
                  <td key={iso} className="p-0.5">
                    <div
                      title={tip}
                      className={`h-4 rounded-sm ${cls} ${st ? 'cursor-help' : ''} transition`}
                    >
                      {st && (
                        <span className="sr-only">{statusLabel(st)}</span>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 범례 */}
      <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-200 inline-block" />예약 가능</span>
        {mode === 'booking' && (
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-300 inline-block" />예약중</span>
        )}
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />예약완료</span>
      </div>

      {loading && <p className="text-xs text-gray-400 mt-2">불러오는 중...</p>}
    </div>
  )
}
