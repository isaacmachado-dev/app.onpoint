import { FingerprintIcon } from "@/components/ui/fingerprint";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";
import { PointProgressBar } from "./PointProgressBar";
import { PointWidget } from "./PointWidget";
import { usePointProgress } from "./usePointProgress";

interface PagePointProps {
  onNavigateToConfiguration?: () => void;
}
export default function PagePoint({ onNavigateToConfiguration }: PagePointProps) {
  const [isPressingFingerprint, setIsPressingFingerprint] = useState(false);

  const {
    realTime,
    shifts,
    hasScheduleToday,
    completedPunches,
    gaugeValue,
    isReadyToPunch,
    isAllCompleted,
    currentShift,
    totalDayPercentage,
    handlePunch,
    handleSnooze,
  } = usePointProgress();

  const handleDrag = async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    try {
      await getCurrentWindow().startDragging();
    } catch (error) {
      console.error("Failed to start dragging:", error);
    }
  };

  if (isReadyToPunch) {
    return (
      <div 
        className="fixed inset-0 z-50 w-full h-full bg-brand-main text-white flex flex-col justify-between p-5 select-none"
      >
        {/* Header com suporte a arraste - startDragging para Windows */}
        <div
          data-tauri-drag-region
          onMouseDown={handleDrag}
          className="flex w-full items-center justify-between cursor-move"
        >
          <div
            data-tauri-drag-region
            onMouseDown={handleDrag}
            className="flex items-center gap-2 pointer-events-none cursor-move"
          >
            <img src="/onpoint.svg" alt="onPoint" className="w-8 h-8" />
            <span className="text-base font-bold text-white tracking-wide">onPoint</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-brand-secondary font-black bg-white/10 px-3 py-1 rounded-full pointer-events-none">
            {realTime}
          </span>
        </div>

        {/* Centro de Ação - 100% da tela */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3.5 my-auto animate-fade animate-duration-200">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-2xl font-black text-white text-center">
              {currentShift?.label}
            </h2>
            <span className="text-xs font-bold text-white/90  px-3 py-0.5 rounded-full">
              Pré-definido: {currentShift?.time}
            </span>
          </div>

          <div
            onMouseDown={() => setIsPressingFingerprint(true)}
            onMouseUp={() => setIsPressingFingerprint(false)}
            onMouseLeave={() => setIsPressingFingerprint(false)}
            onTouchStart={() => setIsPressingFingerprint(true)}
            onTouchEnd={() => setIsPressingFingerprint(false)}
            onClick={handlePunch} 
            className="flex flex-col items-center gap-1 group cursor-pointer my-1 select-none transition-transform duration-150 animate-fade animate-duration-200"
          >
            <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-brand-secondary flex items-center justify-center shadow-2xl group-hover:scale-105 group-active:scale-90 group-active:bg-brand-secondary/20 transition-all duration-150">
              <FingerprintIcon
                size={76}
                isPressed={isPressingFingerprint}
                className="text-brand-secondary stroke-[2.2] group-active:brightness-125 transition-all" 
              />
            </div>

            <div className="flex flex-col items-center mt-4">
              <button
                type="button"
                className="bg-brand-secondary text-brand-main font-black text-xs py-2.5 px-8 rounded-full shadow-lg group-active:brightness-90 transition-all duration-150 cursor-pointer uppercase tracking-widest pointer-events-none group-hover:bg-brand-secondary/50"
              >
                Bater ponto agora
              </button>
            </div>
          </div>

          {/* Botão Lembrar daqui 5 minutos */}
          <button
            type="button"
            onClick={() => handleSnooze(5)}
            className="text-xs font-semibold text-white bg-white/10 hover:bg-white/50  py-2 px-4 rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5 tracking-widest"
          >
            <span>Lembrar daqui 5 minutos</span>
          </button>
        </div>

        {/* Rodapé informativo */}
        {/* <div className="w-full text-center pointer-events-none">
          <span className="text-[10px] text-white/50">
            Abre o sistema de ponto externo configurado.
          </span>
        </div> */}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none animate-fade animate-duration-200">
      {/* Relógio 24h em tempo real */}
      <h1 className="text-3xl font-bold tracking-wider text-black">{realTime}</h1>

      {/* Widget Central (Água / Dia Concluído / Sem Expediente) */}
      <PointWidget
        hasScheduleToday={hasScheduleToday}
        isReadyToPunch={isReadyToPunch}
        isAllCompleted={isAllCompleted}
        currentShift={currentShift}
        gaugeValue={gaugeValue}
        onPunch={handlePunch}
      />

      {/* Barra de Progresso e Marcadores (Dots) */}
      <PointProgressBar
        hasScheduleToday={hasScheduleToday}
        shifts={shifts}
        completedPunches={completedPunches}
        isAllCompleted={isAllCompleted}
        totalDayPercentage={totalDayPercentage}
        onNavigateToConfiguration={onNavigateToConfiguration}
      />
      
    </div>
  );
}
