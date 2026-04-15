import api from '@/shared/api/client'
import type {
  Employee,
  CreateEmployee,
  UpdateEmployee,
  FaceDescriptorRequest,
} from '@/modules/employees/types/employee.types'
import type { ApiResponse, Page } from '@/shared/types/api'

export interface EmployeeQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  sortDir?: string;
  keyword?: string;
  departmentId?: number | string;
  positionId?: number | string;
  status?: string;
}

export const employeeApi = {
  getAll: (params?: EmployeeQueryParams) => api.get<ApiResponse<Page<Employee>>>('/employees', { params }),
  getById: (id: number) => api.get<ApiResponse<Employee>>(`/employees/${id}`),
  create: (data: CreateEmployee) => api.post<ApiResponse<Employee>>('/employees', data),
  update: (id: number, data: UpdateEmployee) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/employees/${id}`),
  // Đăng ký khuôn mặt
  registerFaceDescriptor: (id: number, body: FaceDescriptorRequest) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}/face-descriptor`, body),
}
