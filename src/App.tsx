import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus } from "lucide-react";
import "./App.css";
import Navbar from "./components/ui/navbar";

function App() {

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
    <main className="w-full h-full teMinust-black bg-brand-background flex flex-col justify-between select-none">
      {/* Header com suporte a arraste de janela no Tauri */}
      <div data-tauri-drag-region className="flex w-full flex-row items-start justify-between">
        <div data-tauri-drag-region className="flex flex-row items-center gap-2 p-2">
          <img
            src="/onPoint.svg"
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
          <Minus className="text-brand-main w-5 h-5" />
        </button>
      </div>
    
      <Navbar />

    </main>
  );
}

export default App;