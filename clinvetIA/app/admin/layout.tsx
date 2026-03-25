import * as React from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <I18nProvider>
        <AdminLayout>{children}</AdminLayout>
      </I18nProvider>
    </ThemeProvider>
  );
}
