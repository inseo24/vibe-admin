'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AppointmentStatus } from '@/types/database'

interface Props {
  appointmentId: string
  currentStatus: AppointmentStatus
}

const nextStatuses: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  requested: ['approved', 'rejected'],
  approved: ['completed', 'cancelled', 'no_show'],
  completed: [],
  rejected: [],
  cancelled: [],
  no_show: [],
}

const LABELS: Record<AppointmentStatus, string> = {
  requested: '예약 요청',
  approved: '승인',
  rejected: '거절',
  cancelled: '취소',
  completed: '완료',
  no_show: '노쇼',
}

export default function AppointmentStatusButton({ appointmentId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const options = nextStatuses[currentStatus] ?? []

  if (options.length === 0) return <span className="text-xs text-gray-400">-</span>

  async function handleChange(status: AppointmentStatus) {
    setLoading(true)
    await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((s) => (
        <button
          key={s}
          disabled={loading}
          onClick={() => handleChange(s)}
          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition"
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  )
}
