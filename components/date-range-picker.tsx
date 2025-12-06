"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DateRange } from "react-day-picker"

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const range = value

  const handleSelect = (r: DateRange | undefined) => {
    if (r?.from && r?.to) {
      const daysDiff = differenceInDays(r.to, r.from)
      if (daysDiff > 4) {
        // Limit to 4 days max
        const maxDate = new Date(r.from)
        maxDate.setDate(maxDate.getDate() + 4)
        onChange?.({ from: r.from, to: maxDate })
        return
      }
    }
    onChange?.(r)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !range && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "d LLL y", { locale: localeID })} -{" "}
                  {format(range.to, "d LLL y", { locale: localeID })}
                </>
              ) : (
                format(range.from, "d LLL y", { locale: localeID })
              )
            ) : (
              <span>Pilih tanggal sewa</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={handleSelect}
            footer={<div className="p-3 text-xs text-muted-foreground">Maksimal 4 hari sewa</div>}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
