"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type SortOption =
    | "price_asc"
    | "price_desc"
    | "duration_asc"
    | "duration_desc"
    | "stops_asc"

interface SortControlsProps {
    value: SortOption
    onChange: (value: SortOption) => void
}

export function SortControls({ value, onChange }: SortControlsProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 whitespace-nowrap">Sort by:</span>
            <Select value={value} onValueChange={(val) => onChange(val as SortOption)}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="price_asc">Lowest Price</SelectItem>
                    <SelectItem value="price_desc">Highest Price</SelectItem>
                    <SelectItem value="duration_asc">Shortest Duration</SelectItem>
                    <SelectItem value="duration_desc">Longest Duration</SelectItem>
                    <SelectItem value="stops_asc">Direct / Fewest Stops</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
