"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExportPlanButton({
  planId,
  className,
}: {
  planId: string;
  className?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/plans/${planId}/export`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
      const filename = match
        ? decodeURIComponent(match[1].replace(/^"|"$/g, ""))
        : `plan-${planId}.txt`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export plan:", err);
      alert("Failed to download plan. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      title="Download plan details as a .txt file"
      className={cn(
        "glass-button py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 text-foreground active:scale-95 transition-transform disabled:opacity-50",
        className,
      )}>
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>{isExporting ? "Exporting…" : "Export Plan"}</span>
    </button>
  );
}
