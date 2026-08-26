import { getCurrentWindow } from "@tauri-apps/api/window";
import { Calendar, ScanFace, Settings, X } from "lucide-react";
import { useState } from "react";
import "./App.css";

const appWindow = getCurrentWindow();

type View = "ponto" | "calendario" | "configuracoes";

function App() {
  const [currentView, setCurrentView] = useState<View>("ponto");

  const fecharJanela = async () => {
    // hide() esconde a janela mas mantém o relógio rodando no sistema
    await appWindow.hide(); 
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
          <div className="w-full flex flex-col items-center">
            <h1 className="text-3xl font-bold">14:00</h1>

            <div className="bg-[#ACEBF0] p-10 rounded-full max-w-[10px] mx-auto my-3"></div>

            <div className="flex gap-4 bg-[#ACEBF0] mt-2 w-48 h-2 mx-auto justify-between px-2 items-center rounded-full">
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
            </div>
          </div>
        )}

        {currentView === "calendario" && (
          <div className="flex flex-col items-center justify-center text-center">
            <Calendar className="w-10 h-10 text-brand-main mb-2" />
            <h2 className="text-2xl font-bold text-brand-main">Calendário</h2>
            <p className="text-xs text-gray-600 mt-1">Visão do calendário de batidas</p>
          </div>
        )}

        {currentView === "configuracoes" && (
          <div className="flex flex-col items-center justify-center text-center">
            <Settings className="w-10 h-10 text-brand-main mb-2" />
            <h2 className="text-2xl font-bold text-brand-main">Configurações</h2>
            <p className="text-xs text-gray-600 mt-1">Ajustes e horários</p>
          </div>
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
          <ScanFace className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentView("calendario")}
          className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
            currentView === "calendario"
              ? "bg-brand-main text-white shadow-sm"
              : "text-brand-main hover:bg-brand-main/10"
          }`}
          aria-label="Calendário"
          title="Calendário"
        >
          <Calendar className="w-5 h-5" />
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
          <Settings className="w-5 h-5" />
        </button>
      </nav>

    </main>
  );
}

export default App;