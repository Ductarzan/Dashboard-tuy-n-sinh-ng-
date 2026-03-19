"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type SimpleRow = {
  name: string;
  count: number;
};

type MatrixRow = {
  name: string;
  total: number;
  thanhCong: number;
  dangXuLy: number;
  thatBai: number;
  chuaLH: number;
};

const palette = ["#0f4c81", "#d28c24", "#1f7a47", "#b63a3a", "#6e7e8a", "#8e6c8f"];

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

export function LeadsOverviewChart({
  cqTotal,
  ncqTotal,
  offlineTotal,
  selfManagedTotal
}: {
  cqTotal: number;
  ncqTotal: number;
  offlineTotal: number;
  selfManagedTotal: number;
}) {
  const data = [
    { name: "CQ", value: cqTotal, fill: "#d28c24" },
    { name: "NCQ", value: ncqTotal, fill: "#1f7a47" },
    { name: "Offline", value: offlineTotal, fill: "#b63a3a" },
    { name: "Khoa tự chủ", value: selfManagedTotal, fill: "#0f4c81" }
  ];

  return (
    <div className="subpanel chart-panel">
      <h3>Tổng quan nguồn leads</h3>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(29, 39, 49, 0.12)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatusPieChart({
  title,
  rows
}: {
  title: string;
  rows: SimpleRow[];
}) {
  const data = rows.slice(0, 6).map((row, index) => ({
    ...row,
    fill: palette[index % palette.length]
  }));

  return (
    <div className="subpanel chart-panel">
      <h3>{title}</h3>
      <div className="chart-box pie-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatNumber(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend-list">
        {data.map((item) => (
          <div className="legend-row" key={item.name}>
            <span className="legend-name">
              <span className="legend-dot" style={{ backgroundColor: item.fill }} />
              {item.name}
            </span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopSalesChart({
  title,
  rows
}: {
  title: string;
  rows: MatrixRow[];
}) {
  const data = rows.slice(0, 6).map((row) => ({
    name: row.name,
    thanhCong: row.thanhCong,
    dangXuLy: row.dangXuLy,
    thatBai: row.thatBai
  }));

  return (
    <div className="subpanel chart-panel">
      <h3>{title}</h3>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(29, 39, 49, 0.12)" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Bar dataKey="thanhCong" stackId="a" fill="#1f7a47" radius={[0, 0, 0, 0]} />
            <Bar dataKey="dangXuLy" stackId="a" fill="#0f4c81" radius={[0, 0, 0, 0]} />
            <Bar dataKey="thatBai" stackId="a" fill="#b63a3a" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
