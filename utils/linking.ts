import * as Linking from 'expo-linking';
import { Coordinate } from './spatial';

export const createBeaconUrl = (coordinate: Coordinate, note?: string, floor?: string) => {
    const params = new URLSearchParams({
        lat: coordinate.latitude.toString(),
        lng: coordinate.longitude.toString(),
    });

    if (note) params.append('note', note);
    if (floor) params.append('floor', floor);

    return Linking.createURL('target', { queryParams: Object.fromEntries(params) });
};

export const parseBeaconUrl = (url: string) => {
    const { queryParams } = Linking.parse(url);

    if (!queryParams?.lat || !queryParams?.lng) return null;

    return {
        coordinate: {
            latitude: parseFloat(queryParams.lat as string),
            longitude: parseFloat(queryParams.lng as string),
        },
        note: queryParams.note as string | undefined,
        floor: queryParams.floor as string | undefined,
    };
};
