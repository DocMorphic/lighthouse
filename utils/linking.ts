import * as Linking from 'expo-linking';

import { Coordinate } from './spatial';



export const createBeaconUrl = (coordinate: Coordinate, note?: string, floor?: string) => {

    const params = new URLSearchParams({

        lat: coordinate.latitude.toString(),

        lng: coordinate.longitude.toString(),

    });



    if (note) params.append('note', note);

    if (floor) params.append('floor', floor);



    const queryString = params.toString();



    // Use absolute creating of URL to avoid trailing slashes that confuse parsers

    const baseUrl = Linking.createURL('/');



    // We return the direct link.

    // If WhatsApp is still difficult, we suggest the user taps the link after sending.

    return `${baseUrl}?${queryString}`;

};



export const parseBeaconUrl = (url: string) => {

    // Robust search for query params in the URL string

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