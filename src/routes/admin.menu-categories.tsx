import { createFileRoute } from "@tanstack/react-router";
import { CategoryAdminPage } from "@/components/admin/CategoryAdminPage";

export const Route = createFileRoute("/admin/menu-categories")({
  component: () => (
    <CategoryAdminPage
      table="menu_categories"
      title="Menu categories"
      description="Group menu items (e.g. Coffee, Tea, Sweets). Both Slovene and English names are required."
    />
  ),
});
