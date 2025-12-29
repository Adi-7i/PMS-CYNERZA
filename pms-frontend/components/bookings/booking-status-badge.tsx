import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/types/booking";

interface BookingStatusBadgeProps {
    status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
    const styles: Record<BookingStatus, string> = {
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
        confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
        checked_in: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
        checked_out: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300",
        cancelled: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300",
    };

    const labels: Record<BookingStatus, string> = {
        pending: "Pending",
        confirmed: "Confirmed",
        checked_in: "Checked In",
        checked_out: "Checked Out",
        cancelled: "Cancelled",
    };

    return (
        <Badge variant="outline" className={`${styles[status]} border-none`}>
            {labels[status]}
        </Badge>
    );
}
