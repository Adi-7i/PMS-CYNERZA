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
                        <h3 className="text-lg font-medium">{customer.name}</h3>
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
                        <span>{customer.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        <span>
                            {customer.address || 'No address'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <CreditCard className="h-4 w-4 text-zinc-500" />
                        <span>
                            Balance: <span className={(customer.total_balance_due || 0) > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                                ${Number(customer.total_balance_due || 0).toFixed(2)}
                            </span>
                        </span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
