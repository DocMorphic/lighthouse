import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { MapPin, X } from 'lucide-react-native';
import { Coordinate } from '../utils/spatial';
import * as Location from 'expo-location';

interface MapPickerProps {
    onLocationSelect: (location: Coordinate, name: string) => void;
    onCancel: () => void;
    initialLocation: Coordinate | null;
}

export function MapPicker({ onLocationSelect, onCancel, initialLocation }: MapPickerProps) {
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region>({
        latitude: initialLocation?.latitude || 37.78825,
        longitude: initialLocation?.longitude || -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    });
    const [loading, setLoading] = useState(true);

    // If no initial location, try to get current location
    useEffect(() => {
        if (!initialLocation) {
            (async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    setRegion({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    });
                }
                setLoading(false);
            })();
        } else {
            setLoading(false);
        }
    }, []);

    const handleRegionChangeComplete = (newRegion: Region) => {
        setRegion(newRegion);
    };

    const handleSelect = () => {
        onLocationSelect(
            {
                latitude: region.latitude,
                longitude: region.longitude,
            },
            'Marked Location'
        );
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation
                showsMyLocationButton={false}
                userInterfaceStyle="dark"
            />

            {/* Fixed Center Pin */}
            <View style={styles.centerMarker}>
                <MapPin color="#ef4444" size={40} fill="#ef4444" />
                <View style={styles.pinShadow} />
            </View>

            {/* Header Overlay */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                    <X color="#000" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Drag map to position</Text>
            </View>

            {/* Footer Overlay */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleSelect}>
                    <Text style={styles.confirmText}>SET LOCATION</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    centerMarker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -40, // Half of icon size + offset
        marginLeft: -20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none', // Allow touches to pass through to map
    },
    pinShadow: {
        width: 10,
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 5,
        marginTop: 2,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    closeButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    confirmButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});
