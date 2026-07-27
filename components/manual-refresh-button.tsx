"use client";

import { useState } from "react";

export function ManualRefreshButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      className="manual-refresh-btn"
      onClick={() => {
        setIsPending(true);
        const url = new URL(window.location.href);
        url.searchParams.set("refreshTs", Date.now().toString());
        window.location.assign(url.toString());
      }}
      disabled={isPending}
      aria-label="Cập nhật thủ công toàn bộ chỉ số"
    >
      <svg
        className={`refresh-icon ${isPending ? "spinning" : ""}`}
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.5 2v6h-6M2.5 22v-6h6" />
        <path d="M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
      <span>{isPending ? "Đang làm mới..." : "Làm mới dữ liệu"}</span>
    </button>
  );
}
