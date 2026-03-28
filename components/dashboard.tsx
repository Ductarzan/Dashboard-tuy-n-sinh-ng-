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

export function MetricCard({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent: "blue" | "gold" | "green" | "red" | "slate";
}) {
  return (
    <article className={`metric-card accent-${accent}`}>
      <p>{label}</p>
      <strong>{value.toLocaleString("vi-VN")}</strong>
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
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
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
  return <span className={`tone-pill ${tone}`}>{label}</span>;
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
      <h3>{title}</h3>
      <div className="bar-list">
        {rows.length === 0 ? <p>Chưa có dữ liệu.</p> : null}
        {rows.slice(0, 7).map((row) => {
          const pct = total > 0 ? Number(((row.count / total) * 100).toFixed(1)) : 0;
          return (
            <div className="bar-row" key={row.name}>
              <div className="bar-label">
                <span>{row.name}</span>
                <strong>
                  {row.count} ({pct}%)
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
      <h3>{title}</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Tổng leads</th>
              <th>Thành công</th>
              <th>Đang xử lý</th>
              <th>Hỏng</th>
              <th>Chưa LH</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.total}</td>
                <td>{row.thanhCong}</td>
                <td>{row.dangXuLy}</td>
                <td>{row.thatBai}</td>
                <td>{row.chuaLH}</td>
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
      <h3>{title}</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Đầu mối</th>
              <th>Số lượt ngành</th>
              <th>3 ngành nổi bật</th>
              <th>Dòng trống</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.total}</td>
                <td>{formatInterestList(row.topInterests)}</td>
                <td>{row.blankInterestCells}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
