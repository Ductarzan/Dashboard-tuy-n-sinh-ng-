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

type IndustryTrendRow = {
  name: string;
  total: number;
  dayChangePct: number | null;
  weekChangePct: number | null;
  conversionRate: number;
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
    cq: IndustryTrendRow[];
    ncq: IndustryTrendRow[];
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
};

const sheetNames = ["CQ_Status", "NCQ_Status", "Offline_Status", "Data_TuChu"] as const;

function cellToString(value: RawCell) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeStatus(value: RawCell) {
  if (!cellToString(value)) return "0. Trống / Chưa liên hệ";
  const str = cellToString(value).toLowerCase();

  if (str.includes("nhập học")) return "1. Đã Nhập học";
  if (str.includes("nộp hs") || str.includes("nộp hồ sơ")) return "2. Đã Nộp hồ sơ";
  if (str.includes("suy nghĩ") || str.includes("cân nhắc") || str.includes("xác nhận")) {
    return "3. Đang suy nghĩ / Chờ xác nhận";
  }
  if (str.includes("kb") || str.includes("kết bạn") || str.includes("zalo") || str.includes("add")) {
    return "4. Đang chăm sóc Zalo (Đã KB)";
  }
  if (
    str.includes("đã lh") ||
    str.includes("nghe máy") ||
    str.includes("gửi tn") ||
    str.includes("phản hồi") ||
    str.includes("trl") ||
    str.includes("đồng ý")
  ) {
    return "5. Đã gọi nghe máy / Có tương tác";
  }
  if (str.includes("bố") || str.includes("mẹ") || str.includes("ph ") || str.includes("phụ huynh")) {
    return "6. Đang liên hệ qua Phụ huynh";
  }
  if (
    str.includes("knm") ||
    str.includes("k nghe") ||
    str.includes("ko nghe") ||
    str.includes("chưa liên hệ") ||
    str.includes("tắt máy") ||
    str.includes("máy bận") ||
    str.includes("gọi lại")
  ) {
    return "7. Không nghe máy / Chưa LH được";
  }
  if (
    str.includes("nhu cầu") ||
    str.includes("kqt") ||
    str.includes("quan tâm") ||
    str.includes("bảo ko") ||
    str.includes("ko đi học") ||
    str.includes("k qt")
  ) {
    return "8. Từ chối / Không có nhu cầu";
  }
  if (
    str.includes("sai") ||
    str.includes("thuê bao") ||
    str.includes("nhầm") ||
    str.includes("k có sdt") ||
    str.includes("k gọi") ||
    str.includes("ko gọi")
  ) {
    return "9. Sai số / Thuê bao / Số ảo (Rác)";
  }
  if (str.includes("hương hằng") || str.includes("hằng") || str.includes("phương anh")) {
    return "Khác (Nhập sai cột)";
  }

  return "Trạng thái lẻ tẻ khác";
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

function countBy(data: RawRow[], columnIndex: number) {
  const result: Record<string, number> = {};

  for (const row of data) {
    const value = row[columnIndex];
    const key = cellToString(value) || "Chưa phân bổ NV";
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

    if (statusGroup.startsWith("1.") || statusGroup.startsWith("2.")) {
      result[sale].thanhCong += 1;
    } else if (statusGroup.startsWith("3.")) {
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
  const input =
    typeof value === "number" ? value : typeof value === "string" ? value : String(value);
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isoWeekKey(date: Date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function buildIndustryTrends(
  data: RawRow[],
  dateIdx: number,
  industryIdx: number,
  statusIdx: number,
  normalizer: (value: RawCell) => string
): IndustryTrendRow[] {
  const datedRows = data
    .map((row) => ({ row, date: parseDate(row[dateIdx]) }))
    .filter((item) => item.date !== null) as Array<{ row: RawRow; date: Date }>;

  const latestDate = datedRows.length
    ? new Date(Math.max(...datedRows.map((item) => item.date.getTime())))
    : null;

  const latestDayKey = latestDate ? dayKey(latestDate) : null;
  const prevDayKey = latestDate ? dayKey(new Date(latestDate.getTime() - 86400000)) : null;
  const latestWeekKey = latestDate ? isoWeekKey(latestDate) : null;
  const prevWeekKey = latestDate
    ? isoWeekKey(new Date(latestDate.getTime() - 7 * 86400000))
    : null;

  const stats: Record<
    string,
    {
      total: number;
      success: number;
      dayCount: number;
      prevDayCount: number;
      weekCount: number;
      prevWeekCount: number;
    }
  > = {};

  for (const row of data) {
    const industry = cellToString(row[industryIdx]) || "Chưa có ngành";
    if (!stats[industry]) {
      stats[industry] = {
        total: 0,
        success: 0,
        dayCount: 0,
        prevDayCount: 0,
        weekCount: 0,
        prevWeekCount: 0
      };
    }

    const bucket = stats[industry];
    bucket.total += 1;

    const statusGroup = normalizer(row[statusIdx]);
    if (statusGroup.startsWith("1.") || statusGroup.startsWith("2.")) {
      bucket.success += 1;
    }

    const rowDate = parseDate(row[dateIdx]);
    if (rowDate && latestDayKey && prevDayKey && latestWeekKey && prevWeekKey) {
      const rowDayKey = dayKey(rowDate);
      if (rowDayKey === latestDayKey) bucket.dayCount += 1;
      if (rowDayKey === prevDayKey) bucket.prevDayCount += 1;

      const rowWeekKey = isoWeekKey(rowDate);
      if (rowWeekKey === latestWeekKey) bucket.weekCount += 1;
      if (rowWeekKey === prevWeekKey) bucket.prevWeekCount += 1;
    }
  }

  return Object.entries(stats)
    .map(([name, item]) => ({
      name,
      total: item.total,
      dayChangePct:
        item.prevDayCount > 0 ? ((item.dayCount - item.prevDayCount) / item.prevDayCount) * 100 : null,
      weekChangePct:
        item.prevWeekCount > 0 ? ((item.weekCount - item.prevWeekCount) / item.prevWeekCount) * 100 : null,
      conversionRate: item.total > 0 ? (item.success / item.total) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);
}

function cleanRows(rows: RawRow[], keyIndex: number) {
  return rows.filter((row) => cellToString(row[keyIndex]) !== "");
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
    sourceColumn === undefined ? [] : countBy(data, sourceColumn).slice(0, 7);

  return {
    interestBreakdown: interest.rows,
    sourceBreakdown,
    blankInterestCells: interest.blankCount,
    totalInterestCells: interest.rows.reduce((sum, item) => sum + item.count, 0)
  };
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
  isDemo: boolean
): DashboardPayload {
  const cqData = cleanRows(toRows(rawData.CQ_Status), 2);
  const ncqData = cleanRows(toRows(rawData.NCQ_Status), 3);
  const offlineData = cleanRows(toRows(rawData.Offline_Status), 1);
  const selfManaged = buildSelfManaged(toRows(rawData.Data_TuChu));

  const cqTotal = cqData.length;
  const ncqTotal = ncqData.length;
  const offlineTotal = offlineData.length;
  const selfManagedTotal = selfManaged.totalCQ + selfManaged.totalNCQ;

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
      cq: buildIndustryTrends(cqData, 0, 7, 33, normalizeStatus),
      ncq: buildIndustryTrends(ncqData, 0, 8, 9, normalizeStatus)
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
    selfManaged
  };
}

export async function getDashboardData() {
  noStore();

  try {
    const sheetData = await loadFromGoogleSheets();
    if (sheetData) {
      return buildPayload(sheetData, false);
    }
  } catch (error) {
    console.error("Failed to load Google Sheets data, using demo dataset.", error);
  }

  return buildPayload(buildDemoDataset(), true);
}


