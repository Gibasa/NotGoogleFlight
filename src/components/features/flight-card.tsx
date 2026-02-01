import { Flight, Dictionaries } from "@/types";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Plane, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FlightCardProps {
    flight: Flight;
    dictionaries: Dictionaries;
}

export function FlightCard({ flight, dictionaries }: FlightCardProps) {
    // We'll just show the first itinerary (outbound) for simplicity in the card summary
    // In a real app, we'd show return as well or stack them.
    const itinerary = flight.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    const carrierName = dictionaries.carriers[firstSegment.carrierCode] || firstSegment.carrierCode;
    const departureTime = parseISO(firstSegment.departure.at);
    const arrivalTime = parseISO(lastSegment.arrival.at);

    const formatDuration = (isoDuration: string) => {
        // Basic parser for PT2H30M
        // For now, let's just clean the string or use a library if needed.
        // Amadeus returns PT1H, PT2H30M.
        return isoDuration.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase();
    };

    const stops = itinerary.segments.length - 1;

    return (
        <Card className="mb-4 hover:shadow-lg transition-all border border-blue-100 hover:border-blue-300 bg-white group">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Airline Info */}
                    <div className="flex items-center gap-4 w-full md:w-1/4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-white border border-blue-100 p-1 flex items-center justify-center shadow-sm">
                            <img
                                src={`https://pics.avs.io/200/200/${firstSegment.carrierCode}.png`}
                                alt={carrierName}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{carrierName}</h3>
                            <p className="text-xs text-slate-500">Flight {firstSegment.carrierCode}{firstSegment.number}</p>
                        </div>
                    </div>

                    {/* Flight Times */}
                    <div className="flex flex-1 items-center justify-between w-full md:w-2/4 px-4 text-center">
                        <div className="text-left">
                            <p className="text-2xl font-bold text-slate-900">{format(departureTime, "HH:mm")}</p>
                            <p className="text-sm text-slate-500">{firstSegment.departure.iataCode}</p>
                        </div>

                        <div className="flex flex-col items-center flex-1 px-4">
                            <p className="text-xs text-slate-400 mb-4">{formatDuration(itinerary.duration)}</p>
                            <div className="w-full h-[1px] bg-blue-100 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                    {stops === 0 ? (
                                        <span className="text-xs text-green-600 font-medium">Direct</span>
                                    ) : (
                                        <span className="text-xs text-red-500 font-medium">{stops} stop{stops > 1 ? 's' : ''}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">{format(arrivalTime, "HH:mm")}</p>
                            <p className="text-sm text-slate-500">{lastSegment.arrival.iataCode}</p>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end gap-2 w-full md:w-1/4 text-right pl-4 border-l border-blue-50 md:border-l-2">
                        <div>
                            <span className="text-xs text-slate-400">Total</span>
                            <p className="text-2xl font-bold text-blue-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: flight.price.currency }).format(parseFloat(flight.price.total))}
                            </p>
                        </div>
                        <Button className="w-full bg-white text-blue-600 border border-blue-600 hover:bg-blue-50">Select</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
