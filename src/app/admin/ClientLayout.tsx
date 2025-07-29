'use client';

import AdminAuthGuard from "./AdminAuthGuard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
