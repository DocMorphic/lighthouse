import * as Linking from 'expo-linking';
import { Coordinate } from './spatial';

// The permanent Vercel URL from your deployment
const VERCEL_PROXY_URL = 'https://proxy-lighthouse-j7buxdu2e-dharmays-projects.vercel.app';

export const createBeaconUrl = (coordinate: Coordinate, note?: string, floor?: string) => {
    const params = new URLSearchParams({
        lat: coordinate.latitude.toString(),
        lng: coordinate.longitude.toString(),
    });

    if (note) params.append('note', note);
    if (floor) params.append('floor', floor);

    const queryString = params.toString();

    // PERMANENT LINK: Points to your published EAS update
    // This works even when your local computer/tunnel is turned off.
    const internalUrl = `exp://u.expo.dev/e5c1f5d1-f873-4748-8f33-c62e3ec4020c?channel-name=production&${queryString}`;

    // Return the Vercel Proxy URL
    return `${VERCEL_PROXY_URL}/?lat=${coordinate.latitude}&lng=${coordinate.longitude}&u=${encodeURIComponent(internalUrl)}`;
};

export const parseBeaconUrl = (url: string) => {
    let queryString = '';

    if (url.includes('?')) {
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