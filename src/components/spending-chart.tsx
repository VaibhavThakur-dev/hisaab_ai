'use client'

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { categoryConfig } from './category-badge'
import type { Category } from '@/types'

interface PieProps {
  data: Record<string, number> // category → paise
}

const PIE_COLORS = ['#FF9500', '#FF453A', '#30D158', '#FFD60A', '#BF5AF2', '#64D2FF', '#AC8E68', '#8E8E93']

export function CategoryPieChart({ data }: PieProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value], i) => ({
      name: categoryConfig[key as Category]?.label ?? key,
      value: Math.round(value / 100),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))

  if (chartData.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface BarProps {
  data: { month: string; amount: number }[] // amount in paise
}

export function MonthlyBarChart({ data }: BarProps) {
  const chartData = data.map((d) => ({
    month: d.month.slice(5),
    amount: Math.round(d.amount / 100),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Spent']}
          cursor={{ fill: 'var(--color-muted)' }}
        />
        <Bar dataKey="amount" fill="#FF9500" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
