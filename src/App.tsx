import { getCurrentWindow } from "@tauri-apps/api/window";
import { X } from "lucide-react";
import "./App.css";

const appWindow = getCurrentWindow();

function App() {

  const fecharJanela = async () => {
    // hide() esconde a janela mas mantém o relógio rodando no sistema
    await appWindow.hide(); 
  };

  return (
    // Trocamos 'container' por 'w-full' para ocupar 100% da largura da janela
    <main className="w-full h-screen text-black bg-brand-background">

      <div className="flex w-full flex-row items-start justify-between">
        <div>
          <div className="flex flex-row items-center gap-2 p-2">
            <img
              src="/onpoint.svg"
              alt="onPoint Logo"
            />
            <h1 className="text-lg font-bold">onPoint</h1>
          </div>
        </div>

        {/* O botão agora vai até o limite direito da tela */}
        <button 
          type="button" 
          className="ml-auto p-2 mt-1 mr-1 cursor-pointer" 
          aria-label="Fechar"
          onClick={fecharJanela}
        >
          <X className="text-black" />
        </button>
      </div>

      <div className="flex-1">
          <h1 className="text-3xl font-bold">14:00</h1>
      </div>

      <div className="bg-[#ACEBF0] p-10 rounded-full max-w-[10px] mx-auto">

      </div>

      <div className="flex gap-30 bg-[#ACEBF0] mt-2 w-full h-2 mx-auto">
        <span className="rounded-full h-2 w-2 bg-brand-main"></span>
        <span className="rounded-full h-2 w-2 bg-brand-main"></span>
        <span className="rounded-full h-2 w-2 bg-brand-main"></span>
        <span className="rounded-full h-2 w-2 bg-brand-main"></span>
      </div>

    </main>
  );
}

export default App;