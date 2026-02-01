"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plane, Home } from "lucide-react"

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />

            <div className="relative z-10 max-w-md w-full animate-in zoom-in-95 duration-500">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Bon Voyage!</h1>
                    <p className="text-slate-400 mb-8">
                        Your booking has been confirmed. Get ready for your next adventure!
                    </p>

                    <div className="space-y-3">
                        <Button asChild className="w-full h-12 bg-white text-slate-900 hover:bg-slate-200 font-bold">
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" /> Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-12 opacity-20 animate-pulse hidden">
                    <Plane className="w-32 h-32 text-white mx-auto transform -rotate-45" />
                </div>
            </div>
        </div>
    )
}
