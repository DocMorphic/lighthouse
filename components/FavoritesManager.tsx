import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { X, Trash2, MapPin, Navigation, Star, Share2 } from 'lucide-react-native';
import { FavoriteLocation } from './LocationSearch';
import { Coordinate } from '../utils/spatial';

interface FavoritesManagerProps {
    favorites: FavoriteLocation[];
    onSelect: (location: Coordinate, name: string) => void;
    onShare: (location: Coordinate) => void;
    onRemove: (id: string) => void;
    onClearAll: () => void;
    onClose: () => void;
}

export function FavoritesManager({ favorites, onSelect, onShare, onRemove, onClearAll, onClose }: FavoritesManagerProps) {
    const handleClearAll = () => {
        Alert.alert(
            "Clear All Favorites",
            "Are you sure you want to delete all saved locations? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete All", style: "destructive", onPress: onClearAll }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Your Favorites</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                {favorites.length > 0 ? (
                    <>
                        <FlatList
                            data={favorites}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <View style={styles.favItem}>
                                    <View style={styles.favInfo}>
                                        <View style={styles.iconBox}>
                                            <Star color="#facc15" size={20} fill="#facc15" />
                                        </View>
                                        <View style={styles.textDetails}>
                                            <Text style={styles.favName}>{item.name}</Text>
                                            <Text style={styles.favCoords}>
                                                {item.coordinate.latitude.toFixed(5)}, {item.coordinate.longitude.toFixed(5)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.favActions}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => onShare(item.coordinate)}
                                        >
                                            <Share2 color="#666" size={20} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => onSelect(item.coordinate, item.name)}
                                        >
                                            <Navigation color="#22d3ee" size={20} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => onRemove(item.id)}
                                        >
                                            <Trash2 color="#f87171" size={20} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
                            <Trash2 color="#f87171" size={16} />
                            <Text style={styles.clearAllText}>CLEAR ALL FAVORITES</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Star color="#333" size={64} />
                        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                        <Text style={styles.emptyText}>Save locations from search or map to see them here.</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#111',
        borderRadius: 20,
    },
    listContent: {
        padding: 20,
        gap: 12,
    },
    favItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    favInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textDetails: {
        flex: 1,
    },
    favName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    favCoords: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    favActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 10,
        backgroundColor: '#000',
        borderRadius: 12,
    },
    clearAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: '#f8717133',
        borderRadius: 16,
    },
    clearAllText: {
        color: '#f87171',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
});
