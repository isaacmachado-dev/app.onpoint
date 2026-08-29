import { Calendar } from "lucide-react";

export default function PageCalendar() {
    return (
        <>
            <div className="flex flex-col items-center justify-center text-center animate-fade animate-duration-200">
                <Calendar className="w-10 h-10 text-brand-main mb-2" />
                <h2 className="text-2xl font-bold text-brand-main">Calendário</h2>
                <p className="text-xs text-gray-600 mt-1">Visão do calendário de batidas em breve...</p>
            </div>
        </>
    );
}