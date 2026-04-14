import { unstable_noStore as noStore } from "next/cache";
import { google } from "googleapis";

type RawCell = string | number | boolean | null;
type RawRow = RawCell[];

type SimpleCount = {
  name: string;
  count: number;
};

type MatrixCount = {
  name: string;
  total: number;
  thanhCong: number;
  dangXuLy: number;
  thatBai: number;
  chuaLH: number;
};

type SelfManagedItem = {
  name: string;
  cq: number;
  ncq: number;
};

type RelationInterestRow = {
  name: string;
  total: number;
  topInterests: SimpleCount[];
  blankInterestCells: number;
};

type IndustryTimelineRow = {
  name: string;
  total: number;
  conversionRate: number;
  dailyCounts: Record<string, number>;
};

type IndustryTimeline = {
  days: string[];
  rows: IndustryTimelineRow[];
};

type FbDailyInsight = {
  date: string;
  spend: number;
  messages: number;
  clicks: number;
  reach: number;
  impressions: number;
  cqLeads: number;
  ncqLeads: number;
};

type FbAdsPayload = {
  enabled: boolean;
  accountIds: string[];
  totals: {
    spendAllTime: number;
    spendYesterday: number;
    spendToday: number;
    messagesAllTime: number;
    clicksAllTime: number;
    reachAllTime: number;
    impressionsAllTime: number;
    cqLeadsAllTime: number;
    ncqLeadsAllTime: number;
  };
  byDay: FbDailyInsight[];
  error: string | null;
};

type DashboardPayload = {
  generatedAt: string;
  timezone: string;
  isDemo: boolean;
  summary: {
    totalLeads: number;
    cqTotal: number;
    ncqTotal: number;
    offlineTotal: number;
    selfManagedTotal: number;
  };
  details: {
    cq: {
      interestBreakdown: SimpleCount[];
      sourceBreakdown: SimpleCount[];
      sourceToInterest: RelationInterestRow[];
      saleToInterest: RelationInterestRow[];
      blankInterestCells: number;
      totalInterestCells: number;
    };
    ncq: {
      interestBreakdown: SimpleCount[];
      sourceBreakdown: SimpleCount[];
      sourceToInterest: RelationInterestRow[];
      saleToInterest: RelationInterestRow[];
      blankInterestCells: number;
      totalInterestCells: number;
    };
    offline: {
      interestBreakdown: SimpleCount[];
      saleToInterest: RelationInterestRow[];
      blankInterestCells: number;
      totalInterestCells: number;
    };
  };
  industry: {
    cq: IndustryTimeline;
    ncq: IndustryTimeline;
  };
  cq: {
    saleBreakdown: SimpleCount[];
    statusBreakdown: SimpleCount[];
    matrix: MatrixCount[];
  };
  ncq: {
    saleBreakdown: SimpleCount[];
    statusBreakdown: SimpleCount[];
    matrix: MatrixCount[];
  };
  offline: {
    saleBreakdown: SimpleCount[];
    statusBreakdown: SimpleCount[];
    matrix: MatrixCount[];
  };
  selfManaged: {
    items: SelfManagedItem[];
    totalCQ: number;
    totalNCQ: number;
  };
  fbAds: FbAdsPayload;
};

const sheetNames = ["CQ_Status", "NCQ_Status", "Offline_Status", "Data_TuChu"] as const;

