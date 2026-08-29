import { openUrl } from "@tauri-apps/plugin-opener";
import { LazyStore } from "@tauri-apps/plugin-store";
import { useEffect, useRef, useState } from "react";
import { ScheduleItem, ShiftHour } from "../configuration/Modal.Hour";

const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

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

function getInitialScheduleForToday(): { hasSchedule: boolean; shifts: ShiftHour[] } {
  try {
    const raw = localStorage.getItem("schedules");
    if (!raw) return { hasSchedule: false, shifts: [] };
    const parsed: ScheduleItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return { hasSchedule: false, shifts: [] };

    const dayName = DAY_KEYS[new Date().getDay()];
    const found = parsed.find((s) => s.days.includes(dayName));
    if (found && found.shifts?.length > 0) {
      return { hasSchedule: true, shifts: found.shifts };
    }
    return { hasSchedule: false, shifts: [] };
  } catch {
    return { hasSchedule: false, shifts: [] };
  }
}

export function usePointProgress() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storagePunchKey = `punches_${todayKey}`;
  const storageGaugeKey = `gauge_${todayKey}`;

  const initialSchedule = getInitialScheduleForToday();

  const [realTime, setRealTime] = useState(getFormattedTime);
  const [shifts, setShifts] = useState<ShiftHour[]>(initialSchedule.shifts);
  const [hasScheduleToday, setHasScheduleToday] = useState<boolean>(initialSchedule.hasSchedule);
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

  // 1. Carregar horários persistidos do Tauri Store ou localStorage
  useEffect(() => {
    const loadData = async () => {
      const dayName = DAY_KEYS[new Date().getDay()];
      let allSchedules: ScheduleItem[] = [];

      try {
        const store = new LazyStore("settings.json");
        const stored = await store.get<ScheduleItem[]>("schedules");
        if (stored && Array.isArray(stored)) {
          allSchedules = stored;
        }
      } catch {
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
          setHasScheduleToday(true);
        } else {
          setShifts([]);
          setHasScheduleToday(false);
        }
      } else {
        setShifts([]);
        setHasScheduleToday(false);
      }
    };

    loadData();
  }, []);

  // 2. Loop de atualização em tempo real
  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      setRealTime(getFormattedTime());

      if (!hasScheduleToday || shifts.length === 0 || isDraining) return;

      const totalShifts = shifts.length;
      if (completedPunches >= totalShifts) {
        setGaugeValue(100);
        return;
      }

      const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const targetShift = shifts[completedPunches];
      const targetMinutes = timeToMinutes(targetShift?.time || "08:00");

      let startMinutes = 0;
      if (completedPunches === 0) {
        startMinutes = Math.max(0, targetMinutes - 120);
      } else {
        const prevShift = shifts[completedPunches - 1];
        startMinutes = timeToMinutes(prevShift?.time || "08:00");
      }

      let nextVal = 0;
      if (nowMinutes >= targetMinutes) {
        nextVal = 100;
      } else if (nowMinutes <= startMinutes) {
        nextVal = 0;
      } else {
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
  }, [shifts, completedPunches, isDraining, storageGaugeKey, hasScheduleToday]);

  // 3. Ação de Bater Ponto
  const handlePunch = async () => {
    const punchUrl = "https://letswork.app/relogio";

    try {
      await openUrl(punchUrl);
    } catch {
      window.open(punchUrl, "_blank");
    }

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
    }, 40);
  };

  const isAllCompleted = hasScheduleToday && shifts.length > 0 && completedPunches >= shifts.length;
  const currentShift = !isAllCompleted && hasScheduleToday && shifts.length > 0 ? shifts[completedPunches] : null;
  const isReadyToPunch = !isAllCompleted && hasScheduleToday && gaugeValue >= 100 && !isDraining;

  const totalDayPercentage = hasScheduleToday && shifts.length > 0
    ? Math.min(
        100,
        Math.round(((completedPunches * 100 + (isAllCompleted ? 0 : gaugeValue)) / (shifts.length * 100)) * 100)
      )
    : 0;

  return {
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
  };
}

