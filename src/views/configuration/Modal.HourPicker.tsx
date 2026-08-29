import { useEffect, useRef } from "react";
import { Timepicker } from "timepicker-ui-react";
import "timepicker-ui/main.css";

export interface ModalHourPickerProps {
  initialTime?: string; // Formato 24h (ex: "08:00", "17:00")
  onConfirm: (time24h: string) => void;
  onCancel: () => void;
}

// Converte "17:00" (24h) para "05:00 PM" (12h) para o defaultValue do Timepicker
function to12h(time24?: string): string {
  if (!time24 || !time24.includes(":")) return "08:00 AM";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

// Converte a confirmação 12h AM/PM para formato 24h "HH:MM" (ex: "17:00")
function to24h(hour?: string, minutes?: string, type?: string): string {
  if (!hour || !minutes) return "08:00";
  let h = parseInt(hour, 10);
  const m = parseInt(minutes, 10) || 0;
  const isPM = type?.toUpperCase() === "PM";
  const isAM = type?.toUpperCase() === "AM";

  if (isPM && h < 12) {
    h += 12;
  } else if (isAM && h === 12) {
    h = 0;
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function ModalHourPicker({
  initialTime = "08:00",
  onConfirm,
  onCancel,
}: ModalHourPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Abre automaticamente o seletor de horas ao montar
    const timeout = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  const handleConfirm = (data: { hour?: string; minutes?: string; type?: string }) => {
    if (data?.hour && data?.minutes) {
      const time24h = to24h(data.hour, data.minutes, data.type);
      onConfirm(time24h);
    } else {
      onCancel();
    }
  };

  return (
    <div className="sr-only" aria-hidden="true">
      <Timepicker
        ref={inputRef}
        defaultValue={to12h(initialTime)}
        options={{
          clock: {
            type: "12h",
          },
          ui: {
            theme: "basic",
            backdrop: true,
          },
          labels: {
            ok: "Confirmar",
            cancel: "Cancelar",
            time: "Selecionar",
          },
        }}
        onConfirm={handleConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}