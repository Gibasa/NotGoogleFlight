import { Flight, Dictionaries } from "@/types";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Plane, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlightCardProps {
    flight: Flight;
    dictionaries: Dictionaries;
    isMultiStep?: boolean;
    step?: 'outbound' | 'return';
    onSelect?: () => void;
    displayPrice?: number;
}

export function FlightCard({ flight, dictionaries, isMultiStep, step, onSelect, displayPrice }: FlightCardProps) {
    const formatDuration = (isoDuration: string) => {
        return isoDuration.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase();
    };

    // Filter itineraries based on step if in multi-step mode
    const itinerariesToShow = isMultiStep
        ? (step === 'outbound' ? [flight.itineraries[0]] : [flight.itineraries[1]])
        : flight.itineraries;

    return (
        <Card className="mb-4 hover:shadow-lg transition-all border border-blue-100 hover:border-blue-300 bg-white group overflow-hidden">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Itineraries Column */}
                    <div className="flex-1 p-6 space-y-6">
                        {itinerariesToShow.map((itinerary, idx) => {
                            // Remap index for correct labelling if we are filtering
                            const actualIndex = isMultiStep ? (step === 'outbound' ? 0 : 1) : idx;

                            const firstSegment = itinerary.segments[0];
                            const lastSegment = itinerary.segments[itinerary.segments.length - 1];
                            const carrierName = dictionaries.carriers[firstSegment.carrierCode] || firstSegment.carrierCode;
                            const departureTime = parseISO(firstSegment.departure.at);
                            const arrivalTime = parseISO(lastSegment.arrival.at);
                            const stops = itinerary.segments.length - 1;

                            return (
                                <div key={actualIndex} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                                            actualIndex === 0 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                        )}>
                                            {actualIndex === 0 ? "Outbound" : "Return"}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {format(departureTime, "EEE, d MMM")}
                                        </span>
                                    </div>

                                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                            {/* Airline Info */}
                                            <div className="flex items-center gap-4 w-full md:w-1/4">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-white border border-blue-100 p-1 flex items-center justify-center shadow-sm">
                                                    <img
                                                        src={`https://pics.avs.io/200/200/${firstSegment.carrierCode}.png`}
                                                        alt={carrierName}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-slate-900">{carrierName}</h3>
                                                    <p className="text-xs text-slate-500">
                                                        {firstSegment.carrierCode}{firstSegment.number}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Flight Times */}
                                            <div className="flex flex-1 items-center justify-between w-full md:w-2/4 px-2 text-center">
                                                <div className="text-left">
                                                    <p className="text-xl font-bold text-slate-900">{format(departureTime, "HH:mm")}</p>
                                                    <p className="text-xs text-slate-500">{firstSegment.departure.iataCode}</p>
                                                </div>

                                                <div className="flex flex-col items-center flex-1 px-4">
                                                    <p className="text-[10px] text-slate-400 mb-1">{formatDuration(itinerary.duration)}</p>
                                                    <div className="w-full h-[1px] bg-blue-100 relative">
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                                            {stops === 0 ? (
                                                                <span className="text-[10px] text-green-600 font-medium">Direct</span>
                                                            ) : (
                                                                <span className="text-[10px] text-red-500 font-medium">{stops} stop{stops > 1 ? 's' : ''}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-slate-900">{format(arrivalTime, "HH:mm")}</p>
                                                    <p className="text-xs text-slate-500">{lastSegment.arrival.iataCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Price & Action Column */}
                    <div className="flex flex-col items-end justify-center gap-3 w-full md:w-48 bg-slate-50 p-6 border-l border-slate-100">
                        <div className="text-right">
                            <span className="text-xs text-slate-400 block mb-1">
                                {isMultiStep && step === 'outbound' ? "From" : "Total Price"}
                            </span>
                            <p className="text-2xl font-bold text-blue-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: flight.price.currency }).format(displayPrice || parseFloat(flight.price.total))}
                            </p>
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            onClick={onSelect}
                        >
                            Select
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
