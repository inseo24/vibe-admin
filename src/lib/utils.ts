export function formatDateTimeKST(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatTimeKST(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  requested: '예약 요청',
  approved: '승인',
  rejected: '거절',
  cancelled: '취소',
  completed: '완료',
  no_show: '노쇼',
}

export const CONTACT_STATUS_LABEL: Record<string, string> = {
  open: '접수',
  in_progress: '처리 중',
  answered: '답변 완료',
  closed: '종료',
}
