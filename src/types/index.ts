export interface Flight {
    id: string;
    price: {
        currency: string;
        total: string;
        grandTotal: string;
    };
    itineraries: Itinerary[];
    validatingAirlineCodes: string[];
}

export interface Itinerary {
    duration: string;
    segments: Segment[];
}

export interface Segment {
    departure: {
        iataCode: string;
        at: string; // ISO 8601
        terminal?: string;
    };
    arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
    };
    carrierCode: string;
    number: string;
    aircraft: {
        code: string;
    };
    duration: string;
    numberOfStops: number;
}

export interface Dictionaries {
    locations: Record<string, any>;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
}

export interface SearchResponse {
    data: Flight[];
    dictionaries: Dictionaries;
    meta: {
        count: number;
    };
}
