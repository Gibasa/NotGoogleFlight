"use client"

import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { Plane, ArrowRight } from "lucide-react"

interface BookingSummaryProps {
    outbound: any;
    returnFlight?: any;
    dictionaries: any;
    onCheckout: () => void;
}

export function BookingSummary({ outbound, returnFlight, dictionaries, onCheckout }: BookingSummaryProps) {
    if (!outbound) return null;

    const currency = outbound.price.currency;
    const outboundPrice = parseFloat(outbound.price.total);
    const returnPrice = returnFlight ? parseFloat(returnFlight.price.total) : 0;
    const totalPrice = outboundPrice + returnPrice;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:static md:z-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white border-t md:border border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-md rounded-t-xl md:rounded-xl p-4 text-slate-900">

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-semibold text-base text-slate-800">Your Selection</h3>
                        <div className="text-right">
                            <span className="text-xs text-slate-500 mr-2">Total</span>
                            <span className="text-xl font-bold text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(totalPrice)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Outbound Summary */}
                        <div className="flex items-center gap-3 text-sm">
                            <div className="bg-blue-50 px-2 py-1 rounded text-xs font-bold text-blue-700 uppercase tracking-wider">
                                Outbound
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                    {dictionaries.carriers[outbound.itineraries[0].segments[0].carrierCode]}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {format(parseISO(outbound.itineraries[0].segments[0].departure.at), "EEE, d MMM • HH:mm")}
                                </p>
                            </div>
                        </div>

                        {/* Return Summary (if selected) */}
                        {returnFlight ? (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="bg-purple-50 px-2 py-1 rounded text-xs font-bold text-purple-700 uppercase tracking-wider">
                                    Return
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                        {dictionaries.carriers[returnFlight.itineraries[0].segments[0].carrierCode]}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {format(parseISO(returnFlight.itineraries[1].segments[0].departure.at), "EEE, d MMM • HH:mm")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-sm opacity-60">
                                <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Return
                                </div>
                                <p className="text-xs text-slate-400 font-medium italic">
                                    {outbound && !returnFlight && !!outbound.itineraries[1] ? "Select a flight..." : "Not applicable"}
                                </p>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={onCheckout}
                        disabled={!returnFlight && !!outbound.itineraries[1] /* Enforce return only if it's a round trip search */}
                        className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 shadow-sm"
                    >
                        Review & Book <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
