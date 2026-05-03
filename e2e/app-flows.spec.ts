import { expect, test } from '@playwright/test'
import {
  USERS,
  VALID_PASSWORD,
  enableFaceDetectionStub,
  installMockApi,
  seedAuthenticatedSession,
  type RoleKey,
} from './support/mockApi'

async function openAs(page: Parameters<typeof seedAuthenticatedSession>[0], role: RoleKey, path: string) {
  await seedAuthenticatedSession(page, role)
  await page.goto(path, { waitUntil: 'networkidle' })
}

test('1. Login and role-based routing works on real browser pages', async ({ page }) => {
  await installMockApi(page)

  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByTestId('login-email').fill(USERS.admin.email)
  await page.getByTestId('login-password').fill('wrong-password')
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('login-error')).toContainText('Sai tai khoan hoac mat khau.')

  await page.reload({ waitUntil: 'networkidle' })
  await page.getByTestId('login-email').fill(USERS.admin.email)
  await page.getByTestId('login-password').fill(VALID_PASSWORD)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.evaluate(() => {
    window.localStorage.clear()
  })
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByTestId('login-email').fill(USERS.employee.email)
  await page.getByTestId('login-password').fill(VALID_PASSWORD)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/my\/dashboard$/)
})

test('2. HR can manage employees across list, create, detail and edit screens', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'hr', '/employees')

  await expect(page).toHaveTitle(/Nhân viên/)
  await expect(page.getByText('Danh sách nhân viên')).toBeVisible()
  await expect(page.getByText('Nguyen Van Employee')).toBeVisible()

  await page.getByPlaceholder('Tìm theo tên, mã NV, email...').fill('EMP002')
  await expect(page.getByText('EMP002')).toBeVisible()

  await page.goto('/employees/new')
  await expect(page).toHaveTitle(/Thêm nhân viên/)

  await page.goto('/employees/1002')
  await expect(page).toHaveTitle(/Chi tiết nhân viên/)

  await page.goto('/employees/1002/edit')
  await expect(page).toHaveTitle(/Chỉnh sửa nhân viên/)
})

test('3. HR can access departments and positions setup flows', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'hr', '/departments')

  await expect(page).toHaveTitle(/Phòng ban/)
  await expect(page.locator('tbody').getByText('Nhan su', { exact: true })).toBeVisible()

  await page.goto('/positions')
  await expect(page).toHaveTitle(/Chức vụ/)
  await expect(page.locator('tbody').getByText('HR Specialist', { exact: true })).toBeVisible()

  await page.goto('/positions/new')
  await expect(page).toHaveTitle(/Thêm chức vụ/)

  await page.goto('/positions/1/edit')
  await expect(page).toHaveTitle(/Sửa chức vụ/)
})

test('4. HR can register an employee face descriptor through Playwright', async ({ page }) => {
  await installMockApi(page)
  await enableFaceDetectionStub(page)
  await openAs(page, 'hr', '/employees/1002/register-face')

  await expect(page).toHaveTitle(/Đăng ký khuôn mặt/)
  await expect(page.getByRole('heading', { name: 'Đăng ký khuôn mặt', level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Lưu khuôn mặt' }).click()
  await expect(page.getByText('Lưu thành công')).toBeVisible()
  await expect(page.getByText('Đã có mẫu khuôn mặt trên hệ thống')).toBeVisible()
})

test('5. Kiosk attendance flow completes automatically with stubbed face detection', async ({ page }) => {
  await installMockApi(page)
  await enableFaceDetectionStub(page)
  await page.goto('/kiosk')

  await expect(page.getByText('Chấm công thành công')).toBeVisible()
  await expect(page.getByText('EMP002')).toBeVisible()
  await expect(page.getByText('Nguyen Van Employee')).toBeVisible()
})

test('6. Manager can access attendance operations page and see today records', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'manager', '/attendance')

  await expect(page).toHaveTitle(/Chấm công hôm nay/)
  await expect(page.getByRole('heading', { name: 'Chấm công hôm nay', level: 1 })).toBeVisible()
  await expect(page.getByText('Nguyen Van Employee')).toBeVisible()
  await expect(page.getByRole('table').getByText('Đi muộn', { exact: true })).toBeVisible()
})

test('7. HR can access shift management flows', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'hr', '/shifts')

  await expect(page).toHaveTitle(/Ca làm việc/)
  await expect(page.getByText('Hanh chinh')).toBeVisible()

  await page.goto('/shifts/new')
  await expect(page).toHaveTitle(/Thêm ca làm/)

  await page.goto('/shifts/3001/edit')
  await expect(page).toHaveTitle(/Sửa ca làm/)
})

