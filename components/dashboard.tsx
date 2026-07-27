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

type RelationRow = {
  name: string;
  total: number;
  topInterests: SimpleRow[];
  blankInterestCells: number;
};

type IndustryTimelineRow = {
  name: string;
  total: number;
  conversionRate: number;
  dailyCounts: Record<string, number>;
};

export function MetricCard({
  label,
  value,
  accent,
  featured = false,
  meta = []
}: {
  label: string;
  value: number;
  accent: "blue" | "gold" | "green" | "red" | "slate";
  featured?: boolean;
  meta?: string[];
}) {
  return (
    <article className={`metric-card accent-${accent}${featured ? " metric-card--featured" : ""}`}>
      <div className="metric-card-header">
        <p className="metric-card-label">{label}</p>
        <span className={`metric-card-icon-dot dot-${accent}`} />
      </div>
      <strong className="metric-card-value">{value.toLocaleString("vi-VN")}</strong>
      {meta.length > 0 ? (
        <div className="metric-card-meta">
          {meta.map((item) => (
            <span key={item} className="meta-chip">{item}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function SectionHeading({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-title-group">
        <div className="section-indicator-bar" />
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({
  label,
  tone
}: {
  label: string;
  tone: "ok" | "warn";
}) {
  return (
    <span className={`tone-pill ${tone}`}>
      <span className="tone-dot" />
      {label}
    </span>
  );
}

export function SimpleBarTable({
  title,
  rows,
  total
}: {
  title: string;
  rows: SimpleRow[];
  total: number;
}) {
  return (
    <section className="subpanel">
      <div className="subpanel-header">
        <h3>{title}</h3>
      </div>
      <div className="bar-list">
        {rows.length === 0 ? <p className="empty-msg">Chưa có dữ liệu.</p> : null}
        {rows.slice(0, 7).map((row) => {
          const pct = total > 0 ? Number(((row.count / total) * 100).toFixed(1)) : 0;
          return (
            <div className="bar-row" key={row.name}>
              <div className="bar-label">
                <span className="bar-name">{row.name}</span>
                <strong className="bar-val">
                  {row.count} <span className="bar-pct">({pct}%)</span>
                </strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DataTable({
  title,
  rows
}: {
  title: string;
  rows: MatrixRow[];
}) {
  return (
    <section className="subpanel">
      <div className="subpanel-header">
        <h3>{title}</h3>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th className="num-col">Tổng leads</th>
              <th className="num-col">Thành công</th>
              <th className="num-col">Đang xử lý</th>
              <th className="num-col">Hỏng</th>
              <th className="num-col">Chưa LH</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="font-medium">{row.name}</td>
                <td className="num-col bold">{row.total}</td>
                <td className="num-col text-green">{row.thanhCong}</td>
                <td className="num-col text-blue">{row.dangXuLy}</td>
                <td className="num-col text-red">{row.thatBai}</td>
                <td className="num-col text-muted">{row.chuaLH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatInterestList(rows: SimpleRow[]) {
  if (rows.length === 0) return "Chưa có ngành/nguyện vọng";
  return rows.map((row) => `${row.name} (${row.count})`).join(" · ");
}

export function RelationTable({
  title,
  rows
}: {
  title: string;
  rows: RelationRow[];
}) {
  return (
    <section className="subpanel">
      <div className="subpanel-header">
        <h3>{title}</h3>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Đầu mối</th>
              <th className="num-col">Số lượt ngành</th>
              <th>3 ngành nổi bật</th>
              <th className="num-col">Dòng trống</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="font-medium">{row.name}</td>
                <td className="num-col bold">{row.total}</td>
                <td>{formatInterestList(row.topInterests)}</td>
                <td className="num-col text-muted">{row.blankInterestCells}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatDisplayDate(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return dayKey;
  return `${day}/${month}`;
}

export function IndustryTable({
  title,
  rows,
  visibleDays
}: {
  title: string;
  rows: IndustryTimelineRow[];
  visibleDays: string[];
}) {
  const totalSum = rows.reduce((sum, row) => sum + row.total, 0);
  const totalsByDay = Object.fromEntries(
    visibleDays.map((day) => [day, rows.reduce((sum, row) => sum + (row.dailyCounts[day] || 0), 0)])
  ) as Record<string, number>;

  return (
    <section className="subpanel">
      <div className="subpanel-header">
        <h3>{title}</h3>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngành</th>
              <th className="num-col">Sum</th>
              {visibleDays.map((day) => (
                <th key={day} className="num-col">{formatDisplayDate(day)}</th>
              ))}
              <th className="num-col">Tỷ lệ conversion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="font-medium">{row.name}</td>
                <td className="num-col bold">{row.total}</td>
                {visibleDays.map((day) => (
                  <td key={day} className="num-col">{row.dailyCounts[day] || 0}</td>
                ))}
                <td className="num-col text-blue bold">{row.conversionRate.toFixed(1)}%</td>
              </tr>
            ))}
            <tr className="summary-row">
              <td>Tổng theo ngày</td>
              <td className="num-col bold">{totalSum}</td>
              {visibleDays.map((day) => (
                <td key={day} className="num-col bold">{totalsByDay[day] || 0}</td>
              ))}
              <td className="num-col">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
