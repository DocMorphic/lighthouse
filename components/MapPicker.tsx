import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, X, Share2, Bookmark } from 'lucide-react-native';
import { Coordinate } from '../utils/spatial';
import * as Location from 'expo-location';

interface MapPickerProps {
    onLocationSelect: (location: Coordinate, name: string) => void;
    onShare: (location: Coordinate) => void;
    onFavorite: (location: Coordinate) => void;
    onCancel: () => void;
    initialLocation: Coordinate | null;
}

export function MapPicker({ onLocationSelect, onShare, onFavorite, onCancel, initialLocation }: MapPickerProps) {
    const webViewRef = useRef<WebView>(null);
    const [currentCoord, setCurrentCoord] = useState<Coordinate>(
        initialLocation || { latitude: 37.78825, longitude: -122.4324 }
    );
    const [mapReady, setMapReady] = useState(false);

    // Get current location if initialLocation is missing
    useEffect(() => {
        if (!initialLocation) {
            (async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    const newCoord = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };
                    setCurrentCoord(newCoord);
                    centerMap(newCoord.latitude, newCoord.longitude);
                }
            })();
        }
    }, [initialLocation]);

    const centerMap = (lat: number, lng: number) => {
        const js = `
            if (typeof map !== 'undefined') {
                map.setView([${lat}, ${lng}], 15);
            }
        `;
        webViewRef.current?.injectJavaScript(js);
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MOVE') {
                setCurrentCoord({
                    latitude: data.lat,
                    longitude: data.lng,
                });
            } else if (data.type === 'READY') {
                setMapReady(true);
                // If we already have a location, ensure it's centered
                if (currentCoord) {
                    centerMap(currentCoord.latitude, currentCoord.longitude);
                }
            }
        } catch (e) {
            console.error('Failed to parse message from WebView', e);
        }
    };

    const mapHtml = useMemo(() => {
        // Use the actual currentCoord for the initial HTML generation
        const startLat = currentCoord.latitude;
        const startLng = currentCoord.longitude;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                    body { margin: 0; padding: 0; background-color: #f0f0f0; }
                    #map { height: 100vh; width: 100vw; }
                    .leaflet-control-attribution { display: none !important; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    var map = L.map('map', {
                        zoomControl: false,
                        attributionControl: false
                    }).setView([${startLat}, ${startLng}], 15);

                    // Voyager theme - much more readable but still clean and premium
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                        maxZoom: 19
                    }).addTo(map);

                    map.on('move', function() {
                        var center = map.getCenter();
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'MOVE',
                            lat: center.lat,
                            lng: center.lng
                        }));
                    });

                    // Tell React Native we are ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));

                    document.addEventListener('DOMContentLoaded', function() {
                        setTimeout(() => map.invalidateSize(), 100);
                    });
                </script>
            </body>
            </html>
        `;
    }, []); // Still [] is fine because we coordinate with centerMap via JS injection

    const handleSelect = () => {
        onLocationSelect(currentCoord, 'Marked Location');
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                onMessage={handleMessage}
                style={styles.map}
                scrollEnabled={false} // The map handles its own gestures
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
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.sideButton, { backgroundColor: '#fff' }]}
                        onPress={() => onShare(currentCoord)}
                    >
                        <Share2 color="#000" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleSelect}>
                        <Text style={styles.confirmText}>SET TARGET</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sideButton, { backgroundColor: '#fff' }]}
                        onPress={() => onFavorite(currentCoord)}
                    >
                        <Bookmark color="#000" size={24} />
                    </TouchableOpacity>
                </View>
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
        marginTop: -40,
        marginLeft: -20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
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
        borderRadius: 20,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    sideButton: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