function cellToString(value: RawCell) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeStatus(value: RawCell) {
  if (!cellToString(value)) return "5. Chưa liên hệ";
  const str = cellToString(value).toLowerCase();

  if (str.includes("đã nhập học") || str.includes("da nhap hoc")) {
    return "1. Thành công";
  }
  if (
    str.includes("tiềm năng") ||
    str.includes("tienm nang") ||
    str.includes("tư vấn") ||
    str.includes("tư vẫn") ||
    str.includes("tu van") ||
    str.includes("đã nộp hs") ||
    str.includes("da nop hs") ||
    str.includes("nộp hồ sơ")
  ) {
    return "2. Tiềm năng";
  }
  if (
    str.includes("đã liên hệ") ||
    str.includes("da lien he") ||
    str.includes("không nghe máy") ||
    str.includes("khong nghe may") ||
    str.includes("thuê bao") ||
    str.includes("thue bao")
  ) {
    return "3. Đang xử lý";
  }
  if (
    str.includes("không có nhu cầu") ||
    str.includes("khong co nhu cau") ||
    str.includes("đã rút") ||
    str.includes("da rut") ||
    str.includes("sai số") ||
    str.includes("sai so")
  ) {
    return "4. K.H hỏng";
  }
  if (str === "tình trạng" || str === "tinh trang") {
    return "5. Chưa liên hệ";
  }

  return "3. Đang xử lý";
}
function normalizeOfflineStatus(value: RawCell) {
  if (!cellToString(value)) return "5. Chưa liên hệ";
  const str = cellToString(value).toLowerCase();

  if (str.includes("đã nhập học") || str.includes("da nhap hoc")) {
    return "1. Thành công";
  }
  if (
    str.includes("tiềm năng") ||
    str.includes("tienm nang") ||
    str.includes("tư vấn") ||
    str.includes("tư vẫn") ||
    str.includes("tu van") ||
    str.includes("đã nộp hs") ||
    str.includes("da nop hs") ||
    str.includes("nộp hồ sơ")
  ) {
    return "2. Tiềm năng";
  }
  if (
    str.includes("đã liên hệ") ||
    str.includes("da lien he") ||
    str.includes("không nghe máy") ||
    str.includes("khong nghe may") ||
    str.includes("thuê bao") ||
    str.includes("thue bao")
  ) {
    return "3. Đang xử lý";
  }
  if (
    str.includes("không có nhu cầu") ||
    str.includes("khong co nhu cau") ||
    str.includes("đã rút") ||
    str.includes("da rut") ||
    str.includes("sai số") ||
    str.includes("sai so")
  ) {
    return "4. K.H hỏng";
  }

  return "3. Đang xử lý";
}

