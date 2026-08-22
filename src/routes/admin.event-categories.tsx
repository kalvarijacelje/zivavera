import { createFileRoute } from "@tanstack/react-router";
import { CategoryAdminPage } from "@/components/admin/CategoryAdminPage";

export const Route = createFileRoute("/admin/event-categories")({
  component: () => (
    <CategoryAdminPage
      table="event_categories"
      title="Event categories"
      description="Group events (e.g. Conversations, Tastings, Outreach)."
    />
  ),
});
