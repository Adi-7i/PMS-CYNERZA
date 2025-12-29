import * as z from 'zod';

// Customer info schema matching backend CustomerInfo
const customerInfoSchema = z.object({
    name: z.string().min(1, 'Customer name is required').max(255),
    email: z.string().email('Invalid email address'),
    phone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    id_proof_type: z.string().max(50).optional().or(z.literal('')),
    id_proof_number: z.string().max(100).optional().or(z.literal('')),
});

export const bookingSchema = z.object({
    room_type_id: z.string().min(1, 'Room type is required'), // String for select, convert to number on submit
    check_in: z.string().min(1, 'Check-in date is required'), // ISO date string from input type="date"
    check_out: z.string().min(1, 'Check-out date is required'),
    num_rooms: z.coerce.number().min(1, 'At least 1 room required'),
    amount_paid: z.coerce.number().min(0).optional(),
    notes: z.string().max(500).optional().or(z.literal('')),
    customer: customerInfoSchema,
}).refine((data) => {
    const start = new Date(data.check_in);
    const end = new Date(data.check_out);
    return end > start;
}, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
