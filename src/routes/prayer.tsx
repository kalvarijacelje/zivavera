import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Lock, Send, ShieldCheck, Info } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { submitPrayerRequest } from "@/lib/prayer.functions";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Prayer & Reflection — ŽIVA VERA" },
      {
        name: "description",
        content:
          "Share a prayer request or a spiritual question with the ŽIVA VERA team. Private by default, treated with care.",
      },
      { property: "og:title", content: "Prayer & Reflection — ŽIVA VERA" },
      {
        property: "og:description",
        content:
          "Submit a prayer request or spiritual question. We treat every message with care and confidentiality.",
      },
    ],
  }),
  component: PrayerPage,
});

type WallEntry = {
  id: string;
  created_at: string;
  message: string;
  request_type: "prayer" | "spiritual_question";
  display_name: string | null;
  public_response: string | null;
  public_response_at: string | null;
};

function PrayerPage() {
  const { locale } = useI18n();
  const sl = locale === "sl";

  const copy = sl
    ? {
        formTitle: "Delite molitev ali duhovno vprašanje",
        formIntro:
          "Lahko prosite za molitev, poveste, kar nosite v srcu, ali postavite duhovno vprašanje. Vsako sporočilo sprejmemo s skrbjo.",
        inCafeNote:
          "Pogovorite se lahko tudi z nami osebno v kavarni — običajno je kdo iz ekipe na voljo za pogovor.",
        type: "Vrsta",
        typePrayer: "Molitvena prošnja",
        typeQuestion: "Duhovno vprašanje",
        typePrayerDesc: "Prosite za molitev zase ali za koga, ki vam je drag.",
        typeQuestionDesc:
          "Vprašajte nekaj o veri, življenju ali sledenju Jezusu. Če izberete javno objavo, lahko prejmete tudi pastoralni odgovor.",
        message: "Vaše sporočilo",
        messagePh: "Z nami delite kar nosite v srcu…",
        messageHint:
          "Prosimo, ne navajajte zelo občutljivih osebnih podatkov (zdravstvenih, naslovov, finančnih). Če pišete o drugih, ne navajajte njihovih podatkov brez dovoljenja.",
        name: "Vaše ime (neobvezno)",
        contact: "E-pošta ali telefon (neobvezno)",
        contactHint: "Samo če želite, da vas po potrebi zasebno kontaktiramo.",
        anonymous: "Pošlji anonimno",
        anonymousHint:
          "Vaše ime in kontakt ne bosta nikoli prikazani — sporočilo se lahko deli brez vaše identitete.",
        visibility: "Vidnost",
        visPrivate: "Zasebno — samo ekipa",
        visPrivateDesc: "Samo naša pastoralna ekipa bo videla vašo prošnjo.",
        visPublic: "Po pregledu lahko javno",
        visPublicDesc:
          "Po odobritvi se lahko vaše sporočilo pojavi na javnem zidu. Prikazano bo le vaše ime ali 'Anonimno'. Če gre za duhovno vprašanje, lahko dodamo tudi pastoralni odgovor.",
        publicResponseNote:
          "Javno objavljena duhovna vprašanja lahko prejmejo pastoralni odgovor na zidu. Če ste pustili kontakt, se vam lahko oglasimo tudi zasebno. Vprašanj ne moremo vedno takoj odgovoriti.",
        communityNote:
          "Prosimo, da so javna sporočila spoštljiva in prijazna. Izogibajte se nepotrebnim osebnim podatkom in bodite previdni, ko omenjate druge.",
        submit: "Pošlji prošnjo",
        sending: "Pošiljam…",
        success: "Hvala. Vaša prošnja je sprejeta.",
        successDetail:
          "Naša pastoralna ekipa jo bo prebrala s skrbjo. Javne prošnje so pregledane pred objavo; zasebne prošnje vidi samo ekipa.",
        successInCafe:
          "Če ste v kavarni, se lahko za molitev ali vprašanje obrnete tudi osebno na nekoga iz ekipe.",
        successNotEmergency:
          "To ni kanal za nujne primere. Če potrebujete takojšnjo pomoč, prosimo pokličite ustrezne službe.",
        submitAnother: "Pošlji še eno",
        error: "Sporočila ni bilo mogoče poslati. Poskusite znova.",
        privacyTitle: "Kaj se zgodi po pošiljanju",
        privacyBody:
          "Vsako sporočilo prebere naša pastoralna ekipa. Nič se ne objavi samodejno. Javna sporočila pregledamo glede spoštljivosti in primernosti. Če ste dovolili javni odgovor, bomo na duhovno vprašanje morda odgovorili na zidu in se vam osebno oglasili, če ste pustili kontakt.",
        wallTitle: "Molitveni zid",
        wallIntro:
          "Spodnje prošnje in vprašanja so bila deljena javno z dovoljenjem oseb, ki so jih poslale. Pridružite se nam v molitvi.",
        anonymous_short: "Anonimno",
        emptyWall: "Trenutno ni javno objavljenih prošenj ali vprašanj.",
        badgePrayer: "Molitvena prošnja",
        badgeQuestion: "Duhovno vprašanje",
        publicResponseLabel: "Odgovor pastoralne ekipe",
      }
    : {
        formTitle: "Share a prayer or spiritual question",
        formIntro:
          "You are welcome to ask for prayer, share what is on your heart, or ask a spiritual question here. Every message is received with care.",
        inCafeNote:
          "You can also speak with us in person when you visit the café — someone from the team is usually available.",
        type: "Type",
        typePrayer: "Prayer request",
        typeQuestion: "Spiritual question",
        typePrayerDesc: "Ask for prayer for yourself or someone you care about.",
        typeQuestionDesc:
          "Ask something about faith, life, or following Jesus. You may receive a pastoral response if you share it publicly.",
        message: "Your message",
        messagePh: "Share whatever is on your heart…",
        messageHint:
          "Please avoid highly sensitive personal details (medical, address, financial). If you mention other people, do not share their identifying details without permission.",
        name: "Your name (optional)",
        contact: "Email or phone (optional)",
        contactHint:
          "Only if you'd like us to be able to reach out to you privately.",
        anonymous: "Submit anonymously",
        anonymousHint:
          "Your name and contact will never be shown — the message can be shared without your identity.",
        visibility: "Visibility",
        visPrivate: "Private — staff only",
        visPrivateDesc:
          "Only our pastoral team will ever see this request.",
        visPublic: "May be public after review",
        visPublicDesc:
          "After review, your message may appear on the public wall. Only your first name or 'Anonymous' will be shown. If it is a spiritual question, a pastoral response may be added.",
        publicResponseNote:
          "Public spiritual questions may receive a pastoral response on the wall. We may also follow up privately if you provided contact details. Not every question can be answered immediately.",
        communityNote:
          "Please keep public messages respectful and kind. Avoid unnecessary personal details, and be considerate when writing about other people.",
        submit: "Send request",
        sending: "Sending…",
        success: "Thank you. Your request has been received.",
        successDetail:
          "Our pastoral team will read it with care. Public-eligible requests are reviewed before anything is published; private requests are only seen by staff reviewers.",
        successInCafe:
          "If you are visiting the café, you are also welcome to ask for prayer or share a question with someone in person.",
        successNotEmergency:
          "This is a prayer and spiritual-support channel, not an emergency response service. If you need urgent help, please contact appropriate emergency services.",
        submitAnother: "Submit another",
        error: "We couldn't send your message. Please try again.",
        privacyTitle: "What happens after you submit",
        privacyBody:
          "Every message is read by our pastoral team. Nothing is published automatically. Public messages are reviewed for respect and safety before appearing. If you allowed a public response, we may answer a spiritual question on the wall and also reach out privately if you left contact details.",
        wallTitle: "Prayer wall",
        wallIntro:
          "The requests and questions below were shared publicly with the consent of the people who submitted them. Please join us in praying for them.",
        anonymous_short: "Anonymous",
        emptyWall: "No public requests or questions yet.",
        badgePrayer: "Prayer request",
        badgeQuestion: "Spiritual question",
        publicResponseLabel: "Pastoral team response",
      };

  const [type, setType] = useState<"prayer" | "spiritual_question">("prayer");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [anonymous, setAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<
    "private_staff" | "public_if_approved"
  >("private_staff");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const renderedAt = useMemo(() => Date.now(), []);
  const submitFn = useServerFn(submitPrayerRequest);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 2) {
      toast.error(sl ? "Sporočilo je obvezno" : "Message is required");
      return;
    }
    if (trimmed.length > 4000) {
      toast.error(sl ? "Sporočilo je predolgo" : "Message is too long");
      return;
    }
    setSending(true);
    try {
      await submitFn({
        data: {
          message: trimmed,
          name: anonymous ? null : name.trim() || null,
          contact: anonymous ? null : contact.trim() || null,
          request_type: type,
          visibility_choice: visibility,
          is_anonymous: anonymous,
          website,
          rendered_at: renderedAt,
        },
      });
      toast.success(copy.success);
      setSubmitted(true);
      setMessage("");
      setName("");
      setContact("");
      setWebsite("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : copy.error;
      toast.error(msg || copy.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteShell>
      <StaticPageRenderer
        pageKey="prayer"
       
        after={
          <div className="space-y-12">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <header className="mb-4">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">
                  {copy.formTitle}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {copy.formIntro}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {copy.inCafeNote}
                </p>
              </header>

              {submitted ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
                  <Heart className="mx-auto size-6 text-primary" />
                  <p className="mt-3 text-pretty text-base font-medium">
                    {copy.success}
                  </p>
                  <p className="mt-2 text-pretty text-sm text-muted-foreground">
                    {copy.successDetail}
                  </p>
                  <p className="mt-2 text-pretty text-sm text-muted-foreground">
                    {copy.successInCafe}
                  </p>
                  <p className="mx-auto mt-3 inline-flex max-w-md items-start gap-2 rounded-xl bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <span>{copy.successNotEmergency}</span>
                  </p>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setSubmitted(false)}
                    >
                      {copy.submitAnother}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  {/* Honeypot — hidden from humans, visible to most bots. */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
                    <label>
                      Website
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{copy.type}</Label>
                    <Select
                      value={type}
                      onValueChange={(v) => setType(v as typeof type)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prayer">{copy.typePrayer}</SelectItem>
                        <SelectItem value="spiritual_question">
                          {copy.typeQuestion}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {type === "prayer"
                        ? copy.typePrayerDesc
                        : copy.typeQuestionDesc}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>{copy.message} *</Label>
                    <Textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={copy.messagePh}
                      maxLength={4000}
                      required
                    />
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                      <span>{copy.messageHint}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{copy.anonymous}</div>
                      <div className="text-xs text-muted-foreground">
                        {copy.anonymousHint}
                      </div>
                    </div>
                    <Switch
                      checked={anonymous}
                      onCheckedChange={setAnonymous}
                    />
                  </div>

                  {!anonymous && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>{copy.name}</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{copy.contact}</Label>
                        <Input
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground">
                          {copy.contactHint}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{copy.visibility}</Label>
                    <RadioGroup
                      value={visibility}
                      onValueChange={(v) =>
                        setVisibility(v as typeof visibility)
                      }
                      className="space-y-2"
                    >
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem
                          value="private_staff"
                          className="mt-0.5"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {copy.visPrivate}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {copy.visPrivateDesc}
                          </div>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem
                          value="public_if_approved"
                          className="mt-0.5"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {copy.visPublic}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {copy.visPublicDesc}
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {type === "spiritual_question" && (
                    <p className="flex items-start gap-2 rounded-xl bg-primary/5 px-4 py-3 text-xs text-foreground/80">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{copy.publicResponseNote}</span>
                    </p>
                  )}

                  <p className="flex items-start gap-2 rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    <Heart className="mt-0.5 size-3.5 shrink-0" />
                    <span>{copy.communityNote}</span>
                  </p>

                  <p className="flex items-start gap-2 rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    <Lock className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      <strong className="font-medium text-foreground">
                        {copy.privacyTitle}.
                      </strong>{" "}
                      {copy.privacyBody}
                    </span>
                  </p>

                  <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                    <Send className="mr-2 size-4" />
                    {sending ? copy.sending : copy.submit}
                  </Button>
                </form>
              )}
            </section>

            <PrayerWall copy={copy} />
          </div>
        }
      />
    </SiteShell>
  );
}

function PrayerWall({
  copy,
}: {
  copy: {
    wallTitle: string;
    wallIntro: string;
    anonymous_short: string;
    emptyWall: string;
    badgePrayer: string;
    badgeQuestion: string;
    publicResponseLabel: string;
  };
}) {
  const [entries, setEntries] = useState<WallEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    supabase.rpc("get_prayer_wall").then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setEntries([]);
        return;
      }
      setEntries(((data ?? []) as unknown) as WallEntry[]);
    });
    return () => {
      active = false;
    };
  }, []);

  if (entries === null) return null;
  if (entries.length === 0) {
    return (
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {copy.wallTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.emptyWall}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        {copy.wallTitle}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.wallIntro}</p>
      <ul className="mt-6 space-y-4">
        {entries.map((e) => (
          <li
            key={e.id}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {e.display_name ?? copy.anonymous_short}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {e.request_type === "spiritual_question"
                  ? copy.badgeQuestion
                  : copy.badgePrayer}
              </Badge>
            </div>
            <p className="mt-2 whitespace-pre-line text-pretty leading-relaxed text-foreground/85">
              {e.message}
            </p>
            {e.request_type === "spiritual_question" && e.public_response && (
              <div className="mt-4 rounded-xl border-l-2 border-primary/50 bg-primary/5 px-4 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-primary">
                  {copy.publicResponseLabel}
                </div>
                <p className="mt-1.5 whitespace-pre-line text-pretty text-sm leading-relaxed text-foreground/90">
                  {e.public_response}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
