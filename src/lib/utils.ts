import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseDurationToMinutes(duration: string): number {
    // Format is PT1H, PT2H30M, PT45M
    let minutes = 0;
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
    if (minutesMatch) minutes += parseInt(minutesMatch[1]);

    return minutes;
}
