import { AutoRefresh } from "@/components/auto-refresh";
import { MetricCard, StatusBadge } from "@/components/dashboard";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { getDashboardData } from "@/lib/dashboard-data";

export const revalidate = 1800;

function formatDateTime(input: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(input));
}

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <main className="page-shell">
      <AutoRefresh scheduleHours={[8, 13, 16, 20]} timeZone="Asia/Jakarta" />

      <section className="hero">
        <div>
          <p className="eyebrow">Dashboard tuyển sinh</p>
          <h1>Theo dõi hiệu suất sale và chất lượng leads theo thời gian</h1>
        </div>
        <div className="hero-meta">
          <StatusBadge
            label={data.isDemo ? "Đang dùng dữ liệu demo" : "Đang đọc Google Sheets"}
            tone={data.isDemo ? "warn" : "ok"}
          />
          <p>Cập nhật lúc {formatDateTime(data.generatedAt)}</p>
          <p>Múi giờ {data.timezone}</p>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Tổng leads" value={data.summary.totalLeads} accent="blue" />
        <MetricCard label="Chính quy (CQ)" value={data.summary.cqTotal} accent="gold" />
        <MetricCard label="Ngoài CQ" value={data.summary.ncqTotal} accent="green" />
        <MetricCard label="Offline" value={data.summary.offlineTotal} accent="red" />
        <MetricCard
          label="Khoa tự chủ"
          value={data.summary.selfManagedTotal}
          accent="slate"
        />
      </section>

      <DashboardTabs data={data} />
    </main>
  );
}
