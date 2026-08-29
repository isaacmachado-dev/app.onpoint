import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";
import { ButtonToggle } from "./Button.Toggle";
import ModalHour from "./Modal.Hour";


export default function PageConfiguration() {
    const [ativo, setAtivo] = useState(false);
    const [modalContainerHour, setModalContainerHour] = useState(false);

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
                    <ButtonToggle
                        label="Inicializar ao ligar o sistema"
                        checked={ativo}
                        onChange={setAtivo}
                        activeColorClass="bg-brand-secondary"
                    />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setModalContainerHour(true)} 
                    className="bg-white rounded-full p-4 font-semibold text-sm w-full justify-between flex flex-row cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <h3 className="text-black">Definir horário</h3>
                </button>
                
                <button 
                    type="button"
                    className="bg-white rounded-full p-4 font-semibold text-sm w-full justify-between flex flex-row cursor-pointer hover:bg-gray-50 transition-colors" 
                    onClick={fecharJanela}
                >
                    <h3 className="text-black">Fechar completamente</h3>
                </button>

            </div>

            {modalContainerHour && (
                <ModalHour setModalContainerHour={setModalContainerHour} />
            )}


        </>
    )
}