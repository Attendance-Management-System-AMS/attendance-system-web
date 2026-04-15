export interface Employee {
  id: number
  employeeCode: string
  fullName: string
  gender: string
  email: string
  departmentId: number | null
  departmentName: string | null
  positionId: number | null
  positionName: string | null
  managerId: number | null
  managerName: string | null
  status: string
  biometricHash: string | null
  /** true khi đã lưu face embedding (descriptor) trên server */
  faceRegistered?: boolean
  joinDate: string
  createdAt: string
  // Cũ (giữ lại nếu UI cần nhưng nên ưu tiên dùng DTO trên)
  avatarUrl?: string
  shift?: string
}

export interface CreateEmployee {
  fullName: string
  employeeCode: string
  email: string
  gender?: string
  departmentId?: number
  positionId?: number
  managerId?: number
  status?: string
  joinDate?: string
}

export type UpdateEmployee = Partial<CreateEmployee>

export interface FaceDescriptorRequest {
  descriptor: number[]
}
