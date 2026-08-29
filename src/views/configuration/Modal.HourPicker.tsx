import { useEffect, useRef } from "react";
import { Timepicker } from "timepicker-ui-react";
import "timepicker-ui/main.css";

export interface ModalHourPickerProps {
  initialTime?: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
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
      const h = data.hour.toString().padStart(2, "0");
      const m = data.minutes.toString().padStart(2, "0");
      onConfirm(`${h}:${m}`);
    } else {
      onCancel();
    }
  };

  return (
    <div className="sr-only" aria-hidden="true">
      <Timepicker
        ref={inputRef}
        defaultValue={initialTime}
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
            time: "Definir Horário",
          },
        }}
        onConfirm={handleConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}