import MonthSchedule from '@/components/MonthSchedule'

export default function SchedulePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">예약 스케줄</h1>
      <p className="text-gray-500 text-sm mb-6">
        확정된 예약 일정입니다. 예약은{' '}
        <a href="/login" className="text-blue-600 underline">로그인</a> 후 이용해 주세요.
      </p>

      <div className="bg-white rounded-xl shadow p-5">
        <MonthSchedule />
      </div>
    </main>
  )
}
