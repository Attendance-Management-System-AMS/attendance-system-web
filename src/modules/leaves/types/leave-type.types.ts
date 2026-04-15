
export interface LeaveType {
    id: string | number
    code: string
    name: string
    isPaid: boolean
    deductAnnualLeave: boolean
    insuranceCovers: boolean
    isActive: boolean
    description?: string
}
