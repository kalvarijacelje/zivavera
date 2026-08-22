import espresso from "@/assets/coffee-espresso.jpg";
import cappuccino from "@/assets/coffee-cappuccino.jpg";
import tea from "@/assets/drink-tea.jpg";
import chocolate from "@/assets/drink-chocolate.jpg";
import juice from "@/assets/drink-juice.jpg";
import cookies from "@/assets/pastry-cookies.jpg";
import type { Locale } from "@/i18n/translations";

export type MenuCategory = "coffee" | "tea" | "cold" | "sweet";

export interface MenuItem {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  category: MenuCategory;
  image: string;
  available: boolean;
  featured: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "espresso",
    category: "coffee",
    image: espresso,
    available: true,
    featured: true,
    name: { en: "Espresso", sl: "Espresso" },
    description: {
      en: "A clean, rich single shot — pulled from freshly ground Barcaffè beans.",
      sl: "Čist in poln okus enojnega espresso napitka — iz sveže mletih zrn Barcaffè.",
    },
  },
  {
    id: "cappuccino",
    category: "coffee",
    image: cappuccino,
    available: true,
    featured: true,
    name: { en: "Cappuccino", sl: "Kapučino" },
    description: {
      en: "Espresso with silky steamed milk and a soft foam crown.",
      sl: "Espresso s svilnatim mlekom in nežno mlečno peno.",
    },
  },
  {
    id: "latte",
    category: "coffee",
    image: cappuccino,
    available: true,
    featured: false,
    name: { en: "Caffè Latte", sl: "Kava z mlekom" },
    description: {
      en: "A gentle, milky cup for slow mornings and long conversations.",
      sl: "Mehka, mlečna skodelica za počasna jutra in dolge pogovore.",
    },
  },
  {
    id: "herbal-tea",
    category: "tea",
    image: tea,
    available: true,
    featured: false,
    name: { en: "Herbal Tea", sl: "Zeliščni čaj" },
    description: {
      en: "A warm cup of mint, lemon balm or chamomile — depending on the day.",
      sl: "Topla skodelica mete, melise ali kamilice — odvisno od dneva.",
    },
  },
  {
    id: "lemon-ginger",
    category: "tea",
    image: tea,
    available: true,
    featured: false,
    name: { en: "Lemon & Ginger", sl: "Limona in ingver" },
    description: {
      en: "Bright, warming and a little spicy. Perfect for cooler days.",
      sl: "Sveža, topla in nežno pikantna. Kot nalašč za hladnejše dni.",
    },
  },
  {
    id: "hot-chocolate",
    category: "cold",
    image: chocolate,
    available: true,
    featured: true,
    name: { en: "Hot Chocolate", sl: "Vroča čokolada" },
    description: {
      en: "Thick, comforting chocolate topped with soft whipped cream.",
      sl: "Gosta, topla čokolada s puhasto smetano.",
    },
  },
  {
    id: "orange-juice",
    category: "cold",
    image: juice,
    available: true,
    featured: false,
    name: { en: "Fresh Orange Juice", sl: "Sveže iztisnjen pomarančni sok" },
    description: {
      en: "Squeezed in-house. Bright, sweet and a little tangy.",
      sl: "Iztisnjen pri nas. Sladek, svež in osvežilen.",
    },
  },
  {
    id: "pastry",
    category: "sweet",
    image: cookies,
    available: true,
    featured: false,
    name: { en: "Cookie & Croissant", sl: "Piškot in rogljiček" },
    description: {
      en: "A small sweet to go with your cup — baked fresh.",
      sl: "Majhna sladica k vaši skodelici — sveže pečena.",
    },
  },
  {
    id: "seasonal",
    category: "sweet",
    image: cookies,
    available: false,
    featured: false,
    name: { en: "Seasonal Cake", sl: "Sezonska torta" },
    description: {
      en: "Changes with the season — ask us what's on the counter today.",
      sl: "Spreminja se s sezono — vprašajte, kaj imamo danes.",
    },
  },
];
