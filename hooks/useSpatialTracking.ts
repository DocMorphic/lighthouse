import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { calculateBearing, calculateDistance, Coordinate } from '../utils/spatial';

export interface SpatialData {
    currentLocation: Coordinate | null;
    heading: number | null;
    headingAccuracy: number | null;
    gpsAccuracy: number | null;
    distance: number | null;
    bearing: number | null;
    error: string | null;
}

// Number of samples to average for GPS smoothing
const GPS_SAMPLE_SIZE = 5;
// Number of samples to average for heading smoothing
const HEADING_SAMPLE_SIZE = 8;

/**
 * Compute the circular mean of an array of angles (in degrees).
 * Uses atan2(mean(sin), mean(cos)) to handle the 0°/360° wraparound.
 */
function circularMean(angles: number[]): number {
    let sinSum = 0;
    let cosSum = 0;
    for (const a of angles) {
        const rad = (a * Math.PI) / 180;
        sinSum += Math.sin(rad);
        cosSum += Math.cos(rad);
    }
    const mean = (Math.atan2(sinSum / angles.length, cosSum / angles.length) * 180) / Math.PI;
    return (mean + 360) % 360;
}

export function useSpatialTracking(target: Coordinate | null): SpatialData {
    const [smoothedLocation, setSmoothedLocation] = useState<Coordinate | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [heading, setHeading] = useState<number | null>(null);
    const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Buffer for GPS smoothing (moving average)
    const locationBuffer = useRef<Coordinate[]>([]);
    // Buffer for heading smoothing (circular moving average)
    const headingBuffer = useRef<number[]>([]);

    useEffect(() => {
        let locationSub: Location.LocationSubscription | null = null;
        let headingSub: Location.LocationSubscription | null = null;

        (async () => {
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                setError('Location permission denied');
                return;
            }

            // Track location with smoothing
            locationSub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 500, // More frequent updates for smoother averaging
                    distanceInterval: 0, // Get all updates
                },
                (loc) => {
                    const newCoord: Coordinate = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };

                    // Add to buffer
                    locationBuffer.current.push(newCoord);

                    // Keep only last N samples
                    if (locationBuffer.current.length > GPS_SAMPLE_SIZE) {
                        locationBuffer.current.shift();
                    }

                    // Calculate smoothed position (moving average)
                    if (locationBuffer.current.length >= 2) {
                        const avgLat = locationBuffer.current.reduce((sum, c) => sum + c.latitude, 0) / locationBuffer.current.length;
                        const avgLng = locationBuffer.current.reduce((sum, c) => sum + c.longitude, 0) / locationBuffer.current.length;
                        setSmoothedLocation({ latitude: avgLat, longitude: avgLng });
                    } else {
                        setSmoothedLocation(newCoord);
                    }

                    setGpsAccuracy(loc.coords.accuracy ?? null);
                }
            );

            // Track heading (Compass) with smoothing
            headingSub = await Location.watchHeadingAsync((h) => {
                const rawHeading = h.trueHeading !== -1 ? h.trueHeading : h.magHeading;

                // Add to buffer
                headingBuffer.current.push(rawHeading);

                // Keep only last N samples
                if (headingBuffer.current.length > HEADING_SAMPLE_SIZE) {
                    headingBuffer.current.shift();
                }

                // Compute smoothed heading via circular mean
                const smoothed = circularMean(headingBuffer.current);
                setHeading(smoothed);
                setHeadingAccuracy(h.accuracy);
            });
        })();

        return () => {
            locationSub?.remove();
            headingSub?.remove();
        };
    }, []);

    const bearing = smoothedLocation && target ? calculateBearing(smoothedLocation, target) : null;
    let distance = smoothedLocation && target ? calculateDistance(smoothedLocation, target) : null;

    // Apply deadzone: if distance is less than GPS accuracy, treat as "arrived"
    if (distance !== null && gpsAccuracy !== null && distance < gpsAccuracy) {
        distance = 0;
    }

    return {
        currentLocation: smoothedLocation,
        heading,
        headingAccuracy,
        gpsAccuracy,
        distance,
        bearing,
        error,
    };
}
