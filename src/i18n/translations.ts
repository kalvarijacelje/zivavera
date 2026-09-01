// Translation resources. English is the source of truth.
// Keys are dot-paths used through the t() function in src/i18n/I18nProvider.tsx.

export const SUPPORTED_LOCALES = ["sl", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "sl";

export type TranslationDict = Record<string, string>;

const en: TranslationDict = {
  "brand.name": "ŽIVA VERA",
  "brand.tagline": "Kavarna",
  "brand.partner": "Coffee by Barcaffè",

  "nav.home": "Home",
  "nav.menu": "Menu",
  "nav.events": "Events",
  "nav.about": "About",
  "nav.aboutDropdown": "About us",
  "nav.prayer": "Prayer",
  "nav.visit": "Visit & Contribute",
  "nav.hospitality": "Hospitality Policy",
  "nav.planVisit": "Plan a visit",
  "nav.whereWeAre": "Find us",
  "nav.admin": "Admin",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",

  "lang.switch": "Language",
  "lang.en": "English",
  "lang.sl": "Slovenščina",

  "home.hero.eyebrow": "A unique café that runs on faith",
  "home.hero.title": "Good coffee, real conversation, honest hospitality.",
  "home.hero.subtitle":
    "Welcome to ŽIVA VERA — Slovenia's first Christian non-profit coffee shop. There is no price list. Stay, share, and contribute what feels right.",
  "home.hero.ctaMenu": "See the menu",
  "home.hero.ctaVisit": "Plan your visit",

  "home.values.title": "What makes us different",
  "home.values.welcome.title": "Everyone is welcome",
  "home.values.welcome.body":
    "Whatever your story, beliefs, or background — there's a seat at the table for you.",
  "home.values.faith.title": "We run on faith",
  "home.values.faith.body":
    "No price list, no sales. Enjoy a drink and contribute what you can — freely, by your own choice.",
  "home.values.purpose.title": "Coffee with purpose",
  "home.values.purpose.body":
    "10% of every contribution goes to the Ebenezer orphanage in Ethiopia, a project we have personally supported since 2007.",

  "home.menu.title": "From our counter",
  "home.menu.body":
    "Espresso drinks, teas, hot chocolate, fresh juices and a few sweet things — prepared with care, served with a smile.",
  "home.menu.cta": "Browse the full menu",

  "home.community.title": "More than a café",
  "home.community.body":
    "ŽIVA VERA is a place to meet, talk, and take your time. A place where you're welcome exactly as you are.",
  "home.community.cta": "Read our story",

  "menu.title": "Our Menu",
  "menu.intro":
    "No price list — only voluntary contributions. Coffee proudly served from Barcaffè.",
  "menu.category.coffee": "Coffee",
  "menu.category.tea": "Tea & Herbal",
  "menu.category.cold": "Hot and Cold Drinks",
  "menu.category.sweet": "Something Sweet",
  "menu.unavailable": "Currently unavailable",
  "menu.featured": "Featured",
  "menu.empty": "Our menu is being prepared. Please check back soon.",
  "menu.loading": "Loading the menu…",
  "menu.offer_note.title": "A little about our offer",
  "menu.offer_note.body_1":
    "At ŽIVA VERA, we do not serve alcoholic or energy drinks, as we want to maintain a calm and pleasant atmosphere and create an environment that reflects the values of our mission — a place where everyone can feel at home.",
  "menu.offer_note.body_2":
    "The selection in our refrigerator is a little different from what you might find in a typical café, so we invite you to ask our staff what is currently available — we'll be happy to help. You might just discover something new.",

  "events.title": "Events at ŽIVA VERA",
  "events.intro":
    "Gatherings, conversations and small celebrations. Stop by — you're always welcome.",
  "events.empty": "No upcoming events right now. Check back soon.",
  "events.when": "When",
  "events.where": "Where",

  "about.title": "A unique café that runs on faith",
  "about.s1.title": "Welcome to ŽIVA VERA",
  "about.s1.body":
    "Welcome to ŽIVA VERA — a place where good coffee, warm company and sincere relationships meet the values of faith, hope and service. We are the first and currently only Christian non-profit café in Slovenia, operating as a mission under the Christian Church Calvary. Our goal is not profit, but to create a welcoming space where anyone can feel at home, regardless of their story, beliefs or background. We believe that some of the most meaningful conversations begin over a cup of good coffee.",
  "about.s2.title": "What does it mean to run \"on faith\"?",
  "about.s2.body":
    "ŽIVA VERA is a non-profit activity. Instead of a classic business model, we created a place where anyone can enjoy a coffee or another non-alcoholic drink and offer a voluntary contribution of their own choosing. That means we don't have a price list or sales in the usual sense. Our work is sustained by the voluntary contributions of our guests, which cover ingredients, drink preparation, maintenance of the space and other operating costs. This way of working reflects our trust in God and gives every guest the freedom to contribute as much as they wish and are able.",
  "about.s3.title": "How can you contribute?",
  "about.s3.body":
    "Because we don't sell drinks in the usual way, we cannot issue a receipt for the drinks served. If you enjoyed your time with us and would like to support our work, we invite you to leave a voluntary contribution. Every gift, no matter the size, helps keep this space open for everyone looking for good coffee, a kind conversation or simply a place to rest. We are grateful for every contribution — it allows this special mission to continue.",
  "about.s4.title": "Together we help others too",
  "about.s4.body":
    "Part of the contributions we receive also goes to help people in need. We dedicate 10% of all donations to the Ebenezer orphanage in Ethiopia. We have been personally connected to the founders of the orphanage since 2007, regularly visit it, and closely follow its work with the children. In this way, every visit to our café indirectly supports those who need help the most.",
  "about.s5.title": "Why the name \"ŽIVA VERA\"?",
  "about.s5.body":
    "The name ŽIVA VERA (\"Living Faith\") expresses something we want to live every day. We believe in Jesus Christ, who was crucified, died and rose from the dead. We don't see Him only as a historical figure, but as a living Saviour who still changes lives today. But ŽIVA VERA isn't just a name or a religious phrase. It's an invitation to genuine relationships, honesty, service and care for others — values that everyone serving in this café strives to live by.",
  "about.s6.title": "More than just a café",
  "about.s6.body":
    "ŽIVA VERA is not only a place for coffee. It's a place to meet. A place to talk. A place to take your time. A place where you are welcome exactly as you are. We would be glad to see you and to serve you with a smile, a good coffee and sincere hospitality.",

  "visit.title": "Visit & Contribute",
  "visit.intro":
    "We'd love to meet you. Stop in for a coffee, stay for a conversation, and contribute what feels right — there's no price list.",
  "visit.hours.title": "Opening hours",
  "visit.hours.weekdays": "Tuesday and Friday",
  "visit.hours.weekdaysTime": "(currently open only 2 days a week) 8.30-13.30",
  "visit.hours.saturday": "Monday, Wednesday, Thursday, Saturday",
  "visit.hours.saturdayTime": "Closed",
  "visit.hours.sunday": "Sunday",
  "visit.hours.sundayTime": "(open during worship) 9:00 - 13:00",
  "visit.location.title": "Find us",
  "visit.location.address": "Bežigrajska cesta 7, Celje",
  "visit.location.body":
    "at the Calvary Chapel Celje, located in the Tripex building, between the Chinese shop and the Hotel Grande - opposite the City Center Celje.",
  "visit.contact.title": "Get in touch",
  "visit.contribute.title": "How to contribute",
  "visit.contribute.body":
    "Since we don't sell drinks in the usual way, we can't issue receipts. If you'd like to support our mission, you can leave a voluntary contribution in person at the café, or contact us about other ways to give. 10% of all contributions go to the Ebenezer orphanage in Ethiopia.",
  "visit.contribute.note":
    "This is informational only — no online payments at this time.",

  "admin.title": "Content Management",
  "admin.intro":
    "Lightweight content overview for staff. Editing flows can be wired up in a later version.",
  "admin.menu.title": "Menu items",
  "admin.events.title": "Events",
  "admin.status.available": "Available",
  "admin.status.unavailable": "Unavailable",
  "admin.status.published": "Published",
  "admin.status.draft": "Draft",
  "admin.featured": "Featured",

  // Admin Navigation
  "admin.nav.dashboard": "Dashboard",
  "admin.nav.cafeStatus": "Café status",
  "admin.nav.customers": "Customers",
  "admin.nav.homepage": "Homepage",
  "admin.nav.pages": "Pages",
  "admin.nav.prayerRequests": "Prayer requests",
  "admin.nav.menuCategories": "Menu categories",
  "admin.nav.menuItems": "Menu items",
  "admin.nav.eventCategories": "Event categories",
  "admin.nav.events": "Events",
  "admin.nav.viewSite": "View site",
  "admin.nav.signOut": "Sign out",

  // Admin Dashboard
  "admin.dash.title": "Dashboard",
  "admin.dash.subtitle": "Manage café visitors, menu, events, and website content.",
  "admin.dash.totalVisits": "Total Visits",
  "admin.dash.totalVisitsHint": "all time visitors logged",
  "admin.dash.savedCustomers": "Saved Customers",
  "admin.dash.savedCustomersHint": "guest directory profiles",
  "admin.dash.menuItems": "Menu items",
  "admin.dash.events": "Events",
  "admin.dash.publishedTotal": "published / total",
  "admin.dash.logVisit": "Log Visit",

  // Admin Customers & Visits
  "admin.cust.title": "Customers & Visits",
  "admin.cust.subtitle": "Track visitors, orders, conversation notes, and voluntary contributions — independent of café open/closed status.",
  "admin.cust.logVisit": "Log Visit",
  "admin.cust.totalVisits": "Total Visits",
  "admin.cust.today": "today",
  "admin.cust.savedCustomers": "Saved Customers",
  "admin.cust.directoryProfiles": "profiles in directory",
  "admin.cust.donationsLogged": "Donations Logged",
  "admin.cust.donationsCount": "visits with contribution",
  "admin.cust.paymentSplit": "Payment Split",
  "admin.cust.cashVsCard": "Cash vs Card recorded",
  "admin.cust.tabVisits": "Visits Feed",
  "admin.cust.tabDirectory": "Customers Directory",
  "admin.cust.searchPlaceholder": "Search by visitor, drink, or notes…",
  "admin.cust.filterAll": "All Time",
  "admin.cust.filterToday": "Today",
  "admin.cust.filterWeek": "This Week",
  "admin.cust.filterMonth": "This Month",
  "admin.cust.cash": "Cash",
  "admin.cust.card": "Card",
  "admin.cust.noVisits": "No visits found for the selected filters.",
  "admin.cust.noDonation": "No donation",
  "admin.cust.searchCustPlaceholder": "Search customers by name, email, phone…",
  "admin.cust.sortBy": "Sort:",
  "admin.cust.sortRecent": "Recent",
  "admin.cust.sortVisits": "Most Visits",
  "admin.cust.sortName": "Name",
  "admin.cust.viewProfile": "View Profile",
  "admin.cust.noCustomers": "No customers found. Click \"+ Log Visit\" and choose \"+ New Customer\" to add one!",

  // Admin Cafe Status
  "admin.cafe.title": "Café status",
  "admin.cafe.subtitle": "Mark the café open or closed and track each session's drinks, people and notes.",
  "admin.cafe.currentStatus": "Current status",
  "admin.cafe.open": "OPEN",
  "admin.cafe.closed": "CLOSED",
  "admin.cafe.updated": "Updated",
  "admin.cafe.markOpen": "Mark OPEN",
  "admin.cafe.markClosed": "Mark CLOSED",
  "admin.cafe.trackerTitle": "Visitors & Order Tracker",
  "admin.cafe.trackerSubtitle": "Record individual people, what drinks they enjoyed, conversation notes, and voluntary cash/card contributions. Works anytime, independent of café status.",
  "admin.cafe.allCustomersHistory": "All Customers & History",
  "admin.cafe.todaysVisits": "Today's Logged Visits",
  "admin.cafe.contributionsRecorded": "recorded in contributions",
  "admin.cafe.currentSession": "Current session",
  "admin.cafe.hotDrinks": "Hot drinks served",
  "admin.cafe.coldDrinks": "Cold drinks served",
  "admin.cafe.peopleServed": "People served",
  "admin.cafe.internalNote": "Internal note",
  "admin.cafe.saveSession": "Save session",
  "admin.cafe.publicNoteTitle": "Optional public note",
  "admin.cafe.saveNote": "Save note",
  "admin.cafe.sessionHistory": "Session history",
  "admin.cafe.mode.auto": "Auto (Schedule)",
  "admin.cafe.mode.forceOpen": "Force OPEN",
  "admin.cafe.mode.forceClosed": "Force CLOSED",
  "admin.cafe.mode.autoDesc": "Follows the weekly schedule below automatically.",
  "admin.cafe.mode.forceOpenDesc": "Overriding schedule — marked open now.",
  "admin.cafe.mode.forceClosedDesc": "Overriding schedule — marked closed now.",
  "admin.cafe.revertAuto": "Resume Auto Schedule",
  "admin.cafe.forceCloseToday": "Close rest of today",
  "admin.cafe.scheduleTitle": "Weekly Operating Hours",
  "admin.cafe.scheduleSubtitle": "Customize open & close times for each day. The automated system opens and closes the café accordingly.",
  "admin.cafe.saveSchedule": "Save Schedule",
  "admin.cafe.openTime": "Open",
  "admin.cafe.closeTime": "Close",
  "admin.cafe.dayClosed": "Closed all day",

  "footer.rights": "All rights reserved.",
  "footer.disclaimer": "Respect enables hospitality.\n\nSince ŽIVA VERA operates based on voluntary work and voluntary contributions, we reserve the right to refuse or limit service to persons who harm our mission and community through disrespectful behavior, offensive communication, or repeated exploitation of the voluntary contribution system.\n\nOur desire is to serve everyone, but we are not obliged to provide service in cases where it would be contrary to the values of respect, hospitality and responsible management of our non-profit activities.\n\nThank you for together creating a space where everyone can feel welcome. ☕️",
  "footer.disclaimerShort": "ŽIVA VERA café is based on volunteer work, hospitality and mutual respect. For the benefit of all visitors, we reserve the right to limit or refuse service in cases of behavior that is not in line with our values.\n\nThank you for together creating a space where everyone can feel welcome and accepted. ☕️",
  "footer.hospitalityLink": "Read the hospitality policy",
  "hospitality.title": "Our Commitment to Community",
  "hospitality.intro": "ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje. Our work is built on volunteer effort, the voluntary contributions of our guests, and the desire to create a warm, safe and respectful space for everyone.",
  "hospitality.welcome": "We want to welcome every guest with openness, kindness and hospitality. We believe that even a simple cup of coffee and a sincere conversation can strengthen our community and create a place where people feel accepted and respected.",
  "hospitality.nature": "Because our work is not a typical commercial hospitality business, but a non-profit mission supported by the community, serving drinks and other offerings is not an individual right to service — it is an expression of our hospitality and service to the community.",
  "hospitality.discretion": "Out of responsibility to our volunteers, guests, donors and to the mission itself, we reserve the right, at our own discretion, to refuse, limit or stop service to any individual whose behavior is, in our judgment, not in line with the purpose, values and healthy operation of our café.",
  "hospitality.bulletsIntro": "Such situations may include, among others:",
  "hospitality.bullets.b1": "disrespectful, offensive or aggressive communication;",
  "hospitality.bullets.b2": "harassment of volunteers, guests or other people;",
  "hospitality.bullets.b3": "disruptive behavior that negatively affects the atmosphere of the space;",
  "hospitality.bullets.b4": "deliberate exploitation of the voluntary contribution system;",
  "hospitality.bullets.b5": "repeated behavior that shows disregard for the voluntary nature of our work;",
  "hospitality.bullets.b6": "any other actions that, in the reasonable judgment of the team or volunteers, harm the community, reputation or mission of the café.",
  "hospitality.afterBullets": "We especially want to emphasize that the voluntary contribution system is built on mutual trust, respect and responsibility. It exists to keep this space open and accessible to everyone — not to be deliberately taken advantage of. If we find that someone is knowingly and repeatedly abusing the system, we reserve the right to no longer offer them service.",
  "hospitality.trust": "In every decision we strive to act fairly, respectfully and without discrimination. Our decisions are never connected to nationality, gender, age, social status, religious belief or any other personal circumstance — only to behavior and to how a person treats other guests, volunteers and the mission of the café.",
  "hospitality.fairness": "Our goal is not to exclude people, but to protect a space in which guests and volunteers can feel welcome, respected and safe. We believe such an environment can only be preserved through mutual respect and a responsible attitude from everyone who shapes this community.",
  "hospitality.goal": "Thank you for your understanding, your support and your respect for the values on which ŽIVA VERA is built.",
  "hospitality.thanks": "",
  "footer.mission":
    "ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje.",
  "footer.adminLogin": "Admin login",

  "status.open.label": "OPEN",
  "status.open.line1": "We are open — you're welcome to come.",
  "status.open.line2": "Please check the page or the app before visiting.",
  "status.open.line3": "Our working time depends on staff being present.",
  "status.closed.label": "CLOSED",
  "status.closed.line1": "At the moment, nobody is available in the café.",
  "status.closed.line2": "Please check back later.",
  "status.closed.line3": "Our working time depends on staff being present.",
  "status.note.label": "A note from the café",

  "static.notAvailable": "This page is not available.",
};


const sl: TranslationDict = {
  "brand.name": "ŽIVA VERA",
  "brand.tagline": "Kavarna",
  "brand.partner": "Za odlično skodelico kave pri nas poskrbi Barcaffè.",

  "nav.home": "Domov",
  "nav.menu": "Ponudba",
  "nav.events": "Dogodki",
  "nav.about": "O nas",
  "nav.aboutDropdown": "O nas",
  "nav.prayer": "Molitev",
  "nav.visit": "Obisk in prispevek",
  "nav.hospitality": "Politika gostoljubnosti",
  "nav.planVisit": "Načrtujte obisk",
  "nav.whereWeAre": "KJE SMO",
  "nav.admin": "Admin",
  "nav.openMenu": "Odpri meni",
  "nav.closeMenu": "Zapri meni",

  "lang.switch": "Jezik",
  "lang.en": "English",
  "lang.sl": "Slovenščina",

  "home.hero.eyebrow": "Unikatna kavarna, ki deluje po veri",
  "home.hero.title": "Dobra kava, pristen pogovor, iskreno gostoljubje.",
  "home.hero.subtitle":
    "Dobrodošli v Živi veri — prvi krščanski neprofitni kavarni v Sloveniji. Cenika ni. Ostanite, delite trenutek in prispevajte po svoji presoji.",
  "home.hero.ctaMenu": "Oglejte si ponudbo",
  "home.hero.ctaVisit": "Načrtujte obisk",

  "home.values.title": "Kaj nas dela posebne",
  "home.values.welcome.title": "Vsak je dobrodošel",
  "home.values.welcome.body":
    "Ne glede na vašo zgodbo, prepričanja ali ozadje — za vas je vedno prostor za mizo.",
  "home.values.faith.title": "Delujemo po veri",
  "home.values.faith.body":
    "Brez cenika, brez prodaje. Uživajte v pijači in prispevajte po svoji presoji — povsem prostovoljno. Ali po domače - ZASTONJ. ",
  "home.values.purpose.title": "Kava z namenom",
  "home.values.purpose.body":
    "10 % vseh prostovoljnih prispevkov namenjamo sirotišnici Ebenezer v Etiopiji, ki jo osebno podpiramo že od leta 2007. * - Preberi več o našem sodelovanju s sirotišnico (link še pride)",

  "home.menu.title": "Iz naše kavarne",
  "home.menu.body":
    "Espresso napitki, čaji, vroča čokolada, sveži sokovi in nekaj sladkega — pripravljeno s skrbjo, postreženo z nasmehom.",
  "home.menu.cta": "Poglejte celotno ponudbo",

  "home.community.title": "Več kot le kavarna",
  "home.community.body":
    "ŽIVA VERA je prostor za srečanje, pogovor in mirno preživet čas. Prostor, kjer ste dobrodošli točno takšni, kot ste.",
  "home.community.cta": "Preberite našo zgodbo",

  "menu.title": "Naša ponudba",
  "menu.intro":
    "Brez cenika — le prostovoljni prispevki. Kavo s ponosom strežemo iz ponudbe Barcaffè.",
  "menu.category.coffee": "Kava",
  "menu.category.tea": "Čaji",
  "menu.category.cold": "Druge Vroče in Hladne pijače",
  "menu.category.sweet": "Nekaj sladkega",
  "menu.unavailable": "Trenutno ni na voljo",
  "menu.featured": "Priporočamo",
  "menu.empty": "Naša ponudba se pripravlja. Vrnite se kmalu.",
  "menu.loading": "Nalaganje ponudbe…",
  "menu.offer_note.title": "Nekaj malega o naši ponudbi",
  "menu.offer_note.body_1":
    "V Živi veri ne strežemo alkoholnih in energijskih pijač, saj želimo ohranjati mirno in prijetno vzdušje ter ustvarjati okolje, ki odraža vrednote našega poslanstva v katerem se lahko vsak počuti domače.",
  "menu.offer_note.body_2":
    "Ponudba v našem hladilniku je nekoliko drugačna od ponudbe v običajnih kavarnah, zato vas vabimo, da povprašate naše osebje, kaj je trenutno na voljo — z veseljem vam bomo pomagali. Morda odkrijete kaj novega.",

  "events.title": "Dogodki v Živi veri",
  "events.intro":
    "Srečanja, pogovori in male slovesnosti. Vstopite — vedno ste dobrodošli.",
  "events.empty": "Trenutno ni napovedanih dogodkov. Vrnite se kmalu.",
  "events.when": "Kdaj",
  "events.where": "Kje",

  "about.title": "Unikatna kavarna, ki deluje po veri",
  "about.s1.title": "Dobrodošli v Živi veri",
  "about.s1.body":
    "Dobrodošli v kavarni ŽIVA VERA – prostoru, kjer se dobra kava, prijetna družba in pristni odnosi srečajo z vrednotami vere, upanja in služenja. Smo prva in trenutno edina krščanska neprofitna kavarna v Sloveniji, ki deluje kot poslanstvo v prostorih Krščanske cerkve Kalvarija. Naš cilj ni ustvarjanje dobička, temveč ustvarjanje prijetnega okolja, kjer se vsak lahko počuti dobrodošlega, ne glede na svojo življenjsko zgodbo, prepričanja ali ozadje. Verjamemo, da se najlepši pogovori pogosto začnejo ob skodelici dobre kave.",
  "about.s2.title": "Kaj pomeni, da delujemo »po veri«?",
  "about.s2.body":
    "ŽIVA VERA je neprofitna dejavnost. Namesto klasičnega poslovnega modela smo ustvarili prostor, kjer lahko vsak uživa v kavi ali drugi brezalkoholni pijači ter za postrežbo prispeva prostovoljni prispevek po svoji presoji. To pomeni, da cenika in prodaje v običajnem pomenu besede nimamo. Naše delovanje temelji na prostovoljnih prispevkih obiskovalcev, s katerimi pokrivamo stroške nabave, priprave napitkov, vzdrževanja prostora in druge operativne stroške. Takšen način delovanja odraža naše zaupanje v Boga in hkrati daje vsakemu obiskovalcu svobodo, da prispeva toliko, kot sam želi in zmore.",
  "about.s3.title": "Kako lahko prispevate?",
  "about.s3.body":
    "Ker pijač ne prodajamo na običajen način, vam za postrežene napitke ne moremo izdati računa. Če vam je bilo pri nas prijetno in želite podpreti naše delovanje, vas vabimo k prostovoljnemu prispevku. Vsak dar, ne glede na velikost, pomaga ohranjati prostor odprt za vse, ki iščejo dobro kavo, prijeten pogovor ali preprosto kraj za oddih. Hvaležni smo za vsak prispevek, saj nam omogoča nadaljnje delovanje tega posebnega poslanstva.",
  "about.s4.title": "Skupaj pomagamo tudi drugim",
  "about.s4.body":
    "Del prejetih prispevkov namenjamo tudi pomoči ljudem v stiski. 10 % vseh prejetih donacij namenjamo sirotišnici Ebenezer v Etiopiji. Z ustanovitelji sirotišnice smo osebno povezani že od leta 2007, sirotišnico redno obiskujemo in od blizu spremljamo njeno delo med otroki. Tako vsak obisk naše kavarne posredno prispeva tudi k podpori tistim, ki pomoč najbolj potrebujejo.",
  "about.s5.title": "Zakaj ime »ŽIVA VERA«?",
  "about.s5.body":
    "Ime ŽIVA VERA izraža nekaj, kar želimo živeti vsak dan. Verujemo v Jezusa Kristusa, ki je bil križan, umrl in vstal od mrtvih. Zanj ne verjamemo le kot v zgodovinsko osebnost, ampak kot v živega Odrešenika, ki tudi danes spreminja življenja. Vendar ŽIVA VERA ni le ime ali verski izraz. Je povabilo k pristnim odnosom, iskrenosti, služenju in skrbi za druge. To so vrednote, ki jih želimo živeti vsi, ki strežemo v tej kavarni.",
  "about.s6.title": "Več kot le kavarna",
  "about.s6.body":
    "ŽIVA VERA ni le prostor za kavo. Je prostor srečevanja. Prostor pogovora. Prostor, kjer si lahko vzamete čas. Prostor, kjer ste dobrodošli točno takšni, kot ste. Veseli bomo vašega obiska in priložnosti, da vas postrežemo z nasmehom, dobro kavo in pristnim gostoljubjem.",

  "visit.title": "Obisk in prispevek",
  "visit.intro":
    "Veseli bomo vašega obiska. Pridite na kavo, ostanite na pogovoru in prispevajte po svoji presoji — cenika ni.",
  "visit.hours.title": "Odpiralni čas",
  "visit.hours.weekdays": "Torek in Petek",
  "visit.hours.weekdaysTime": "(trenutno smo odprti samo 2 dni v tednu) 8.30-13.30",
  "visit.hours.saturday": "Ponedeljek, Sreda, Četrtek, Sobota",
  "visit.hours.saturdayTime": "Zaprto",
  "visit.hours.sunday": "Nedelja",
  "visit.hours.sundayTime": "(odprti v času bogoslužja) 9:00 - 13.00",
  "visit.location.title": "Najdete nas",
  "visit.location.address": "Bežigrajska cesta 7, Celje",
  "visit.location.body":
    "v prostorih Krščanske cerkve Kalvarija, ki se nahaja v stavbi Tripex, med kitajsko trgovino in hotelom Grande - nasproti City Centra Celje.",
  "visit.contact.title": "Stopite v stik",
  "visit.contribute.title": "Kako prispevati",
  "visit.contribute.body":
    "Ker pijač ne prodajamo na običajen način, ne moremo izdati računov. Če želite podpreti naše poslanstvo, lahko prostovoljni prispevek pustite osebno v kavarni ali se obrnete na nas za druge možnosti. 10 % vseh prispevkov gre sirotišnici Ebenezer v Etiopiji.",
  "visit.contribute.note":
    "To je le informativno — spletnih plačil zaenkrat ne sprejemamo.",

  "admin.title": "Upravljanje vsebine",
  "admin.intro":
    "Lahkoten pregled vsebin za osebje. Urejevalnik bo dodan v naslednji različici.",
  "admin.menu.title": "Postavke menija",
  "admin.events.title": "Dogodki",
  "admin.status.available": "Na voljo",
  "admin.status.unavailable": "Ni na voljo",
  "admin.status.published": "Objavljeno",
  "admin.status.draft": "Osnutek",
  "admin.featured": "Priporočeno",

  // Admin Navigation
  "admin.nav.dashboard": "Nadzorna plošča",
  "admin.nav.cafeStatus": "Status kavarne",
  "admin.nav.customers": "Obiskovalci",
  "admin.nav.homepage": "Domača stran",
  "admin.nav.pages": "Strani",
  "admin.nav.prayerRequests": "Molitvene prošnje",
  "admin.nav.menuCategories": "Kategorije menija",
  "admin.nav.menuItems": "Postavke menija",
  "admin.nav.eventCategories": "Kategorije dogodkov",
  "admin.nav.events": "Dogodki",
  "admin.nav.viewSite": "Ogled strani",
  "admin.nav.signOut": "Odjava",

  // Admin Dashboard
  "admin.dash.title": "Nadzorna plošča",
  "admin.dash.subtitle": "Upravljanje obiskovalcev kavarne, menija, dogodkov in spletne vsebine.",
  "admin.dash.totalVisits": "Vsi obiski",
  "admin.dash.totalVisitsHint": "zabeleženih obiskov skupaj",
  "admin.dash.savedCustomers": "Shranjeni obiskovalci",
  "admin.dash.savedCustomersHint": "profili v imeniku",
  "admin.dash.menuItems": "Postavke menija",
  "admin.dash.events": "Dogodki",
  "admin.dash.publishedTotal": "objavljeno / skupaj",
  "admin.dash.logVisit": "Zabeleži obisk",

  // Admin Customers & Visits
  "admin.cust.title": "Obiskovalci & Naročila",
  "admin.cust.subtitle": "Beleženje obiskovalcev, naročil, pogovorov in prostovoljnih prispevkov — neodvisno od odprtja kavarne.",
  "admin.cust.logVisit": "Zabeleži obisk",
  "admin.cust.totalVisits": "Vsi obiski",
  "admin.cust.today": "danes",
  "admin.cust.savedCustomers": "Shranjeni obiskovalci",
  "admin.cust.directoryProfiles": "profilov v imeniku",
  "admin.cust.donationsLogged": "Zbrani prispevki",
  "admin.cust.donationsCount": "obiskov s prispevkom",
  "admin.cust.paymentSplit": "Razdelitev plačil",
  "admin.cust.cashVsCard": "Gotovina proti kartici",
  "admin.cust.tabVisits": "Pregled obiskov",
  "admin.cust.tabDirectory": "Imenik obiskovalcev",
  "admin.cust.searchPlaceholder": "Išči po imenu, pijači ali zapiskih…",
  "admin.cust.filterAll": "Ves čas",
  "admin.cust.filterToday": "Danes",
  "admin.cust.filterWeek": "Ta teden",
  "admin.cust.filterMonth": "Ta mesec",
  "admin.cust.cash": "Gotovina",
  "admin.cust.card": "Kartica",
  "admin.cust.noVisits": "Ni najdenih obiskov za izbrane filtre.",
  "admin.cust.noDonation": "Brez prispevka",
  "admin.cust.searchCustPlaceholder": "Išči obiskovalce po imenu, e-pošti, telefonu…",
  "admin.cust.sortBy": "Razvrsti:",
  "admin.cust.sortRecent": "Nedavno",
  "admin.cust.sortVisits": "Največ obiskov",
  "admin.cust.sortName": "Ime",
  "admin.cust.viewProfile": "Ogled profila",
  "admin.cust.noCustomers": "Ni najdenih obiskovalcev. Kliknite \"+ Zabeleži obisk\" in izberite \"+ Nov obiskovalec\"!",

  // Admin Cafe Status
  "admin.cafe.title": "Status kavarne",
  "admin.cafe.subtitle": "Označite kavarno kot odprto ali zaprto ter spremljajte pijače, obiskovalce in opombe.",
  "admin.cafe.currentStatus": "Trenutni status",
  "admin.cafe.open": "ODPRTO",
  "admin.cafe.closed": "ZAPRTO",
  "admin.cafe.updated": "Posodobljeno",
  "admin.cafe.markOpen": "Označi ODPRTO",
  "admin.cafe.markClosed": "Označi ZAPRTO",
  "admin.cafe.trackerTitle": "Spremljanje obiskovalcev in naročil",
  "admin.cafe.trackerSubtitle": "Beleženje posameznih oseb, naročenih pijač, pogovorov ter gotovinskih/kartičnih prispevkov. Deluje kadarkoli, neodvisno od statusa kavarne.",
  "admin.cafe.allCustomersHistory": "Vsi obiskovalci in zgodovina",
  "admin.cafe.todaysVisits": "Današnji zabeleženi obiski",
  "admin.cafe.contributionsRecorded": "zabeleženo v prispevkih",
  "admin.cafe.currentSession": "Trenutna izmena",
  "admin.cafe.hotDrinks": "Postreženi topli napitki",
  "admin.cafe.coldDrinks": "Postreženi hladni napitki",
  "admin.cafe.peopleServed": "Postreženi ljudje",
  "admin.cafe.internalNote": "Interna opomba",
  "admin.cafe.saveSession": "Shrani izmeno",
  "admin.cafe.publicNoteTitle": "Neobvezno javno obvestilo",
  "admin.cafe.saveNote": "Shrani obvestilo",
  "admin.cafe.sessionHistory": "Zgodovina izmen",
  "admin.cafe.mode.auto": "Samodejno (Urnik)",
  "admin.cafe.mode.forceOpen": "Prisili ODPRTO",
  "admin.cafe.mode.forceClosed": "Prisili ZAPRTO",
  "admin.cafe.mode.autoDesc": "Kavarna se samodejno odpira in zapira po spodnjem tedenskem urniku.",
  "admin.cafe.mode.forceOpenDesc": "Ročni vklop — kavarna je trenutno označena kot odprta.",
  "admin.cafe.mode.forceClosedDesc": "Ročni izklop — kavarna je trenutno označena kot zaprta.",
  "admin.cafe.revertAuto": "Nadaljuj z urnikom",
  "admin.cafe.forceCloseToday": "Zapri za preostanek dneva",
  "admin.cafe.scheduleTitle": "Tedenski urnik odpiralnih časov",
  "admin.cafe.scheduleSubtitle": "Prilagodite ure odprtja in zaprtja za vsak dan posebej. Sistem bo samodejno odprl in zaprl kavarno.",
  "admin.cafe.saveSchedule": "Shrani urnik",
  "admin.cafe.openTime": "Odprtje",
  "admin.cafe.closeTime": "Zaprtje",
  "admin.cafe.dayClosed": "Zaprto ves dan",

  "footer.rights": "Vse pravice pridržane.",
  "footer.disclaimer": "Spoštovanje omogoča gostoljubnost.\n\nKer ŽIVA VERA deluje na podlagi prostovoljnega dela in prostovoljnih prispevkov, si pridržujemo pravico, da zavrnemo ali omejimo postrežbo osebam, ki z nespoštljivim vedenjem, žaljivo komunikacijo ali ponavljajočim izkoriščanjem sistema prostovoljnih prispevkov škodujejo našemu poslanstvu in skupnosti.\n\nNaša želja je postreči vsakomur, vendar nismo dolžni zagotavljati postrežbe v primerih, ko bi to bilo v nasprotju z vrednotami spoštovanja, gostoljubnosti in odgovornega upravljanja našega neprofitnega delovanja.\n\nHvala, ker skupaj ustvarjamo prostor, kjer se vsak lahko počuti dobrodošel. ☕️",
  "footer.disclaimerShort": "Kavarna ŽIVA VERA temelji na prostovoljnem delu, gostoljubnosti in medsebojnem spoštovanju. Za dobrobit vseh obiskovalcev si pridržujemo pravico omejiti ali zavrniti postrežbo v primerih ravnanja, ki niso skladi z našimi vrednotami.\n\nHvala, ker skupaj ustvarjamo prostor, kjer se vsak lahko počuti dobrodošel in sprejet. ☕️",
  "footer.hospitalityLink": "Preberi politiko gostoljubnosti",
  "hospitality.title": "Naša zaveza skupnosti",
  "hospitality.intro": "ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Calvary Chapel Celje. Naše delo temelji na prostovoljstvu, prostovoljnih prispevkih naših obiskovalcev ter želji po ustvarjanju toplega, varnega in spoštljivega prostora za vsakogar.",
  "hospitality.welcome": "Vsakega obiskovalca želimo sprejeti z odprtostjo, prijaznostjo in gostoljubnostjo. Verjamemo, da lahko že preprosta skodelica kave in iskren pogovor prispevata k boljši skupnosti ter ustvarjata prostor, kjer se ljudje počutijo sprejete in spoštovane.",
  "hospitality.nature": "Ker naše delovanje ne temelji na običajnem komercialnem gostinstvu, temveč na neprofitnem poslanstvu in prostovoljni podpori skupnosti, postrežba napitkov in drugih storitev ne predstavlja pravice posameznika do storitve, temveč izraz naše gostoljubnosti in služenja skupnosti.",
  "hospitality.discretion": "Zaradi odgovornosti do naših prostovoljcev, obiskovalcev, donatorjev in samega poslanstva si pridržujemo pravico, da po lastni presoji zavrnemo, omejimo ali prekinemo postrežbo posamezniku, kadar ocenimo, da njegovo ravnanje ni skladno z namenom, vrednotami ali dobrim delovanjem naše kavarne.",
  "hospitality.bulletsIntro": "Takšni primeri lahko med drugim vključujejo:",
  "hospitality.bullets.b1": "nespoštljivo, žaljivo ali agresivno komunikacijo;",
  "hospitality.bullets.b2": "nadlegovanje prostovoljcev, obiskovalcev ali drugih oseb;",
  "hospitality.bullets.b3": "moteče vedenje, ki negativno vpliva na vzdušje v prostoru;",
  "hospitality.bullets.b4": "namerno izkoriščanje sistema prostovoljnih prispevkov;",
  "hospitality.bullets.b5": "ponavljajoče ravnanje, ki kaže na nespoštovanje do prostovoljnega značaja našega delovanja;",
  "hospitality.bullets.b6": "druga dejanja, ki po razumni presoji vodstva ali prostovoljcev škodujejo skupnosti, ugledu ali poslanstvu kavarne.",
  "hospitality.afterBullets": "Posebej želimo poudariti, da je sistem prostovoljnih prispevkov zasnovan na medsebojnem zaupanju, spoštovanju in odgovornosti. Namenjen je temu, da omogoča dostopen in odprt prostor za vse, ne pa temu, da bi ga posamezniki namerno izkoriščali v svojo korist. Če ugotovimo, da nekdo sistem zavestno in ponavljajoče zlorablja, si pridržujemo pravico, da mu nadaljnje postrežbe ne omogočimo.",
  "hospitality.trust": "Pri vseh odločitvah si prizadevamo ravnati pošteno, spoštljivo in brez diskriminacije. Naše odločitve niso povezane z narodnostjo, spolom, starostjo, socialnim položajem, verskim prepričanjem ali drugimi osebnimi okoliščinami posameznika, temveč izključno z njegovim vedenjem in odnosom do drugih ljudi, prostovoljcev ter samega poslanstva kavarne.",
  "hospitality.fairness": "Naš cilj ni izključevanje ljudi, temveč varovanje prostora, v katerem se lahko obiskovalci in prostovoljci počutijo dobrodošle, spoštovane in varne. Verjamemo, da je takšno okolje mogoče ohranjati le ob medsebojnem spoštovanju in odgovornem odnosu vseh, ki soustvarjamo to skupnost.",
  "hospitality.goal": "Zahvaljujemo se vam za razumevanje, podporo in spoštovanje vrednot, na katerih temelji delovanje kavarne ŽIVA VERA.",
  "footer.mission":
    "ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Krščanske cerkve Kalvarija.",
  "footer.adminLogin": "Prijava administratorja",

  "status.open.label": "ODPRTO",
  "status.open.line1": "Trenutno smo odprti — vabljeni na obisk.",
  "status.open.line2": "Pred prihodom prosimo preverite stran ali aplikacijo.",
  "status.open.line3": "Naš delovni čas je odvisen od prisotnosti osebja.",
  "status.closed.label": "ZAPRTO",
  "status.closed.line1": "Trenutno ni v kavarni nikogar.",
  "status.closed.line2": "Vabljeni, da preverite kasneje.",
  "status.closed.line3": "Naš delovni čas je odvisen od prisotnosti osebja.",
  "status.note.label": "Sporočilo iz kavarne",

  "static.notAvailable": "Ta stran ni na voljo.",
};


export const translations: Record<Locale, TranslationDict> = { en, sl };
