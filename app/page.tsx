import { AutoRefresh } from "@/components/auto-refresh";
import { LeadsOverviewChart, StatusPieChart, TopSalesChart } from "@/components/charts";
import {
  DataTable,
  MetricCard,
  RelationTable,
  SectionHeading,
  SimpleBarTable,
  StatusBadge
} from "@/components/dashboard";
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
      <AutoRefresh intervalMs={30 * 60 * 1000} />

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

      <section className="chart-grid">
        <LeadsOverviewChart
          cqTotal={data.summary.cqTotal}
          ncqTotal={data.summary.ncqTotal}
          offlineTotal={data.summary.offlineTotal}
          selfManagedTotal={data.summary.selfManagedTotal}
        />
        <StatusPieChart title="Phễu trạng thái CQ" rows={data.cq.statusBreakdown} />
        <TopSalesChart title="Top sale CQ theo tiến độ xử lý" rows={data.cq.matrix} />
      </section>

      <section className="detail-section">
        <SectionHeading
          title="Cấu trúc nhu cầu theo ngành"
          subtitle="Tổng hợp theo tên ngành chuẩn, loại trừ các dòng trống để phản ánh đúng mức độ quan tâm thực tế"
        />
        <div className="detail-grid">
          <div className="subpanel">
            <h3>CQ: Nhóm ngành quan tâm nổi bật</h3>
            <SimpleBarTable
              title="Phân bổ nguyện vọng theo ngành"
              rows={data.details.cq.interestBreakdown}
              total={data.details.cq.totalInterestCells}
            />
            <p className="detail-note">
              Đã loại {data.details.cq.blankInterestCells} ô trống tại `Nguyện vọng 01` và `Nguyện vọng 02` để tránh làm lệch tỷ trọng.
            </p>
          </div>

          <div className="subpanel">
            <h3>NCQ: Nhóm ngành được quan tâm</h3>
            <SimpleBarTable
              title="Cơ cấu ngành quan tâm"
              rows={data.details.ncq.interestBreakdown}
              total={data.details.ncq.totalInterestCells}
            />
            <SimpleBarTable
              title="Cơ cấu nguồn phát sinh"
              rows={data.details.ncq.sourceBreakdown}
              total={data.summary.ncqTotal}
            />
            <p className="detail-note">
              Đã loại {data.details.ncq.blankInterestCells} ô trống trong cột `Ngành`.
            </p>
          </div>

          <div className="subpanel">
            <h3>Offline: Nhóm ngành quan tâm nổi bật</h3>
            <SimpleBarTable
              title="Phân bổ nguyện vọng theo ngành"
              rows={data.details.offline.interestBreakdown}
              total={data.details.offline.totalInterestCells}
            />
            <p className="detail-note">
              Đã loại {data.details.offline.blankInterestCells} ô trống tại `Nguyện vọng 01` và `Nguyện vọng 02`.
            </p>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <SectionHeading
          title="Dòng chảy nguồn và phân bổ phụ trách theo ngành"
          subtitle="Phân tích nguồn phát sinh, ngành được quan tâm và mức độ tập trung của từng sale theo từng nhóm ngành"
        />
        <div className="relation-grid">
          <div className="relation-column">
            <RelationTable title="CQ: Dòng chảy nguồn -> ngành" rows={data.details.cq.sourceToInterest} />
            <RelationTable title="CQ: Phân bổ sale -> ngành" rows={data.details.cq.saleToInterest} />
          </div>
          <div className="relation-column">
            <RelationTable title="NCQ: Dòng chảy nguồn -> ngành" rows={data.details.ncq.sourceToInterest} />
            <RelationTable title="NCQ: Phân bổ sale -> ngành" rows={data.details.ncq.saleToInterest} />
          </div>
          <div className="relation-column">
            <RelationTable title="Offline: Phân bổ sale -> ngành" rows={data.details.offline.saleToInterest} />
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <SectionHeading
            title="Hệ Chính Quy"
            subtitle="Phân bổ sale, phễu xử lý và ma trận hiệu suất"
          />
          <div className="two-column">
            <SimpleBarTable title="Phân bổ NV tư vấn" rows={data.cq.saleBreakdown} total={data.summary.cqTotal} />
            <SimpleBarTable title="Phễu tổng đã gom nhóm" rows={data.cq.statusBreakdown} total={data.summary.cqTotal} />
          </div>
          <DataTable title="Ma trận chăm sóc từng sale" rows={data.cq.matrix} />
        </div>

        <div className="panel">
          <SectionHeading
            title="Hệ Ngoài Chính Quy"
            subtitle="Theo dõi xử lý và chuyển đổi của nhóm NCQ"
          />
          <div className="two-column">
            <StatusPieChart title="Phễu trạng thái NCQ" rows={data.ncq.statusBreakdown} />
            <TopSalesChart title="Top sale NCQ theo tiến độ xử lý" rows={data.ncq.matrix} />
          </div>
          <div className="two-column">
            <SimpleBarTable title="Phân bổ NV tư vấn" rows={data.ncq.saleBreakdown} total={data.summary.ncqTotal} />
            <SimpleBarTable title="Phễu tổng đã gom nhóm" rows={data.ncq.statusBreakdown} total={data.summary.ncqTotal} />
          </div>
          <DataTable title="Ma trận chăm sóc từng sale" rows={data.ncq.matrix} />
        </div>

        <div className="panel">
          <SectionHeading
            title="Data Offline"
            subtitle="Hiệu suất xử lý data tuyển sinh ngoại tuyến"
          />
          <div className="two-column">
            <StatusPieChart title="Phễu trạng thái Offline" rows={data.offline.statusBreakdown} />
            <TopSalesChart title="Top sale Offline theo tiến độ xử lý" rows={data.offline.matrix} />
          </div>
          <div className="two-column">
            <SimpleBarTable title="Phân bổ NV tư vấn" rows={data.offline.saleBreakdown} total={data.summary.offlineTotal} />
            <SimpleBarTable title="Phễu tổng đã gom nhóm" rows={data.offline.statusBreakdown} total={data.summary.offlineTotal} />
          </div>
          <DataTable title="Ma trận chăm sóc từng sale" rows={data.offline.matrix} />
        </div>

        <div className="panel">
          <SectionHeading
            title="Khoa Tự Chủ"
            subtitle="Tổng hợp leads CQ và NCQ theo đầu mối"
          />
          <table className="summary-table">
            <thead>
              <tr>
                <th>Đơn vị / Đầu mối</th>
                <th>CQ</th>
                <th>NCQ</th>
              </tr>
            </thead>
            <tbody>
              {data.selfManaged.items.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.cq}</td>
                  <td>{item.ncq}</td>
                </tr>
              ))}
              <tr className="summary-row">
                <td>Tổng cộng</td>
                <td>{data.selfManaged.totalCQ}</td>
                <td>{data.selfManaged.totalNCQ}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
