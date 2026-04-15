/** Chuẩn hóa trạng thái đơn nghỉ từ API (enum, hoa/thường, tiếng Việt). */
export type CanonicalLeaveStatus = 'pending' | 'approved' | 'rejected'

export function normalizeLeaveStatus(raw: string | undefined | null): CanonicalLeaveStatus {
  const s = String(raw ?? '').trim().toLowerCase()

  const approved = new Set([
    'approved',
    'approve',
    'accepted',
    'accept',
    'đã duyệt',
    'da duyet',
    'success',
  ])
  const rejected = new Set([
    'rejected',
    'reject',
    'refused',
    'denied',
    'từ chối',
    'tu choi',
    'cancelled',
    'canceled',
  ])
  const pending = new Set([
    'pending',
    'wait',
    'waiting',
    'new',
    'draft',
    'submitted',
    'chờ duyệt',
    'cho duyet',
    'processing',
    'in_review',
    'inreview',
  ])

  if (approved.has(s)) return 'approved'
  if (rejected.has(s)) return 'rejected'
  if (pending.has(s)) return 'pending'

  // Giá trị lạ: vẫn cho phép duyệt (thường là chờ xử lý)
  return 'pending'
}

export function isPendingLeave(raw: string | undefined | null): boolean {
  return normalizeLeaveStatus(raw) === 'pending'
}
