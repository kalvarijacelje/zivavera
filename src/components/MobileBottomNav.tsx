import { Link, useRouterState } from "@tanstack/react-router";
import { Coffee, Utensils, Calendar, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export function MobileBottomNav() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#A6A15E]/20 shadow-lg px-2 py-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 items-center justify-items-center">
        {/* 1. Domov */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            pathname === "/" ? "text-[#93032E] font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Coffee className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-['Nohemi',sans-serif]">{t("nav.home")}</span>
        </Link>

        {/* 2. Meni */}
        <Link
          to="/menu"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            pathname.startsWith("/menu") ? "text-[#93032E] font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-['Nohemi',sans-serif]">{t("nav.menu")}</span>
        </Link>

        {/* 3. Dogodki */}
        <Link
          to="/events"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            pathname.startsWith("/events") ? "text-[#93032E] font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-['Nohemi',sans-serif]">{t("nav.events")}</span>
        </Link>

        {/* 4. Obisk */}
        <Link
          to="/visit"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            pathname.startsWith("/visit") ? "text-[#93032E] font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-['Nohemi',sans-serif]">Obisk</span>
        </Link>
      </div>
    </nav>
  );
}
