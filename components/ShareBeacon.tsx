import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Share,
    Alert,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import { X, Share2, MapPin } from 'lucide-react-native';
import { Coordinate } from '../utils/spatial';
import { createBeaconUrl } from '../utils/linking';

interface ShareBeaconProps {
    location: Coordinate;
    onClose: () => void;
}

export function ShareBeacon({ location, onClose }: ShareBeaconProps) {
    const [note, setNote] = useState('');
    const [floor, setFloor] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onShow = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const onHide = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            onShow.remove();
            onHide.remove();
        };
    }, []);

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
        <View style={styles.overlay}>
            {/* Transparent backdrop needed to catch taps outside */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            {/* Manual Keyboard Spacer - Pushes the content up */}
            <View style={[styles.sheetContainer, { marginBottom: keyboardHeight }]}>
                <View style={styles.handle} />

                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Share Location</Text>
                        <Text style={styles.subtitle}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X color="#666" size={24} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Floor / Unit (Optional)</Text>
                        <View style={styles.inputWrapper}>
                            <MapPin color="#444" size={16} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 3rd Floor, Apt 4B"
                                placeholderTextColor="#444"
                                value={floor}
                                onChangeText={setFloor}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Additional Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="e.g. Gate code, entrance details..."
                            placeholderTextColor="#444"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Share2 color="#000" size={20} />
                    <Text style={styles.shareButtonText}>SHARE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    sheetContainer: {
        backgroundColor: '#0a0a0a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
        maxHeight: '90%',
        width: '100%',
    },
    handle: {
        width: 40,
        height: 1,
        backgroundColor: '#333',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#666',
        fontSize: 12,
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingVertical: 15,
        fontSize: 16,
    },
    textArea: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 15,
        minHeight: 100,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginTop: 10,
    },
    shareButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
