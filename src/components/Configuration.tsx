import { Settings } from "lucide-react";

export default function ConfigurationComponent() {
    return (

        <>
            <div className="flex flex-col items-center justify-center text-center">
                <Settings className="w-10 h-10 text-brand-main mb-2" />
                <h2 className="text-2xl font-bold text-brand-main">Configurações</h2>
                <p className="text-xs text-gray-600 mt-1">Ajustes e horários em breve...</p>
            </div>
        </>
    )
}