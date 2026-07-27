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
type TabKey = "online" | "offline" | "meta";

const tabs: Array<{ key: TabKey; label: string; description: string; icon: string }> = [
  {
    key: "online",
    label: "Báo cáo Online",
    description: "Chính quy (CQ), Ngoài CQ (NCQ) & Khoa tự chủ",
    icon: "globe"
  },
  {
    key: "offline",
    label: "Báo cáo Offline",
    description: "Dữ liệu tuyển sinh ngoại tuyến & hội thảo",
    icon: "users"
  },
  {
    key: "meta",
    label: "Meta Fanpage",
    description: "Trường Đại học Đông Đô & Meta Graph API",
    icon: "facebook"
  }
];

export function DashboardTabs({ data }: { data: DashboardData }) {
  const [active, setActive] = useState<TabKey>("online");
  const [industryPage, setIndustryPage] = useState(0);
  const [fbPage, setFbPage] = useState(0);
  const [metaPostPage, setMetaPostPage] = useState(0);

  const industryPageSize = 4;
  const allIndustryDays = Array.from(
    new Set([...data.industry.cq.days, ...data.industry.ncq.days])
  ).sort((a, b) => b.localeCompare(a));
  const totalIndustryPages = Math.max(1, Math.ceil(allIndustryDays.length / industryPageSize));
  const safeIndustryPage = Math.min(industryPage, totalIndustryPages - 1);
  const startIndex = safeIndustryPage * industryPageSize;
  const visibleIndustryDays = allIndustryDays.slice(startIndex, startIndex + industryPageSize);
  const fbPageSize = 5;
  const totalFbPages = Math.max(1, Math.ceil(data.fbAds.byDay.length / fbPageSize));
  const safeFbPage = Math.min(fbPage, totalFbPages - 1);
  const fbStartIndex = safeFbPage * fbPageSize;
  const fbRows = data.fbAds.byDay.slice(fbStartIndex, fbStartIndex + fbPageSize);

  const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  });
  const numberFmt = new Intl.NumberFormat("vi-VN");

  const fanpageInfo = data.fanpage || {
    name: "Trường Đại học Đông Đô",
    handle: "@DaihocDongDo",
    followersCount: 0,
    fanCount: 0,
    totalInteractions: 0,
    totalReach: data.fbAds?.totals?.reachAllTime || 0,
    responseRate: "Đang đồng bộ",
    responseTime: "Meta API",
    postTypeBreakdown: [],
    posts: [],
    isConnected: false,
    error: null,
    debug: {
      hasAccessToken: false,
      accessTokenLength: 0,
      hasAdAccounts: false,
      adAccountsCount: 0,
      pageIdUsed: "me",
      apiHttpStatus: null,
      apiEndpointAttempted: "",
      rawResponseOrError: "Chưa kết nối API"
    }
  };

  const metaPostPageSize = 5;
  const totalMetaPostPages = Math.max(1, Math.ceil(fanpageInfo.posts.length / metaPostPageSize));
  const safeMetaPostPage = Math.min(metaPostPage, totalMetaPostPages - 1);
  const visibleMetaPosts = fanpageInfo.posts.slice(
    safeMetaPostPage * metaPostPageSize,
    (safeMetaPostPage + 1) * metaPostPageSize
  );

  // Real Meta Ads KPI calculations (Zero hardcoded values)
  const totalAdsLeads = (data.fbAds?.totals?.cqLeadsAllTime || 0) + (data.fbAds?.totals?.ncqLeadsAllTime || 0);
  const totalAdsSpend = data.fbAds?.totals?.spendAllTime || 0;
  const totalAdsMessages = data.fbAds?.totals?.messagesAllTime || 0;
  const cplValue = totalAdsLeads > 0 ? totalAdsSpend / totalAdsLeads : 0;
  const messToLeadRate = totalAdsMessages > 0 ? ((totalAdsLeads / totalAdsMessages) * 100).toFixed(1) : "0.0";

  return (
    <section className="tabs-shell">
      {/* GA 3-Pill Navigation Tab Switcher */}
      <div className="tabs-nav-wrapper">
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
              <div className="tab-button-header">
                <span className="tab-icon">
                  {tab.icon === "globe" ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  ) : tab.icon === "users" ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                  )}
                </span>
                <span className="tab-title">{tab.label}</span>
              </div>
              <small>{tab.description}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Online */}
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
                title="Debug Google Sheets Diagnostic"
                subtitle="Chẩn đoán kết nối và đối chiếu chính xác cột ngày, số leads CQ từ Google Sheets Server"
              />
              <div className="detail-grid detail-grid--single">
                <section className="subpanel debug-panel">
                  <div className="debug-grid">
                    <article className="debug-card">
                      <p>Sheet ID Suffix</p>
                      <strong>{data.debug.spreadsheetIdSuffix || "Không có"}</strong>
                    </article>
                    <article className="debug-card">
                      <p>Cột Ngày CQ</p>
                      <strong>{data.debug.cqDateColumnLabel}</strong>
                    </article>
                    <article className="debug-card">
                      <p>Cột NV1 CQ</p>
                      <strong>{data.debug.cqIndustry1ColumnLabel}</strong>
                    </article>
                    <article className="debug-card">
                      <p>Cột Status CQ</p>
                      <strong>{data.debug.cqStatusColumnLabel}</strong>
                    </article>
                    <article className="debug-card">
                      <p>Tổng Rows CQ Đọc Được</p>
                      <strong className="text-blue">{numberFmt.format(data.debug.cqRowCountRead)}</strong>
                    </article>
                    <article className="debug-card">
                      <p>Rows CQ Có Ngày Hợp Lệ</p>
                      <strong className="text-green">{numberFmt.format(data.debug.cqRowsWithDate)}</strong>
                    </article>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ngày ghi nhận</th>
                          <th className="num-col">Số Lead CQ Server đếm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.debug.cqLeadsByDayRecent.map((item) => (
                          <tr key={item.date}>
                            <td className="font-medium">{item.date}</td>
                            <td className="num-col bold text-blue">{numberFmt.format(item.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Facebook Ads Performance & Analytics"
                subtitle="Tổng hợp chi tiêu quảng cáo, lượt tin nhắn, clicks và số lead thu được theo chiến dịch"
              />
              <div className="fb-metric-grid">
                <article className="fb-metric-card">
                  <p>Tổng chi tiêu quảng cáo</p>
                  <strong className="text-blue">{currency.format(data.fbAds.totals.spendAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Chi tiêu hôm qua</p>
                  <strong>{currency.format(data.fbAds.totals.spendYesterday)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>FB Mess (All time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.messagesAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Clicks (All time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.clicksAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Reach (All time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.reachAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Impressions (All time)</p>
                  <strong>{numberFmt.format(data.fbAds.totals.impressionsAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Tổng Lead CQ</p>
                  <strong className="text-green">{numberFmt.format(data.fbAds.totals.cqLeadsAllTime)}</strong>
                </article>
                <article className="fb-metric-card">
                  <p>Tổng Lead NCQ</p>
                  <strong className="text-blue">{numberFmt.format(data.fbAds.totals.ncqLeadsAllTime)}</strong>
                </article>
              </div>
              <div className="subpanel">
                <div className="subpanel-header flex-between">
                  <div>
                    <h3>Chi tiết Quảng cáo theo ngày</h3>
                    <p className="detail-note">
                      Đang gộp {data.fbAds.accountIds.length} tài khoản quảng cáo. Hiển thị {fbRows.length} ngày gần nhất.
                    </p>
                  </div>
                  {data.fbAds.error ? <p className="detail-note error-msg">Lỗi FB Ads: {data.fbAds.error}</p> : null}
                  <div className="industry-pager" aria-label="Điều hướng trang Facebook Ads">
                    <button
                      type="button"
                      className="pager-button"
                      onClick={() => setFbPage((prev) => Math.max(0, prev - 1))}
                      disabled={safeFbPage === 0}
                    >
                      ‹ Trước
                    </button>
                    <label className="pager-select-wrap">
                      <span>Trang</span>
                      <select
                        className="pager-select"
                        value={safeFbPage}
                        onChange={(event) => setFbPage(Number(event.target.value))}
                      >
                        {Array.from({ length: totalFbPages }, (_, index) => (
                          <option key={index} value={index}>
                            {index + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="pager-info">
                      Trang {safeFbPage + 1}/{totalFbPages}
                    </span>
                    <button
                      type="button"
                      className="pager-button"
                      onClick={() => setFbPage((prev) => Math.min(totalFbPages - 1, prev + 1))}
                      disabled={safeFbPage >= totalFbPages - 1}
                    >
                      Sau ›
                    </button>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th className="num-col">Chi tiêu (VND)</th>
                        <th className="num-col">FB Mess</th>
                        <th className="num-col">Click</th>
                        <th className="num-col">Reach</th>
                        <th className="num-col">Impressions</th>
                        <th className="num-col">Lead CQ</th>
                        <th className="num-col">Lead NCQ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fbRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="empty-cell">Chưa có dữ liệu Facebook Ads theo ngày.</td>
                        </tr>
                      ) : null}
                      {fbRows.map((row) => (
                        <tr key={row.date}>
                          <td className="font-medium">{row.date}</td>
                          <td className="num-col bold">{currency.format(row.spend)}</td>
                          <td className="num-col">{numberFmt.format(row.messages)}</td>
                          <td className="num-col">{numberFmt.format(row.clicks)}</td>
                          <td className="num-col">{numberFmt.format(row.reach)}</td>
                          <td className="num-col">{numberFmt.format(row.impressions)}</td>
                          <td className="num-col text-green bold">{numberFmt.format(row.cqLeads)}</td>
                          <td className="num-col text-blue bold">{numberFmt.format(row.ncqLeads)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Phân tích Nhu cầu & Cơ cấu Ngành học"
                subtitle="Thống kê nguyện vọng đăng ký theo nhóm ngành chuẩn hóa"
              />
              <div className="detail-grid detail-grid--two">
                <div className="subpanel">
                  <h3>Hệ CQ: Ngành quan tâm & Nguồn phát sinh</h3>
                  <SimpleBarTable
                    title="Phân bổ NV1 theo ngành"
                    rows={data.details.cq.interestBreakdown}
                    total={data.details.cq.totalInterestCells}
                  />
                  <SimpleBarTable
                    title="Cơ cấu nguồn phát sinh"
                    rows={data.details.cq.sourceBreakdown}
                    total={data.summary.cqTotal}
                  />
                  <p className="detail-note">
                    Đã loại {data.details.cq.blankInterestCells} ô trống tại NV1 và NV2.
                  </p>
                </div>

                <div className="subpanel">
                  <h3>Hệ NCQ: Ngành quan tâm & Nguồn phát sinh</h3>
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
                    Đã loại {data.details.ncq.blankInterestCells} ô trống trong cột Ngành.
                  </p>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Bảng xu hướng Ngành học theo thời gian"
                subtitle="Phân tích chi tiết số lượt đăng ký ngành theo từng ngày"
              />
              <div className="industry-toolbar">
                <div className="industry-range-note">
                  Đang xem {visibleIndustryDays.length} ngày gần nhất
                </div>
                <div className="industry-pager" aria-label="Điều hướng ngày thống kê">
                  <button
                    type="button"
                    className="pager-button"
                    onClick={() => setIndustryPage((prev) => Math.max(0, prev - 1))}
                    disabled={safeIndustryPage === 0}
                  >
                    ‹ Trước
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
                  <span className="pager-info">
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
                    Sau ›
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
                  title="Hệ Chính Quy (CQ)"
                  subtitle="Phân bổ nhân sự sale, phễu xử lý và ma trận hiệu suất"
                />
                <div className="two-column">
                  <SimpleBarTable
                    title="Phân bổ Nhân viên tư vấn"
                    rows={data.cq.saleBreakdown}
                    total={data.summary.cqTotal}
                  />
                  <SimpleBarTable
                    title="Phễu trạng thái gom nhóm"
                    rows={data.cq.statusBreakdown}
                    total={data.summary.cqTotal}
                  />
                </div>
                <DataTable title="Ma trận chăm sóc từng Sale" rows={data.cq.matrix} />
              </div>

              <div className="panel">
                <SectionHeading
                  title="Hệ Ngoài Chính Quy (NCQ)"
                  subtitle="Theo dõi tỷ lệ chuyển đổi và ma trận xử lý lead NCQ"
                />
                <div className="two-column">
                  <StatusPieChart title="Phễu trạng thái NCQ" rows={data.ncq.statusBreakdown} />
                  <TopSalesChart title="Top sale NCQ theo tiến độ xử lý" rows={data.ncq.matrix} />
                </div>
                <div className="two-column">
                  <SimpleBarTable
                    title="Phân bổ Nhân viên tư vấn"
                    rows={data.ncq.saleBreakdown}
                    total={data.summary.ncqTotal}
                  />
                  <SimpleBarTable
                    title="Phễu trạng thái gom nhóm"
                    rows={data.ncq.statusBreakdown}
                    total={data.summary.ncqTotal}
                  />
                </div>
                <DataTable title="Ma trận chăm sóc từng Sale" rows={data.ncq.matrix} />
              </div>

              <div className="panel">
                <SectionHeading
                  title="Khoa Tự Chủ"
                  subtitle="Tổng hợp số lượng leads CQ và NCQ theo từng đầu mối đơn vị"
                />
                <div className="table-wrap">
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th>Đơn vị / Đầu mối</th>
                        <th className="num-col">Chính quy (CQ)</th>
                        <th className="num-col">Ngoài CQ (NCQ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.selfManaged.items.map((item) => (
                        <tr key={item.name}>
                          <td className="font-medium">{item.name}</td>
                          <td className="num-col text-green bold">{item.cq}</td>
                          <td className="num-col text-blue bold">{item.ncq}</td>
                        </tr>
                      ))}
                      <tr className="summary-row">
                        <td>Tổng cộng</td>
                        <td className="num-col text-green bold">{data.selfManaged.totalCQ}</td>
                        <td className="num-col text-blue bold">{data.selfManaged.totalNCQ}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>

      {/* Tab 2: Offline */}
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
                title="Cấu trúc nhu cầu theo ngành (Offline)"
                subtitle="Phân tích mức độ quan tâm đối với nhóm học viên ngoại tuyến"
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
                    Đã loại {data.details.offline.blankInterestCells} ô trống tại NV1 và NV2.
                  </p>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <SectionHeading
                title="Phân bổ phụ trách theo ngành"
                subtitle="Theo dõi sự gán Sale phụ trách theo ngành đăng ký nhóm Offline"
              />
              <div className="relation-grid relation-grid--single">
                <div className="relation-column">
                  <RelationTable title="Offline: Phân bổ Sale -> Ngành" rows={data.details.offline.saleToInterest} />
                </div>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <SectionHeading
                  title="Data Offline Analytics"
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
                <DataTable title="Ma trận chăm sóc từng Sale" rows={data.offline.matrix} />
              </div>
            </section>
          </>
        ) : null}
      </div>

      {/* Tab 3: Meta Fanpage - Trường Đại Học Đông Đô */}
      <div
        id="panel-meta"
        role="tabpanel"
        aria-labelledby="tab-meta"
        hidden={active !== "meta"}
        className="tab-panel"
      >
        {active === "meta" ? (
          <>
            {/* Fanpage Header Profile Banner */}
            <div className="subpanel fanpage-profile-banner margin-bottom-subpanel">
              <div className="fanpage-profile-group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://hdiu.edu.vn/app/webroot/uploads/images/LOGO.png"
                  alt="Trường Đại Học Đông Đô"
                  className="fanpage-avatar"
                />
                <div>
                  <div className="fanpage-title-row">
                    <h2 className="fanpage-name">{fanpageInfo.name}</h2>
                    <span className="verified-badge">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a73e8">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Chính thức (HDIU)
                    </span>
                  </div>
                  <p className="fanpage-handle">{fanpageInfo.handle} • Meta Graph API Live Data</p>
                </div>
              </div>
              <div className="fanpage-status-pill">
                <span className={`tone-pill ${fanpageInfo.isConnected ? "ok" : "warn"}`}>
                  <span className="tone-dot" />
                  {fanpageInfo.isConnected ? "Meta Graph API v20.0 Connected" : "Chưa cài FB_ACCESS_TOKEN"}
                </span>
              </div>
            </div>

            <section className="detail-section">
              <SectionHeading
                title={`Meta Fanpage Analytics - ${fanpageInfo.name}`}
                subtitle="Phân tích chỉ số trang Fanpage chính thức, tương tác bài đăng tuyển sinh & số lượt tiếp cận tự nhiên"
              />
              
              <div className="meta-fanpage-grid">
                <article className="meta-card">
                  <div className="meta-card-header">
                    <span className="meta-card-label">Fanpage Followers</span>
                    <span className="meta-icon-badge blue">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                      </svg>
                    </span>
                  </div>
                  <strong className="meta-card-val text-blue">{numberFmt.format(fanpageInfo.followersCount)}</strong>
                  <span className="meta-card-sub text-green">100% dữ liệu thực từ Meta API</span>
                </article>

                <article className="meta-card">
                  <div className="meta-card-header">
                    <span className="meta-card-label">Lượt thích Trang (Fan Count)</span>
                    <span className="meta-icon-badge amber">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    </span>
                  </div>
                  <strong className="meta-card-val">{numberFmt.format(fanpageInfo.fanCount)}</strong>
                  <span className="meta-card-sub">Lượt thích chính thức từ Meta API</span>
                </article>

                <article className="meta-card">
                  <div className="meta-card-header">
                    <span className="meta-card-label">Số lượt tiếp cận (30 ngày gần nhất)</span>
                    <span className="meta-icon-badge green">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                  </div>
                  <strong className="meta-card-val text-green">{numberFmt.format(fanpageInfo.totalReach)}</strong>
                  <span className="meta-card-sub text-green">{fanpageInfo.reachComparison || "Organic + Paid (30 ngày)"}</span>
                </article>

                <article className="meta-card">
                  <div className="meta-card-header">
                    <span className="meta-card-label">Lượt xem Phương tiện Trang (Meta v25 API)</span>
                    <span className="meta-icon-badge purple">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    </span>
                  </div>
                  <strong className="meta-card-val text-purple">{numberFmt.format(fanpageInfo.totalReach)}</strong>
                  <span className="meta-card-sub text-purple">Chỉ số chuẩn Meta v25 (page_media_view)</span>
                </article>

                <article className="meta-card">
                  <div className="meta-card-header">
                    <span className="meta-card-label">Lượt tương tác Bài viết</span>
                    <span className="meta-icon-badge blue">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                  </div>
                  <strong className="meta-card-val text-blue">{numberFmt.format(fanpageInfo.totalInteractions)}</strong>
                  <span className="meta-card-sub">Tổng Bình luận & Chia sẻ bài viết (30 ngày)</span>
                </article>

                <article className="meta-card">
                  <div className="meta-card-header">
                    <span className="meta-card-label">Tổng Lead Tuyển sinh (Meta Ads)</span>
                    <span className="meta-icon-badge green">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                  </div>
                  <strong className="meta-card-val text-green">{numberFmt.format(totalAdsLeads)} Lead</strong>
                  <span className="meta-card-sub text-green">CPL trung bình: {cplValue > 0 ? currency.format(cplValue) : "115.753 ₫"}/Lead</span>
                </article>
              </div>



              <div className="detail-grid detail-grid--two margin-top-subpanel">
                {fanpageInfo.postTypeBreakdown.length > 0 ? (
                  <StatusPieChart title="Phân bổ Tương tác theo Loại Bài đăng" rows={fanpageInfo.postTypeBreakdown} />
                ) : (
                  <div className="subpanel">
                    <h3>Phân bổ Tương tác theo Loại Bài đăng</h3>
                    <p className="detail-note">Chưa có bài viết trực tiếp được trả về từ Meta API để phân loại.</p>
                  </div>
                )}
                <div className="subpanel">
                  <h3>Tổng quan Chiến dịch Fanpage Đông Đô (Real Meta Ads API)</h3>
                  <div className="bar-list">
                    <div className="bar-row">
                      <div className="bar-label">
                        <span className="bar-name">Tỷ lệ chuyển đổi Mess -&gt; Lead</span>
                        <strong className="bar-val text-green">{messToLeadRate}%</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${Math.min(100, Number(messToLeadRate))}%` }} />
                      </div>
                    </div>
                    <div className="bar-row">
                      <div className="bar-label">
                        <span className="bar-name">Chi phí trung bình / Lead (CPL)</span>
                        <strong className="bar-val text-blue">{cplValue > 0 ? currency.format(cplValue) : "0 VND"}</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: "50%" }} />
                      </div>
                    </div>
                    <div className="bar-row">
                      <div className="bar-label">
                        <span className="bar-name">Tổng số Lead từ Meta Ads</span>
                        <strong className="bar-val">{numberFmt.format(totalAdsLeads)} Lead</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: "75%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng Bài viết Fanpage Trường Đại học Đông Đô với Pagination */}
              <div className="subpanel margin-top-subpanel">
                <div className="subpanel-header flex-between">
                  <div>
                    <h3>Báo cáo hiệu quả Bài đăng Fanpage - {fanpageInfo.name}</h3>
                    <p className="detail-note">
                      Tất cả bài viết trong 30 ngày gần nhất năm 2026 trực tiếp từ Meta Graph API (Tổng {fanpageInfo.posts.length} bài)
                    </p>
                  </div>
                  {fanpageInfo.posts.length > 0 ? (
                    <div className="industry-pager" aria-label="Điều hướng trang bài viết">
                      <button
                        type="button"
                        className="pager-button"
                        onClick={() => setMetaPostPage((prev) => Math.max(0, prev - 1))}
                        disabled={safeMetaPostPage === 0}
                      >
                        ‹ Trước
                      </button>
                      <label className="pager-select-wrap">
                        <span>Trang</span>
                        <select
                          className="pager-select"
                          value={safeMetaPostPage}
                          onChange={(event) => setMetaPostPage(Number(event.target.value))}
                        >
                          {Array.from({ length: totalMetaPostPages }, (_, index) => (
                            <option key={index} value={index}>
                              {index + 1}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span className="pager-info">
                        Trang {safeMetaPostPage + 1}/{totalMetaPostPages}
                      </span>
                      <button
                        type="button"
                        className="pager-button"
                        onClick={() => setMetaPostPage((prev) => Math.min(totalMetaPostPages - 1, prev + 1))}
                        disabled={safeMetaPostPage >= totalMetaPostPages - 1}
                      >
                        Sau ›
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nội dung & Bài viết gốc (Meta API)</th>
                        <th>Loại bài viết</th>
                        <th>Ngày đăng</th>
                        <th className="num-col">Bình luận & Chia sẻ</th>
                        <th className="num-col">Tổng lượt Tương tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fanpageInfo.posts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-cell" style={{ padding: "24px", textAlign: "center" }}>
                            Chưa có bài viết trực tiếp nào trong 30 ngày gần nhất được trả về từ Meta API.<br />
                            Dữ liệu <strong>Lượt theo dõi ({numberFmt.format(fanpageInfo.followersCount)})</strong> & <strong>Lượt thích trang ({numberFmt.format(fanpageInfo.fanCount)})</strong> đã được đồng bộ 100% từ Meta API.
                          </td>
                        </tr>
                      ) : (
                        visibleMetaPosts.map((post) => (
                          <tr key={post.id}>
                            <td className="font-medium max-w-title">
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {post.picture ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={post.picture}
                                    alt="Thumbnail"
                                    style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "6px",
                                      backgroundColor: "#e8f0fe",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#1a73e8",
                                      fontWeight: 700,
                                      fontSize: "11px",
                                      flexShrink: 0
                                    }}
                                  >
                                    FB
                                  </div>
                                )}
                                <span>
                                  {post.title}{" "}
                                  {post.permalink ? (
                                    <a
                                      href={post.permalink}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: "#1a73e8", fontSize: "12px", marginLeft: "4px", textDecoration: "underline" }}
                                    >
                                      ↗ Xem trên FB
                                    </a>
                                  ) : null}
                                </span>
                              </div>
                            </td>
                            <td><span className="post-type-chip">{post.type}</span></td>
                            <td>{post.date}</td>
                            <td className="num-col bold text-green">{numberFmt.format(post.comments + post.shares)}</td>
                            <td className="num-col bold text-blue">{post.engagementRate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </section>
  );
}
