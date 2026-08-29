import { getCurrentWindow } from "@tauri-apps/api/window";
import { Calendar, ScanFace, Settings, X } from "lucide-react";
import { useState } from "react";
import "./App.css";
import PageCalendar from "./views/calendar/Page.Calendar";
import PageConfiguration from "./views/configuration/Page.Configuration";
import PagePoint from "./views/point/Page.Point";

type View = "ponto" | "calendario" | "configuracoes";

function App() {
  const [currentView, setCurrentView] = useState<View>("ponto");

  const fecharJanela = async () => {
    try {
      const appWindow = getCurrentWindow();
      // hide() esconde a janela mas mantém o relógio rodando no sistema
      await appWindow.hide(); 
    } catch (error) {
      console.error("Failed to hide window:", error);
    }
  };

  return (
    <main className="w-full h-screen text-black bg-brand-background flex flex-col justify-between select-none">
      {/* Header com suporte a arraste de janela no Tauri */}
      <div data-tauri-drag-region className="flex w-full flex-row items-start justify-between">
        <div data-tauri-drag-region className="flex flex-row items-center gap-2 p-2">
          <img
            src="/onpoint.svg"
            alt="onPoint Logo"
            className="w-10 h-10 pointer-events-none"
          />
          <h1 className="text-lg font-bold pointer-events-none">onPoint</h1>
        </div>

        {/* Botão fechar/esconder */}
        <button 
          type="button" 
          className="ml-auto p-2 mt-1 mr-1 cursor-pointer hover:opacity-70 transition-opacity" 
          aria-label="Fechar"
          onClick={fecharJanela}
        >
          <X className="text-brand-main w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo Central alternável de acordo com a aba ativa */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {currentView === "ponto" && (
          <PagePoint />
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
          <ScanFace
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

    </main>
  );
}

export default App;