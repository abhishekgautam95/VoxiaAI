import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard | Voxia AI - Voice Receptionist",
  description: "Real-time AI voice receptionist dashboard, call logs, appointment scheduler, and agent orchestration.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
