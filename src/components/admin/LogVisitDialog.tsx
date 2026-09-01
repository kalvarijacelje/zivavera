import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Coffee,
  Plus,
  Minus,
  Trash2,
  Search,
  MessageSquare,
  Banknote,
  CreditCard,
  Calendar,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export type OrderItem = {
  id?: string;
  name: string;
  quantity: number;
  is_custom?: boolean;
};

type CustomerOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  visit_count: number;
};

type MenuItemOption = {
  id: string;
  name_en: string;
  name_sl: string;
  category_id: string | null;
};

type CategoryOption = {
  id: string;
  name_en: string;
  name_sl: string;
};

interface LogVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  preselectedCustomer?: CustomerOption | null;
  editVisit?: any | null;
}

export function LogVisitDialog({
  open,
  onOpenChange,
  onSaved,
  preselectedCustomer,
  editVisit,
}: LogVisitDialogProps) {
  const { session } = useSession();
  const { locale } = useI18n();

  // Mode: "existing" | "new" | "guest"
  const [customerMode, setCustomerMode] = useState<"existing" | "new" | "guest">("existing");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // New customer fields
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerNotes, setNewCustomerNotes] = useState("");

  // Guest name if mode is guest
  const [guestName, setGuestName] = useState(locale === "sl" ? "Gost" : "Guest");

  // Menu items & categories
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [customItemName, setCustomItemName] = useState("");

  // Conversation notes
  const [notes, setNotes] = useState("");

  // Donation
  const [donationGiven, setDonationGiven] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [donationAmount, setDonationAmount] = useState<string>("");

  // Time
  const [visitedAt, setVisitedAt] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  );

  const [saving, setSaving] = useState(false);

  // Load menu items, categories, and customers
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      const [{ data: custData }, { data: itemData }, { data: catData }] = await Promise.all([
        supabase.from("customers").select("id,name,email,phone,visit_count").order("name"),
        supabase.from("menu_items").select("id,name_en,name_sl,category_id").eq("published", true).order("sort_order"),
        supabase.from("menu_categories").select("id,name_en,name_sl").eq("published", true).order("sort_order"),
      ]);

      if (custData) setCustomers(custData as CustomerOption[]);
      if (itemData) setMenuItems(itemData as MenuItemOption[]);
      if (catData) setCategories(catData as CategoryOption[]);
    };

    loadData();

    if (editVisit) {
      if (editVisit.customer_id) {
        setCustomerMode("existing");
        setSelectedCustomerId(editVisit.customer_id);
      } else {
        setCustomerMode("guest");
        setGuestName(editVisit.guest_name || (locale === "sl" ? "Gost" : "Guest"));
      }
      setSelectedItems(Array.isArray(editVisit.items) ? editVisit.items : []);
      setNotes(editVisit.notes || "");
      setDonationGiven(Boolean(editVisit.donation_given));
      setPaymentMethod(editVisit.payment_method === "card" ? "card" : "cash");
      setDonationAmount(editVisit.donation_amount ? String(editVisit.donation_amount) : "");
      if (editVisit.visited_at) {
        const d = new Date(editVisit.visited_at);
        setVisitedAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
    } else if (preselectedCustomer) {
      setCustomerMode("existing");
      setSelectedCustomerId(preselectedCustomer.id);
      resetVisitFields();
    } else {
      resetAll();
    }
  }, [open, preselectedCustomer, editVisit]);

  const resetVisitFields = () => {
    setSelectedItems([]);
    setCustomItemName("");
    setNotes("");
    setDonationGiven(false);
    setPaymentMethod("cash");
    setDonationAmount("");
    setVisitedAt(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const resetAll = () => {
    setCustomerMode("existing");
    setSelectedCustomerId(null);
    setCustomerSearch("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewCustomerPhone("");
    setNewCustomerNotes("");
    setGuestName(locale === "sl" ? "Gost" : "Guest");
    resetVisitFields();
  };

  const addItem = (name: string, id?: string, is_custom?: boolean) => {
    setSelectedItems((prev) => {
      const idx = prev.findIndex((it) => (id ? it.id === id : it.name.toLowerCase() === name.toLowerCase()));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { id, name, quantity: 1, is_custom }];
    });
  };

  const decrementItem = (index: number) => {
    setSelectedItems((prev) => {
      const item = prev[index];
      if (item.quantity > 1) {
        const copy = [...prev];
        copy[index] = { ...copy[index], quantity: copy[index].quantity - 1 };
        return copy;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    addItem(customItemName.trim(), undefined, true);
    setCustomItemName("");
  };

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q));
  });

  const filteredMenuItems = menuItems.filter((it) => {
    if (selectedCategory === "all") return true;
    return it.category_id === selectedCategory;
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalCustomerId: string | null = null;
      let finalGuestName = locale === "sl" ? "Gost" : "Guest";
      let finalGuestEmail: string | null = null;

      if (customerMode === "existing") {
        if (!selectedCustomerId) {
          toast.error(locale === "sl" ? "Izberite obiskovalca ali izberite Gost" : "Please select a customer or choose Guest");
          setSaving(false);
          return;
        }
        const cust = customers.find((c) => c.id === selectedCustomerId);
        finalCustomerId = selectedCustomerId;
        finalGuestName = cust?.name || (locale === "sl" ? "Gost" : "Guest");
        finalGuestEmail = cust?.email || null;
      } else if (customerMode === "new") {
        if (!newCustomerName.trim()) {
          toast.error(locale === "sl" ? "Vnesite ime novega obiskovalca" : "Please enter a name for the new customer");
          setSaving(false);
          return;
        }
        const { data: newCust, error: custErr } = await supabase
          .from("customers")
          .insert({
            name: newCustomerName.trim(),
            email: newCustomerEmail.trim() || null,
            phone: newCustomerPhone.trim() || null,
            notes: newCustomerNotes.trim() || null,
            first_visited_at: new Date(visitedAt).toISOString(),
            last_visited_at: new Date(visitedAt).toISOString(),
            visit_count: 1,
            created_by: session?.user?.id || null,
          })
          .select("id, name, email")
          .single();

        if (custErr) throw custErr;
        finalCustomerId = newCust.id;
        finalGuestName = newCust.name;
        finalGuestEmail = newCust.email;
      } else {
        finalCustomerId = null;
        finalGuestName = guestName.trim() || (locale === "sl" ? "Gost" : "Guest");
        finalGuestEmail = null;
      }

      const amountVal = donationGiven && donationAmount.trim() ? parseFloat(donationAmount.replace(",", ".")) : null;

      const visitPayload = {
        customer_id: finalCustomerId,
        guest_name: finalGuestName,
        guest_email: finalGuestEmail,
        items: selectedItems,
        notes: notes.trim() || null,
        donation_given: donationGiven,
        donation_amount: !isNaN(amountVal as number) ? amountVal : null,
        payment_method: donationGiven ? paymentMethod : null,
        visited_at: new Date(visitedAt).toISOString(),
        created_by: session?.user?.id || null,
        created_by_email: session?.user?.email || null,
      };

      if (editVisit?.id) {
        const { error: visitErr } = await supabase
          .from("cafe_visits")
          .update(visitPayload)
          .eq("id", editVisit.id);
        if (visitErr) throw visitErr;
        toast.success(locale === "sl" ? "Obisk posodobljen" : "Visit updated successfully");
      } else {
        const { error: visitErr } = await supabase
          .from("cafe_visits")
          .insert(visitPayload);
        if (visitErr) throw visitErr;
        toast.success(locale === "sl" ? "Obisk uspešno zabeležen!" : "Visit logged successfully!");
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      toast.error(err.message || (locale === "sl" ? "Napaka pri shranjevanju" : "Failed to save visit"));
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Coffee className="size-5 text-amber-700" />
            {locale === "sl"
              ? (editVisit ? "Uredi obisk" : "Zabeleži obiskovalca in naročilo")
              : (editVisit ? "Edit Visit" : "Log Visitor & Order")}
          </DialogTitle>
          <DialogDescription>
            {locale === "sl"
              ? "Zabeležite, kdo je prišel, kaj so si privoščili z menija, zapiske pogovora ter prispevke."
              : "Record who visited, what they enjoyed from the menu, conversation notes, and donations."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Section 1: Customer Selection */}
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="font-semibold text-foreground">
                {locale === "sl" ? "1. Kdo je prišel?" : "1. Who visited?"}
              </Label>
              <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCustomerMode("existing")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    customerMode === "existing" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "sl" ? "Shranjeni" : "Saved"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("new")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    customerMode === "new" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "sl" ? "+ Nov profil" : "+ New Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("guest")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    customerMode === "guest" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "sl" ? "Gost" : "Guest"}
                </button>
              </div>
            </div>

            {customerMode === "existing" && (
              <div className="space-y-2">
                {selectedCustomerObj ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
                    <div>
                      <div className="font-medium text-foreground">{selectedCustomerObj.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedCustomerObj.email || (locale === "sl" ? "Brez e-pošte" : "No email")} · {selectedCustomerObj.visit_count} {locale === "sl" ? "obiskov" : "visits"}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)}>
                      {locale === "sl" ? "Spremeni" : "Change"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={locale === "sl" ? "Išči po imenu ali e-pošti…" : "Search customer by name or email…"}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-md border border-border bg-background divide-y divide-border">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          {locale === "sl" ? "Ni najdenih obiskovalcev. Izberite \"+ Nov profil\" zgoraj." : "No matching customer found. Switch to \"+ New Profile\" above."}
                        </div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCustomerId(c.id)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="text-muted-foreground">
                              {c.email || `${c.visit_count} ${locale === "sl" ? "obiskov" : "visits"}`}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {customerMode === "new" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="newCustName" className="text-xs">{locale === "sl" ? "Ime *" : "Name *"}</Label>
                  <Input
                    id="newCustName"
                    placeholder="npr. Marko Novak"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newCustEmail" className="text-xs">{locale === "sl" ? "E-pošta (neobvezno)" : "Email (optional)"}</Label>
                  <Input
                    id="newCustEmail"
                    type="email"
                    placeholder="npr. marko@primer.si"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newCustPhone" className="text-xs">{locale === "sl" ? "Telefon (neobvezno)" : "Phone (optional)"}</Label>
                  <Input
                    id="newCustPhone"
                    placeholder="npr. +386 40 123 456"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newCustNotes" className="text-xs">{locale === "sl" ? "Ozadje / trajna opomba" : "Initial background notes"}</Label>
                  <Input
                    id="newCustNotes"
                    placeholder={locale === "sl" ? "npr. Sosed, igra kitaro" : "e.g. Neighbor, plays guitar"}
                    value={newCustomerNotes}
                    onChange={(e) => setNewCustomerNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            {customerMode === "guest" && (
              <div>
                <Label htmlFor="guestName" className="text-xs">{locale === "sl" ? "Oznaka gosta / mize" : "Visitor identifier / table"}</Label>
                <Input
                  id="guestName"
                  placeholder={locale === "sl" ? "npr. Gost, Miza 2, Par pri oknu" : "e.g. Guest, Table 2, Couple by the window"}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Section 2: Items enjoyed (Menu + Custom) */}
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-foreground">
                {locale === "sl" ? "2. Kaj so si privoščili?" : "2. What did they have?"}
              </Label>
              <span className="text-xs text-muted-foreground">
                {locale === "sl" ? "Kliknite za dodajanje" : "Tap items to add"}
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {locale === "sl" ? "Vsi izdelki" : "All items"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "sl" ? cat.name_sl : cat.name_en}
                </button>
              ))}
            </div>

            {/* Menu item buttons */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 max-h-48 overflow-y-auto p-1">
              {filteredMenuItems.map((item) => {
                const count = selectedItems.find((i) => i.id === item.id)?.quantity || 0;
                const displayName = locale === "sl" ? item.name_sl : item.name_en;
                const secondaryName = locale === "sl" ? item.name_en : item.name_sl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItem(displayName, item.id, false)}
                    className={cn(
                      "relative flex flex-col items-start justify-between rounded-lg border p-2 text-left text-xs transition-all active:scale-95",
                      count > 0
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-foreground font-medium shadow-xs"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    )}
                  >
                    <span className="line-clamp-2 leading-snug font-medium">{displayName}</span>
                    <span className="text-[10px] text-muted-foreground">{secondaryName}</span>
                    {count > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom off-menu item */}
            <div className="flex gap-2 pt-1">
              <Input
                placeholder={locale === "sl" ? "Ali vpišite izdelek po meri (npr. zeliščni čaj, rogljiček)…" : "Or type custom item (e.g. Herbal tea, Croissant)…"}
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                className="text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddCustom} disabled={!customItemName.trim()}>
                <Plus className="mr-1 size-3.5" /> {locale === "sl" ? "Dodaj" : "Add"}
              </Button>
            </div>

            {/* Selected items summary */}
            {selectedItems.length > 0 && (
              <div className="mt-3 rounded-lg border border-border bg-background p-3">
                <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {locale === "sl" ? "Izbrani izdelki" : "Selected Items"} ({selectedItems.reduce((a, b) => a + b.quantity, 0)})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 py-1 pl-3 pr-1 text-xs"
                    >
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.is_custom && (
                        <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
                          {locale === "sl" ? "po meri" : "custom"}
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          type="button"
                          onClick={() => decrementItem(idx)}
                          className="flex size-5 items-center justify-center rounded-full bg-background hover:bg-muted text-foreground"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-5 text-center font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => addItem(item.name, item.id, item.is_custom)}
                          className="flex size-5 items-center justify-center rounded-full bg-background hover:bg-muted text-foreground"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="flex size-5 items-center justify-center rounded-full hover:text-destructive text-muted-foreground ml-0.5"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Notes & Conversation */}
          <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-4">
            <Label htmlFor="visitNotes" className="font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-4 text-primary" /> {locale === "sl" ? "3. Zapiski pogovora in srečanja" : "3. Conversation & Interaction Notes"}
            </Label>
            <Textarea
              id="visitNotes"
              rows={2}
              placeholder={locale === "sl" ? "O čem ste se pogovarjali? Morebitne molitvene potrebe, povezava s skupnostjo…" : "What did you talk about? Any prayer needs, background, connection with the community…"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Section 4: Donation & Payment Method */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="donationSwitch" className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-emerald-600" /> {locale === "sl" ? "4. Prostovoljni prispevek" : "4. Voluntary Contribution / Donation"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {locale === "sl" ? "Označite, če je obiskovalec pustil prostovoljni prispevek za pijačo" : "Mark if the guest gave a donation for their drinks"}
                </p>
              </div>
              <Switch
                id="donationSwitch"
                checked={donationGiven}
                onCheckedChange={setDonationGiven}
              />
            </div>

            {donationGiven && (
              <div className="pt-2 border-t border-border/60 space-y-3">
                {/* Cash vs Card Toggle */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    {locale === "sl" ? "Način plačila" : "Payment Method"}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                        paymentMethod === "cash"
                          ? "border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Banknote className="size-4" /> {locale === "sl" ? "Gotovina" : "Cash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                        paymentMethod === "card"
                          ? "border-blue-600 bg-blue-500/15 text-blue-700 dark:text-blue-400 shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <CreditCard className="size-4" /> {locale === "sl" ? "Kartica" : "Card"}
                    </button>
                  </div>
                </div>

                {/* Amount input & quick presets */}
                <div>
                  <Label htmlFor="donationAmount" className="text-xs text-muted-foreground mb-1 block">
                    {locale === "sl" ? "Znesek v EUR (Neobvezno — pustite prazno, če samo beležite prispevek)" : "Amount in EUR (Optional — leave blank if just marking a contribution)"}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">€</span>
                      <Input
                        id="donationAmount"
                        type="number"
                        step="0.50"
                        min="0"
                        placeholder="npr. 5.00"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                    {[2, 3, 5, 10].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(String(amt))}
                        className={cn(donationAmount === String(amt) && "border-primary bg-primary/10")}
                      >
                        €{amt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Date and Time */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" /> {locale === "sl" ? "Datum & čas:" : "Date & Time:"}
            </div>
            <Input
              type="datetime-local"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              className="w-auto h-8 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {locale === "sl" ? "Prekliči" : "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="font-semibold">
            {saving
              ? (locale === "sl" ? "Shranjevanje…" : "Saving…")
              : editVisit
              ? (locale === "sl" ? "Posodobi obisk" : "Update Visit")
              : (locale === "sl" ? "Shrani obisk" : "Save Visit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
