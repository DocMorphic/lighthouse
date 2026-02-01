import * as Linking from 'expo-linking';
import { Coordinate } from './spatial';

// [NOTE]: Replace this with your actual Vercel URL after deployment
const VERCEL_PROXY_URL = 'https://proxy-lighthouse123.vercel.app/';

export const createBeaconUrl = (coordinate: Coordinate, note?: string, floor?: string) => {
    const params = new URLSearchParams({
        lat: coordinate.latitude.toString(),
        lng: coordinate.longitude.toString(),
    });

    if (note) params.append('note', note);
    if (floor) params.append('floor', floor);

    const queryString = params.toString();
    const internalUrl = `${Linking.createURL('/')}?${queryString}`;

    // Return the Vercel Proxy URL with the internal URL and coordinates as parameters
    // This ensures WhatsApp sees a standard HTTPS link.
    return `${VERCEL_PROXY_URL}/?lat=${coordinate.latitude}&lng=${coordinate.longitude}&u=${encodeURIComponent(internalUrl)}`;
};

export const parseBeaconUrl = (url: string) => {
    // Robust search for query params in the URL string
    let queryString = '';

    // Check if it's the Vercel proxy URL OR the direct deep link
    if (url.includes('?')) {
        queryString = url.split('?')[1];
    } else if (url.includes('exp.host') || url.includes('expo.dev')) {
        // Fallback for redirected URLs just in case
        const parts = url.split('/');
        queryString = parts[parts.length - 1];
    }

    if (!queryString) return null;

    const params = new URLSearchParams(queryString);
    const lat = params.get('lat');
    const lng = params.get('lng');

    if (!lat || !lng) return null;

    return {
        coordinate: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
        },
        note: params.get('note') || undefined,
        floor: params.get('floor') || undefined,
    };
};