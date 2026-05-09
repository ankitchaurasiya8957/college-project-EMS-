import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-black/5">
      <p className="text-xs font-semibold text-dark mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function CategoryPieChart({ events }) {
  const data = Object.entries(events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  if (!data.length) return <p className="text-black/30 text-sm text-center py-10">No data</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({ events }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map((name, i) => ({
    name,
    events: events.filter(e => new Date(e.date).getMonth() === i).length
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="events" fill="#3b82f6" radius={[6,6,0,0]} name="Events" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueLineChart({ bookings }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map((name, i) => ({
    name,
    revenue: bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed' && new Date(b.bookedAt).getMonth() === i)
      .reduce((s, b) => s + b.amount, 0)
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} name="Revenue (₹)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
