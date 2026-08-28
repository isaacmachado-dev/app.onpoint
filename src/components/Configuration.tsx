import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";
import { ToggleCard } from "./ToggleCard";

export default function ConfigurationComponent() {
    const [ativo, setAtivo] = useState(false);

    const fecharJanela = async () => {
        try {
        const appWindow = getCurrentWindow();
        // hide() esconde a janela mas mantém o relógio rodando no sistema
        await appWindow.close(); 
        } catch (error) {
        console.error("Failed to hide window:", error);
        }
    };
    
    return (

        <>
            <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="bg-white rounded-full p-4 w-full">
                    <div className="max-w-md mx-auto">
                    <ToggleCard
                        label="Inicializar ao ligar o sistema"
                        checked={ativo}
                        onChange={setAtivo}
                        activeColorClass="bg-brand-secondary"
                    />
                    </div>
                </div>

                <button className="bg-white rounded-full p-4 font-semibold text-sm w-full justify-between flex flex-row" onClick={() => alert("Função de definir horário ainda não implementada")}>
                    <h3 className="text-black">Definir horário</h3>
                </button>
                
                <button className="bg-white rounded-full p-4 font-semibold text-sm w-full justify-between flex flex-row" onClick={fecharJanela}>
                    <h3 className="text-black">Fechar completamente</h3>
                </button>

            </div>
        </>
    )
}