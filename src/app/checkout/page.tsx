"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FlightCard } from "@/components/features/flight-card"
import { CheckCircle, ArrowRight, Plane } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
    const router = useRouter()
    const [bookingData, setBookingData] = useState<any>(null)

    useEffect(() => {
        // Load data from session storage
        const data = sessionStorage.getItem('bookingData')
        if (data) {
            setBookingData(JSON.parse(data))
        } else {
            router.push('/')
        }
    }, [router])

    if (!bookingData) return <div className="p-8 text-center text-slate-500">Loading booking details...</div>

    const { outbound, returnFlight, dictionaries } = bookingData
    const totalPrice = parseFloat(outbound.price.total) + (returnFlight ? parseFloat(returnFlight.price.total) : 0)

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/">
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-red-500">Not</span> <span className="text-white">Google Flights</span>
                        </h1>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="text-green-500" /> Confirm your Trip
                </h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Col: Itineraries */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">OUTBOUND</span>
                                Outbound Flight
                            </h2>
                            <FlightCard flight={outbound} dictionaries={dictionaries} isMultiStep={true} step="outbound" readOnly={true} hideLabel={true} />
                        </div>

                        {returnFlight && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">RETURN</span>
                                    Return Flight
                                </h2>
                                <FlightCard flight={returnFlight} dictionaries={dictionaries} isMultiStep={true} step="return" readOnly={true} hideLabel={true} />
                            </div>
                        )}
                    </div>

                    {/* Right Col: Price & Pay */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                            <h2 className="font-bold text-lg mb-4">Price Summary</h2>

                            <div className="space-y-2 mb-6 border-b border-slate-100 pb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Outbound</span>
                                    <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: outbound.price.currency }).format(parseFloat(outbound.price.total))}</span>
                                </div>
                                {returnFlight && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Return</span>
                                        <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: outbound.price.currency }).format(parseFloat(returnFlight.price.total))}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-6">
                                <span className="text-slate-900 font-bold text-lg">Total</span>
                                <span className="text-2xl font-bold text-blue-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: outbound.price.currency }).format(totalPrice)}
                                </span>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/10"
                                onClick={() => router.push('/success')}
                            >
                                Confirm & Pay
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
