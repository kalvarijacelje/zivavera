import type { Locale } from "@/i18n/translations";

export interface CafeEvent {
  id: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  startsAt: string; // ISO
  location: Record<Locale, string>;
  published: boolean;
  is_recurring?: boolean;
  recurrence_interval?: string;
}

const inDays = (n: number, hours = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

export const EVENTS: CafeEvent[] = [
  {
    id: "evening-conversation",
    published: true,
    startsAt: inDays(5, 19),
    title: {
      en: "Evening of Conversation",
      sl: "Večer pogovora",
    },
    description: {
      en: "An open evening to share thoughts about faith, life and hope, over a warm cup of coffee. Everyone is welcome — no preparation needed.",
      sl: "Odprt večer za pogovor o veri, življenju in upanju ob topli skodelici kave. Vsak je dobrodošel — priprava ni potrebna.",
    },
    location: {
      en: "At the café",
      sl: "V kavarni",
    },
  },
  {
    id: "barista-morning",
    published: true,
    startsAt: inDays(12, 10),
    title: {
      en: "Saturday Barista Morning",
      sl: "Sobotno barista jutro",
    },
    description: {
      en: "Step behind the counter for a relaxed morning of espresso tasting and brewing tips with our team.",
      sl: "Sproščeno sobotno jutro za pokušino espresso napitkov in nasvete naše ekipe.",
    },
    location: {
      en: "Café counter",
      sl: "Za pultom kavarne",
    },
  },
  {
    id: "ebenezer-update",
    published: true,
    startsAt: inDays(20, 18),
    title: {
      en: "Ebenezer: Stories from Ethiopia",
      sl: "Ebenezer: zgodbe iz Etiopije",
    },
    description: {
      en: "A short evening sharing stories and photos from the Ebenezer orphanage — the project that 10% of every contribution supports.",
      sl: "Kratek večer z zgodbami in fotografijami iz sirotišnice Ebenezer — projekta, ki ga podpira 10 % vsakega prispevka.",
    },
    location: {
      en: "At the café",
      sl: "V kavarni",
    },
  },
];
