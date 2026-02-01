import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken } from '@/lib/amadeus';
import { z } from 'zod';

const searchSchema = z.object({
    origin: z.string().length(3).regex(/^[A-Z]{3}$/),
    destination: z.string().length(3).regex(/^[A-Z]{3}$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    adults: z.string().regex(/^\d+$/).default("1"),
})

export async function GET(request: NextRequest) {
    adults: searchParams.get('adults') || undefined,
        }

const result = searchSchema.safeParse(rawParams);

if (!result.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: result.error.format() }, { status: 400 });
}

const { origin, destination, date, returnDate, adults } = result.data;

try {
    const token = await getAmadeusToken();
    const url = new URL('https://test.api.amadeus.com/v2/shopping/flight-offers');
    url.searchParams.append('originLocationCode', origin);
    url.searchParams.append('destinationLocationCode', destination);
    url.searchParams.append('departureDate', date);
    if (returnDate) {
        url.searchParams.append('returnDate', returnDate);
    }
    url.searchParams.append('adults', adults);
    url.searchParams.append('max', '20');
    url.searchParams.append('currencyCode', 'BRL');

    const res = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Amadeus API Error:', errorText);
        return NextResponse.json({ error: 'Failed to fetch flights from provider' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
} catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
    }
