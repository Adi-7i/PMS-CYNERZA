import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomTypeService } from '../services/roomType';
import { bookingService } from '../services/booking';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Plus, Trash2, ArrowLeft, Calendar, User, CreditCard, Building2, BedDouble } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function NewBooking() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const { data: roomTypes, isLoading: isLoadingRooms } = useQuery({
        queryKey: ['roomTypes'],
        queryFn: roomTypeService.getAll,
    });

    const form = useForm({
        defaultValues: {
            check_in: '',
            check_out: '',
            rooms: [{ room_type_id: '', quantity: 1 }],
            customer: {
                name: '',
                email: '',
                phone: ''
            },
            notes: '',
            amount_paid: 0
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rooms"
    });

    const createMutation = useMutation({
        mutationFn: bookingService.createMultiRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            navigate('/bookings');
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || "Failed to create booking");
        }
    });

    const onSubmit = (data: any) => {
        // Transform data types
        const payload = {
            ...data,
            rooms: data.rooms.map((r: any) => ({
                room_type_id: Number(r.room_type_id),
                quantity: Number(r.quantity)
            })),
            amount_paid: Number(data.amount_paid)
        };
        createMutation.mutate(payload);
    };

    if (isLoadingRooms) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <Link to="/bookings" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 w-fit transition-colors group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Bookings
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">New Reservation</h1>
                <p className="text-gray-500 mt-1">Create a new booking for a guest</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center shadow-sm">
                    <div className="flex-shrink-0 mr-3">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Dates & Customer Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 text-gray-900">
                                <User className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-bold">Guest Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                    <input {...form.register('customer.name', { required: true })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                    <input type="email" {...form.register('customer.email', { required: true })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <input {...form.register('customer.phone')} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-2 mb-4 text-gray-900">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-bold">Stay Dates</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Check-in Date</label>
                                        <input type="date" {...form.register('check_in', { required: true })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Check-out Date</label>
                                        <input type="date" {...form.register('check_out', { required: true })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Selection */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <BedDouble className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-lg font-bold">Room Selection</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => append({ room_type_id: '', quantity: 1 })}
                                    className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Add Another Room
                                </button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group transition-all hover:bg-blue-50/30">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Room Type</label>
                                                <select
                                                    {...form.register(`rooms.${index}.room_type_id` as const, { required: true })}
                                                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                                >
                                                    <option value="">Select a room type...</option>
                                                    {roomTypes?.map(type => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.name} — ${type.base_price}/night
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="mt-1 text-xs text-gray-400">
                                                    Select from available room categories
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Rooms</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        {...form.register(`rooms.${index}.quantity` as const, { required: true, min: 1 })}
                                                        className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="absolute -top-2 -right-2 bg-white text-red-500 shadow-sm border border-gray-100 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                                title="Remove room"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary & Payment */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                            <div className="flex items-center gap-2 mb-6 text-gray-900">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-bold">Payment & Notes</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial Payment</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            {...form.register('amount_paid')}
                                            className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Leave as 0 for pay later</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Requests</label>
                                    <textarea
                                        {...form.register('notes')}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[120px] resize-none"
                                        placeholder="Any special requirements or notes..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        {createMutation.isPending && <Loader2 className="animate-spin h-5 w-5" />}
                                        {createMutation.isPending ? "Processing..." : "Confirm Booking"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
