import axios from 'axios'

const API_URL = '/api/departments'

export default {
    async createDepartment(data: { name: string; description?: string }) {
        const response = await axios.post(API_URL, data)
        return response.data
    },
    // ...other department-related methods can be added here
}
