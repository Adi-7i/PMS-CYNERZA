'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
    { name: 'Jan', total: 12500 },
    { name: 'Feb', total: 15000 },
    { name: 'Mar', total: 22000 },
    { name: 'Apr', total: 18000 },
    { name: 'May', total: 28000 },
    { name: 'Jun', total: 35000 },
    { name: 'Jul', total: 42000 },
    { name: 'Aug', total: 45000 },
    { name: 'Sep', total: 38000 },
    { name: 'Oct', total: 32000 },
    { name: 'Nov', total: 25000 },
    { name: 'Dec', total: 43240 },
];

export function RevenueChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                    }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
