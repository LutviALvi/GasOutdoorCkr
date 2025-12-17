"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays, getDay, addDays, isBefore, startOfDay } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DateRange, Matcher } from "react-day-picker"

// Helper function to check if a date is Fri, Sat, or Sun
function isAllowedStartDay(date: Date): boolean {
  const day = getDay(date)
  // 0 = Sunday, 5 = Friday, 6 = Saturday
  return day === 0 || day === 5 || day === 6
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false) // Open state for Popover
  const range = value

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined)
      return
    }

    // Only allow selecting start date. 
    // Logic: If user clicks a date, IF it's valid, auto-set the range to [date, date + 3 days]
    
    if (isAllowedStartDay(selectedDate)) {
        const endDate = addDays(selectedDate, 3) // Total 4 days
        onChange?.({ from: selectedDate, to: endDate })
        setOpen(false) // Close popover immediately after valid selection
    }
  }

  // Create disabled matcher
  const disabledMatcher: Matcher = React.useMemo(() => {
    const today = startOfDay(new Date())
    
    return (date: Date) => {
      const d = startOfDay(date)
      // Disable past dates
      if (isBefore(d, today)) return true
      // Disable non Fri/Sat/Sun
      return !isAllowedStartDay(date)
    }
  }, [])

  // Calculate day count strictly
  const dayCount = range?.from && range?.to 
    ? differenceInDays(range.to, range.from) 
    : 0

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
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
            {range?.from && range?.to ? (
                <>
                  {format(range.from, "EEE, d LLL", { locale: localeID })} -{" "}
                  {format(range.to, "EEE, d LLL y", { locale: localeID })}
                  <span className="ml-2 text-xs text-muted-foreground">({dayCount} hari)</span>
                </>
            ) : (
              <span>Pilih tanggal sewa (Jum/Sab/Min)</span>
            )}
            {range?.from && (
                <div role="button" onClick={handleClear} className="ml-auto hover:bg-slate-200 rounded-full p-1 cursor-pointer">
                    <span className="sr-only">Reset</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single" // Changed from 'range' to 'single' because we auto-calculate the range
            numberOfMonths={1}
            selected={range?.from}
            onSelect={handleSelect}
            disabled={disabledMatcher}
            footer={
              <div className="p-3 text-xs text-muted-foreground space-y-1">
                  <p>✓ Mulai sewa: hanya Jumat, Sabtu, atau Minggu</p>
                  <p>✓ Durasi otomatis 4 hari</p>
              </div>
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
