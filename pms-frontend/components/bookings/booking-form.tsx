'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { bookingSchema, BookingFormValues } from '@/lib/validations/booking';
import { useCreateBooking } from '@/lib/hooks/use-bookings';
import { useCustomers } from '@/lib/hooks/use-customers';
import { useRoomTypes } from '@/lib/hooks/use-rooms';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function BookingForm() {
    const router = useRouter();
    const createBooking = useCreateBooking();

    // Fetch data for dropdowns
    const { data: customersData, isLoading: isLoadingCustomers } = useCustomers(1, 100); // Fetch first 100 for now
    const { data: roomTypes, isLoading: isLoadingRoomTypes } = useRoomTypes();

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            customer_id: '',
            room_type_id: '',
            check_in: '',
            check_out: '',
            num_adults: 1,
            num_children: 0,
            num_rooms: 1,
            notes: '',
        },
    });

    async function onSubmit(data: BookingFormValues) {
        try {
            await createBooking.mutateAsync({
                customer_id: parseInt(data.customer_id),
                room_type_id: parseInt(data.room_type_id),
                check_in: new Date(data.check_in),
                check_out: new Date(data.check_out),
                num_adults: data.num_adults,
                num_children: data.num_children,
                num_rooms: data.num_rooms,
                notes: data.notes,
            });
            router.push('/bookings');
        } catch (error) {
            // Error handled by mutation
        }
    }

    const isLoading = createBooking.isPending || isLoadingCustomers || isLoadingRoomTypes;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    <FormField
                        control={form.control}
                        name="customer_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    >
                                        <option value="">Select a customer</option>
                                        {customersData?.data.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.full_name} ({customer.email})
                                            </option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="room_type_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Type</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    >
                                        <option value="">Select a room type</option>
                                        {roomTypes?.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} - ${type.base_price}/night
                                            </option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="check_in"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Check In</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="check_out"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Check Out</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="num_adults"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adults</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="num_children"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Children</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="num_rooms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Rooms</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Input className="h-20" placeholder="Special requests..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Booking
                    </Button>
                </div>
            </form>
        </Form>
    );
}