function countByStatus(data: RawRow[], columnIndex: number, normalizer: (value: RawCell) => string) {
  const result: Record<string, number> = {};

  for (const row of data) {
    const value = row[columnIndex];
    const key = normalizer(value);
    result[key] = (result[key] || 0) + 1;
  }

  return Object.entries(result)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function countBy(
  data: RawRow[],
  columnIndex: number,
  normalizer?: (value: RawCell) => string,
  emptyLabel = "Chưa phân bổ NV"
) {
  const result: Record<string, number> = {};

  for (const row of data) {
    const value = row[columnIndex];
    const key = normalizer ? normalizer(value) : cellToString(value) || emptyLabel;
    result[key] = (result[key] || 0) + 1;
  }

  return Object.entries(result)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function countMultipleColumns(data: RawRow[], columnIndices: number[]) {
  const result: Record<string, number> = {};
  let blankCount = 0;

  for (const row of data) {
    for (const index of columnIndices) {
      const value = cellToString(row[index]);
      if (!value) {
        blankCount += 1;
        continue;
      }

      result[value] = (result[value] || 0) + 1;
    }
  }

  return {
    rows: Object.entries(result)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    blankCount
  };
}

function buildRelationInterest(
  data: RawRow[],
  relationColumn: number,
  interestColumns: number[]
) {
  const buckets: Record<
    string,
    {
      name: string;
      total: number;
      blankInterestCells: number;
      interests: Record<string, number>;
    }
  > = {};

  for (const row of data) {
    const relation = cellToString(row[relationColumn]) || "Chưa phân bổ";
    if (!buckets[relation]) {
      buckets[relation] = {
        name: relation,
        total: 0,
        blankInterestCells: 0,
        interests: {}
      };
    }

    const bucket = buckets[relation];
    for (const index of interestColumns) {
      const value = cellToString(row[index]);
      if (!value) {
        bucket.blankInterestCells += 1;
        continue;
      }

      bucket.total += 1;
      bucket.interests[value] = (bucket.interests[value] || 0) + 1;
    }
  }

  return Object.values(buckets)
    .map((bucket) => ({
      name: bucket.name,
      total: bucket.total,
      blankInterestCells: bucket.blankInterestCells,
      topInterests: Object.entries(bucket.interests)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    }))
    .sort((a, b) => b.total - a.total);
}

function buildSaleMatrix(
  data: RawRow[],
  saleColIdx: number,
  statusColIdx: number,
  normalizer: (value: RawCell) => string
) {
  const result: Record<string, MatrixCount> = {};

  for (const row of data) {
    const sale = cellToString(row[saleColIdx]) || "Chưa phân bổ NV";
    const statusGroup = normalizer(row[statusColIdx]);

    if (!result[sale]) {
      result[sale] = {
        name: sale,
        total: 0,
        thanhCong: 0,
        dangXuLy: 0,
        thatBai: 0,
        chuaLH: 0
      };
    }

    result[sale].total += 1;

    if (statusGroup.startsWith("1.")) {
      result[sale].thanhCong += 1;
    } else if (statusGroup.startsWith("2.") || statusGroup.startsWith("3.")) {
      result[sale].dangXuLy += 1;
    } else if (statusGroup.startsWith("4.")) {
      result[sale].thatBai += 1;
    } else if (statusGroup.startsWith("5.")) {
      result[sale].chuaLH += 1;
    } else {
      result[sale].dangXuLy += 1;
    }
  }

  return Object.values(result).sort((a, b) => b.total - a.total);
}

function parseDate(value: RawCell): Date | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    // Google Sheets / Excel serial date number.
    const serialDate = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!Number.isNaN(serialDate.getTime())) return serialDate;
  }

  const text = typeof value === "string" ? value.trim() : String(value).trim();
  if (!text) return null;

  const asNumber = Number(text);
  if (!Number.isNaN(asNumber) && /^\d+(\.\d+)?$/.test(text)) {
    const serialDate = new Date(Math.round((asNumber - 25569) * 86400 * 1000));
    if (!Number.isNaN(serialDate.getTime())) return serialDate;
  }

  const viMatch = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (viMatch) {
    const day = Number(viMatch[1]);
    const month = Number(viMatch[2]);
    const yearRaw = Number(viMatch[3]);
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const hour = Number(viMatch[4] || 0);
    const minute = Number(viMatch[5] || 0);
    const second = Number(viMatch[6] || 0);

    const viDate = new Date(year, month - 1, day, hour, minute, second);
    if (!Number.isNaN(viDate.getTime())) return viDate;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDayKeyFromCell(value: RawCell): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    const serialDate = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(serialDate.getTime()) ? null : dayKey(serialDate);
  }

  const text = typeof value === "string" ? value.trim() : String(value).trim();
  if (!text) return null;

  const isoPrefix = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (isoPrefix) {
    return `${isoPrefix[1]}-${isoPrefix[2]}-${isoPrefix[3]}`;
  }

  const viMatch = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (viMatch) {
    const day = String(Number(viMatch[1])).padStart(2, "0");
    const month = String(Number(viMatch[2])).padStart(2, "0");
    const yearRaw = Number(viMatch[3]);
    const year = String(yearRaw < 100 ? 2000 + yearRaw : yearRaw);
    return `${year}-${month}-${day}`;
  }

  const asNumber = Number(text);
  if (!Number.isNaN(asNumber) && /^\d+(\.\d+)?$/.test(text)) {
    const serialDate = new Date(Math.round((asNumber - 25569) * 86400 * 1000));
    return Number.isNaN(serialDate.getTime()) ? null : dayKey(serialDate);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : dayKey(parsed);
}

function countRowsByDay(data: RawRow[], dateIdx: number) {
  const result: Record<string, number> = {};

  for (const row of data) {
    const key = parseDayKeyFromCell(row[dateIdx]);
    if (!key) continue;
    result[key] = (result[key] || 0) + 1;
  }

  return result;
}

