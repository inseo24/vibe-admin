import { formatDateTimeKST } from '@/lib/utils'
import type { PublicScheduleItem } from '@/types/database'

async function getPublicSchedule(): Promise<PublicScheduleItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/public-schedule`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function SchedulePage() {
  const schedule = await getPublicSchedule()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">예약 스케줄</h1>
      <p className="text-gray-500 text-sm mb-6">
        확정된 예약 일정입니다. 예약 요청은{' '}
        <a href="/login" className="text-blue-600 underline">로그인</a> 후 이용해 주세요.
      </p>

      {schedule.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          현재 예정된 스케줄이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {formatDateTimeKST(item.scheduled_at)} · {item.duration}분
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                예약 완료
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
