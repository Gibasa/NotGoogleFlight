"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useFlightSearch } from "@/hooks/use-flight-search"
import { FlightCard } from "@/components/features/flight-card"
import { PriceChart } from "@/components/features/price-chart"
import { DateNavigator } from "@/components/features/date-navigator"
import { FilterSidebar } from "@/components/features/filter-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, Filter } from "lucide-react"
import { useState, useMemo, useEffect, Suspense } from "react"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { SortControls } from "@/components/features/sort-controls"
import type { SortOption } from "@/components/features/sort-controls"
import { parseDurationToMinutes } from "@/lib/utils"

function SearchPageContent() {
    const searchParams = useSearchParams()
    const origin = searchParams.get("origin") || ""
    const destination = searchParams.get("destination") || ""
    const date = searchParams.get("date") || ""
    const returnDate = searchParams.get("returnDate") || undefined
    const adults = searchParams.get("adults") || "1"

    const { data, isLoading, error } = useFlightSearch({
        origin,
        destination,
        date,
        returnDate,
        adults
    })

    // Filter State
    const [maxPriceLimit, setMaxPriceLimit] = useState(10000)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
    const [selectedStops, setSelectedStops] = useState<string[]>([])
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
    const [availableAirlines, setAvailableAirlines] = useState<{ code: string; name: string }[]>([])
    const [sortBy, setSortBy] = useState<SortOption>("price_asc")

    // Initialize filters when data loads
    useEffect(() => {
        if (data) {
            // Find max price
            const highestPrice = Math.max(...data.data.map(f => parseFloat(f.price.total)), 1000)
            const roundedMax = Math.ceil(highestPrice / 100) * 100
            setMaxPriceLimit(roundedMax)
            setPriceRange([0, roundedMax])

            // Extract available airlines
            const carriers = new Set<string>()
            data.data.forEach(flight => {
                flight.itineraries[0].segments.forEach(seg => carriers.add(seg.carrierCode))
            })
            const airlinesList = Array.from(carriers).map(code => ({
                code,
                name: data.dictionaries.carriers[code] || code
            }))
            setAvailableAirlines(airlinesList)
        }
    }, [data])

    const filteredFlights = useMemo(() => {
        if (!data) return []

        let result = data.data.filter(flight => {
            const price = parseFloat(flight.price.total)
            // Price Filter
            if (price > priceRange[1]) return false

            const itinerary = flight.itineraries[0]
            const segments = itinerary.segments
            const stops = segments.length - 1

            // Stops Filter
            if (selectedStops.length > 0) {
                let match = false
                if (selectedStops.includes("0") && stops === 0) match = true
                if (selectedStops.includes("1") && stops === 1) match = true
                if (selectedStops.includes("2+") && stops >= 2) match = true
                if (!match) return false
            }

            // Airline Filter
            if (selectedAirlines.length > 0) {
                const carrier = segments[0].carrierCode
                if (!selectedAirlines.includes(carrier)) return false
            }

            return true
        })

        // Sorting Logic
        return result.sort((a, b) => {
            if (sortBy === "price_asc") {
                return parseFloat(a.price.total) - parseFloat(b.price.total)
            }
            if (sortBy === "price_desc") {
                return parseFloat(b.price.total) - parseFloat(a.price.total)
            }
            if (sortBy === "duration_asc") {
                return parseDurationToMinutes(a.itineraries[0].duration) - parseDurationToMinutes(b.itineraries[0].duration)
            }
            if (sortBy === "duration_desc") {
                return parseDurationToMinutes(b.itineraries[0].duration) - parseDurationToMinutes(a.itineraries[0].duration)
            }
            if (sortBy === "stops_asc") {
                // Primary: Number of stops, Secondary: Duration
                const stopsA = a.itineraries[0].segments.length
                const stopsB = b.itineraries[0].segments.length
                if (stopsA !== stopsB) return stopsA - stopsB
                return parseDurationToMinutes(a.itineraries[0].duration) - parseDurationToMinutes(b.itineraries[0].duration)
            }
            return 0
        })

    }, [data, priceRange, selectedStops, selectedAirlines, sortBy])

    // Calculate average price of filtered flights for the chart
    const averagePrice = useMemo(() => {
        if (filteredFlights.length === 0) return 0
        const sum = filteredFlights.reduce((acc, curr) => acc + parseFloat(curr.price.total), 0)
        return sum / filteredFlights.length
    }, [filteredFlights])

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <Link href="/">
                            <h1 className="text-xl font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors">Flight Search</h1>
                        </Link>
                        <div className="text-sm text-slate-500">
                            {origin} to {destination} • {date} • {adults} Passenger(s)
                        </div>
                    </div>

                    {/* Mobile Filter Trigger */}
                    <div className="md:hidden">
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>Filters</DrawerTitle>
                                    <DrawerDescription>Adjust your search criteria.</DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4">
                                    <FilterSidebar
                                        maxPrice={maxPriceLimit}
                                        priceRange={priceRange}
                                        setPriceRange={setPriceRange}
                                        stops={selectedStops}
                                        setStops={setSelectedStops}
                                        airlines={selectedAirlines}
                                        setAirlines={setSelectedAirlines}
                                        availableAirlines={availableAirlines}
                                    />
                                </div>
                                <DrawerFooter>
                                    <DrawerClose asChild>
                                        <Button>Apply Filters</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Desktop Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-6 hidden md:block sticky top-24 h-fit">
                    <FilterSidebar
                        maxPrice={maxPriceLimit}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        stops={selectedStops}
                        setStops={setSelectedStops}
                        airlines={selectedAirlines}
                        setAirlines={setSelectedAirlines}
                        availableAirlines={availableAirlines}
                    />
                </aside>

                {/* Main Content */}
                <section className="flex-1 min-w-0">
                    {/* Date Navigator */}
                    {date && (
                        <DateNavigator dateString={date} />
                    )}

                    {/* Price Chart */}
                    {date && (
                        <div className="mb-6">
                            {/* Pass the computed average price to simulate chart reacting to filtering */}
                            <PriceChart baseDate={new Date(date)} basePrice={averagePrice || 500} />
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <Skeleton className="h-12 w-48" />
                                    </div>
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-red-600 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5" />
                            <p>Failed to load flights. {(error as Error).message}</p>
                        </div>
                    )}

                    {/* Results */}
                    {data && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                <p className="text-sm text-slate-500">
                                    Showing {filteredFlights.length} of {data.data.length} flights
                                </p>
                                <SortControls value={sortBy} onChange={setSortBy} />
                            </div>

                            {filteredFlights.map((flight) => (
                                <FlightCard
                                    key={flight.id}
                                    flight={flight}
                                    dictionaries={data.dictionaries}
                                />
                            ))}

                            {filteredFlights.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                                    <p className="text-slate-500 text-lg font-medium">No flights match your filters.</p>
                                    <Button
                                        variant="link"
                                        className="text-indigo-600 mt-2"
                                        onClick={() => {
                                            setPriceRange([0, maxPriceLimit])
                                            setSelectedStops([])
                                            setSelectedAirlines([])
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading search...</div>}>
            <SearchPageContent />
        </Suspense>
    )
}
