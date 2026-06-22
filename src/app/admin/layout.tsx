import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-primary-dark">
      {/* AdminSidebar */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
