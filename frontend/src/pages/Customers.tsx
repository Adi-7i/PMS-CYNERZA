import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../services/customer';
import { Loader2, Search, User, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Customers() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Simple debounce for search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        const timeoutId = setTimeout(() => setDebouncedSearch(value), 500);
        return () => clearTimeout(timeoutId);
    };

    const { data: customers, isLoading, error } = useQuery({
        queryKey: ['customers', debouncedSearch],
        queryFn: () => customerService.getAll({ search: debouncedSearch }),
    });

    if (isLoading && !customers) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-8">Error loading customers</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-500">Manage your guest database</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    className="w-full md:w-96 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {customers?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-50 rounded-full p-3 mb-3">
                                            <User className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">No customers found</p>
                                        <p className="text-sm">Try adjusting your search terms</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            customers?.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm font-bold">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <Link to={`/customers/${customer.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 hover:underline">
                                                    {customer.name}
                                                </Link>
                                                <div className="text-xs text-gray-400 font-mono">ID: #{customer.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 flex flex-col gap-1.5">
                                            {customer.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {customer.email}</div>}
                                            {customer.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {customer.phone}</div>}
                                            {customer.address && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {customer.address}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full text-xs font-bold">{customer.booking_count}</span>
                                            <span>bookings</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full border",
                                            customer.total_balance_due > 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                                        )}>
                                            ${customer.total_balance_due.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
