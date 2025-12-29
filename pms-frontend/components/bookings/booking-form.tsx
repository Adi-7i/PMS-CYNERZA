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
import { useCreateBooking, useModifyBooking } from '@/lib/hooks/use-bookings';
import { useRoomTypes } from '@/lib/hooks/use-rooms';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Booking } from '@/types/booking';
import { format } from 'date-fns';

interface BookingFormProps {
    initialData?: Booking;
    bookingId?: number;
}

export function BookingForm({ initialData, bookingId }: BookingFormProps) {
    const router = useRouter();
    const createBooking = useCreateBooking();
    const modifyBooking = useModifyBooking();

    // Fetch room types for dropdown
    const { data: roomTypesData, isLoading: isLoadingRoomTypes } = useRoomTypes();
    const roomTypes = Array.isArray(roomTypesData) ? roomTypesData : [];

    const isEditing = !!initialData;

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            room_type_id: initialData?.room_type_id?.toString() || '',
            check_in: initialData?.check_in ? format(new Date(initialData.check_in), 'yyyy-MM-dd') : '',
            check_out: initialData?.check_out ? format(new Date(initialData.check_out), 'yyyy-MM-dd') : '',
            num_rooms: initialData?.num_rooms || 1,
            amount_paid: initialData?.amount_paid || 0,
            notes: initialData?.notes || '',
            customer: {
                name: initialData?.customer_name || '',
                email: initialData?.customer_email || '',
                phone: '',
                address: '',
                id_proof_type: '',
                id_proof_number: '',
            },
        },
    });

    async function onSubmit(data: BookingFormValues) {
        try {
            if (isEditing && bookingId) {
                // For modifications, only dates and room info can be changed
                await modifyBooking.mutateAsync({
                    id: bookingId,
                    data: {
                        room_type_id: parseInt(data.room_type_id),
                        check_in: data.check_in,
                        check_out: data.check_out,
                        num_rooms: data.num_rooms,
                    },
                });
            } else {
                // For new bookings, send complete data with customer info
                await createBooking.mutateAsync({
                    room_type_id: parseInt(data.room_type_id),
                    check_in: data.check_in,
                    check_out: data.check_out,
                    num_rooms: data.num_rooms,
                    amount_paid: data.amount_paid,
                    notes: data.notes || undefined,
                    customer: {
                        name: data.customer.name,
                        email: data.customer.email,
                        phone: data.customer.phone || undefined,
                        address: data.customer.address || undefined,
                        id_proof_type: data.customer.id_proof_type || undefined,
                        id_proof_number: data.customer.id_proof_number || undefined,
                    },
                });
            }
            router.push('/bookings');
        } catch (error) {
            // Error handled by mutation hook
        }
    }

    const isLoading = createBooking.isPending || modifyBooking.isPending || isLoadingRoomTypes;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Customer Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Customer Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="customer.name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer.email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer.phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 8900" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer.id_proof_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID Type</FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                            disabled={isEditing}
                                        >
                                            <option value="">Select ID type</option>
                                            <option value="passport">Passport</option>
                                            <option value="id_card">ID Card</option>
                                            <option value="driver_license">Driver's License</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer.id_proof_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="AB123456" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer.address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, City" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Booking Details Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Booking Details</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="room_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Type *</FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                        >
                                            <option value="">Select a room type</option>
                                            {roomTypes?.map((type: any) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name} - ${Number(type.base_price).toFixed(2)}/night
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
                            name="num_rooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Rooms *</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" {...field} />
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
                                    <FormLabel>Check In *</FormLabel>
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
                                    <FormLabel>Check Out *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="amount_paid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Paid</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Notes Section */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Input className="h-20" placeholder="Special requests, preferences..." {...field} />
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
                        {isEditing ? 'Update Booking' : 'Create Booking'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
