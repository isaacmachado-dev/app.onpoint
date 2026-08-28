import { useState } from "react";
import { ToggleCard } from "./ToggleCard";

export default function ConfigurationComponent() {
    const [ativo, setAtivo] = useState(false);
    
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
                
                <div className="bg-white rounded-full p-4 font-semibold text-sm w-full justify-between flex flex-row">
                    <h3>Fechar completamente</h3>
                </div>

            </div>
        </>
    )
}