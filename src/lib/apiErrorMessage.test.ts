import { describe, it, expect } from 'vitest'
import { getApiErrorMessage } from './apiErrorMessage'

describe('getApiErrorMessage', () => {
  it('ưu tiên message từ body Spring-style', () => {
    const err = {
      response: {
        status: 400,
        data: { message: 'Email đã tồn tại' },
      },
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe('Email đã tồn tại')
  })

  it('dùng fallback khi không suy ra được', () => {
    expect(getApiErrorMessage({}, 'Lỗi tùy chỉnh')).toBe('Lỗi tùy chỉnh')
  })
})
