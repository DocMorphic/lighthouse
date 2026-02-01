/**
 * Lighthouse Spatial Math Utility
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the bearing (azimuth) from point A to point B.
 * Returns value in degrees from 0-360.
 */
export function calculateBearing(start: Coordinate, end: Coordinate): number {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLn = (start.longitude * Math.PI) / 180;
  const endLat = (end.latitude * Math.PI) / 180;
  const endLn = (end.longitude * Math.PI) / 180;

  const y = Math.sin(endLn - startLn) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLn - startLn);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Calculates the distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistance(start: Coordinate, end: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (start.latitude * Math.PI) / 180;
  const φ2 = (end.latitude * Math.PI) / 180;
  const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
  const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Normalizes heading/bearing difference to [-180, 180]
 */
export function getRelativeAngle(heading: number, bearing: number): number {
  let diff = bearing - heading;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;
  return diff;
}
