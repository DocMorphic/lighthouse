import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Bookmark, X } from 'lucide-react-native';
import { Coordinate } from '../utils/spatial';

interface FavoriteModalProps {
    visible: boolean;
    location: Coordinate;
    onSave: (name: string, location: Coordinate) => void;
    onCancel: () => void;
}

export function FavoriteModal({ visible, location, onSave, onCancel }: FavoriteModalProps) {
    const [name, setName] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), location);
            setName('');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.content}>
                                <View style={styles.header}>
                                    <View style={styles.iconBox}>
                                        <Bookmark color="#22d3ee" size={24} />
                                    </View>
                                    <Text style={styles.title}>Save to Favorites</Text>
                                    <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                                        <X color="#666" size={20} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.subtitle}>
                                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>LOCATION NAME</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. Secret Meetup Spot, Home..."
                                        placeholderTextColor="#444"
                                        value={name}
                                        onChangeText={setName}
                                        autoFocus
                                        returnKeyType="done"
                                        onSubmitEditing={handleSave}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
                                    onPress={handleSave}
                                    disabled={!name.trim()}
                                >
                                    <Text style={styles.saveButtonText}>SAVE FAVORITE</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#222',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    subtitle: {
        color: '#666',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 24,
        marginLeft: 52,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: '#22d3ee',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#000',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        color: '#fff',
        padding: 16,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
});
