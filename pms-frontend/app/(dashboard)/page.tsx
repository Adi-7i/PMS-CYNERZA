'use client';

import {
  Users,
  CreditCard,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentBookings } from '@/components/dashboard/recent-bookings';
import { mockBookings } from '@/lib/mock-data';

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
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue performance for the current year.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Latest booking transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentBookings bookings={mockBookings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
