"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardTrendChart({
  data,
}: {
  data: Array<{ name: string; progress: number; actual: number }>;
}) {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart data={data}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Line dataKey="progress" dot={{ r: 2.5 }} stroke="var(--brand)" strokeWidth={2.5} type="monotone" />
        <Line dataKey="actual" dot={false} stroke="var(--ink-soft)" strokeWidth={1.75} type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  );
}
