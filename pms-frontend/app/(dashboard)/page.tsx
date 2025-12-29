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
import { useOverviewAnalytics } from '@/lib/hooks/use-analytics';
import { useBookings } from '@/lib/hooks/use-bookings';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardHome() {
  // Get date range for last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: analytics, isLoading: analyticsLoading } = useOverviewAnalytics(startDate, endDate);
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(1, 5);

  const recentBookings = Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : [];

  const stats = [
    {
      title: 'Total Bookings',
      value: analytics?.total_bookings || 0,
      description: `${analytics?.confirmed_bookings || 0} confirmed`,
      icon: Calendar,
    },
    {
      title: 'Total Revenue',
      value: `$${analytics?.total_revenue ? Number(analytics.total_revenue).toLocaleString() : '0'}`,
      description: `Avg: $${analytics?.average_daily_rate ? Number(analytics.average_daily_rate).toFixed(2) : '0'}/day`,
      icon: CreditCard,
    },
    {
      title: 'Occupancy Rate',
      value: `${analytics?.occupancy_rate ? analytics.occupancy_rate.toFixed(1) : '0'}%`,
      description: 'Last 30 days',
      icon: TrendingUp,
    },
    {
      title: 'Cancelled Bookings',
      value: analytics?.cancelled_bookings || 0,
      description: `of ${analytics?.total_bookings || 0} total`,
      icon: Users,
    },
  ];

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
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {stat.description}
                  </p>
                </>
              )}
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
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest booking transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <RecentBookings bookings={recentBookings} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
