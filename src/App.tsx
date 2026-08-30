import { hidePopupWindow } from "@/lib/windowPopup";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus } from "lucide-react";
import "./App.css";
import Navbar from "./components/ui/navbar";

function App() {
  const fecharJanela = async () => {
    try {
      // Oculta a janela e remove always on top
      await hidePopupWindow();
    } catch (error) {
      console.error("Failed to hide window:", error);
    }
  };

  const handleDrag = async (e: React.MouseEvent) => {
    // Só arrasta com botão esquerdo; ignora clique em botões filhos
    if (e.button !== 0) return;
    // Evita arraste se o alvo é um botão/elemento interativo
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    try {
      await getCurrentWindow().startDragging();
    } catch (error) {
      console.error("Failed to start dragging:", error);
    }
  };

  return (
    <main className="w-full h-full bg-brand-background rounded-3xl overflow-hidden flex flex-col justify-between select-none">
      {/* Header com suporte a arraste de janela no Tauri - Windows precisa de startDragging */}
      <div
        data-tauri-drag-region
        onMouseDown={handleDrag}
        className="flex w-full flex-row items-start justify-between cursor-move"
      >
        <div
          data-tauri-drag-region
          onMouseDown={handleDrag}
          className="flex flex-row items-center gap-2 p-2 flex-1 cursor-move"
        >
          <img
            src="/onpoint.svg"
            alt="onPoint Logo"
            className="w-10 h-10 pointer-events-none"
          />
          <h1 className="text-lg font-bold pointer-events-none">onPoint</h1>
        </div>

        {/* Botão fechar/esconder - não deve iniciar arraste */}
        <button 
          type="button" 
          className="ml-auto p-2 mt-1 mr-1 cursor-pointer hover:opacity-70 transition-opacity" 
          aria-label="Fechar"
          onMouseDown={(e) => e.stopPropagation()}
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
