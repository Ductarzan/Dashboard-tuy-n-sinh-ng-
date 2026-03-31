"use client";

import { useState } from "react";
import { LeadsOverviewChart, StatusPieChart, TopSalesChart } from "@/components/charts";
import {
  DataTable,
  IndustryTable,
  RelationTable,
  SectionHeading,
  SimpleBarTable
} from "@/components/dashboard";
import type { getDashboardData } from "@/lib/dashboard-data";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type TabKey = "online" | "offline";

const tabs: Array<{ key: TabKey; label: string; description: string }> = [
  {
    key: "online",
    label: "Online",
    description: "CQ, NCQ và khoa tự chủ"
  },
  {
    key: "offline",
    label: "Offline",
    description: "Dữ liệu tuyển sinh ngoại tuyến"
  }
];

export function DashboardTabs({ data }: { data: DashboardData }) {
  const [active, setActive] = useState<TabKey>("online");
  const [industryPage, setIndustryPage] = useState(0);
  const industryPageSize = 4;
  const allIndustryDays = Array.from(
    new Set([...data.industry.cq.days, ...data.industry.ncq.days])
  ).sort((a, b) => b.localeCompare(a));
  const totalIndustryPages = Math.max(1, Math.ceil(allIndustryDays.length / industryPageSize));
  const safeIndustryPage = Math.min(industryPage, totalIndustryPages - 1);
  const startIndex = safeIndustryPage * industryPageSize;
  const visibleIndustryDays = allIndustryDays.slice(startIndex, startIndex + industryPageSize);
  const fbRows = data.fbAds.byDay.slice(0, 60);

  const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  });
  const numberFmt = new Intl.NumberFormat("vi-VN");

  return (
    <section className="tabs-shell">
      <div className="tabs" role="tablist" aria-label="Chế độ dữ liệu">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={active === tab.key}
            aria-controls={`panel-${tab.key}`}
            className="tab-button"
            data-active={active === tab.key}
            onClick={() => setActive(tab.key)}
          >
            <span>{tab.label}</span>
            <small>{tab.description}</small>
          </button>
        ))}
      </div>

      <div
        id="panel-online"
        role="tabpanel"
        aria-labelledby="tab-online"
        hidden={active !== "online"}
        className="tab-panel"
      >
        {active === "online" ? (
          <>
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
                title="Facebook Ads: Tổng chi tiêu và chỉ số theo ngày"
                subtitle="Gộp dữ liệu từ tất cả tài khoản quảng cáo đã cấu hình trong hệ thống"
              />
              <div className="fb-metric-grid">
                <article className="fb-metric-card">
                  <p>Tổng tiền đã chạy</p>
                  <strong>{currency.format(data.fbAds.totals.spendAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Tổng tiền hôm qua</p>
                  <strong>{currency.format(data.fbAds.totals.spendYesterday)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Tổng tiền hôm nay</p>
                  <strong>{currency.format(data.fbAds.totals.spendToday)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>FB mess (all-time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.messagesAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Clicks (all-time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.clicksAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Reach (all-time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.reachAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Impressions (all-time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.impressionsAllTime)}</strong>
                </article>
              </div>
              <div className="subpanel">
                <h3>Theo ngày (toàn bộ thời gian chạy)</h3>
                <p className="detail-note">
                  Tài khoản đang gộp: {data.fbAds.accountIds.length}. Hiển thị {fbRows.length} ngày gần nhất.
                </p>
                {data.fbAds.error ? <p className="detail-note">Lỗi Facebook Ads: {data.fbAds.error}</p> : null}
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Chi tiêu</th>
                        <th>FB mess</th>
                        <th>Click</th>
                        <th>Reach</th>
                        <th>Impressions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fbRows.length === 0 ? (
                        <tr>
                          <td colSpan={6}>Chưa có dữ liệu Facebook Ads theo ngày.</td>
                        </tr>
                      ) : null}
                      {fbRows.map((row) => (
                        <tr key={row.date}>
                          <td>{row.date}</td>
                          <td>{currency.format(row.spend)}</td>
                          <td>{numberFmt.format(row.messages)}</td>
                          <td>{numberFmt.format(row.clicks)}</td>
                          <td>{numberFmt.format(row.reach)}</td>
                          <td>{numberFmt.format(row.impressions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Cấu trúc nhu cầu theo ngành"
                subtitle="Tổng hợp theo tên ngành chuẩn, loại trừ các dòng trống để phản ánh đúng mức độ quan tâm thực tế"
              />
              <div className="detail-grid detail-grid--two">
                <div className="subpanel">
                  <h3>CQ: Nhóm ngành quan tâm nổi bật</h3>
                  <SimpleBarTable
                    title="Phân bổ nguyện vọng theo ngành"
                    rows={data.details.cq.interestBreakdown}
                    total={data.details.cq.totalInterestCells}
                  />
                  <SimpleBarTable
                    title="Cơ cấu nguồn phát sinh"
                    rows={data.details.cq.sourceBreakdown}
                    total={data.summary.cqTotal}
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
              </div>
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Thống kê tất cả ngành theo hệ"
                subtitle="Theo dõi theo từng ngày, tổng (sum) và tỷ lệ chuyển đổi theo ngành"
              />
              <div className="industry-toolbar">
                <div className="industry-range-note">
                  Hiển thị {visibleIndustryDays.length} ngày gần nhất mỗi lần xem
                </div>
                <div className="industry-pager" aria-label="Điều hướng ngày thống kê">
                  <button
                    type="button"
                    className="pager-button"
                    onClick={() => setIndustryPage((prev) => Math.max(0, prev - 1))}
                    disabled={safeIndustryPage === 0}
                  >
                    Prev
                  </button>
                  <label className="pager-select-wrap">
                    <span>Trang</span>
                    <select
                      className="pager-select"
                      value={safeIndustryPage}
                      onChange={(event) => setIndustryPage(Number(event.target.value))}
                    >
                      {Array.from({ length: totalIndustryPages }, (_, index) => (
                        <option key={index} value={index}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span>
                    Trang {safeIndustryPage + 1}/{totalIndustryPages}
                  </span>
                  <button
                    type="button"
                    className="pager-button"
                    onClick={() =>
                      setIndustryPage((prev) => Math.min(totalIndustryPages - 1, prev + 1))
                    }
                    disabled={safeIndustryPage >= totalIndustryPages - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="detail-grid detail-grid--two">
                <IndustryTable
                  title="CQ: Ngành (Nguyện vọng 01)"
                  rows={data.industry.cq.rows}
                  visibleDays={visibleIndustryDays}
                />
                <IndustryTable
                  title="NCQ: Ngành"
                  rows={data.industry.ncq.rows}
                  visibleDays={visibleIndustryDays}
                />
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <SectionHeading
                  title="Hệ Chính Quy"
                  subtitle="Phân bổ sale, phễu xử lý và ma trận hiệu suất"
                />
                <div className="two-column">
                  <SimpleBarTable
                    title="Phân bổ NV tư vấn"
                    rows={data.cq.saleBreakdown}
                    total={data.summary.cqTotal}
                  />
                  <SimpleBarTable
                    title="Phễu tổng đã gom nhóm"
                    rows={data.cq.statusBreakdown}
                    total={data.summary.cqTotal}
                  />
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
                  <SimpleBarTable
                    title="Phân bổ NV tư vấn"
                    rows={data.ncq.saleBreakdown}
                    total={data.summary.ncqTotal}
                  />
                  <SimpleBarTable
                    title="Phễu tổng đã gom nhóm"
                    rows={data.ncq.statusBreakdown}
                    total={data.summary.ncqTotal}
                  />
                </div>
                <DataTable title="Ma trận chăm sóc từng sale" rows={data.ncq.matrix} />
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
          </>
        ) : null}
      </div>

      <div
        id="panel-offline"
        role="tabpanel"
        aria-labelledby="tab-offline"
        hidden={active !== "offline"}
        className="tab-panel"
      >
        {active === "offline" ? (
          <>
            <section className="chart-grid tab-grid">
              <StatusPieChart title="Phễu trạng thái Offline" rows={data.offline.statusBreakdown} />
              <TopSalesChart title="Top sale Offline theo tiến độ xử lý" rows={data.offline.matrix} />
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Cấu trúc nhu cầu theo ngành"
                subtitle="Tổng hợp theo tên ngành chuẩn để thấy rõ nhu cầu của nhóm offline"
              />
              <div className="detail-grid detail-grid--single">
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
                subtitle="Theo dõi phân bổ sale của nhóm offline theo ngành"
              />
              <div className="relation-grid relation-grid--single">
                <div className="relation-column">
                  <RelationTable title="Offline: Phân bổ sale -> ngành" rows={data.details.offline.saleToInterest} />
                </div>
              </div>
            </section>

            <section className="dashboard-grid">
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
                  <SimpleBarTable
                    title="Phân bổ NV tư vấn"
                    rows={data.offline.saleBreakdown}
                    total={data.summary.offlineTotal}
                  />
                  <SimpleBarTable
                    title="Phễu tổng đã gom nhóm"
                    rows={data.offline.statusBreakdown}
                    total={data.summary.offlineTotal}
                  />
                </div>
                <DataTable title="Ma trận chăm sóc từng sale" rows={data.offline.matrix} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </section>
  );
}