function normalizeSourceName(value: RawCell) {
  const raw = cellToString(value);
  if (!raw) return "Chưa có nguồn";

  const normalized = raw.replace(/\s+/g, " ").trim();
  const key = normalized.toLocaleLowerCase("vi-VN");

  const aliases: Record<string, string> = {
    "fb ads": "Facebook ADS",
    "facebook ads": "Facebook ADS",
    "facebook ad": "Facebook ADS",
    "fbad": "Facebook ADS",
    "facebook": "Facebook ADS"
  };

  return aliases[key] || normalized;
}
function normalizeIndustryName(value: RawCell) {
  const raw = cellToString(value);
  if (!raw) return "Chưa có ngành";

  const withoutCode = raw.replace(/\s*-\s*\d+\s*$/, "").replace(/\s+/g, " ").trim();
  const key = withoutCode.toLocaleLowerCase("vi-VN");

  const aliases: Record<string, string> = {
    "quản trị kinh doanh": "Quản trị kinh doanh",
    "kỹ thuật xét nghiệm y học": "Kỹ thuật xét nghiệm y học",
    "ngôn ngữ trung quốc": "Ngôn ngữ Trung Quốc",
    "ngôn ngữ hàn quốc": "Ngôn ngữ Hàn Quốc",
    "ngôn ngữ nhật bản": "Ngôn ngữ Nhật Bản",
    "thú y": "Thú y",
    "điều dưỡng": "Điều dưỡng",
    "kế toán": "Kế toán",
    "tài chính ngân hàng": "Tài chính ngân hàng",
    "thương mại điện tử": "Thương mại điện tử",
    "công nghệ thông tin": "Công nghệ thông tin",
    "công nghệ kỹ thuật ô tô": "Công nghệ kỹ thuật ô tô",
    "luật kinh tế": "Luật kinh tế",
    "dược học": "Dược học"
  };

  return aliases[key] || withoutCode;
}
function buildIndustryTimeline(
  data: RawRow[],
  dateIdx: number,
  industryIndices: number[],
  statusIdx: number,
  normalizer: (value: RawCell) => string
): IndustryTimeline {
  const stats: Record<
    string,
    {
      total: number;
      success: number;
      dailyCounts: Record<string, number>;
    }
  > = {};
  const dayKeys = new Set<string>();

  for (const row of data) {
    const key = parseDayKeyFromCell(row[dateIdx]);
    if (!key) continue;
    const industriesInRow = new Set(
      industryIndices
        .map((index) => cellToString(row[index]))
        .filter((value) => value !== "")
        .map((value) => normalizeIndustryName(value))
    );
    if (industriesInRow.size === 0) continue;
    const statusGroup = normalizer(row[statusIdx]);

    for (const industry of industriesInRow) {
      if (!stats[industry]) {
        stats[industry] = {
          total: 0,
          success: 0,
          dailyCounts: {}
        };
      }

      const bucket = stats[industry];
      dayKeys.add(key);
      bucket.total += 1;
      bucket.dailyCounts[key] = (bucket.dailyCounts[key] || 0) + 1;

      if (statusGroup.startsWith("1.")) {
        bucket.success += 1;
      }
    }
  }

  const rows = Object.entries(stats)
    .map(([name, item]) => ({
      name,
      total: item.total,
      conversionRate: item.total > 0 ? (item.success / item.total) * 100 : 0,
      dailyCounts: item.dailyCounts
    }))
    .sort((a, b) => b.total - a.total);

  return {
    days: [...dayKeys].sort((a, b) => b.localeCompare(a)),
    rows
  };
}
function cleanRowsByAnyValue(rows: RawRow[], keyIndices: number[]) {
  return rows.filter((row) => keyIndices.some((index) => cellToString(row[index]) !== ""));
}

function toRows(values: unknown[][] | undefined) {
  if (!values || values.length <= 1) return [];
  return values.slice(1) as RawRow[];
}

function buildSelfManaged(rows: RawRow[]) {
  const grouped: Record<string, SelfManagedItem> = {};
  let totalCQ = 0;
  let totalNCQ = 0;

  for (const row of rows) {
    const source = cellToString(row[0]);
    const system = cellToString(row[1]).toUpperCase();

    if (!source) continue;

    if (!grouped[source]) {
      grouped[source] = { name: source, cq: 0, ncq: 0 };
    }

    if (system === "CQ") {
      grouped[source].cq += 1;
      totalCQ += 1;
    } else if (system === "NCQ") {
      grouped[source].ncq += 1;
      totalNCQ += 1;
    }
  }

  return {
    items: Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name, "vi")),
    totalCQ,
    totalNCQ
  };
}

function buildInterestByColumn(data: RawRow[], interestColumns: number[], sourceColumn?: number) {
  const interest = countMultipleColumns(data, interestColumns);
  const sourceBreakdown =
    sourceColumn === undefined
      ? []
      : countBy(data, sourceColumn, normalizeSourceName, "Chưa có nguồn").slice(0, 7);

  return {
    interestBreakdown: interest.rows,
    sourceBreakdown,
    blankInterestCells: interest.blankCount,
    totalInterestCells: interest.rows.reduce((sum, item) => sum + item.count, 0)
  };
}

type FbAction = {
  action_type?: string;
  value?: string;
};

