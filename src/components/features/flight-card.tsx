"use client"

import { useState } from "react";
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
    readOnly?: boolean;
    hideLabel?: boolean; // New Prop
}

function AirlineLogo({ carrierCode, carrierName }: { carrierCode: string, carrierName: string }) {
    const [error, setError] = useState(false);

    if (error) {
        return <Plane className="h-6 w-6 text-slate-300 transform -rotate-45" />;
    }

    return (
        <img
            src={`https://pics.avs.io/200/200/${carrierCode}.png`}
            alt={carrierName}
            className="w-full h-full object-contain"
            onError={() => setError(true)}
        />
    );
}

export function FlightCard({ flight, dictionaries, isMultiStep, step, onSelect, displayPrice, readOnly, hideLabel }: FlightCardProps) {
    const formatDuration = (isoDuration: string) => {
        return isoDuration.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase();
    };

    // Filter itineraries based on step if in multi-step mode
    const itinerariesToShow = isMultiStep
        ? (step === 'outbound' ? [flight.itineraries[0]] : [flight.itineraries[1]])
        : flight.itineraries;

    return (
        <Card className={cn(
            "mb-4 transition-all bg-white group overflow-hidden",
            readOnly ? "border-slate-100 shadow-sm" : "border border-blue-100 hover:shadow-lg hover:border-blue-300"
        )}>
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Itineraries Column */}
                    <div className="flex-1">
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
                                <div key={actualIndex} className={cn(
                                    "p-6 flex flex-col gap-4",
                                    idx > 0 && "border-t border-slate-100"
                                )}>
                                    {/* Label (if needed) */}
                                    {!hideLabel && (
                                        <div className="flex items-center gap-2 mb-2">
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
                                    )}

                                    {/* Flight Row Grid */}
                                    {/* Flight Row Flex Layout */}
                                    <div className="flex flex-col md:flex-row items-center gap-6">

                                        {/* Airline Info - Fixed Width 25% - Logo & Flight No. only */}
                                        <div className="w-full md:w-[25%] flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                                            <div className="h-10 w-10 flex-shrink-0 relative">
                                                <AirlineLogo
                                                    carrierCode={firstSegment.carrierCode}
                                                    carrierName={carrierName}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-bold text-slate-900">
                                                    {firstSegment.carrierCode}{firstSegment.number}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Flight Times & Path - Remaining 70% */}
                                        <div className="flex-1 w-full flex items-center justify-between gap-4 md:pl-2">
                                            {/* Departure */}
                                            <div className="text-left w-[80px]">
                                                <p className="text-2xl font-bold text-slate-900 leading-none">
                                                    {format(departureTime, "HH:mm")}
                                                </p>
                                                <p className="text-sm font-medium text-slate-500 mt-1">
                                                    {firstSegment.departure.iataCode}
                                                </p>
                                            </div>

                                            {/* Duration Visual */}
                                            <div className="flex flex-col items-center justify-center flex-1 px-2">
                                                <p className="text-xs text-slate-400 font-medium mb-2">
                                                    {formatDuration(itinerary.duration)}
                                                </p>
                                                <div className="w-full max-w-[120px] h-[2px] bg-slate-300 relative flex items-center justify-center">
                                                    {/* Stops Badge */}
                                                    <div className="bg-white px-2 relative z-10">
                                                        {stops === 0 ? (
                                                            <span className="text-[10px] font-bold text-green-600 uppercase">Direct</span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-red-500 uppercase">
                                                                {stops} stop{stops > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Dots endpoints */}
                                                    <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-slate-300 -ml-0.5" />
                                                    <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-slate-300 -mr-0.5" />
                                                </div>
                                            </div>

                                            {/* Arrival */}
                                            <div className="text-right w-[80px]">
                                                <p className="text-2xl font-bold text-slate-900 leading-none">
                                                    {format(arrivalTime, "HH:mm")}
                                                </p>
                                                <p className="text-sm font-medium text-slate-500 mt-1">
                                                    {lastSegment.arrival.iataCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Price & Action Column (Desktop: Right Side, Mobile: Bottom) */}
                    {!readOnly && (
                        <div className="flex flex-col md:w-56 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 justify-center gap-4">
                            <div className="flex md:flex-col justify-between items-center md:items-end gap-2">
                                <span className="text-sm text-slate-500">
                                    {isMultiStep && step === 'outbound' ? "From" : "Total Price"}
                                </span>
                                <p className="text-3xl font-bold text-blue-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: flight.price.currency }).format(displayPrice || parseFloat(flight.price.total))}
                                </p>
                            </div>
                            <Button
                                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                                onClick={onSelect}
                            >
                                Select
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
