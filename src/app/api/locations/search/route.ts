import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken } from '@/lib/amadeus';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 1) {
        return NextResponse.json({ data: [] });
    }

    try {
        const token = await getAmadeusToken();
        const url = new URL('https://test.api.amadeus.com/v1/reference-data/locations');
        url.searchParams.append('subType', 'CITY,AIRPORT');
        url.searchParams.append('keyword', keyword);
        url.searchParams.append('view', 'LIGHT');
        url.searchParams.append('page[limit]', '20');

        const res = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            // If 404/empty, just return empty array
            if (res.status === 404) return NextResponse.json({ data: [] });

            const errorText = await res.text();
            console.error('Amadeus Locations API Error:', errorText);

            // Fallback for demo if API fails (avoid breaking UI)
            return NextResponse.json({ data: [] });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Location Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
