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

const palette = ["#1a73e8", "#fbbc04", "#34a853", "#ea4335", "#ab47bc", "#00acc1"];

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="ga-tooltip">
        {label ? <p className="ga-tooltip-title">{label}</p> : null}
        {payload.map((entry: any, index: number) => (
          <div className="ga-tooltip-row" key={`item-${index}`}>
            <span className="ga-tooltip-dot" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="ga-tooltip-label">{entry.name}:</span>
            <strong className="ga-tooltip-value">{formatNumber(Number(entry.value))}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
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
    { name: "CQ", value: cqTotal, fill: "#fbbc04" },
    { name: "NCQ", value: ncqTotal, fill: "#34a853" },
    { name: "Offline", value: offlineTotal, fill: "#ea4335" },
    { name: "Khoa tự chủ", value: selfManagedTotal, fill: "#1a73e8" }
  ];

  return (
    <div className="subpanel chart-panel">
      <div className="chart-header">
        <div>
          <h3>Tổng quan nguồn leads</h3>
          <p className="chart-subtitle">So sánh phân bổ lead theo từng hệ đào tạo</p>
        </div>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaed" />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#dadce0" }} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={54}>
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

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="subpanel chart-panel">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p className="chart-subtitle">Tỷ lệ phân bổ theo trạng thái chăm sóc</p>
        </div>
      </div>
      <div className="pie-container-wrap">
        <div className="chart-box pie-box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-center-badge">
            <span className="pie-center-val">{formatNumber(totalCount)}</span>
            <span className="pie-center-lbl">TỔNG</span>
          </div>
        </div>
        <div className="legend-list">
          {data.map((item) => (
            <div className="legend-row" key={item.name}>
              <span className="legend-name">
                <span className="legend-dot" style={{ backgroundColor: item.fill }} />
                {item.name}
              </span>
              <strong>{formatNumber(item.count)}</strong>
            </div>
          ))}
        </div>
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
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p className="chart-subtitle">Tiến độ chuyển đổi của tư vấn viên xuất sắc</p>
        </div>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 16, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8eaed" />
            <XAxis type="number" tickLine={false} axisLine={{ stroke: "#dadce0" }} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#3c4043", fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="thanhCong" name="Thành công" stackId="a" fill="#34a853" radius={[0, 0, 0, 0]} maxBarSize={22} />
            <Bar dataKey="dangXuLy" name="Đang xử lý" stackId="a" fill="#1a73e8" radius={[0, 0, 0, 0]} maxBarSize={22} />
            <Bar dataKey="thatBai" name="Thất bại" stackId="a" fill="#ea4335" radius={[0, 4, 4, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
