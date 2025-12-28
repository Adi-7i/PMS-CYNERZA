import { apiClient } from './client';
import type { Customer, CustomerCreate, CustomerUpdate } from '@/types/customer';

export const customerApi = {
    getAll: async (page = 1, limit = 10, search?: string) => {
        const offset = (page - 1) * limit;
        const params = new URLSearchParams({
            offset: offset.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        const { data } = await apiClient.get<Customer[]>('/customers', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await apiClient.get<Customer>(`/customers/${id}`);
        return data;
    },

    create: async (customer: CustomerCreate) => {
        const { data } = await apiClient.post<Customer>('/customers', customer);
        return data;
    },

    update: async (id: number, customer: CustomerUpdate) => {
        const { data } = await apiClient.put<Customer>(`/customers/${id}`, customer);
        return data;
    },

    getHistory: async (id: number) => {
        // Customer bookings are included in the customer details response
        const customer = await customerApi.getById(id);
        return customer.bookings || [];
    }
};
