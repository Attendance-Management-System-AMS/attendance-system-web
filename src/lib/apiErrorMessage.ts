/** Lấy chuỗi lỗi đọc được từ response axios / backend Spring. */
export function getApiErrorMessage(
  err: unknown,
  fallbackMessage = 'Không tạo được đơn. Xem tab Network → Response để biết chi tiết.',
): string {
  const e = err as {
    response?: { status?: number; data?: unknown }
    message?: string
  }
  const data = e.response?.data

  if (typeof data === 'string' && data.trim()) return data

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.message === 'string' && d.message.trim()) return d.message
    if (typeof d.error === 'string' && d.error.trim()) return d.error
    if (typeof d.detail === 'string' && d.detail.trim()) return d.detail

    const errors = d.errors
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0]
      if (typeof first === 'string') return first
      if (first && typeof first === 'object') {
        const o = first as Record<string, unknown>
        if (typeof o.defaultMessage === 'string') return o.defaultMessage
        if (typeof o.message === 'string') return o.message
      }
    }

    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      const vals = Object.values(errors as Record<string, string[] | string>)
      const flat = vals.flatMap((v) => (Array.isArray(v) ? v : [v]))
      const msg = flat.find((x) => typeof x === 'string' && x.length > 0)
      if (typeof msg === 'string') return msg
    }
  }

  const status = e.response?.status
  if (status === 401) return 'Chưa đăng nhập hoặc phiên hết hạn.'
  if (status === 403) return 'Không có quyền thực hiện thao tác này.'
  if (status === 404) return 'Không tìm thấy API hoặc dữ liệu (404).'
  if (status === 400) return 'Dữ liệu không hợp lệ (400). Kiểm tra employeeId, ngày, loại nghỉ.'

  if (e.message && !e.message.startsWith('Request failed')) return e.message
  return fallbackMessage
}
