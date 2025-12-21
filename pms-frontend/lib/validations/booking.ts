import * as z from 'zod';

export const bookingSchema = z.object({
    customer_id: z.string().min(1, 'Customer is required'), // Using string for select value, convert to number on submit
    room_type_id: z.string().min(1, 'Room type is required'), // Same as above
    check_in: z.string().min(1, 'Check-in date is required'), // Store as ISO date string from input type="date"
    check_out: z.string().min(1, 'Check-out date is required'),
    num_adults: z.coerce.number().min(1, 'At least 1 adult required'),
    num_children: z.coerce.number().min(0),
    num_rooms: z.coerce.number().min(1, 'At least 1 room required'),
    notes: z.string().optional(),
}).refine((data) => {
    const start = new Date(data.check_in);
    const end = new Date(data.check_out);
    return end > start;
}, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
