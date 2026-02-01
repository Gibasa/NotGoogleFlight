"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { CityAutocomplete } from "./city-autocomplete"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
    type: z.enum(["ROUND_TRIP", "ONE_WAY"]),
    origin: z.string().length(3, "Must be a 3-letter IATA code (e.g. JFK)").regex(/^[A-Z]{3}$/, "Must be uppercase IATA code"),
    destination: z.string().length(3, "Must be a 3-letter IATA code").regex(/^[A-Z]{3}$/, "Must be uppercase IATA code"),
    date: z.date(),
    returnDate: z.date().optional(),
    adults: z.string(),
})

export function SearchForm() {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "ONE_WAY",
            origin: "",
            destination: "",
            adults: "1",
        } as any,
    })

    const searchType = form.watch("type")
    const departureDate = form.watch("date")

    const [isDepartureOpen, setIsDepartureOpen] = useState(false)
    const [isReturnOpen, setIsReturnOpen] = useState(false)

    // Reset return date if it's before new departure date
    useEffect(() => {
        const returnDate = form.getValues("returnDate")
        if (departureDate && returnDate && returnDate < departureDate) {
            form.setValue("returnDate", undefined)
        }
    }, [departureDate, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        const params = new URLSearchParams()
        params.set("origin", values.origin.toUpperCase())
        params.set("destination", values.destination.toUpperCase())
        params.set("date", format(values.date, "yyyy-MM-dd"))
        if (values.type === "ROUND_TRIP" && values.returnDate) {
            params.set("returnDate", format(values.returnDate, "yyyy-MM-dd"))
        }
        params.set("adults", values.adults)

        router.push(`/search?${params.toString()}`)
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-8 bg-white rounded-3xl border-2 border-primary shadow-xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="ONE_WAY" onValueChange={(val) => form.setValue("type", val as any)} className="w-full">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-slate-100 text-slate-500">
                            <TabsTrigger value="ROUND_TRIP" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Round Trip</TabsTrigger>
                            <TabsTrigger value="ONE_WAY" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">One Way</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                                <FormItem className={cn("col-span-12", searchType === "ROUND_TRIP" ? "md:col-span-3" : "md:col-span-3")}>
                                    <FormLabel className="text-slate-700 font-medium ml-1">From</FormLabel>
                                    <FormControl>
                                        <div className="border border-blue-200 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                                            <CityAutocomplete
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Origin (e.g. NYC)"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem className={cn("col-span-12", searchType === "ROUND_TRIP" ? "md:col-span-3" : "md:col-span-3")}>
                                    <FormLabel className="text-slate-700 font-medium ml-1">To</FormLabel>
                                    <FormControl>
                                        <div className="border border-blue-200 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                                            <CityAutocomplete
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Dest (e.g. LON)"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className={cn("flex flex-col col-span-12", searchType === "ROUND_TRIP" ? "md:col-span-2" : "md:col-span-3")}>
                                    <FormLabel className="text-slate-700 font-medium ml-1">Departure</FormLabel>
                                    <Popover open={isDepartureOpen} onOpenChange={setIsDepartureOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-12 pl-3 text-left font-normal bg-white text-slate-900 border border-blue-200 hover:bg-slate-50 hover:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 text-lg",
                                                        !field.value && "text-slate-400"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-5 w-5 opacity-50 text-blue-500" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-blue-100" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        field.onChange(date)
                                                        setIsDepartureOpen(false)
                                                    }
                                                }}
                                                disabled={(date) =>
                                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                className="p-3"
                                                classNames={{
                                                    day: "h-12 w-12 text-lg font-medium hover:bg-blue-50 hover:text-blue-600 rounded-md",
                                                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                                                    head_cell: "w-12 text-blue-800 font-normal text-base",
                                                    caption: "flex justify-center pt-1 relative items-center mb-2 text-lg font-medium text-blue-900",
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />

                        {searchType === "ROUND_TRIP" && (
                            <FormField
                                control={form.control}
                                name="returnDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col col-span-12 md:col-span-2">
                                        <FormLabel className="text-slate-700 font-medium ml-1">Return</FormLabel>
                                        <Popover open={isReturnOpen} onOpenChange={setIsReturnOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 pl-3 text-left font-normal bg-white text-slate-900 border border-blue-200 hover:bg-slate-50 hover:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 text-lg",
                                                            !field.value && "text-slate-400"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-5 w-5 opacity-50 text-blue-500" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-blue-100" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            field.onChange(date)
                                                            setIsReturnOpen(false)
                                                        }
                                                    }}
                                                    disabled={(date) =>
                                                        date < (departureDate || new Date())
                                                    }
                                                    className="p-3"
                                                    classNames={{
                                                        day: "h-12 w-12 text-lg font-medium hover:bg-blue-50 hover:text-blue-600 rounded-md",
                                                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                                                        head_cell: "w-12 text-blue-800 font-normal text-base",
                                                        caption: "flex justify-center pt-1 relative items-center mb-2 text-lg font-medium text-blue-900",
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="adults"
                            render={({ field }) => (
                                <FormItem className={cn("col-span-12", searchType === "ROUND_TRIP" ? "md:col-span-2" : "md:col-span-3")}>
                                    <FormLabel className="text-slate-700 font-medium ml-1">Travelers</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Users className="absolute left-3 top-3 h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                                            <Input type="number" min="1" max="9" {...field} className="pl-10 h-12 bg-white text-slate-900 border border-blue-200 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-lg" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full h-14 bg-white text-blue-600 font-bold text-xl border-2 border-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm transition-all rounded-xl">
                        Search Flights
                    </Button>
                </form>
            </Form>
        </div>
    )

}
