"use client";

import { Monitor, MONITOR_STATUS } from "@/types/shared";
import { cn } from "@/lib/utils";

interface MonitorStatusBadgeProps {
  status: Monitor["currentStatus"];
  className?: string;
}

export function MonitorStatusBadge({
  status,
  className,
}: MonitorStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case MONITOR_STATUS.UP:
        return {
          label: "Online",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          icon: "🟢",
        };
      case MONITOR_STATUS.DOWN:
        return {
          label: "Offline",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          icon: "🔴",
        };
      case MONITOR_STATUS.PENDING:
      default:
        return {
          label: "Pending",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          icon: "🟡",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", config.color)} />
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
