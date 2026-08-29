import { CheckCheck, Coffee, Fingerprint } from "lucide-react";
import LiquidFillGauge from "react-ts-liquid-gauge";
import { ShiftHour } from "../configuration/Modal.Hour";

interface PointWidgetProps {
  hasScheduleToday: boolean;
  isReadyToPunch: boolean;
  isAllCompleted: boolean;
  currentShift: ShiftHour | null;
  gaugeValue: number;
  totalShiftsCount: number;
  onPunch: () => void;
}

export function PointWidget({
  hasScheduleToday,
  isReadyToPunch,
  isAllCompleted,
  currentShift,
  gaugeValue,
  totalShiftsCount,
  onPunch,
}: PointWidgetProps) {
  return (
    <div className="rounded-full flex flex-col items-center justify-center mx-auto my-3 min-h-[140px]">
      {!hasScheduleToday ? (
        <div className="w-[130px] h-[130px] rounded-full bg-brand-secondary/30 border-2 border-dashed border-brand-main/40 flex flex-col items-center justify-center gap-1.5 text-brand-main shadow-xs">
          <Coffee className="w-8 h-8 text-brand-main" />
          <span className="text-xs font-bold text-center leading-tight">
            Sem expediente
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            Dia de folga
          </span>
        </div>
      ) : isReadyToPunch ? (
        <button
          type="button"
          onClick={onPunch}
          className="w-[130px] h-[130px] rounded-full bg-brand-main text-white flex flex-col items-center justify-center gap-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse border-4 border-brand-secondary"
          title={`Bater ponto: ${currentShift?.label || "Horário"}`}
        >
          <Fingerprint className="w-8 h-8 text-brand-secondary" />
          <span className="text-xs font-bold text-center leading-tight">
            Bater ponto
          </span>
          <span className="text-[10px] text-white/80 font-medium">
            {currentShift?.time}
          </span>
        </button>
      ) : isAllCompleted ? (
        <div className="w-[130px] h-[130px] rounded-full bg-brand-main/10 border-4 border-brand-main flex flex-col items-center justify-center gap-1 text-brand-main shadow-xs">
          <CheckCheck className="w-8 h-8 text-brand-main" />
          <span className="text-xs font-bold text-center leading-tight">
            Dia Concluído!
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            {totalShiftsCount}/{totalShiftsCount} batidas
          </span>
        </div>
      ) : (
        <div className="relative">
          <LiquidFillGauge
            width={130}
            height={130}
            value={gaugeValue}
            unit="%"
            shapeType="circle"
            riseAnimation={false}
            waveAnimation={true}
            waveFrequency={2}
            waveAmplitude={3}
            gradient={true}
            shapeStyle={{
              fill: "#25586A",
            }}
            waveStyle={{
              fill: "#25586A",
            }}
            textStyle={{
              fill: "#25586A",
              fontFamily: "Arial",
              fontWeight: "bold",
            }}
            waveTextStyle={{
              fill: "#FFFFFF",
              fontFamily: "Arial",
              fontWeight: "bold",
            }}
            textRenderer={() => null}
          />
        </div>
      )}
    </div>
  );
}

