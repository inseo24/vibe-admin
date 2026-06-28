'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  slotsForDate,
  kstToday,
  toDateStr,
  SLOT_MINUTES,
  BOOKING_RANGE_DAYS,
  type Slot,
} from '@/lib/booking'
import ScheduleGrid from '@/components/ScheduleGrid'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function NewAppointmentPage() {
  const router = useRouter()
  const today = kstToday()

  // 예약 가능 마지막 날짜
  const maxDate = new Date(`${today.str}T00:00:00+09:00`)
  maxDate.setDate(maxDate.getDate() + BOOKING_RANGE_DAYS)
  const maxY = maxDate.getUTCFullYear()
  const maxM = maxDate.getUTCMonth() + 1
  const maxD = maxDate.getUTCDate()

  const [viewY, setViewY] = useState(today.y)
  const [viewM, setViewM] = useState(today.m) // 1-12
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [takenSet, setTakenSet] = useState<Set<number>>(new Set())
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async (date: string) => {
    setLoadingSlots(true)
    setTakenSet(new Set())
    try {
      const res = await fetch(`/api/availability?date=${date}`)
      if (res.ok) {
        const { slots } = await res.json()
        setTakenSet(new Set((slots as { at: string }[]).map((s) => new Date(s.at).getTime())))
      }
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) fetchAvailability(selectedDate)
  }, [selectedDate, fetchAvailability])

  // 캘린더 그리드 계산
  const firstWeekday = new Date(`${toDateStr(viewY, viewM, 1)}T00:00:00+09:00`).getUTCDay()
  const daysInMonth = new Date(viewY, viewM, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const canPrev = !(viewY === today.y && viewM === today.m)
  const canNext = viewY < maxY || (viewY === maxY && viewM < maxM)

  function prevMonth() {
    if (!canPrev) return
    if (viewM === 1) { setViewY(viewY - 1); setViewM(12) } else setViewM(viewM - 1)
  }
  function nextMonth() {
    if (!canNext) return
    if (viewM === 12) { setViewY(viewY + 1); setViewM(1) } else setViewM(viewM + 1)
  }

  function isDateSelectable(day: number): boolean {
    const ds = toDateStr(viewY, viewM, day)
    return ds >= today.str && ds <= toDateStr(maxY, maxM, maxD)
  }

  function selectDay(day: number) {
    if (!isDateSelectable(day)) return
    setSelectedDate(toDateStr(viewY, viewM, day))
    setSelectedSlot(null)
  }

  async function handleSubmit() {
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: selectedSlot.iso, customer_message: message || null }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '예약 요청에 실패했습니다.')
      if (res.status === 409 && selectedDate) fetchAvailability(selectedDate)
      setSelectedSlot(null)
    } else {
      router.push('/my/appointments')
    }
    setSubmitting(false)
  }

  const slots = selectedDate ? slotsForDate(selectedDate) : []
  const amSlots = slots.filter((s) => s.hour < 12)
  const pmSlots = slots.filter((s) => s.hour >= 12)
  const now = Date.now()

  const SlotButton = ({ s }: { s: Slot }) => {
    const disabled = s.instant < now || takenSet.has(s.instant)
    const selected = selectedSlot?.iso === s.iso
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setSelectedSlot(s)}
        className={`py-2.5 rounded-lg text-sm font-medium border transition ${
          selected
            ? 'bg-blue-600 text-white border-blue-600'
            : disabled
            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through'
            : 'bg-white text-gray-800 border-gray-300 hover:border-blue-500'
        }`}
      >
        {s.label}
      </button>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/my/appointments" className="text-gray-500 hover:text-gray-700">←</Link>
        <h1 className="text-2xl font-bold">예약하기</h1>
      </div>

      {/* 주간 예약 현황 (한눈에 보기) */}
      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold mb-3">이번 주 예약 현황</h2>
        <ScheduleGrid mode="booking" days={7} />
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold mb-3 flex items-center gap-1">📅 날짜와 시간을 선택해 주세요</h2>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-center gap-6 mb-3">
          <button onClick={prevMonth} disabled={!canPrev}
            className="text-gray-400 disabled:opacity-30 hover:text-gray-700 text-lg px-2">‹</button>
          <span className="font-semibold">{viewY}.{viewM}</span>
          <button onClick={nextMonth} disabled={!canNext}
            className="text-gray-400 disabled:opacity-30 hover:text-gray-700 text-lg px-2">›</button>
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{w}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e${idx}`} />
            const ds = toDateStr(viewY, viewM, day)
            const selectable = isDateSelectable(day)
            const isSelected = selectedDate === ds
            const isToday = ds === today.str
            return (
              <button
                key={ds}
                onClick={() => selectDay(day)}
                disabled={!selectable}
                className={`aspect-square rounded-lg text-sm transition ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold'
                    : !selectable
                    ? 'text-gray-300 cursor-not-allowed'
                    : isToday
                    ? 'text-blue-600 font-bold hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* 시간 슬롯 */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow p-5 mb-4">
          {loadingSlots ? (
            <p className="text-center text-gray-400 text-sm py-4">시간을 불러오는 중...</p>
          ) : (
            <>
              {amSlots.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">오전</div>
                  <div className="grid grid-cols-4 gap-2">
                    {amSlots.map((s) => <SlotButton key={s.iso} s={s} />)}
                  </div>
                </div>
              )}
              {pmSlots.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">오후</div>
                  <div className="grid grid-cols-4 gap-2">
                    {pmSlots.map((s) => <SlotButton key={s.iso} s={s} />)}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                회색으로 표시된 시간은 예약할 수 없습니다. (소요 시간 {SLOT_MINUTES}분)
              </p>
            </>
          )}
        </div>
      )}

      {/* 요청사항 + 신청 */}
      {selectedSlot && (
        <div className="bg-white rounded-xl shadow p-5">
          <div className="mb-3 text-sm">
            선택한 시간: <strong>{selectedDate} {selectedSlot.label}</strong>
          </div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">요청사항</label>
          <div className="mb-1 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            ⚠️ 예약 요청사항에는 주민등록번호, 계좌번호, 카드번호, 비밀번호, 건강정보 등 민감한 정보를 입력하지 마세요.
          </div>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="요청사항을 입력해 주세요 (선택)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-3 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? '요청 중...' : '예약 신청'}
          </button>
        </div>
      )}

      {error && !selectedSlot && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </main>
  )
}
