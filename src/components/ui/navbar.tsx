import PageCalendar from "@/views/calendar/Page.Calendar";
import PageConfiguration from "@/views/configuration/Page.Configuration";
import PagePoint from "@/views/point/Page.Point";
import { Calendar, FingerprintPattern, Settings } from "lucide-react";
import { useState } from "react";

type View = "ponto" | "calendario" | "configuracoes";

export default function Navbar() {

    const [currentView, setCurrentView] = useState<View>("ponto");

    return(

        <>
            {/* Conteúdo Central alternável de acordo com a aba ativa */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {currentView === "ponto" && (
                <PagePoint onNavigateToConfiguration={() => setCurrentView("configuracoes")} />
                )}
        
                {currentView === "calendario" && (
                <PageCalendar />
                )}

                {currentView === "configuracoes" && (
                <PageConfiguration />
                )}
            </div>
            
            {/* Barra de Navegação estilo Tabs/Links */}
            <nav className="flex flex-row mb-4 bg-brand-secondary mx-auto rounded-full p-1.5 gap-4 items-center shadow-xs">
                <button
                type="button"
                onClick={() => setCurrentView("ponto")}
                className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    currentView === "ponto"
                    ? "bg-brand-main text-white shadow-sm"
                    : "text-brand-main hover:bg-brand-main/10"
                }`}
                aria-label="Ponto"
                title="Ponto"
                >
                <FingerprintPattern
                    strokeWidth={2}
                    className={`w-5 h-5 text-brand-main 
                    ${currentView === "ponto" ? "text-white" : "text-brand-main"}`} 
                />
                </button>

                <button
                type="button"
                onClick={() => setCurrentView("calendario")}
                className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    currentView === "calendario"
                    ? "bg-brand-main shadow-sm"
                    : " hover:bg-brand-main/10"
                }`}
                aria-label="Calendário"
                title="Calendário"
                >
                <Calendar
                    strokeWidth={2}
                    className={`w-5 h-5 text-brand-main 
                    ${currentView === "calendario" ? "text-white" : "text-brand-main"}`} 
                />
                </button>

                <button
                type="button"
                onClick={() => setCurrentView("configuracoes")}
                className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    currentView === "configuracoes"
                    ? "bg-brand-main text-white shadow-sm"
                    : "text-brand-main hover:bg-brand-main/10"
                }`}
                aria-label="Configurações"
                title="Configurações"
                >
                <Settings 
                    strokeWidth={2}
                    className={`w-5 h-5 text-brand-main 
                    ${currentView === "configuracoes" ? "text-white" : "text-brand-main"}`} 
                />
                </button>
            </nav>
        </>

    );
}