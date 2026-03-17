export interface Department {
    id: string
    name: string
    description: string
    employeeCount: number
    defaultShift?: string
    status: 'active' | 'inactive'
}
