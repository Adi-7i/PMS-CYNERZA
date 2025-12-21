import {
  Users,
  CreditCard,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Total Bookings',
    value: '124',
    description: '+12% from last month',
    icon: Calendar,
  },
  {
    title: 'Total Revenue',
    value: '$43,240',
    description: '+8% from last month',
    icon: CreditCard,
  },
  {
    title: 'Occupancy Rate',
    value: '78%',
    description: '+2% from last month',
    icon: TrendingUp,
  },
  {
    title: 'Active Customers',
    value: '1,230',
    description: '+5% from last month',
    icon: Users,
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Dashboard Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Welcome to PMS-CYNERZA. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* This will be replaced with a real list/table eventually */}
              <p className="text-sm text-zinc-500">Loading recent bookings...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">Loading room inventory...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
