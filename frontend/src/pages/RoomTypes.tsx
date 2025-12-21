import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomTypeService } from '../services/roomType';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RoomTypes() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: roomTypes, isLoading, error } = useQuery({
        queryKey: ['roomTypes'],
        queryFn: roomTypeService.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: roomTypeService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
        },
    });

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this room type?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-8">Error loading room types</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Room Types</h1>
                    <p className="text-gray-500">Manage your hotel's room categories</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    Add Room Type
                </button>
            </div>

            {/* List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rooms</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {roomTypes?.map((type) => (
                            <tr key={type.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <span className="text-xs font-bold">{type.name.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                        {type.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">${type.base_price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {type.total_rooms} rooms
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 truncate max-w-xs text-sm">{type.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-slate-400 hover:text-blue-600 mr-3 transition-colors p-1 rounded-md hover:bg-blue-50">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type.id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal (Simple inline implementation for now) */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <CreateRoomTypeForm onClose={() => setIsCreateOpen(false)} />
                </div>
            )}
        </div>
    );
}

function CreateRoomTypeForm({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<any>();

    const createMutation = useMutation({
        mutationFn: roomTypeService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
            onClose();
        },
    });

    const onSubmit = (data: any) => {
        createMutation.mutate({
            ...data,
            base_price: Number(data.base_price),
            total_rooms: Number(data.total_rooms)
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Room Type</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input {...register("name", { required: "Name is required" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    {errors.name && <span className="text-red-500 text-xs">{String(errors.name.message)}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                        <input type="number" {...register("base_price", { required: "Price is required", min: 0 })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms</label>
                        <input type="number" {...register("total_rooms", { required: "Total is required", min: 1 })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea {...register("description")} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-slate-800 disabled:opacity-50">
                        {createMutation.isPending ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    )
}
