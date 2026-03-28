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
type IndustryDaysKey = "d7" | "d30" | "d90" | "all";

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
  const [industryDays, setIndustryDays] = useState<IndustryDaysKey>("d30");
  const [industryPeriod, setIndustryPeriod] = useState<"day" | "week">("week");

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
                subtitle="Theo dõi biến động theo days/period và tỷ lệ chuyển đổi theo ngành"
              />
              <div className="industry-toolbar">
                <div className="segmented" role="tablist" aria-label="Khoảng ngày thống kê">
                  <button
                    type="button"
                    className="segmented-button"
                    data-active={industryDays === "d7"}
                    onClick={() => setIndustryDays("d7")}
                  >
                    7D
                  </button>
                  <button
                    type="button"
                    className="segmented-button"
                    data-active={industryDays === "d30"}
                    onClick={() => setIndustryDays("d30")}
                  >
                    30D
                  </button>
                  <button
                    type="button"
                    className="segmented-button"
                    data-active={industryDays === "d90"}
                    onClick={() => setIndustryDays("d90")}
                  >
                    90D
                  </button>
                  <button
                    type="button"
                    className="segmented-button"
                    data-active={industryDays === "all"}
                    onClick={() => setIndustryDays("all")}
                  >
                    ALL
                  </button>
                </div>
                <div className="segmented" role="tablist" aria-label="Chu kỳ so sánh">
                  <button
                    type="button"
                    className="segmented-button"
                    data-active={industryPeriod === "day"}
                    onClick={() => setIndustryPeriod("day")}
                  >
                    Theo ngày
                  </button>
                  <button
                    type="button"
                    className="segmented-button"
                    data-active={industryPeriod === "week"}
                    onClick={() => setIndustryPeriod("week")}
                  >
                    Theo tuần
                  </button>
                </div>
              </div>
              <div className="detail-grid detail-grid--two">
                <IndustryTable
                  title="CQ: Ngành (Nguyện vọng 01)"
                  rows={data.industry.cq[industryDays]}
                  period={industryPeriod}
                />
                <IndustryTable
                  title="NCQ: Ngành"
                  rows={data.industry.ncq[industryDays]}
                  period={industryPeriod}
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
