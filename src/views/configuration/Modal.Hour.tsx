import { useState } from "react";
import ModalDatePicker from "./Modal.DatePicker";
import ModalHourPicker from "./Modal.HourPicker";

export interface ModalHourProps {
  setModalContainerHour: (modal: boolean) => void;
}

interface ShiftHour {
  id: number;
  label: string;
  time: string;
}

export default function ModalHour({ setModalContainerHour }: ModalHourProps) {
  const [shifts, setShifts] = useState<ShiftHour[]>([
    { id: 1, label: "Horário entrada", time: "08:00" },
    { id: 2, label: "Horário saída", time: "12:00" },
    { id: 3, label: "Horário entrada", time: "13:00" },
    { id: 4, label: "Horário saída", time: "17:00" },
  ]);

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

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        onClick={() => setModalContainerHour(false)}
      >
        <div 
          className="bg-white p-5 rounded-2xl shadow-xl max-w-xs w-full text-left flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-main">Definir Horário</h2>
          </div>

          <ModalDatePicker />
          
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
            onClick={() => setModalContainerHour(false)}
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
    </>
  );
}