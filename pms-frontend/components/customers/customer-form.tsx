'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Customer } from '@/types/customer';
import { useCreateCustomer, useUpdateCustomer } from '@/lib/hooks/use-customers';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Schema matches backend CustomerCreate
const customerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email address'),
    phone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    id_proof_type: z.string().max(50).optional().or(z.literal('')),
    id_proof_number: z.string().max(100).optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    initialData?: Customer;
    customerId?: number;
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
    const router = useRouter();
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();

    const isEditing = !!initialData;
    const isLoading = createCustomer.isPending || updateCustomer.isPending;

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: initialData?.name || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            address: initialData?.address || '',
            id_proof_type: initialData?.id_proof_type || '',
            id_proof_number: initialData?.id_proof_number || '',
        },
    });

    async function onSubmit(data: CustomerFormValues) {
        try {
            // Clean up empty strings to undefined for optional fields
            const cleanData = {
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                address: data.address || undefined,
                id_proof_type: data.id_proof_type || undefined,
                id_proof_number: data.id_proof_number || undefined,
            };

            if (isEditing && customerId) {
                await updateCustomer.mutateAsync({ id: customerId, data: cleanData });
            } else {
                await createCustomer.mutateAsync(cleanData);
            }
            router.push('/customers');
            router.refresh();
        } catch (error) {
            // Error handled by mutation hook
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1 234 567 8900" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="123 Main St, City, Country" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="id_proof_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Type</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    >
                                        <option value="">Select ID type</option>
                                        <option value="passport">Passport</option>
                                        <option value="id_card">ID Card</option>
                                        <option value="driver_license">Driver's License</option>
                                        <option value="other">Other</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="id_proof_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="AB123456" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Customer' : 'Create Customer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