type FbInsightApiRow = {
  date_start?: string;
  spend?: string;
  clicks?: string;
  reach?: string;
  impressions?: string;
  actions?: FbAction[];
};

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function formatDateInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function extractMessageCount(actions: FbAction[] | undefined) {
  if (!actions || actions.length === 0) return 0;

  return actions.reduce((sum, action) => {
    const type = (action.action_type || "").toLowerCase();
    if (!type) return sum;

    const isMessageAction =
      type.includes("messaging") ||
      type.includes("onsite_conversion.messaging") ||
      type.includes("message") ||
      type.includes("conversation_started");

    if (!isMessageAction) return sum;
    return sum + parseNumber(action.value);
  }, 0);
}

async function fetchFbInsightsForAccount(
  accountId: string,
  accessToken: string
): Promise<FbInsightApiRow[]> {
  let nextUrl =
    `https://graph.facebook.com/v20.0/${accountId}/insights` +
    `?fields=date_start,spend,clicks,reach,impressions,actions` +
    `&time_increment=1&date_preset=maximum&limit=500` +
    `&access_token=${encodeURIComponent(accessToken)}`;
  const rows: FbInsightApiRow[] = [];

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Facebook API error (${accountId}): ${response.status} ${body}`);
    }

    const json = (await response.json()) as {
      data?: FbInsightApiRow[];
      paging?: { next?: string };
    };

    if (json.data?.length) {
      rows.push(...json.data);
    }

    nextUrl = json.paging?.next || "";
  }

  return rows;
}

async function buildFbAdsPayload(timezone: string): Promise<FbAdsPayload> {
  const accessToken = process.env.FB_ACCESS_TOKEN?.trim() || "";
  const fbStartDate = process.env.FB_ADS_START_DATE?.trim() || "2026-03-21";
  const accountsFromEnv =
    process.env.FB_AD_ACCOUNT_IDS?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];
  const fallbackAccounts = [
    "act_1821842625152762",
    "act_1474263064222209",
    "act_1831887934042126"
  ];
  const accountIds = accountsFromEnv.length > 0 ? accountsFromEnv : fallbackAccounts;

  if (!accessToken || accountIds.length === 0) {
    const missing: string[] = [];
    if (!accessToken) missing.push("FB_ACCESS_TOKEN");
    if (accountIds.length === 0) missing.push("FB_AD_ACCOUNT_IDS");

    return {
      enabled: false,
      accountIds,
      totals: {
        spendAllTime: 0,
        spendYesterday: 0,
        spendToday: 0,
        messagesAllTime: 0,
        clicksAllTime: 0,
        reachAllTime: 0,
        impressionsAllTime: 0,
        cqLeadsAllTime: 0,
        ncqLeadsAllTime: 0
      },
      byDay: [],
      error: `Thiếu biến môi trường: ${missing.join(", ")}.`
    };
  }

  try {
    const rowsByAccount = await Promise.all(
      accountIds.map((accountId) => fetchFbInsightsForAccount(accountId, accessToken))
    );
    const grouped: Record<string, FbDailyInsight> = {};

    for (const rows of rowsByAccount) {
      for (const row of rows) {
        const date = row.date_start || "";
        if (!date) continue;

        if (!grouped[date]) {
          grouped[date] = {
            date,
            spend: 0,
            messages: 0,
            clicks: 0,
            reach: 0,
            impressions: 0,
            cqLeads: 0,
            ncqLeads: 0
          };
        }

        grouped[date].spend += parseNumber(row.spend);
        grouped[date].clicks += parseNumber(row.clicks);
        grouped[date].reach += parseNumber(row.reach);
        grouped[date].impressions += parseNumber(row.impressions);
        grouped[date].messages += extractMessageCount(row.actions);
      }
    }

    const byDay = Object.values(grouped)
      .filter((item) => item.date >= fbStartDate)
      .sort((a, b) => b.date.localeCompare(a.date));
    const todayKey = formatDateInTimezone(new Date(), timezone);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = formatDateInTimezone(yesterdayDate, timezone);

    const totals = byDay.reduce(
      (acc, item) => {
        acc.spendAllTime += item.spend;
        acc.messagesAllTime += item.messages;
        acc.clicksAllTime += item.clicks;
        acc.reachAllTime += item.reach;
        acc.impressionsAllTime += item.impressions;

        if (item.date === todayKey) {
          acc.spendToday += item.spend;
        }
        if (item.date === yesterdayKey) {
          acc.spendYesterday += item.spend;
        }
        return acc;
      },
      {
        spendAllTime: 0,
        spendYesterday: 0,
        spendToday: 0,
        messagesAllTime: 0,
        clicksAllTime: 0,
        reachAllTime: 0,
        impressionsAllTime: 0,
        cqLeadsAllTime: 0,
        ncqLeadsAllTime: 0
      }
    );

    return {
      enabled: true,
      accountIds,
      totals,
      byDay,
      error: null
    };
  } catch (error) {
    return {
      enabled: false,
      accountIds,
      totals: {
        spendAllTime: 0,
        spendYesterday: 0,
        spendToday: 0,
        messagesAllTime: 0,
        clicksAllTime: 0,
        reachAllTime: 0,
        impressionsAllTime: 0,
        cqLeadsAllTime: 0,
        ncqLeadsAllTime: 0
      },
      byDay: [],
      error: error instanceof Error ? error.message : "Không thể tải dữ liệu Facebook Ads."
    };
  }
}

async function loadFromGoogleSheets() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const ranges = sheetNames.map((name) => `'${name}'`);

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges
  });

  const bySheet = Object.fromEntries(
    (response.data.valueRanges || []).map((range, index) => [
      sheetNames[index],
      range.values || []
    ])
  ) as Record<(typeof sheetNames)[number], unknown[][]>;

  return bySheet;
}

function buildDemoDataset(): Record<(typeof sheetNames)[number], unknown[][]> {
  const cqRows = [
    [
      "Lead",
      "Phone",
      "Student",
      "Sale",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "...",
      "Status"
    ],
    [
      "1",
      "",
      "Nguyen A",
      "Sale Lan",
      "",
      "",
      "",
      "CNTT",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Đã nhập học"
    ],
    [
      "2",
      "",
      "Nguyen B",
      "Sale Lan",
      "",
      "",
      "",
      "Dược",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Đã LH, nghe máy"
    ],
    [
      "3",
      "",
      "Nguyen C",
      "Sale Minh",
      "",
      "",
      "",
      "Kế toán",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Không nghe máy"
    ],
    [
      "4",
      "",
      "Nguyen D",
      "Sale Minh",
      "",
      "",
      "",
      "CNTT",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Nộp hồ sơ"
    ],
    [
      "5",
      "",
      "Nguyen E",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  ];

  const ncqRows = [
    ["Lead", "Phone", "Sale", "Student", "x", "x", "x", "x", "Ngành", "Status"],
    ["1", "", "Sale Hoa", "Hoc vien 1", "", "", "", "", "Marketing", "Kết bạn Zalo"],
    ["2", "", "Sale Hoa", "Hoc vien 2", "", "", "", "", "Kế toán", "Từ chối"],
    ["3", "", "Sale Dat", "Hoc vien 3", "", "", "", "", "CNTT", "Nộp HS"]
  ];

  const offlineRows = [
    [
      "Lead",
      "Student",
      "x",
      "x",
      "Status",
      "x",
      "Nguyện vọng 01",
      "Nguyện vọng 02",
      "x",
      "Sale"
    ],
    ["1", "Offline 1", "", "", "Đã nhập học", "", "CNTT", "", "", "Sale Hung"],
    ["2", "Offline 2", "", "", "Không nghe máy, thuê bao", "", "Dược", "", "", "Sale Hung"],
    ["3", "Offline 3", "", "", "", "", "", "", "", ""]
  ];

  const tuChuRows = [
    ["Nguon", "He"],
    ["Khoa CNTT", "CQ"],
    ["Khoa CNTT", "NCQ"],
    ["Khoa Duoc", "CQ"]
  ];

  return {
    CQ_Status: cqRows,
    NCQ_Status: ncqRows,
    Offline_Status: offlineRows,
    Data_TuChu: tuChuRows
  };
}

function buildPayload(
  rawData: Record<(typeof sheetNames)[number], unknown[][]>,
  isDemo: boolean,
  fbAds: FbAdsPayload
): DashboardPayload {
  const cqData = cleanRowsByAnyValue(toRows(rawData.CQ_Status), [0, 2, 7, 8, 33]);
  const ncqData = cleanRowsByAnyValue(toRows(rawData.NCQ_Status), [0, 3, 8, 9]);
  const offlineData = cleanRowsByAnyValue(toRows(rawData.Offline_Status), [0, 1, 4, 6, 7]);
  const selfManaged = buildSelfManaged(toRows(rawData.Data_TuChu));

  const cqTotal = cqData.length;
  const ncqTotal = ncqData.length;
  const offlineTotal = offlineData.length;
  const selfManagedTotal = selfManaged.totalCQ + selfManaged.totalNCQ;
  const fbStartDate = process.env.FB_ADS_START_DATE?.trim() || "2026-03-21";
  const cqLeadsByDay = countRowsByDay(cqData, 0);
  const ncqLeadsByDay = countRowsByDay(ncqData, 0);
  const fbByDayMap = Object.fromEntries(fbAds.byDay.map((item) => [item.date, item]));
  const allDays = Array.from(
    new Set([...Object.keys(fbByDayMap), ...Object.keys(cqLeadsByDay), ...Object.keys(ncqLeadsByDay)])
  )
    .filter((day) => day >= fbStartDate)
    .sort((a, b) => b.localeCompare(a));
  const mergedFbByDay = allDays.map((day) => {
    const base = fbByDayMap[day];
    return {
      date: day,
      spend: base?.spend || 0,
      messages: base?.messages || 0,
      clicks: base?.clicks || 0,
      reach: base?.reach || 0,
      impressions: base?.impressions || 0,
      cqLeads: cqLeadsByDay[day] || 0,
      ncqLeads: ncqLeadsByDay[day] || 0
    };
  });
  const mergedFbAds: FbAdsPayload = {
    ...fbAds,
    byDay: mergedFbByDay,
    totals: {
      ...fbAds.totals,
      cqLeadsAllTime: mergedFbByDay.reduce((sum, item) => sum + item.cqLeads, 0),
      ncqLeadsAllTime: mergedFbByDay.reduce((sum, item) => sum + item.ncqLeads, 0)
    }
  };

  return {
    generatedAt: new Date().toISOString(),
    timezone: process.env.APP_TIMEZONE || "Asia/Bangkok",
    isDemo,
    summary: {
      totalLeads: cqTotal + ncqTotal + offlineTotal + selfManagedTotal,
      cqTotal,
      ncqTotal,
      offlineTotal,
      selfManagedTotal
    },
    details: {
      cq: {
        ...buildInterestByColumn(cqData, [7, 8], 1),
        sourceToInterest: buildRelationInterest(cqData, 1, [7, 8]),
        saleToInterest: buildRelationInterest(cqData, 3, [7, 8])
      },
      ncq: {
        ...buildInterestByColumn(ncqData, [8], 1),
        sourceToInterest: buildRelationInterest(ncqData, 1, [8]),
        saleToInterest: buildRelationInterest(ncqData, 2, [8])
      },
      offline: {
        ...buildInterestByColumn(offlineData, [6, 7]),
        saleToInterest: buildRelationInterest(offlineData, 9, [6, 7])
      }
    },
    industry: {
      cq: buildIndustryTimeline(cqData, 0, [7], 33, normalizeStatus),
      ncq: buildIndustryTimeline(ncqData, 0, [8], 9, normalizeStatus)
    },
    cq: {
      saleBreakdown: countBy(cqData, 3),
      statusBreakdown: countByStatus(cqData, 33, normalizeStatus),
      matrix: buildSaleMatrix(cqData, 3, 33, normalizeStatus)
    },
    ncq: {
      saleBreakdown: countBy(ncqData, 2),
      statusBreakdown: countByStatus(ncqData, 9, normalizeStatus),
      matrix: buildSaleMatrix(ncqData, 2, 9, normalizeStatus)
    },
    offline: {
      saleBreakdown: countBy(offlineData, 9),
      statusBreakdown: countByStatus(offlineData, 4, normalizeOfflineStatus),
      matrix: buildSaleMatrix(offlineData, 9, 4, normalizeOfflineStatus)
    },
    selfManaged,
    fbAds: mergedFbAds
  };
}

export async function getDashboardData() {
  noStore();
  const timezone = process.env.APP_TIMEZONE || "Asia/Bangkok";
  const fbAds = await buildFbAdsPayload(timezone);

  try {
    const sheetData = await loadFromGoogleSheets();
    if (sheetData) {
      return buildPayload(sheetData, false, fbAds);
    }
  } catch (error) {
    console.error("Failed to load Google Sheets data, using demo dataset.", error);
  }

  return buildPayload(buildDemoDataset(), true, fbAds);
}






