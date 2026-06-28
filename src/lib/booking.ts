// 예약 슬롯 공통 설정 및 헬퍼 (클라이언트/서버 공용, 순수 함수)
// 운영자는 아래 값만 바꾸면 영업시간/슬롯 길이를 조정할 수 있습니다.

export const SLOT_MINUTES = 30 // 한 슬롯 길이(분).
export const BUSINESS_START_HOUR = 9 // 영업 시작 (시)
export const BUSINESS_END_HOUR = 18 // 영업 종료 (시). 마지막 슬롯은 이 시각 이전에 끝남.
export const BOOKING_RANGE_DAYS = 60 // 오늘부터 며칠 후까지 예약 가능
export const MAX_BOOKING_SLOTS = 8 // 한 번에 연속 선택 가능한 최대 슬롯 수 (8 x 30분 = 4시간)

export interface Slot {
  label: string // "14:30"
  iso: string // "2026-07-15T14:30:00+09:00"
  instant: number // 절대 시각(ms)
  hour: number
}

// dateStr: 'YYYY-MM-DD' (KST 달력 기준). 해당 날짜의 모든 슬롯 생성.
export function slotsForDate(dateStr: string): Slot[] {
  const slots: Slot[] = []
  for (let m = BUSINESS_START_HOUR * 60; m < BUSINESS_END_HOUR * 60; m += SLOT_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    const iso = `${dateStr}T${hh}:${mm}:00+09:00`
    slots.push({ label: `${hh}:${mm}`, iso, instant: new Date(iso).getTime(), hour: Math.floor(m / 60) })
  }
  return slots
}

// KST 기준 오늘 날짜 정보
export function kstToday(): { y: number; m: number; d: number; str: string } {
  const str = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const [y, m, d] = str.split('-').map(Number)
  return { y, m, d, str }
}

// 'YYYY-MM-DD' 포맷
export function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// 주어진 ISO 슬롯이 유효한 영업 슬롯인지 검증 (서버 측 신뢰 검증용)
export function isValidSlot(iso: string): boolean {
  const dateStr = iso.slice(0, 10)
  return slotsForDate(dateStr).some((s) => s.instant === new Date(iso).getTime())
}

// 시작 시각 + 소요시간이 차지하는 모든 30분 슬롯의 시작 instant 목록
export function coveredInstants(iso: string, durationMin: number): number[] {
  const start = new Date(iso).getTime()
  const n = Math.round(durationMin / SLOT_MINUTES)
  return Array.from({ length: n }, (_, i) => start + i * SLOT_MINUTES * 60000)
}

// 예약(시작 + 소요시간)이 유효한지 검증:
// - duration이 SLOT_MINUTES의 양의 배수
// - 최대 슬롯 수 이내
// - 차지하는 모든 슬롯이 같은 날 영업시간 안의 유효 슬롯
export function isValidBooking(iso: string, durationMin: number): boolean {
  if (!Number.isFinite(durationMin) || durationMin <= 0) return false
  if (durationMin % SLOT_MINUTES !== 0) return false
  if (durationMin / SLOT_MINUTES > MAX_BOOKING_SLOTS) return false
  const dateStr = iso.slice(0, 10)
  const valid = new Set(slotsForDate(dateStr).map((s) => s.instant))
  return coveredInstants(iso, durationMin).every((t) => valid.has(t))
}

// 두 예약 구간이 겹치는지 (start/duration 기준)
export function intervalsOverlap(
  startA: number, durMinA: number,
  startB: number, durMinB: number
): boolean {
  const endA = startA + durMinA * 60000
  const endB = startB + durMinB * 60000
  return startA < endB && endA > startB
}
