"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useFlightSearch } from "@/hooks/use-flight-search"
import { FlightCard } from "@/components/features/flight-card"
import { BookingSummary } from "@/components/features/booking-summary"
import { PriceChart } from "@/components/features/price-chart"
import { DateNavigator } from "@/components/features/date-navigator"
import { FilterSidebar } from "@/components/features/filter-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, Filter, CheckCircle2 } from "lucide-react"
import { useState, useMemo, useEffect, Suspense } from "react"
import { cn } from "@/lib/utils"
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
import { format, parseISO } from "date-fns"

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

    // Mix-and-match State
    const router = useRouter();
    const isRoundTrip = !!returnDate;
    const [step, setStep] = useState<'outbound' | 'return'>('outbound');
    const [selectedOutbound, setSelectedOutbound] = useState<any>(null);
    const [selectedReturn, setSelectedReturn] = useState<any>(null);

    const handleCheckout = () => {
        if (!selectedOutbound) return;

        const bookingData = {
            outbound: selectedOutbound,
            returnFlight: selectedReturn,
            dictionaries: data?.dictionaries
        };
        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
        router.push('/checkout');
    };

    // 1. Group by unique Outbound legs (same carrier, flight number, departure time)
    const uniqueOutbounds = useMemo(() => {
        if (!isRoundTrip || !data) return [];
        const map = new Map();
        filteredFlights.forEach(flight => {
            const outItinerary = flight.itineraries[0];
            const key = outItinerary.segments.map(s => `${s.carrierCode}${s.number}-${s.departure.at}`).join('_');

            if (!map.has(key)) {
                // Store the whole flight as a representative, but we also need the CHEAPEST price for this outbound
                // Since we don't know the isolated price, we show "From <min_total_price>"
                map.set(key, { ...flight, minPrice: parseFloat(flight.price.total) });
            } else {
                const existing = map.get(key);
                if (parseFloat(flight.price.total) < existing.minPrice) {
                    map.set(key, { ...flight, minPrice: parseFloat(flight.price.total) });
                }
            }
        });
        return Array.from(map.values()).sort((a, b) => a.minPrice - b.minPrice);
    }, [filteredFlights, isRoundTrip, data]);

    // 2. Get compatible Returns for selected outbound
    const availableReturns = useMemo(() => {
        if (!selectedOutbound || !data) return [];
        const outKey = selectedOutbound.itineraries[0].segments.map((s: any) => `${s.carrierCode}${s.number}-${s.departure.at}`).join('_');

        return filteredFlights.filter(f => {
            const fKey = f.itineraries[0].segments.map((s: any) => `${s.carrierCode}${s.number}-${s.departure.at}`).join('_');
            return fKey === outKey;
        }).sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    }, [filteredFlights, selectedOutbound, data]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/">
                            <h1 className="text-xl font-bold tracking-tight cursor-pointer hover:opacity-90 transition-opacity">
                                <span className="text-red-500">Not</span> <span className="text-white">Google Flights</span>
                            </h1>
                        </Link>

                        <div className="hidden md:flex items-center space-x-2 text-sm text-slate-400 border-l border-slate-700 pl-6 h-6">
                            <span className="font-medium text-slate-200">{origin}</span>
                            <span>{returnDate ? "↔" : "→"}</span>
                            <span className="font-medium text-slate-200">{destination}</span>
                            <span className="mx-2">•</span>
                            <span>{date}</span>
                            {returnDate && (
                                <>
                                    <span className="mx-1">-</span>
                                    <span>{returnDate}</span>
                                </>
                            )}
                            <span className="mx-2">•</span>
                            <span>{adults} Pax</span>
                        </div>
                    </div>

                    {/* Mobile Summary & Filter Trigger */}
                    <div className="flex items-center gap-4">
                        <div className="md:hidden text-xs text-slate-400">
                            {origin} → {destination}
                        </div>

                        <div className="md:hidden">
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white">
                                        <Filter className="h-4 w-4" /> Filters
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                    <DrawerHeader>
                                        <DrawerTitle>Filters</DrawerTitle>
                                        <DrawerDescription>Adjust your search criteria.</DrawerDescription>
                                    </DrawerHeader>
                                    <div className="p-4 overflow-y-auto max-h-[75vh]">
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
                </div>
            </header>

            <main className={cn(
                "max-w-[90rem] mx-auto p-4 md:p-8 grid grid-cols-1 gap-8 items-start relative transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
                selectedOutbound ? "md:grid-cols-[16rem_1fr_24rem]" : "md:grid-cols-[16rem_1fr]"
            )}>
                {/* Desktop Sidebar Filters (Col 1) */}
                <aside className="space-y-6 hidden md:block sticky top-24 h-fit">
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

                {/* Main Content (Col 2) */}
                <section className="min-w-0 flex flex-col pb-64 md:pb-0">
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

                            {!isRoundTrip ? (
                                // One-way rendering with Selection
                                filteredFlights.map((flight) => (
                                    <FlightCard
                                        key={flight.id}
                                        flight={flight}
                                        dictionaries={data.dictionaries}
                                        onSelect={() => setSelectedOutbound(flight)}
                                    />
                                ))
                            ) : (
                                // Round-trip mix-and-match rendering (Tabbed UI)
                                <>
                                    {/* Selection Tabs Header */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {/* Outbound Tab */}
                                        <div
                                            onClick={() => setStep('outbound')}
                                            className={cn(
                                                "relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-blue-300",
                                                step === 'outbound'
                                                    ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500"
                                                    : "bg-white border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                                                    step === 'outbound' ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    Outbound
                                                </span>
                                                {selectedOutbound && <span className="text-blue-600"><CheckCircle2 className="h-5 w-5" /></span>}
                                            </div>

                                            {selectedOutbound ? (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-900 text-lg">{format(parseISO(selectedOutbound.itineraries[0].segments[0].departure.at), "HH:mm")}</span>
                                                        <span className="text-slate-400">→</span>
                                                        <span className="font-bold text-slate-900 text-lg">{format(parseISO(selectedOutbound.itineraries[0].segments[selectedOutbound.itineraries[0].segments.length - 1].arrival.at), "HH:mm")}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {data.dictionaries.carriers[selectedOutbound.itineraries[0].segments[0].carrierCode]} • {format(parseISO(selectedOutbound.itineraries[0].segments[0].departure.at), "EEE, d MMM")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="py-2">
                                                    <p className="text-slate-900 font-semibold">Select Flight</p>
                                                    <p className="text-sm text-slate-500">{origin} to {destination}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Return Tab */}
                                        <div
                                            onClick={() => {
                                                if (selectedOutbound) setStep('return');
                                            }}
                                            className={cn(
                                                "relative p-4 rounded-xl border-2 transition-all",
                                                !selectedOutbound ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-100" : "cursor-pointer hover:border-purple-300",
                                                step === 'return'
                                                    ? "bg-purple-50 border-purple-500 shadow-md ring-1 ring-purple-500"
                                                    : "bg-white border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                                                    step === 'return' ? "bg-purple-200 text-purple-800" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    Return
                                                </span>
                                                {selectedReturn && <span className="text-purple-600"><CheckCircle2 className="h-5 w-5" /></span>}
                                            </div>

                                            {(!selectedOutbound && step !== 'return') ? (
                                                <div className="py-2">
                                                    <p className="text-slate-400 font-medium italic">Select outbound first</p>
                                                </div>
                                            ) : selectedReturn ? (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-900 text-lg">{format(parseISO(selectedReturn.itineraries[0].segments[0].departure.at), "HH:mm")}</span>
                                                        <span className="text-slate-400">→</span>
                                                        <span className="font-bold text-slate-900 text-lg">{format(parseISO(selectedReturn.itineraries[0].segments[selectedReturn.itineraries[0].segments.length - 1].arrival.at), "HH:mm")}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {data.dictionaries.carriers[selectedReturn.itineraries[0].segments[0].carrierCode]} • {format(parseISO(selectedReturn.itineraries[0].segments[0].departure.at), "EEE, d MMM")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="py-2">
                                                    <p className="text-slate-900 font-semibold">Select Flight</p>
                                                    <p className="text-sm text-slate-500">{destination} to {origin}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Flight List based on Step */}
                                    {step === 'outbound' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            {uniqueOutbounds.map(flight => (
                                                <FlightCard
                                                    key={flight.id}
                                                    flight={flight}
                                                    dictionaries={data.dictionaries}
                                                    isMultiStep={true}
                                                    step="outbound"
                                                    onSelect={() => {
                                                        setSelectedOutbound(flight);
                                                        setSelectedReturn(null); // Reset return if outbound changes
                                                        setStep('return');
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    displayPrice={flight.minPrice}
                                                />
                                            ))}
                                            {uniqueOutbounds.length === 0 && (
                                                <p className="text-center text-slate-500 py-8">No outbound flights match your filters.</p>
                                            )}
                                        </div>
                                    )}

                                    {step === 'return' && selectedOutbound && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            {availableReturns.map(flight => (
                                                <FlightCard
                                                    key={flight.id}
                                                    flight={flight}
                                                    dictionaries={data.dictionaries}
                                                    isMultiStep={true}
                                                    step="return"
                                                    onSelect={() => {
                                                        setSelectedReturn(flight);
                                                    }}
                                                />
                                            ))}
                                            {availableReturns.length === 0 && (
                                                <p className="text-center text-slate-500 py-8">No return flights available for selected outbound.</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

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

                {/* Third Column: Booking Summary (Desktop Sticky) */}
                {selectedOutbound && (
                    <div className="md:sticky md:top-24 md:h-fit z-30">
                        <BookingSummary
                            outbound={selectedOutbound}
                            returnFlight={selectedReturn}
                            dictionaries={data?.dictionaries || { carriers: {}, aircraft: {}, currencies: {}, location: {} }}
                            onCheckout={handleCheckout}
                        />
                    </div>
                )}
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
