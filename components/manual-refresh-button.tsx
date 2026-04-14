"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ManualRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="manual-refresh-btn"
      onClick={() => {
        startTransition(() => {
          const url = new URL(window.location.href);
          url.searchParams.set("refreshTs", Date.now().toString());
          router.replace(url.pathname + url.search);
          router.refresh();
        });
      }}
      disabled={isPending}
      aria-label="Cập nhật thủ công toàn bộ chỉ số"
    >
      {isPending ? "Đang cập nhật..." : "UPDATE MANUAL"}
    </button>
  );
}
