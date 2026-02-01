import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Share,
    Alert,
} from 'react-native';
import { X, Send, Share2 } from 'lucide-react-native';
import { Coordinate } from '../utils/spatial';
import { createBeaconUrl } from '../utils/linking';

interface ShareBeaconProps {
    location: Coordinate;
    onClose: () => void;
}

export function ShareBeacon({ location, onClose }: ShareBeaconProps) {
    const [note, setNote] = useState('');
    const [floor, setFloor] = useState('');

    const handleShare = async () => {
        const url = createBeaconUrl(location, note, floor);

        // Create a message that is helpful even without the app
        const message = `📍 Tactical Beacon\n\nTarget: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}\n` +
            (floor ? `🏢 Floor: ${floor}\n` : '') +
            (note ? `📝 Intel: ${note}\n` : '') +
            `\nOpen in Lighthouse: ${url}`;

        try {
            await Share.share({
                message,
                url, // iOS often uses this for AirDrop
            });
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Could not share beacon');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>DEPLOY BEACON</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Floor / Level (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 3rd Floor, Basement"
                    placeholderTextColor="#666"
                    value={floor}
                    onChangeText={setFloor}
                />

                <Text style={styles.label}>Tactical Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g. Door code 1234, Enter via alley"
                    placeholderTextColor="#666"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                />

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Share2 color="#000" size={20} />
                    <Text style={styles.shareButtonText}>SHARE COORDINATES</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    content: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#4ade80',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    closeButton: {
        padding: 5,
    },
    label: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        color: '#fff',
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4ade80',
        padding: 18,
        borderRadius: 12,
        gap: 10,
    },
    shareButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
