import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/api/customers';
import { CustomerCreate, CustomerUpdate } from '@/types/customer';
import { toast } from 'sonner';

export function useCustomers(page = 1, limit = 10, search?: string) {
    return useQuery({
        queryKey: ['customers', page, limit, search],
        queryFn: () => customerApi.getAll(page, limit, search),
    });
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: ['customer', id],
        queryFn: () => customerApi.getById(id),
        enabled: !!id,
    });
}

export function useCustomerHistory(id: number) {
    return useQuery({
        queryKey: ['customer-history', id],
        queryFn: () => customerApi.getHistory(id),
        enabled: !!id,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: customerApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create customer');
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CustomerUpdate }) =>
            customerApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
            toast.success('Customer updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update customer');
        },
    });
}