test('8. Schedule planning flows load for HR and employee self-service schedule is visible', async ({
  page,
  context,
}) => {
  await installMockApi(page)
  await openAs(page, 'hr', '/schedule')

  await expect(page).toHaveTitle(/Lịch làm việc/)

  await page.goto('/schedule/assignments')
  await expect(page).toHaveTitle(/Phân công lịch làm việc/)

  await page.goto('/schedule/templates')
  await expect(page).toHaveTitle(/Mẫu lịch làm việc/)

  const employeePage = await context.newPage()
  await seedAuthenticatedSession(employeePage, 'employee')
  await employeePage.goto('/my/schedule')
  await expect(employeePage).toHaveTitle(/Lịch làm việc của tôi/)
})

test('9. HR can access holiday management flows', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'hr', '/holidays')

  await expect(page).toHaveTitle(/Ngày nghỉ/)
  await expect(page.getByText('Giai phong', { exact: true })).toBeVisible()

  await page.goto('/holidays/new')
  await expect(page).toHaveTitle(/Thêm ngày nghỉ/)

  await page.goto('/holidays/6001/edit')
  await expect(page).toHaveTitle(/Sửa ngày nghỉ/)
})

test('10. Employee can create a leave request and manager can approve it', async ({ page, context }) => {
  await installMockApi(page)

  const employeePage = page
  await seedAuthenticatedSession(employeePage, 'employee')
  await employeePage.goto('/my/requests')
  await expect(employeePage).toHaveTitle(/Đơn từ của tôi/)

  await employeePage.getByTestId('my-requests-create').click()
  await employeePage.getByTestId('my-requests-leave-type').click()
  await employeePage.getByText('Nghi phep nam', { exact: true }).click()
  await employeePage.getByTestId('my-requests-from-date').fill('2026-04-26')
  await employeePage.getByTestId('my-requests-to-date').fill('2026-04-26')
  await employeePage.getByTestId('my-requests-reason').fill('Nghi phep da duoc len ke hoach')
  await employeePage.getByTestId('my-requests-submit').click()
  await expect(employeePage.getByText('Gửi đơn thành công! Đang chờ duyệt.')).toBeVisible()

  const managerPage = await context.newPage()
  await seedAuthenticatedSession(managerPage, 'manager')
  await managerPage.goto('/leaves')
  await expect(managerPage).toHaveTitle(/Nghỉ phép/)
  await expect(managerPage.getByRole('button', { name: /Phe duyet don/ }).first()).toBeVisible()
  await expect(managerPage.locator('tbody').getByText('Nghi phep nam', { exact: true }).first()).toBeVisible()
  await managerPage.getByRole('button', { name: /Phe duyet don/ }).first().click()
  await expect(managerPage.getByText('Đã phê duyệt đơn nghỉ phép')).toBeVisible()
  await expect(managerPage.getByRole('table').getByText('Đã duyệt', { exact: true })).toBeVisible()
})

test('11. Employee can review personal attendance history', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'employee', '/my/attendance')

  await expect(page).toHaveTitle(/Bảng công của tôi/)
  await expect(page.getByText('Bảng công tháng')).toBeVisible()
  await expect(page.getByRole('table').getByText('Muộn (15p)')).toBeVisible()
  await expect(page.getByText('08:15:00')).toBeVisible()
})

test('12. Admin can open report export flow and finish export preparation', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'admin', '/reports')

  await expect(page).toHaveTitle(/Báo cáo/)
  await page.getByRole('button', { name: 'Xuất bảng công' }).click()
  await expect(page.getByText('Xuất bảng công tháng')).toBeVisible()
  await page.getByRole('button', { name: 'Tải xuống .xls' }).click()
  await expect(page.getByText('Xuất bảng công tháng')).not.toBeVisible()
})

test('13. Admin can review accounts and update role assignments in permissions page', async ({ page }) => {
  await installMockApi(page)
  await openAs(page, 'admin', '/permissions')

  await expect(page).toHaveTitle(/Phân quyền/)
  await expect(page.getByText('Danh sách tài khoản và vai trò')).toBeVisible()
  await expect(page.getByTestId('permissions-edit-1002')).toBeVisible()

  await page.getByTestId('permissions-edit-1002').click()
  await expect(page.getByText('Điều chỉnh quyền truy cập')).toBeVisible()
  await page.getByTestId('permissions-role-ROLE_MANAGER').check()
  await page.getByTestId('permissions-save-access').click()
  await expect(page.getByText('Đã cập nhật quyền cho Nguyen Van Employee.')).toBeVisible()
  await expect(page.getByTestId('permissions-user-1002-role-ROLE_MANAGER')).toBeVisible()
})
