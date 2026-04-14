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
      {isPending ? "Đang cập nhật..." : "UPDATE MANUAL"}
    </button>
  );
}
