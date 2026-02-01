"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FilterSidebarProps {
    maxPrice: number;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    stops: string[];
    setStops: (stops: string[]) => void;
    airlines: string[];
    setAirlines: (airlines: string[]) => void;
    availableAirlines: { code: string; name: string }[];
}

export function FilterSidebar({
    maxPrice,
    priceRange,
    setPriceRange,
    stops,
    setStops,
    airlines,
    setAirlines,
    availableAirlines,
}: FilterSidebarProps) {

    const handleStopChange = (stop: string) => {
        if (stops.includes(stop)) {
            setStops(stops.filter(s => s !== stop))
        } else {
            setStops([...stops, stop])
        }
    }

    const handleAirlineChange = (airline: string) => {
        if (airlines.includes(airline)) {
            setAirlines(airlines.filter(a => a !== airline))
        } else {
            setAirlines([...airlines, airline])
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-blue-100 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-blue-50">
                    <CardTitle className="text-base font-semibold text-blue-900">Stops</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="stop-0" checked={stops.includes("0")} onCheckedChange={() => handleStopChange("0")} className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                        <Label htmlFor="stop-0" className="text-slate-700">Direct</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="stop-1" checked={stops.includes("1")} onCheckedChange={() => handleStopChange("1")} className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                        <Label htmlFor="stop-1" className="text-slate-700">1 Stop</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="stop-2" checked={stops.includes("2+")} onCheckedChange={() => handleStopChange("2+")} className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                        <Label htmlFor="stop-2" className="text-slate-700">2+ Stops</Label>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-blue-50">
                    <CardTitle className="text-base font-semibold text-blue-900">Price Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Slider
                        value={[priceRange[0], priceRange[1]]}
                        min={0}
                        max={maxPrice}
                        step={50}
                        onValueChange={(val) => setPriceRange([val[0], val[1]])}
                        className="my-4"
                    />
                    <div className="flex items-center gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="min-price" className="text-xs text-blue-500">Min</Label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                                <Input
                                    id="min-price"
                                    type="number"
                                    min={0}
                                    max={priceRange[1]}
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const val = Math.min(Number(e.target.value), priceRange[1] - 50)
                                        setPriceRange([val, priceRange[1]])
                                    }}
                                    className="pl-6 h-8 text-sm border-blue-200 focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="max-price" className="text-xs text-blue-500">Max</Label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                                <Input
                                    id="max-price"
                                    type="number"
                                    min={priceRange[0]}
                                    max={maxPrice}
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const val = Math.max(Number(e.target.value), priceRange[0] + 50)
                                        setPriceRange([priceRange[0], val])
                                    }}
                                    className="pl-6 h-8 text-sm border-blue-200 focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-blue-50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-semibold text-blue-900">Airlines</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setAirlines([])}
                        >
                            Clear
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 max-h-[300px] overflow-y-auto">
                    {availableAirlines.map((airline) => (
                        <div key={airline.code} className="flex items-center space-x-2">
                            <Checkbox
                                id={`airline-${airline.code}`}
                                checked={airlines.includes(airline.code) || airlines.length === 0}
                                onCheckedChange={() => handleAirlineChange(airline.code)}
                                className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Label htmlFor={`airline-${airline.code}`} className="flex-1 truncate text-slate-700">
                                {airline.name}
                            </Label>
                        </div>
                    ))}
                    {availableAirlines.length === 0 && (
                        <p className="text-sm text-slate-400">No airlines available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
