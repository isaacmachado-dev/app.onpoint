import { openUrl } from "@tauri-apps/plugin-opener";
import { LazyStore } from "@tauri-apps/plugin-store";
import { CheckCheck, Fingerprint } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LiquidFillGauge from "react-ts-liquid-gauge";
import { ScheduleItem, ShiftHour } from "../configuration/Modal.Hour";

const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

const DEFAULT_SHIFTS: ShiftHour[] = [
  { id: 1, label: "1° Entrada", time: "08:00" },
  { id: 2, label: "2° Saída", time: "12:00" },
  { id: 3, label: "3° Entrada", time: "13:00" },
  { id: 4, label: "4° Saída", time: "17:00" },
];

const getFormattedTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function PagePoint() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storagePunchKey = `punches_${todayKey}`;
  const storageGaugeKey = `gauge_${todayKey}`;

  const [realTime, setRealTime] = useState(getFormattedTime);
  const [shifts, setShifts] = useState<ShiftHour[]>(DEFAULT_SHIFTS);
  const [completedPunches, setCompletedPunches] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storagePunchKey);
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [gaugeValue, setGaugeValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageGaugeKey);
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [isDraining, setIsDraining] = useState<boolean>(false);
  const drainIntervalRef = useRef<number | null>(null);

  // 1. Carregar configurações de horários e batidas já feitas hoje
  useEffect(() => {
    const loadData = async () => {
      // Carregar batidas feitas hoje
      try {
        const savedPunches = localStorage.getItem(storagePunchKey);
        if (savedPunches !== null) {
          setCompletedPunches(Number(savedPunches));
        }
      } catch (err) {
        console.error("Erro ao ler batidas:", err);
      }

      // Carregar horários configurados
      const dayName = DAY_KEYS[new Date().getDay()];
      let allSchedules: ScheduleItem[] = [];

      try {
        const store = new LazyStore("settings.json");
        const stored = await store.get<ScheduleItem[]>("schedules");
        if (stored && Array.isArray(stored)) {
          allSchedules = stored;
        }
      } catch {
        // Fallback para localStorage
        try {
          const local = localStorage.getItem("schedules");
          if (local) allSchedules = JSON.parse(local);
        } catch (e) {
          console.error(e);
        }
      }

      if (allSchedules.length > 0) {
        const todaySchedule = allSchedules.find((s) => s.days.includes(dayName));
        if (todaySchedule && todaySchedule.shifts.length > 0) {
          setShifts(todaySchedule.shifts);
        }
      }
    };

    loadData();
  }, [storagePunchKey]);

  // 2. Loop de atualização em tempo real (Relógio e Nível da água)
  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      setRealTime(getFormattedTime());

      // Se estiver na animação de esvaziar, não recalcula
      if (isDraining) return;

      const totalShifts = shifts.length;
      if (completedPunches >= totalShifts) {
        setGaugeValue(100);
        return;
      }

      const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const targetShift = shifts[completedPunches];
      const targetMinutes = timeToMinutes(targetShift?.time || "08:00");

      // Início do intervalo atual
      let startMinutes = 0;
      if (completedPunches === 0) {
        // Para a 1ª batida: começa 2h antes da batida ou 00:00
        startMinutes = Math.max(0, targetMinutes - 120);
      } else {
        // Para as batidas seguintes: começa no horário da batida anterior
        const prevShift = shifts[completedPunches - 1];
        startMinutes = timeToMinutes(prevShift?.time || "08:00");
      }

      let nextVal = 0;
      if (nowMinutes >= targetMinutes) {
        // Horário atingido! Água cheia 100%
        nextVal = 100;
      } else if (nowMinutes <= startMinutes) {
        // Ainda não começou o intervalo
        nextVal = 0;
      } else {
        // Progresso proporcional entre start e target
        const diffTotal = targetMinutes - startMinutes;
        const diffElapsed = nowMinutes - startMinutes;
        nextVal = Math.min(99, Math.max(1, Math.round((diffElapsed / diffTotal) * 100)));
      }

      setGaugeValue((prev) => {
        if (prev !== nextVal) {
          try {
            localStorage.setItem(storageGaugeKey, String(nextVal));
          } catch (e) {
            console.error(e);
          }
          return nextVal;
        }
        return prev;
      });
    };

    updateProgress();
    const timer = setInterval(updateProgress, 1000);
    return () => clearInterval(timer);
  }, [shifts, completedPunches, isDraining, storageGaugeKey]);

  // 3. Ação de Bater Ponto e esvaziamento suave da água
  const handlePunch = async () => {
    const punchUrl = "https://letswork.app/relogio"; // Link da batida de ponto

    try {
      await openUrl(punchUrl);
    } catch {
      window.open(punchUrl, "_blank");
    }

    // Inicia animação de esvaziamento com calma
    setIsDraining(true);
    let currentVal = 100;

    if (drainIntervalRef.current) clearInterval(drainIntervalRef.current);

    drainIntervalRef.current = window.setInterval(() => {
      currentVal -= 5;
      if (currentVal <= 0) {
        if (drainIntervalRef.current) clearInterval(drainIntervalRef.current);
        setGaugeValue(0);
        try {
          localStorage.setItem(storageGaugeKey, "0");
        } catch (e) {
          console.error(e);
        }
        setIsDraining(false);

        // Incrementa o número de batidas realizadas hoje e salva
        setCompletedPunches((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem(storagePunchKey, String(next));
          } catch (e) {
            console.error(e);
          }
          return next;
        });
      } else {
        setGaugeValue(currentVal);
      }
    }, 40); // 40ms * 20 passos = 800ms de animação fluida
  };

  const isAllCompleted = completedPunches >= shifts.length;
  const currentShift = !isAllCompleted ? shifts[completedPunches] : null;
  const isReadyToPunch = !isAllCompleted && gaugeValue >= 100 && !isDraining;

  // Cálculo da % da linha de progresso do dia inteiro
  const totalDayPercentage = Math.min(
    100,
    Math.round(((completedPunches * 100 + (isAllCompleted ? 0 : gaugeValue)) / (shifts.length * 100)) * 100)
  );

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Relógio 24h em tempo real */}
      <h1 className="text-3xl font-bold tracking-wider text-black">{realTime}</h1>

      {/* Container Central: Liquid Gauge ou Botão Bater Ponto */}
      <div className="rounded-full flex flex-col items-center justify-center mx-auto my-3 min-h-[140px]">
        {isReadyToPunch ? (
          <button
            type="button"
            onClick={handlePunch}
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
              4/4 batidas
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

      {/* Barra de Progresso com os Dots das 4 batidas */}
      <div className="w-52 mt-2 flex flex-col items-center gap-1.5">
        <div className="relative w-full h-2.5 bg-brand-secondary rounded-full overflow-hidden">
          {/* Preenchimento contínuo da barra */}
          <div
            className="h-full bg-brand-main transition-all duration-700 ease-out rounded-full"
            style={{ width: `${totalDayPercentage}%` }}
          />
        </div>

        {/* Marcadores dos 4 horários (Dots) */}
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
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isDone
                      ? "h-2.5 w-2.5 bg-brand-main ring-2 ring-white scale-110"
                      : isCurrent
                      ? "h-2.5 w-2.5 bg-brand-main animate-ping"
                      : "h-2 w-2 bg-brand-main/40"
                  }`}
                />
                <span className="text-[9px] font-semibold text-gray-500">
                  {shift.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}