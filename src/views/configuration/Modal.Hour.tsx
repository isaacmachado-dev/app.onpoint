import { LazyStore } from "@tauri-apps/plugin-store";
import { useState } from "react";
import { createPortal } from "react-dom";
import ModalDatePicker from "./Modal.DatePicker";
import ModalHourPicker from "./Modal.HourPicker";

export interface ShiftHour {
  id: number;
  label: string;
  time: string;
}

export interface ScheduleItem {
  id: string;
  days: string[];
  daysLabel: string;
  shifts: ShiftHour[];
}

export interface ModalHourProps {
  setModalContainerHour: (modal: boolean) => void;
  editingSchedule?: ScheduleItem | null;
  onSave?: (schedule: ScheduleItem) => void;
}

export function formatDaysLabel(selectedDays: string[]): string {
  if (!selectedDays || selectedDays.length === 0) return "Selecionar dias";
  if (selectedDays.length === 7) return "Todos os dias";

  const workdays = ["seg", "ter", "qua", "qui", "sex"];
  if (selectedDays.length === 5 && workdays.every((d) => selectedDays.includes(d))) {
    return "Seg-Sex";
  }

  const weekend = ["dom", "sab"];
  if (selectedDays.length === 2 && weekend.every((d) => selectedDays.includes(d))) {
    return "Finais de semana";
  }

  const dayOrder = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const shortNames: Record<string, string> = {
    dom: "Dom",
    seg: "Seg",
    ter: "Ter",
    qua: "Qua",
    qui: "Qui",
    sex: "Sex",
    sab: "Sáb",
  };

  const sorted = [...selectedDays].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  const indices = sorted.map((d) => dayOrder.indexOf(d));
  const isConsecutive =
    indices.length >= 2 &&
    indices.every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);

  if (isConsecutive && sorted.length > 1) {
    return `${shortNames[sorted[0]]}-${shortNames[sorted[sorted.length - 1]]}`;
  }

  return sorted.map((d) => shortNames[d] || d).join(", ");
}

export default function ModalHour({
  setModalContainerHour,
  editingSchedule,
  onSave,
}: ModalHourProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    editingSchedule?.days || ["seg", "ter", "qua", "qui", "sex"]
  );

  const [shifts, setShifts] = useState<ShiftHour[]>(
    editingSchedule?.shifts || [
      { id: 1, label: "Horário entrada", time: "08:00" },
      { id: 2, label: "Horário saída", time: "12:00" },
      { id: 3, label: "Horário entrada", time: "13:00" },
      { id: 4, label: "Horário saída", time: "17:00" },
    ]
  );

  const [activeShiftIndex, setActiveShiftIndex] = useState<number | null>(null);

  const handleOpenPicker = (index: number) => {
    setActiveShiftIndex(index);
  };

  const handleConfirmTime = (newTime: string) => {
    if (activeShiftIndex !== null) {
      setShifts((prev) =>
        prev.map((shift, idx) =>
          idx === activeShiftIndex ? { ...shift, time: newTime } : shift
        )
      );
    }
    setActiveShiftIndex(null);
  };

  const handleCancelPicker = () => {
    setActiveShiftIndex(null);
  };

  const handleSave = async () => {
    const label = formatDaysLabel(selectedDays);
    const scheduleToSave: ScheduleItem = {
      id: editingSchedule?.id || Date.now().toString(),
      days: selectedDays,
      daysLabel: label,
      shifts,
    };

    // 1. Salvar no Tauri Store
    try {
      const store = new LazyStore("settings.json");
      const current = (await store.get<ScheduleItem[]>("schedules")) || [];
      const exists = current.some((s) => s.id === scheduleToSave.id);
      const updated = exists
        ? current.map((s) => (s.id === scheduleToSave.id ? scheduleToSave : s))
        : [...current, scheduleToSave];

      await store.set("schedules", updated);
      await store.save();
    } catch (err) {
      console.warn("Tauri Store fallback:", err);
    }

    // 2. Salvar no localStorage como fallback síncrono
    try {
      const savedRaw = localStorage.getItem("schedules");
      const current: ScheduleItem[] = savedRaw ? JSON.parse(savedRaw) : [];
      const exists = current.some((s) => s.id === scheduleToSave.id);
      const updated = exists
        ? current.map((s) => (s.id === scheduleToSave.id ? scheduleToSave : s))
        : [...current, scheduleToSave];
      localStorage.setItem("schedules", JSON.stringify(updated));
    } catch (err) {
      console.error("Erro no localStorage:", err);
    }

    // 3. Callback de sucesso para o componente pai
    if (onSave) {
      onSave(scheduleToSave);
    }

    // 4. Fechar o modal
    setModalContainerHour(false);
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-xs"
        onClick={() => setModalContainerHour(false)}
      >
        <div 
          className="bg-white p-5 rounded-2xl shadow-xl max-w-xs w-full text-left flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-main">
              {editingSchedule ? "Editar Horário" : "Definir Horário"}
            </h2>
          </div>

          <ModalDatePicker
            selectedDays={selectedDays}
            onChange={setSelectedDays}
          />
          
          <div className="flex flex-col gap-2">
            {shifts.map((shift, index) => (
              <button
                key={shift.id}
                type="button"
                onClick={() => handleOpenPicker(index)} 
                className="bg-white rounded-full p-3 font-semibold text-sm w-full flex flex-row cursor-pointer hover:bg-gray-50 border border-gray-100 transition-colors items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-brand-main px-2.5 py-0.5 rounded-full text-white text-xs font-bold">
                    {shift.id}°
                  </div>
                  <h3 className="text-black text-xs font-medium">{shift.label}</h3>
                </div>
                <span className="text-xs font-bold text-brand-main bg-brand-background px-2.5 py-1 rounded-full">
                  {shift.time}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="mt-2 bg-brand-main text-white py-2.5 px-4 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity text-center shadow-xs"
          >
            Salvar
          </button>
        </div>
      </div>

      {activeShiftIndex !== null && (
        <ModalHourPicker
          key={activeShiftIndex}
          initialTime={shifts[activeShiftIndex]?.time || "08:00"}
          onConfirm={handleConfirmTime}
          onCancel={handleCancelPicker}
        />
      )}
    </>,
    document.body
  );
}