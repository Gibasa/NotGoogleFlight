"use client"

import { format, addDays, subDays } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DateNavigator({ dateString }: { dateString: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Parse the YYYY-MM-DD string as a local date
    const [year, month, day] = dateString.split('-').map(Number)
    const currentDate = new Date(year, month - 1, day)

    const handleDateChange = (date: Date | undefined) => {
        if (!date) return

        const params = new URLSearchParams(searchParams.toString())
        params.set("date", format(date, "yyyy-MM-dd"))
        router.push(`/search?${params.toString()}`)
    }

    const handleNextDay = () => {
        const nextDate = addDays(currentDate, 1)
        handleDateChange(nextDate)
    }

    const handlePrevDay = () => {
        const prevDate = subDays(currentDate, 1)
        handleDateChange(prevDate)
    }

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <Button
                variant="ghost"
                onClick={handlePrevDay}
                disabled={subDays(currentDate, 1) < new Date(new Date().setHours(0, 0, 0, 0))}
                className="flex items-center gap-2 hover:bg-slate-50"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev Day</span>
            </Button>

            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal border-slate-200",
                                !currentDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={handleDateChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button
                variant="ghost"
                onClick={handleNextDay}
                className="flex items-center gap-2 hover:bg-slate-50"
            >
                <span className="hidden sm:inline">Next Day</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
