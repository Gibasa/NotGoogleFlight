import { useQuery } from "@tanstack/react-query"
import { SearchResponse } from "@/types"

interface SearchParams {
    origin: string
    destination: string
    date: string
    returnDate?: string
    adults: string
}

async function fetchFlights(params: SearchParams): Promise<SearchResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "undefined") {
            searchParams.append(key, value)
        }
    })

    const query = searchParams.toString()
    const res = await fetch(`/api/flights/search?${query}`)

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to fetch flights")
    }

    return res.json()
}

export function useFlightSearch(params: SearchParams) {
    return useQuery({
        queryKey: ["flights", params],
        queryFn: () => fetchFlights(params),
        enabled: !!params.origin && !!params.destination && !!params.date,
        retry: 1,
    })
}
