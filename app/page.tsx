"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

type DemoItem = {
  id: number;
  label: string;
  value: number;
};

type SpreadMode = "Rải dài" | "Rải tiêu chuẩn" | "Rải ngắn";

const qualityRules = [
  "Outer loading >= 0.7 (ưu tiên).",
  "Cronbach's Alpha >= 0.7, Composite Reliability >= 0.7.",
  "AVE >= 0.5, HTMT < 0.9, Fornell-Larcker đạt.",
  "VIF < 5, R² >= 0.10 theo mức mô hình.",
  "Bootstrap 5.000 mẫu: p < 0.05 và t > 1.96."
];

const qualityTargets = [
  {
    title: "Độ tin cậy",
    detail: "Cronbach's Alpha, CR"
  },
  {
    title: "Giá trị hội tụ",
    detail: "AVE, Outer Loading"
  },
  {
    title: "Giá trị phân biệt",
    detail: "HTMT, Fornell-Larcker"
  },
  {
    title: "Mô hình cấu trúc",
    detail: "R², f², VIF, Bootstrap"
  }
];

export default function HomePage() {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [modelName, setModelName] = useState("Mô hình hành vi sử dụng dịch vụ");
  const [sampleSize, setSampleSize] = useState(350);
  const [spreadMode, setSpreadMode] = useState<SpreadMode>("Rải tiêu chuẩn");
  const [endDate, setEndDate] = useState("");
  const [demoGroups, setDemoGroups] = useState<DemoItem[]>([
    { id: 1, label: "Nam", value: 48 },
    { id: 2, label: "Nữ", value: 52 }
  ]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalRatio = useMemo(
    () => demoGroups.reduce((sum, group) => sum + (Number.isFinite(group.value) ? group.value : 0), 0),
    [demoGroups]
  );

  const isRatioValid = Math.abs(totalRatio - 100) < 0.01;

  function updateGroup(id: number, key: "label" | "value", value: string) {
    setDemoGroups((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          [key]: key === "value" ? Math.max(0, Math.min(100, Number(value) || 0)) : value
        };
      })
    );
  }

  function addGroup() {
    setDemoGroups((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: `Nhóm ${prev.length + 1}`,
        value: 0
      }
    ]);
  }

  function removeGroup(id: number) {
    setDemoGroups((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleManualUpdate() {
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  return (
    <main className="landing-shell">
      <section className="hero">
        <p className="kicker">FillForm • Điền form theo mô hình nghiên cứu</p>
        <h1>Tạo cấu hình khảo sát chuẩn nghiên cứu chỉ trong vài phút</h1>
        <p className="lead">
          Bạn nhập mô hình, số lượng mẫu và tỉ lệ nhân khẩu học mong muốn. Hệ thống sẽ tạo bộ cấu hình
          dữ liệu theo tiêu chí học thuật để hỗ trợ quy trình nghiên cứu nhanh hơn.
        </p>
        <div className="hero-actions">
          <button type="button" className="manual-update-btn" onClick={handleManualUpdate} disabled={isRefreshing}>
            {isRefreshing ? "ĐANG UPDATE..." : "UPDATE MANUAL"}
          </button>
          <a href="#builder">Bắt đầu cấu hình</a>
          <a href="#criteria" className="outline">
            Xem tiêu chí kiểm định
          </a>
        </div>
      </section>

      <section className="strip-grid">
        {qualityTargets.map((item) => (
          <article key={item.title} className="strip-card">
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section id="builder" className="panel">
        <div className="panel-title">
          <h2>Triển khai đơn giản</h2>
          <p>Vẽ mô hình nghiên cứu, liên kết câu hỏi, chỉnh tỉ lệ, nhập số mẫu và chờ kết quả.</p>
        </div>

        <form className="config-form" onSubmit={handleSubmit}>
          <label>
            Tên mô hình nghiên cứu
            <input
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
              placeholder="VD: Chất lượng dịch vụ -> Sự hài lòng -> Ý định mua"
              required
            />
          </label>

          <label>
            Số lượng mẫu mục tiêu
            <input
              type="number"
              min={10}
              value={sampleSize}
              onChange={(event) => setSampleSize(Number(event.target.value) || 0)}
              required
            />
          </label>

          <label>
            Chế độ điền rải
            <select value={spreadMode} onChange={(event) => setSpreadMode(event.target.value as SpreadMode)}>
              <option>Rải dài</option>
              <option>Rải tiêu chuẩn</option>
              <option>Rải ngắn</option>
            </select>
          </label>

          <label>
            Ngày kết thúc
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>

          <div className="demo-box">
            <div className="demo-head">
              <h3>Tỉ lệ nhân khẩu học</h3>
              <button type="button" onClick={addGroup}>
                + Thêm nhóm
              </button>
            </div>

            {demoGroups.map((item) => (
              <div key={item.id} className="demo-row">
                <input value={item.label} onChange={(event) => updateGroup(item.id, "label", event.target.value)} />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.value}
                  onChange={(event) => updateGroup(item.id, "value", event.target.value)}
                />
                <button type="button" onClick={() => removeGroup(item.id)}>
                  Xóa
                </button>
              </div>
            ))}

            <p className={isRatioValid ? "ratio-ok" : "ratio-warn"}>Tổng tỉ lệ: {totalRatio}%</p>
          </div>

          <label>
            Ghi chú thêm (tự luận/thông tin cá nhân)
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Bạn có thể mô tả định dạng câu hỏi tự luận, họ tên/email/số điện thoại..."
            />
          </label>

          <button className="submit" type="submit">
            Tạo cấu hình FillForm
          </button>
        </form>

        {submitted ? (
          <div className="result-box">
            <h3>Đã tạo cấu hình</h3>
            <p>
              Mô hình: <strong>{modelName}</strong>
            </p>
            <p>
              Số mẫu: <strong>{sampleSize}</strong> | Chế độ: <strong>{spreadMode}</strong>
            </p>
            <p>
              Kết thúc: <strong>{endDate || "Chưa chọn"}</strong>
            </p>
            <p>
              Tỉ lệ nhân khẩu học: <strong>{isRatioValid ? "Hợp lệ" : "Chưa đủ 100%"}</strong>
            </p>
            {notes ? <p>Ghi chú: {notes}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="panel two-col">
        <article>
          <h2>Ai nên dùng dịch vụ này</h2>
          <ul>
            <li>Cần data nhanh, tiết kiệm thời gian thu thập.</li>
            <li>Mô hình phức tạp, khó mô tả hoàn toàn bằng lời.</li>
            <li>Muốn kiểm soát tỉ lệ nhân khẩu học theo mục tiêu nghiên cứu.</li>
          </ul>
        </article>
        <article>
          <h2>Tính năng bổ sung</h2>
          <ul>
            <li>Trả lời câu hỏi tự luận và thông tin cá nhân theo cấu hình.</li>
            <li>Tự động đề xuất tỉ lệ từng câu để tham khảo.</li>
            <li>Hẹn giờ điền rải với 3 chế độ giống hành vi thực tế.</li>
          </ul>
        </article>
      </section>

      <section className="panel two-col">
        <article>
          <h2>Hạn chế hiện tại</h2>
          <ul>
            <li>Không điền được lựa chọn "đáp án khác" ở một số câu trắc nghiệm.</li>
            <li>
              Không thể đảm bảo ghép tuyệt đối đúng mọi thuộc tính nhân khẩu học khi form trộn ngẫu nhiên đáp án.
            </li>
          </ul>
        </article>
        <article>
          <h2>Giải pháp hỗ trợ</h2>
          <ul>
            <li>Điền theo bộ data có trước.</li>
            <li>Điền bằng AI Agent theo cấu hình.</li>
            <li>Nhờ chuyên viên thao tác hộ theo checklist.</li>
          </ul>
        </article>
      </section>

      <section id="criteria" className="panel">
        <h2>Kết quả data kì vọng</h2>
        <ol className="criteria-list">
          {qualityRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
