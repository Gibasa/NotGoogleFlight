"use client"

import * as React from "react"
import { Check, Plane, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

interface CityAutocompleteProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function CityAutocomplete({ value, onChange, placeholder = "Search city..." }: CityAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value || "")

    // Update input text if value prop changes externally (e.g. from URL)
    // Only if the user isn't actively searching (open) to avoid overwriting typing?
    // Actually, for a simple search form, sync is usually expected.
    // But since value is IATA and input is potentially Name, we have a disconnect if we don't have the dictionary.
    // For now, assume we just show the code or what comes in.
    React.useEffect(() => {
        if (value && !open) {
            setInputValue(value)
        }
    }, [value, open])

    const debouncedSearch = useDebounce(inputValue, 500)

    const { data: locations, isLoading } = useQuery({
        queryKey: ["locations", debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) return []
            const res = await fetch(`/api/locations/search?keyword=${debouncedSearch}`)
            if (!res.ok) throw new Error("Failed to fetch locations")
            const data = await res.json()
            return data.data || []
        },
        enabled: debouncedSearch.length >= 2,
    })

    const handleSelect = (iataCode: string, displayName: string) => {
        onChange(iataCode)
        setInputValue(displayName) // Show "City (IATA)" in input
        setOpen(false)
    }

    return (
        <div className="relative w-full group">
            <Command className="overflow-visible bg-transparent">
                <div className="flex items-center border-0 px-3 bg-transparent">
                    <Plane className="h-4 w-4 shrink-0 opacity-50 text-blue-500 mr-2" />
                    <CommandInput
                        placeholder={placeholder}
                        value={inputValue}
                        onValueChange={(val) => {
                            setInputValue(val)
                            if (!open && val.length > 0) setOpen(true)
                        }}
                        onFocus={() => {
                            if (inputValue.length >= 2) setOpen(true)
                        }}
                        onBlur={() => {
                            // Delay hide to allow click on item
                            setTimeout(() => setOpen(false), 200)
                        }}
                        className="flex-1 h-12 border-0 focus:ring-0 bg-transparent text-lg placeholder:text-slate-400 text-slate-900"
                    />
                </div>

                {open && inputValue.length >= 2 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-md border shadow-lg z-50 overflow-hidden">
                        <CommandList>
                            {isLoading && (
                                <div className="p-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                </div>
                            )}
                            {!isLoading && locations?.length === 0 && (
                                <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                                    No locations found.
                                </CommandEmpty>
                            )}
                            <CommandGroup>
                                {locations?.map((location: any) => (
                                    <CommandItem
                                        key={location.id}
                                        value={location.iataCode + " " + location.address?.cityName} // Searchable keys
                                        onSelect={() => handleSelect(location.iataCode, `${location.address?.cityName} (${location.iataCode})`)}
                                        className="cursor-pointer aria-selected:bg-slate-100"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === location.iataCode ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col text-left">
                                            <span className="font-medium">
                                                {location.address?.cityName} ({location.iataCode})
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {location.name}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    )
}
