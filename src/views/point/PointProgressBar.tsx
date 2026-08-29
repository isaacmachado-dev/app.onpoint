import { Loader2 } from "lucide-react";
import { ShiftHour } from "../configuration/Modal.Hour";

interface PointProgressBarProps {
  hasScheduleToday: boolean;
  shifts: ShiftHour[];
  completedPunches: number;
  isAllCompleted: boolean;
  totalDayPercentage: number;
  onNavigateToConfiguration?: () => void;
}

export function PointProgressBar({
  hasScheduleToday,
  shifts,
  completedPunches,
  isAllCompleted,
  totalDayPercentage,
  onNavigateToConfiguration,
}: PointProgressBarProps) {
  if (!hasScheduleToday) {
    return (
      
      <>
      <div className="w-52 mt-2 flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onNavigateToConfiguration}
          className="mt-2 text-xs font-semibold text-brand-main bg-white hover:bg-brand-secondary/50 py-2.5 px-4 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          Configurar horário
        </button>
      </div>
      </>
     
    );
  }

  return (
    <div className="w-52 mt-2 flex flex-col items-center gap-1.5">
      {/* Barra contínua de progresso */}
      <div className="relative w-full h-2.5 bg-brand-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-main transition-all duration-700 ease-out rounded-full"
          style={{ width: `${totalDayPercentage}%` }}
        />
      </div>

      {/* Marcadores dos horários (Dots) */}
      <div className="w-full flex justify-between px-1 items-center">
        {shifts.map((shift, idx) => {
          const isDone = idx < completedPunches;
          const isCurrent = idx === completedPunches && !isAllCompleted;

          return (
            <div
              key={shift.id || idx}
              className="flex flex-col items-center gap-0.5 group cursor-default"
              title={`${shift.label}: ${shift.time}`}
            >
              <div className="h-3.5 w-3.5 flex items-center justify-center">
                {isDone ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-main ring-2 ring-white scale-110 shadow-xs" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-brand-main animate-spin" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-brand-main/40" />
                )}
              </div>
              <span
                className={`text-[9px] font-semibold ${
                  isCurrent ? "text-brand-main font-bold" : "text-gray-500"
                }`}
              >
                {shift.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

