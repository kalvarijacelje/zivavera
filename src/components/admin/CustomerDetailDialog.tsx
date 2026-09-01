import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Coffee,
  MessageSquare,
  Banknote,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Save,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { type OrderItem } from "./LogVisitDialog";
import { useI18n } from "@/i18n/I18nProvider";

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
  guest_name: string;
  guest_email: string | null;
  items: OrderItem[];
  notes: string | null;
  donation_given: boolean;
  donation_amount: number | null;
  payment_method: "cash" | "card" | null;
  visited_at: string;
  created_by_email: string | null;
};

interface CustomerDetailDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogVisitForCustomer?: (customer: Customer) => void;
  onCustomerUpdated?: () => void;
}

export function CustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
  onLogVisitForCustomer,
  onCustomerUpdated,
}: CustomerDetailDialogProps) {
  const { locale } = useI18n();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const loadCustomer = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const [{ data: cData, error: cErr }, { data: vData, error: vErr }] = await Promise.all([
        supabase.from("customers").select("*").eq("id", customerId).single(),
        supabase
          .from("cafe_visits")
          .select("*")
          .eq("customer_id", customerId)
          .order("visited_at", { ascending: false }),
      ]);

      if (cErr) throw cErr;
      if (cData) {
        setCustomer(cData as Customer);
        setName(cData.name);
        setEmail(cData.email || "");
        setPhone(cData.phone || "");
        setNotes(cData.notes || "");
      }
      if (vData) {
        setVisits(vData as unknown as Visit[]);
      }
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri nalaganju profila" : "Failed to load customer profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && customerId) {
      setIsEditing(false);
      loadCustomer();
    }
  }, [open, customerId]);

  const handleSaveProfile = async () => {
    if (!customerId || !name.trim()) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);

      if (error) throw error;
      toast.success(locale === "sl" ? "Profil posodobljen" : "Customer profile updated");
      setIsEditing(false);
      loadCustomer();
      onCustomerUpdated?.();
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri posodobitvi" : "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    const msg = locale === "sl" ? "Ali ste prepričani, da želite izbrisati ta obisk?" : "Are you sure you want to delete this visit record?";
    if (!confirm(msg)) return;
    try {
      const { error } = await supabase.from("cafe_visits").delete().eq("id", visitId);
      if (error) throw error;
      toast.success(locale === "sl" ? "Obisk izbrisan" : "Visit deleted");
      loadCustomer();
      onCustomerUpdated?.();
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri brisanju" : "Failed to delete visit"));
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerId) return;
    const msg = locale === "sl"
      ? `Ali ste prepričani, da želite izbrisati obiskovalca "${customer?.name}"? Pretekli obiski bodo ostali kot splošni zapisi gostov.`
      : `Are you sure you want to delete customer "${customer?.name}"? Past visits will remain as general guest records.`;
    if (!confirm(msg)) return;
    try {
      const { error } = await supabase.from("customers").delete().eq("id", customerId);
      if (error) throw error;
      toast.success(locale === "sl" ? "Obiskovalec izbrisan" : "Customer deleted");
      onOpenChange(false);
      onCustomerUpdated?.();
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri brisanju" : "Failed to delete customer"));
    }
  };

  const formatVisitCount = (count: number) => {
    if (locale === "sl") {
      if (count === 1) return "1 obisk skupaj";
      if (count === 2) return "2 obiska skupaj";
      if (count === 3 || count === 4) return `${count} obiski skupaj`;
      return `${count} obiskov skupaj`;
    }
    return `${count} total visits`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                <User className="size-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl">{customer?.name || (locale === "sl" ? "Profil obiskovalca" : "Customer Profile")}</DialogTitle>
                <DialogDescription>
                  {locale === "sl"
                    ? "Zgodovina obiskov, priljubljene pijače, zapiski in prispevki."
                    : "Customer history, recurring drinks, notes, and contributions."}
                </DialogDescription>
              </div>
            </div>
            {customer && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    onOpenChange(false);
                    onLogVisitForCustomer?.(customer);
                  }}
                  className="font-medium"
                >
                  <Plus className="mr-1 size-4" /> {locale === "sl" ? "Zabeleži obisk" : "Log Visit"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (locale === "sl" ? "Prekliči" : "Cancel") : <><Edit2 className="mr-1 size-3.5" /> {locale === "sl" ? "Uredi" : "Edit"}</>}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">{locale === "sl" ? "Nalaganje profila…" : "Loading profile…"}</div>
        ) : customer ? (
          <div className="space-y-6 pt-2">
            {/* Profile Card */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="editName" className="text-xs">{locale === "sl" ? "Ime *" : "Name *"}</Label>
                      <Input
                        id="editName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEmail" className="text-xs">{locale === "sl" ? "E-pošta" : "Email"}</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editPhone" className="text-xs">{locale === "sl" ? "Telefon" : "Phone"}</Label>
                      <Input
                        id="editPhone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editNotes" className="text-xs">{locale === "sl" ? "Trajni zapiski / ozadje" : "Background / Permanent Notes"}</Label>
                    <Textarea
                      id="editNotes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={locale === "sl" ? "npr. Sosed, igra klavir, dela v tehnologiji, itd." : "e.g. Neighbor, plays piano, works in tech, etc."}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteCustomer}
                    >
                      <Trash2 className="mr-1.5 size-3.5" /> {locale === "sl" ? "Izbriši obiskovalca" : "Delete customer"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={savingProfile || !name.trim()}
                    >
                      <Save className="mr-1.5 size-3.5" /> {locale === "sl" ? "Shrani spremembe" : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="size-4 text-primary" />
                        <a href={`mailto:${customer.email}`} className="hover:underline text-foreground">
                          {customer.email}
                        </a>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-4 text-primary" />
                        <a href={`tel:${customer.phone}`} className="hover:underline text-foreground">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-4" />
                      <span>{formatVisitCount(customer.visit_count)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-4" />
                      <span>{locale === "sl" ? "Zadnji obisk" : "Last visited"} {new Date(customer.last_visited_at).toLocaleDateString(locale === "sl" ? "sl-SI" : "en-US")}</span>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-foreground">
                      <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        {locale === "sl" ? "Trajna opomba / ozadje:" : "Background Note:"}
                      </span>
                      {customer.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visits Timeline */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" /> {locale === "sl" ? "Zgodovina obiskov" : "Visit History"} ({visits.length})
                </h3>
              </div>

              {visits.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  {locale === "sl" ? "Za tega obiskovalca še ni zabeleženih obiskov." : "No visits logged for this customer yet."}
                </div>
              ) : (
                <div className="space-y-3">
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-foreground">
                            {new Date(v.visited_at).toLocaleDateString(locale === "sl" ? "sl-SI" : "en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            ·{" "}
                            {new Date(v.visited_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {v.created_by_email && (
                            <div className="text-[11px] text-muted-foreground">
                              {locale === "sl" ? "Zabeležil" : "Logged by"} {v.created_by_email}
                            </div>
                          )}
                        </div>

                        {/* Donation pill */}
                        <div className="flex items-center gap-2">
                          {v.donation_given ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-0.5 font-semibold text-xs",
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
                                {" "}({v.payment_method === "card" ? (locale === "sl" ? "Kartica" : "Card") : (locale === "sl" ? "Gotovina" : "Cash")})
                              </span>
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">{locale === "sl" ? "Brez prispevka" : "No donation"}</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteVisit(v.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                            title={locale === "sl" ? "Izbriši obisk" : "Delete visit"}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      {v.items && v.items.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <Coffee className="size-3.5 text-muted-foreground mr-1" />
                          {v.items.map((it, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs font-normal">
                              {it.quantity > 1 && <span className="font-bold mr-1">{it.quantity}x</span>}
                              {it.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {v.notes && (
                        <div className="mt-2.5 rounded-md bg-muted/40 p-2.5 text-xs text-foreground flex items-start gap-2">
                          <MessageSquare className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                          <p className="whitespace-pre-wrap">{v.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
