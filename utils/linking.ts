import * as Linking from 'expo-linking';
import { Coordinate } from './spatial';

// The permanent Vercel URL from your deployment
const VERCEL_PROXY_URL = 'https://proxy-lighthouse123.vercel.app/';

export const createBeaconUrl = (coordinate: Coordinate, note?: string, floor?: string) => {
    const params = new URLSearchParams({
        lat: coordinate.latitude.toString(),
        lng: coordinate.longitude.toString(),
    });

    if (note) params.append('note', note);
    if (floor) params.append('floor', floor);

    const queryString = params.toString();

    // STANDALONE APK LINK: Uses your custom app scheme 'lighthouse://'
    // This ensures the link opens your standalone APK instead of Expo Go.
    const internalUrl = `lighthouse://beacon?${queryString}`;

    // Return the Vercel Proxy URL
    return `${VERCEL_PROXY_URL}?lat=${coordinate.latitude}&lng=${coordinate.longitude}&u=${encodeURIComponent(internalUrl)}`;
};

export const parseBeaconUrl = (url: string) => {
    let queryString = '';

    if (url.includes('lighthouse://')) {
        queryString = url.split('?')[1];
    } else if (url.includes('?')) {
        queryString = url.split('?')[1];
    } else if (url.includes('exp.host') || url.includes('expo.dev')) {
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