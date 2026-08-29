"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

export interface DayOfWeek {
  id: string
  short: string
  full: string
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { id: "dom", short: "Dom", full: "Domingo" },
  { id: "seg", short: "Seg", full: "Segunda-feira" },
  { id: "ter", short: "Ter", full: "Terça-feira" },
  { id: "qua", short: "Qua", full: "Quarta-feira" },
  { id: "qui", short: "Qui", full: "Quinta-feira" },
  { id: "sex", short: "Sex", full: "Sexta-feira" },
  { id: "sab", short: "Sáb", full: "Sábado" },
]

export interface ModalDatePickerProps {
  selectedDays?: string[];
  onChange?: (days: string[]) => void;
}

const ModalDatePicker = ({
  selectedDays: controlledDays,
  onChange,
}: ModalDatePickerProps) => {
  const [internalDays, setInternalDays] = useState<string[]>([
    "seg",
    "ter",
    "qua",
    "qui",
    "sex",
  ])

  const selectedDays = controlledDays ?? internalDays

  const toggleDay = (dayId: string) => {
    const updated = selectedDays.includes(dayId)
      ? selectedDays.filter((id) => id !== dayId)
      : [...selectedDays, dayId]

    if (onChange) {
      onChange(updated)
    } else {
      setInternalDays(updated)
    }
  }

  const getButtonLabel = () => {
    if (selectedDays.length === 0) return "Selecionar dias"
    if (selectedDays.length === 7) return "Todos os dias"

    const workdays = ["seg", "ter", "qua", "qui", "sex"]
    const isWorkdays =
      selectedDays.length === 5 && workdays.every((d) => selectedDays.includes(d))
    if (isWorkdays) return "Segunda a Sexta"

    const weekend = ["dom", "sab"]
    const isWeekend =
      selectedDays.length === 2 && weekend.every((d) => selectedDays.includes(d))
    if (isWeekend) return "Finais de semana"

    return DAYS_OF_WEEK.filter((d) => selectedDays.includes(d.id))
      .map((d) => d.short)
      .join(", ")
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-3 bg-white hover:bg-gray-50 text-foreground border border-gray-200 rounded-xl",
              !selectedDays.length && "text-muted-foreground",
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-brand-main shrink-0" />
            <span className="truncate">{getButtonLabel()}</span>
          </Button>
        }
      />
      <PopoverContent align="start" className="z-[120] w-[280px] p-3 rounded-2xl shadow-xl bg-white border border-gray-100">
        {/* Botões dos Dias da Semana */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day.id)

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                title={day.full}
                className={cn(
                  "h-9 w-full flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-brand-main text-white shadow-xs"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                )}
              >
                {day.short}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ModalDatePicker

