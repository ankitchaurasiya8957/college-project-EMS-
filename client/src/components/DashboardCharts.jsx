import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#f43f5e','#06b6d4','#ec4899','#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#172023', marginBottom: 6, marginTop: 0 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color || p.stroke, margin: '2px 0', fontWeight: 500 }}>
          {p.name}: {typeof p.value === 'number' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
};

const SimpleTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#172023', marginBottom: 6, marginTop: 0 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color || p.fill, margin: '2px 0', fontWeight: 500 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function CategoryPieChart({ events }) {
  const data = Object.entries(events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  if (!data.length) return <p style={{ color: 'rgba(0,0,0,0.3)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>No data</p>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} stroke="none">
          {data.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<SimpleTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
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
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<SimpleTooltip />} />
        <Bar dataKey="events" fill="#3b82f6" radius={[6,6,0,0]} name="Events" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueLineChart({ bookings, events }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentYear = new Date().getFullYear();

  const data = months.map((name, i) => {
    // Actual revenue: sum of paid+confirmed booking amounts for this month
    const actual = bookings
      .filter(b => {
        if (b.paymentStatus !== 'paid' || b.status !== 'confirmed') return false;
        const d = new Date(b.bookedAt || b.createdAt);
        return d.getMonth() === i && d.getFullYear() === currentYear;
      })
      .reduce((s, b) => s + (Number(b.amount) || 0), 0);

    // Projection: based on event ticket prices × total seats for events in this month
    // This gives a "maximum potential revenue" projection
    const projection = (events || [])
      .filter(e => new Date(e.date).getMonth() === i)
      .reduce((s, e) => s + ((Number(e.ticketPrice) || 0) * (Number(e.totalSeats) || 0)), 0);

    return { name, actual, projection: Math.round(projection * 0.4) }; // 40% target fill rate
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="projection"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorProjection)"
          strokeDasharray="6 3"
          dot={false}
          name="Projection"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#colorActual)"
          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
          name="Actual"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
