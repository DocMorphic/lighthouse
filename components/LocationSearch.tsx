import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Text,
    FlatList,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { Search, MapPin, X, Bookmark, Share2, Star } from 'lucide-react-native';
import { Coordinate } from '../utils/spatial';

export interface FavoriteLocation {
    id: string;
    name: string;
    coordinate: Coordinate;
}

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationSearchProps {
    favorites: FavoriteLocation[];
    onLocationSelect: (location: Coordinate, name: string) => void;
    onFavorite: (location: Coordinate) => void;
    onShare: (location: Coordinate) => void;
    onRemoveFavorite: (id: string) => void;
    onCancel: () => void;
}

export function LocationSearch({
    favorites,
    onLocationSelect,
    onFavorite,
    onShare,
    onRemoveFavorite,
    onCancel
}: LocationSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchLocation = async () => {
        if (query.trim().length < 3) {
            setError('Enter at least 3 characters');
            return;
        }

        setLoading(true);
        setError(null);
        Keyboard.dismiss();

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                {
                    headers: {
                        'User-Agent': 'Lighthouse-App/1.0',
                    },
                }
            );
            const data: SearchResult[] = await response.json();

            if (data.length === 0) {
                setError('No locations found');
            }
            setResults(data);
        } catch (err) {
            setError('Search failed. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        onLocationSelect(
            {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
            },
            result.display_name.split(',')[0]
        );
    };

    const renderResult = ({ item, isFavorite }: { item: SearchResult | FavoriteLocation, isFavorite?: boolean }) => {
        const name = 'display_name' in item ? item.display_name.split(',')[0] : item.name;
        const address = 'display_name' in item ? item.display_name : `${item.coordinate.latitude.toFixed(5)}, ${item.coordinate.longitude.toFixed(5)}`;
        const coord = 'display_name' in item
            ? { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) }
            : item.coordinate;

        return (
            <View style={styles.resultItemContainer}>
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => onLocationSelect(coord, name)}
                >
                    {isFavorite ? <Star color="#facc15" size={20} fill="#facc15" /> : <MapPin color="#4ade80" size={20} />}
                    <View style={styles.resultTextContainer}>
                        <Text style={styles.resultName} numberOfLines={1}>{name}</Text>
                        <Text style={styles.resultAddress} numberOfLines={1}>{address}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(coord)}>
                        <Share2 color="#666" size={18} />
                    </TouchableOpacity>
                    {!isFavorite && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onFavorite(coord)}>
                            <Bookmark color="#666" size={18} />
                        </TouchableOpacity>
                    )}
                    {isFavorite && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onRemoveFavorite((item as FavoriteLocation).id)}>
                            <X color="#f87171" size={18} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Set Destination</Text>
                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                    <X color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
                <View style={styles.inputContainer}>
                    <Search color="#666" size={20} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search address or place..."
                        placeholderTextColor="#666"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={searchLocation}
                        returnKeyType="search"
                        autoFocus
                    />
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
                    <Text style={styles.searchButtonText}>Go</Text>
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {favorites.length > 0 && query.length < 3 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FAVORITES</Text>
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderResult({ item, isFavorite: true })}
                        scrollEnabled={false}
                    />
                </View>
            )}

            {results.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.place_id.toString()}
                        renderItem={({ item }) => renderResult({ item })}
                        scrollEnabled={false}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 40,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingVertical: 15,
        marginLeft: 10,
    },
    searchButton: {
        backgroundColor: '#4ade80',
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    loadingText: {
        color: '#666',
    },
    errorText: {
        color: '#f87171',
        textAlign: 'center',
        marginTop: 15,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        color: '#22d3ee',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
    },
    resultItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        marginBottom: 8,
        paddingRight: 8,
    },
    resultItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        gap: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        padding: 10,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultAddress: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
});
