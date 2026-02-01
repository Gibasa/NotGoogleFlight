"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { addDays, format, subDays } from "date-fns"
import { useMemo } from "react"

interface PriceChartProps {
    baseDate: Date
    basePrice: number
}

export function PriceChart({ baseDate, basePrice }: PriceChartProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleBarClick = (data: any) => {
        if (!data || !data.fullDate) return
        const date = data.fullDate

        const params = new URLSearchParams(searchParams.toString())
        params.set("date", date)
        router.push(`/search?${params.toString()}`)
    }

    const data = useMemo(() => {
        // Fix: Ensure baseDate is treated as a local date (00:00:00) to prevent timezone shifts
        // when formatting. If baseDate was created via new Date("YYYY-MM-DD"), it might be UTC.
        // We'll reconstruct it safely.
        const normalizedBaseDate = new Date(
            baseDate.getUTCFullYear(),
            baseDate.getUTCMonth(),
            baseDate.getUTCDate()
        )

        // Actually, the simpler way if the input is definitely a Date object from "YYYY-MM-DD"
        // is to check if we are shifting. 
        // Better approach: Work with the string directly if possible, but here we have a Date prop.
        // Let's assume the prop passed is "new Date(searchParamString)".
        // If string was "2025-02-01", Date is UTC.
        // In GMT-3, getDay() returns previous day.
        // So allow me to just parse the ISO string if available?
        // No, let's fix the Date object by treating it as if it's UTC parts are the Local parts.

        // This helper effectively adds the timezone offset back if it was stripped.
        // Or simpler: just use addDays on the UTC date? No, format() uses local.

        // We will create a date that is truly 00:00:00 CURRENT LOCAL TIME for the target Y/M/D.
        // Since we don't have the string here easily, we rely on the caller or fixes here.

        // Let's fix it by parsing the string representation of UTC.
        const isoString = baseDate.toISOString().split('T')[0]; // "2025-02-01"
        const [year, month, day] = isoString.split("-").map(Number);
        const localBaseDate = new Date(year, month - 1, day);

        // Generate mock trend data: -3 days to +3 days
        return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(subDays(localBaseDate, 3), i)
            // Randomize price slightly around basePrice
            const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
            const price = Math.round(basePrice * randomFactor)

            return {
                date: format(date, "EEE dd"),
                fullDate: format(date, "yyyy-MM-dd"),
                price,
                isCurrent: i === 3
            }
        })
    }, [baseDate, basePrice])

    return (
        <Card className="mb-6 shadow-sm border-slate-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-slate-700">Price Trends (Click to Search)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[250px] w-full p-4 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} className="cursor-pointer">
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Date
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].payload.fullDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Average
                                                        </span>
                                                        <span className="font-bold">
                                                            R$ {payload[0].value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="price" radius={[4, 4, 0, 0]} onClick={handleBarClick}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isCurrent ? "#4f46e5" : "#e2e8f0"}
                                        className="transition-all hover:opacity-80 cursor-pointer"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
