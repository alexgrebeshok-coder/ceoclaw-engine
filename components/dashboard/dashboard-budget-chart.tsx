"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardBudgetChart({
  data,
}: {
  data: Array<{ name: string; planned: number; actual: number }>;
}) {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="planned" fill="var(--panel-soft-strong)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" fill="var(--brand)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
