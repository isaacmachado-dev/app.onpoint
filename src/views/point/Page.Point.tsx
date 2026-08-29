import { PointProgressBar } from "./PointProgressBar";
import { PointWidget } from "./PointWidget";
import { usePointProgress } from "./usePointProgress";

interface PagePointProps {
  onNavigateToConfiguration?: () => void;
}

export default function PagePoint({ onNavigateToConfiguration }: PagePointProps) {
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
  } = usePointProgress();

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Relógio 24h em tempo real */}
      <h1 className="text-3xl font-bold tracking-wider text-black">{realTime}</h1>

      {/* Widget Central (Água / Botão Bater Ponto / Dia Concluído / Sem Expediente) */}
      <PointWidget
        hasScheduleToday={hasScheduleToday}
        isReadyToPunch={isReadyToPunch}
        isAllCompleted={isAllCompleted}
        currentShift={currentShift}
        gaugeValue={gaugeValue}
        totalShiftsCount={shifts.length}
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