import PageCalendar from "@/views/calendar/Page.Calendar";
import PageConfiguration from "@/views/configuration/Page.Configuration";
import PagePoint from "@/views/point/Page.Point";
import { usePointProgress } from "@/views/point/usePointProgress";
import { Calendar, FingerprintPattern, type LucideIcon, Settings } from "lucide-react";
import { useEffect, useState } from "react";

type View = "ponto" | "calendario" | "configuracoes";

interface NavTab {
  id: View;
  label: string;
  icon: LucideIcon;
}

const NAV_TABS: NavTab[] = [
  { id: "ponto", label: "Ponto", icon: FingerprintPattern },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

export default function Navbar() {
  const [currentView, setCurrentView] = useState<View>("ponto");
  const pointProgress = usePointProgress();
  const { isReadyToPunch } = pointProgress;

  // Quando o horário chegar e a janela subir em pop-up, garante que a tela cheia de bater ponto apareça
  useEffect(() => {
    if (isReadyToPunch) {
      setCurrentView("ponto");
    }
  }, [isReadyToPunch]);

  const activeIndex = NAV_TABS.findIndex((tab) => tab.id === currentView);

  return (
    <>
      {/* Conteúdo Central alternável de acordo com a aba ativa */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {currentView === "ponto" && (
          <PagePoint
            pointProgress={pointProgress}
            onNavigateToConfiguration={() => setCurrentView("configuracoes")}
          />
        )}

        {currentView === "calendario" && <PageCalendar />}

        {currentView === "configuracoes" && <PageConfiguration />}
      </div>

      {/* Barra de Navegação com a bolinha que desliza/arrasta */}
      <nav className="relative z-10 flex flex-row mb-4 bg-brand-secondary mx-auto rounded-full p-1.5 gap-2 items-center shadow-xs">
        {/* Bolinha ativa que desliza de forma contínua com efeito elástico */}
        <span
          className="absolute top-1.5 left-1.5 w-9 h-9 bg-brand-main rounded-full shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
          style={{
            transform: `translateX(${activeIndex * 44}px)`,
          }}
        />

        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentView(tab.id)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200"
              aria-label={tab.label}
              title={tab.label}
            >
              <Icon
                strokeWidth={2}
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-brand-main hover:opacity-80"
                }`}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}