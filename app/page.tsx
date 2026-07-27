import { AutoRefresh } from "@/components/auto-refresh";
import { MetricCard, StatusBadge } from "@/components/dashboard";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { ManualRefreshButton } from "@/components/manual-refresh-button";
import { getDashboardData } from "@/lib/dashboard-data";
export const dynamic = "force-dynamic";

function formatDateTime(input: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(input));
}

function formatSnapshotMeta(label: string, value: string) {
  return `${label}: ${value || "--"}`;
}

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <main className="page-shell">
      <AutoRefresh scheduleHours={[8, 13, 16, 20]} timeZone="Asia/Jakarta" />

      {/* Google Analytics Top Header Bar */}
      <header className="ga-topbar">
        <div className="ga-topbar-left">
          <div className="ga-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://hdiu.edu.vn/app/webroot/uploads/images/LOGO.png"
              alt="HDIU Logo"
              className="hdiu-logo"
            />
            <div className="ga-logo-divider" />
            <svg className="ga-logo" viewBox="0 0 40 40" width="26" height="26">
              <path d="M22 6c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v28c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V6z" fill="#fbbc04" />
              <path d="M12 16c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V16z" fill="#ea4335" />
              <path d="M2 26c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8z" fill="#4285f4" />
            </svg>
          </div>
          <div className="ga-property-info">
            <div className="ga-breadcrumb">
              <span>Tài khoản tuyển sinh</span>
              <span className="sep">/</span>
              <span className="active-property">Tuyển Sinh Analytics</span>
            </div>
            <h1 className="ga-page-title">Theo dõi hiệu suất sale & chất lượng leads</h1>
          </div>
        </div>

        <div className="ga-search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input type="text" placeholder="Tìm kiếm chỉ số, báo cáo, dữ liệu tuyển sinh..." readOnly />
        </div>

        <div className="ga-topbar-right">
          <div className="ga-status-pill">
            <StatusBadge
              label={data.isDemo ? "Dữ liệu Demo" : "Google Sheets Live"}
              tone={data.isDemo ? "warn" : "ok"}
            />
          </div>
          <ManualRefreshButton />
        </div>
      </header>

      {/* GA Sub-header & Meta Bar */}
      <section className="ga-meta-bar">
        <div className="meta-info-group">
          <span className="meta-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <span>Cập nhật lần cuối: <strong>{formatDateTime(data.generatedAt)}</strong></span>
          <span className="meta-sep">•</span>
          <span>Múi giờ: <strong>{data.timezone}</strong></span>
        </div>
      </section>

      {/* GA Executive KPI Cards Grid */}
      <section className="metrics-grid">
        <MetricCard label="Tổng leads" value={data.summary.totalLeads} accent="blue" />
        <MetricCard
          label="Số lượng nguyện vọng"
          value={data.summary.totalAspirations}
          accent="slate"
          featured
          meta={[
            formatSnapshotMeta("Time", data.summary.aspirationSnapshot.time),
            formatSnapshotMeta("Ngày", data.summary.aspirationSnapshot.date)
          ]}
        />
        <MetricCard label="Chính quy (CQ)" value={data.summary.cqTotal} accent="gold" />
        <MetricCard label="Ngoài CQ" value={data.summary.ncqTotal} accent="green" />
        <MetricCard label="Offline" value={data.summary.offlineTotal} accent="red" />
        <MetricCard label="Khoa tự chủ" value={data.summary.selfManagedTotal} accent="slate" />
      </section>

      <DashboardTabs data={data} />
    </main>
  );
}
