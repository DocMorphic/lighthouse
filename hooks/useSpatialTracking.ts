import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { calculateBearing, calculateDistance, Coordinate } from '../utils/spatial';

export interface SpatialData {
    currentLocation: Coordinate | null;
    heading: number | null;
    distance: number | null;
    bearing: number | null;
    error: string | null;
}

export function useSpatialTracking(target: Coordinate | null): SpatialData {
    const [location, setLocation] = useState<Coordinate | null>(null);
    const [heading, setHeading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let locationSub: Location.LocationSubscription | null = null;
        let headingSub: Location.LocationSubscription | null = null;

        (async () => {
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                setError('Location permission denied');
                return;
            }

            // Track location
            locationSub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (loc) => {
                    setLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                }
            );

            // Track heading (Compass)
            headingSub = await Location.watchHeadingAsync((h) => {
                setHeading(h.trueHeading !== -1 ? h.trueHeading : h.magHeading);
            });
        })();

        return () => {
            locationSub?.remove();
            headingSub?.remove();
        };
    }, []);

    const bearing = location && target ? calculateBearing(location, target) : null;
    const distance = location && target ? calculateDistance(location, target) : null;

    return {
        currentLocation: location,
        heading,
        distance,
        bearing,
        error,
    };
}
