import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { Mail, MapPin, Phone, User as UserIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface CustomerDetailsCardProps {
    customer: Customer;
}

export function CustomerDetailsCard({ customer }: CustomerDetailsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                        <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">{customer.full_name}</h3>
                        <p className="text-sm text-zinc-500">Member since {format(new Date(customer.created_at), 'MMMM yyyy')}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-zinc-500" />
                        <span>{customer.phone_number || 'No phone'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        <span>
                            {[customer.address, customer.city, customer.country].filter(Boolean).join(', ') || 'No address'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <CreditCard className="h-4 w-4 text-zinc-500" />
                        <span>
                            Balance: <span className={customer.outstanding_balance > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                                ${customer.outstanding_balance.toFixed(2)}
                            </span>
                        </span>
                    </div>
                </div>

                {customer.notes && (
                    <div className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">Notes:</p>
                        <p className="text-zinc-600 dark:text-zinc-400">{customer.notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
