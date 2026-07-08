import { redirect } from "next/navigation";

export default function DashboardScanRedirect() {
  redirect("/#analyze");
}
