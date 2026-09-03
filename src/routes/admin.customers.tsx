import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Coffee,
  Calendar,
  MessageSquare,
  Banknote,
  CreditCard,
  UserCheck,
  HeartHandshake,
  Edit2,
  Trash2,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LogVisitDialog, type OrderItem } from "@/components/admin/LogVisitDialog";
import { CustomerDetailDialog } from "@/components/admin/CustomerDetailDialog";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersAdminPage,
});

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  first_visited_at: string;
  last_visited_at: string;
  visit_count: number;
};

type Visit = {
  id: string;
  customer_id: string | null;
  guest_name: string;
  guest_email: string | null;
  items: OrderItem[];
  notes: string | null;
  donation_given: boolean;
  donation_amount: number | null;
  payment_method: "cash" | "card" | null;
  visited_at: string;
  created_at: string;
  created_by_email: string | null;
};

function CustomersAdminPage() {
  const { t, locale } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [preselectedCustomer, setPreselectedCustomer] = useState<Customer | null>(null);

  // Filters for Visits
  const [visitSearch, setVisitSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("today");
  const [donationFilter, setDonationFilter] = useState<"all" | "donations" | "cash" | "card">("all");

  // Filters for Customers
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSort, setCustomerSort] = useState<"recent" | "visits" | "name">("recent");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [{ data: cData }, { data: vData }] = await Promise.all([
        supabase.from("customers").select("*").order("last_visited_at", { ascending: false }),
        supabase.from("cafe_visits").select("*").order("visited_at", { ascending: false }).limit(200),
      ]);
      if (cData) setCustomers(cData as Customer[]);
      if (vData) setVisits(vData as unknown as Visit[]);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const totalVisits = visits.length;
    const uniqueCustomers = customers.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayVisits = visits.filter((v) => new Date(v.visited_at).getTime() >= todayStart.getTime()).length;

    let totalDonationAmount = 0;
    let cashDonationAmount = 0;
    let cardDonationAmount = 0;
    let donationCount = 0;

    visits.forEach((v) => {
      if (v.donation_given) {
        donationCount++;
        const amt = Number(v.donation_amount) || 0;
        totalDonationAmount += amt;
        if (v.payment_method === "card") {
          cardDonationAmount += amt;
        } else if (v.payment_method === "cash") {
          cashDonationAmount += amt;
        }
      }
    });

    return {
      totalVisits,
      todayVisits,
      uniqueCustomers,
      donationCount,
      totalDonationAmount,
      cashDonationAmount,
      cardDonationAmount,
    };
  }, [visits, customers]);

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    const day = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return visits.filter((v) => {
      const vTime = new Date(v.visited_at).getTime();
      if (dateFilter === "today" && vTime < startOfToday.getTime()) return false;
      if (dateFilter === "week" && vTime < startOfWeek.getTime()) return false;
      if (dateFilter === "month" && vTime < startOfMonth.getTime()) return false;

      if (donationFilter === "donations" && !v.donation_given) return false;
      if (donationFilter === "cash" && (!v.donation_given || v.payment_method !== "cash")) return false;
      if (donationFilter === "card" && (!v.donation_given || v.payment_method !== "card")) return false;

      if (visitSearch.trim()) {
        const q = visitSearch.toLowerCase();
        const matchesName = v.guest_name?.toLowerCase().includes(q);
        const matchesNotes = v.notes?.toLowerCase().includes(q);
        const matchesItems = v.items?.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesName && !matchesNotes && !matchesItems) return false;
      }

      return true;
    });
  }, [visits, dateFilter, donationFilter, visitSearch]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    let list = customers.filter((c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });

    if (customerSort === "recent") {
      list.sort((a, b) => new Date(b.last_visited_at).getTime() - new Date(a.last_visited_at).getTime());
    } else if (customerSort === "visits") {
      list.sort((a, b) => b.visit_count - a.visit_count);
    } else if (customerSort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [customers, customerSearch, customerSort]);

  const handleDeleteVisit = async (visitId: string) => {
    const confirmMsg = locale === "sl" ? "Ali ste prepričani, da želite izbrisati ta zapis obiska?" : "Are you sure you want to delete this visit record?";
    if (!confirm(confirmMsg)) return;
    try {
      const { error } = await supabase.from("cafe_visits").delete().eq("id", visitId);
      if (error) throw error;
      toast.success(locale === "sl" ? "Obisk izbrisan" : "Visit deleted");
      loadAll();
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri brisanju" : "Failed to delete visit"));
    }
  };

  const openCustomerDetail = (customerId: string) => {
    setDetailCustomerId(customerId);
    setDetailDialogOpen(true);
  };

  const formatVisitCount = (count: number) => {
    if (locale === "sl") {
      if (count === 1) return "1 obisk";
      if (count === 2) return "2 obiska";
      if (count === 3 || count === 4) return `${count} obiski`;
      return `${count} obiskov`;
    }
    return `${count} visit${count === 1 ? "" : "s"}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Users className="size-6 text-primary" /> {t("admin.cust.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.cust.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setEditingVisit(null);
              setPreselectedCustomer(null);
              setLogDialogOpen(true);
            }}
            className="font-medium shadow-xs"
          >
            <Plus className="mr-1.5 size-4" /> {t("admin.cust.logVisit")}
          </Button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.cust.totalVisits")}</div>
            <Coffee className="size-4 text-amber-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">{stats.totalVisits}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{stats.todayVisits} {t("admin.cust.today")}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.cust.savedCustomers")}</div>
            <UserCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">{stats.uniqueCustomers}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{t("admin.cust.directoryProfiles")}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.cust.donationsLogged")}</div>
            <HeartHandshake className="size-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            €{stats.totalDonationAmount.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {stats.donationCount} {t("admin.cust.donationsCount")}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("admin.cust.paymentSplit")}</div>
            <Sparkles className="size-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="inline-flex items-center gap-1 font-display text-base font-semibold text-emerald-700 dark:text-emerald-400">
              <Banknote className="size-3.5" /> €{stats.cashDonationAmount.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="inline-flex items-center gap-1 font-display text-base font-semibold text-blue-700 dark:text-blue-400">
              <CreditCard className="size-3.5" /> €{stats.cardDonationAmount.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{t("admin.cust.cashVsCard")}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visits" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="visits" className="gap-2">
              <Coffee className="size-4" /> {t("admin.cust.tabVisits")} ({filteredVisits.length})
            </TabsTrigger>
            <TabsTrigger value="directory" className="gap-2">
              <Users className="size-4" /> {t("admin.cust.tabDirectory")} ({filteredCustomers.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: VISITS FEED */}
        <TabsContent value="visits" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.cust.searchPlaceholder")}
                value={visitSearch}
                onChange={(e) => setVisitSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter */}
              <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs font-medium">
                {(["today", "week", "month", "all"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDateFilter(d)}
                    className={cn(
                      "rounded-md px-2.5 py-1 transition-all",
                      dateFilter === d ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {d === "today"
                      ? t("admin.cust.filterToday")
                      : d === "week"
                      ? t("admin.cust.filterWeek")
                      : d === "month"
                      ? t("admin.cust.filterMonth")
                      : t("admin.cust.filterAll")}
                  </button>
                ))}
              </div>

              {/* Donation Filter */}
              <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDonationFilter("all")}
                  className={cn(
                    "rounded-md px-2 py-1 transition-all",
                    donationFilter === "all" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "sl" ? "Vsi" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setDonationFilter("cash")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1 transition-all",
                    donationFilter === "cash" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Banknote className="size-3" /> {t("admin.cust.cash")}
                </button>
                <button
                  type="button"
                  onClick={() => setDonationFilter("card")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1 transition-all",
                    donationFilter === "card" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CreditCard className="size-3" /> {t("admin.cust.card")}
                </button>
              </div>
            </div>
          </div>

          {/* Visits List */}
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">{locale === "sl" ? "Nalaganje obiskov…" : "Loading visits…"}</div>
          ) : filteredVisits.length === 0 ? (
            <Card className="py-12 text-center text-sm text-muted-foreground">
              {t("admin.cust.noVisits")}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredVisits.map((v) => (
                <Card key={v.id} className="p-4 transition-all hover:border-border/80 shadow-xs">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {v.customer_id ? (
                          <button
                            type="button"
                            onClick={() => openCustomerDetail(v.customer_id!)}
                            className="font-display font-semibold text-foreground hover:underline flex items-center gap-1.5"
                          >
                            <Users className="size-4 text-primary" /> {v.guest_name}
                          </button>
                        ) : (
                          <span className="font-display font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-muted-foreground/50" /> {v.guest_name}
                          </span>
                        )}

                        <span className="text-xs text-muted-foreground">
                          {new Date(v.visited_at).toLocaleDateString(locale === "sl" ? "sl-SI" : "en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          ·{" "}
                          {new Date(v.visited_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {v.created_by_email && (
                          <span className="text-[11px] text-muted-foreground">
                            {locale === "sl" ? "vnesel" : "by"} {v.created_by_email.split("@")[0]}
                          </span>
                        )}
                      </div>

                      {/* Items */}
                      {v.items && v.items.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {v.items.map((it, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs font-normal">
                              {it.quantity > 1 && <span className="font-bold mr-1">{it.quantity}x</span>}
                              {it.name}
                              {it.is_custom && <span className="ml-1 text-[10px] text-muted-foreground">({locale === "sl" ? "po meri" : "custom"})</span>}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {v.notes && (
                        <div className="mt-2 rounded-md bg-muted/40 p-2.5 text-xs text-foreground flex items-start gap-2 max-w-2xl">
                          <MessageSquare className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                          <p className="whitespace-pre-wrap">{v.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Donation status & actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {v.donation_given ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 font-semibold text-xs",
                            v.payment_method === "card"
                              ? "border-blue-500/40 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              : "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          )}
                        >
                          {v.payment_method === "card" ? (
                            <CreditCard className="size-3.5" />
                          ) : (
                            <Banknote className="size-3.5" />
                          )}
                          <span>
                            {v.donation_amount ? `€${Number(v.donation_amount).toFixed(2)}` : (locale === "sl" ? "Prispevek" : "Donation")}
                            {" "}({v.payment_method === "card" ? t("admin.cust.card") : t("admin.cust.cash")})
                          </span>
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("admin.cust.noDonation")}</span>
                      )}

                      <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            setEditingVisit(v);
                            setLogDialogOpen(true);
                          }}
                          title={locale === "sl" ? "Uredi obisk" : "Edit visit"}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteVisit(v.id)}
                          title={locale === "sl" ? "Izbriši obisk" : "Delete visit"}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: CUSTOMERS DIRECTORY */}
        <TabsContent value="directory" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.cust.searchCustPlaceholder")}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpDown className="size-3.5" /> {t("admin.cust.sortBy")}
              </span>
              <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCustomerSort("recent")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    customerSort === "recent" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("admin.cust.sortRecent")}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSort("visits")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    customerSort === "visits" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("admin.cust.sortVisits")}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSort("name")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    customerSort === "name" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("admin.cust.sortName")}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">{locale === "sl" ? "Nalaganje obiskovalcev…" : "Loading customers…"}</div>
          ) : filteredCustomers.length === 0 ? (
            <Card className="py-12 text-center text-sm text-muted-foreground">
              {t("admin.cust.noCustomers")}
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((c) => (
                <Card
                  key={c.id}
                  className="p-4 transition-all hover:border-border/90 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground leading-tight">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {c.email || c.phone || (locale === "sl" ? "Brez neposrednega kontakta" : "No direct contact")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {formatVisitCount(c.visit_count)}
                      </Badge>
                    </div>

                    {c.notes && (
                      <p className="line-clamp-2 text-xs text-muted-foreground bg-muted/40 rounded p-2">
                        {c.notes}
                      </p>
                    )}

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                      <Calendar className="size-3" />
                      {locale === "sl" ? "Zadnji obisk:" : "Last visited:"} {new Date(c.last_visited_at).toLocaleDateString(locale === "sl" ? "sl-SI" : "en-US")}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => openCustomerDetail(c.id)}
                    >
                      {t("admin.cust.viewProfile")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setPreselectedCustomer(c);
                        setEditingVisit(null);
                        setLogDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-1 size-3.5" /> {t("admin.cust.logVisit")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Log Visit Dialog */}
      <LogVisitDialog
        open={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        onSaved={loadAll}
        preselectedCustomer={preselectedCustomer}
        editVisit={editingVisit}
      />

      {/* Customer Detail Dialog */}
      <CustomerDetailDialog
        customerId={detailCustomerId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onCustomerUpdated={loadAll}
        onLogVisitForCustomer={(c) => {
          setPreselectedCustomer(c);
          setEditingVisit(null);
          setLogDialogOpen(true);
        }}
      />
    </div>
  );
}
