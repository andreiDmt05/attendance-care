import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "green" | "red" | "yellow" | "slate" | "blue";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
}

const colorClasses: Record<BadgeColor, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
};

export default function Badge({ children, color = "slate" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colorClasses[color]
      )}
    >
      {children}
    </span>
  );
}
