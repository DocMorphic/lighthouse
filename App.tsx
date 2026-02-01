import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { MapPin, Compass, Target, Search, Map as MapIcon, Share2, Sun, Moon } from 'lucide-react-native';
import { useSpatialTracking } from './hooks/useSpatialTracking';
import { getRelativeAngle, Coordinate } from './utils/spatial';
import { CompassNeedle } from './components/CompassNeedle';
import { LocationSearch } from './components/LocationSearch';
import { MapPicker } from './components/MapPicker';
import { ShareBeacon } from './components/ShareBeacon';
import { parseBeaconUrl } from './utils/linking';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [target, setTarget] = useState<Coordinate | null>(null);
  const [targetName, setTargetName] = useState<string | null>(null);
  const [targetIntel, setTargetIntel] = useState<{ note?: string; floor?: string }>({});
  const [showSearch, setShowSearch] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const { currentLocation, heading, headingAccuracy, gpsAccuracy, distance, bearing, error } = useSpatialTracking(target);
  const angleDiff = heading !== null && bearing !== null ? getRelativeAngle(heading, bearing) : null;

  // Theme Colors
  const colors = {
    bg: theme === 'dark' ? '#000000' : '#f8fafc',
    text: theme === 'dark' ? '#ffffff' : '#0f172a',
    subtext: theme === 'dark' ? '#94a3b8' : '#64748b',
    card: theme === 'dark' ? '#111111' : '#ffffff',
    border: theme === 'dark' ? '#333333' : '#e2e8f0',
    accent: theme === 'dark' ? '#fff' : '#000',
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // GPS Quality indicator
  const getGpsQuality = () => {
    if (!gpsAccuracy) return { label: 'NO SIGNAL', color: '#666' };
    if (gpsAccuracy <= 5) return { label: 'EXCELLENT', color: '#4ade80' };
    if (gpsAccuracy <= 10) return { label: 'GOOD', color: '#22d3ee' };
    if (gpsAccuracy <= 20) return { label: 'MODERATE', color: '#facc15' };
    return { label: 'POOR', color: '#f87171' };
  };
  const gpsQuality = getGpsQuality();

  // Haptic feedback loop when aligned
  useEffect(() => {
    if (angleDiff !== null && Math.abs(angleDiff) < 5) {
      const interval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [angleDiff]);

  const handleSetTarget = async () => {
    if (currentLocation) {
      setTarget(currentLocation);
      setTargetName('Marked Location');
      setTargetIntel({});
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Deep Link Handling
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const data = parseBeaconUrl(event.url);
      if (data) {
        setTarget(data.coordinate);
        setTargetName('Shared Beacon');
        setTargetIntel({ note: data.note, floor: data.floor });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    Linking.getInitialURL().then((url) => { if (url) handleUrl({ url }); });
    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  const handleLocationSelect = (location: Coordinate, name: string) => {
    setTarget(location);
    setTargetName(name);
    setTargetIntel({});
    setShowSearch(false);
    setShowMap(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearTarget = () => {
    setTarget(null);
    setTargetName(null);
    setTargetIntel({});
  };

  if (showSearch) return <LocationSearch onLocationSelect={handleLocationSelect} onCancel={() => setShowSearch(false)} />;
  if (showMap) return <MapPicker onLocationSelect={handleLocationSelect} onCancel={() => setShowMap(false)} initialLocation={currentLocation} />;
  if (showShare && currentLocation) return <ShareBeacon location={currentLocation} onClose={() => setShowShare(false)} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>

        {/* Header: Theme Toggle | Title | GPS Text */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            {theme === 'dark' ? <Sun color="#fcba03" size={24} /> : <Moon color="#64748b" size={24} />}
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>LIGHTHOUSE</Text>
            <Text style={styles.subtitle}>Find the PRECISE location</Text>
            {/* Explicit GPS Text Line */}
            <Text style={[styles.gpsText, { color: gpsQuality.color }]}>
              GPS: ±{gpsAccuracy?.toFixed(0) || '--'}m ({gpsQuality.label})
            </Text>
          </View>

          {/* Spacer to balance the Toggle button */}
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Compass color={colors.subtext} size={20} />
            <Text style={[styles.statValue, { color: colors.text }]}>{heading?.toFixed(0) || '--'}°</Text>
            <Text style={styles.statLabel}>Heading</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Target color={colors.subtext} size={20} />
            <Text style={[styles.statValue, { color: colors.text }]}>{bearing?.toFixed(0) || '--'}°</Text>
            <Text style={styles.statLabel}>Target Bearing</Text>
          </View>
        </View>

        <View style={styles.mainView}>
          {target ? (
            <View style={styles.infoBox}>
              <CompassNeedle angleDiff={angleDiff} size={200} theme={theme} />

              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>Distance to Target</Text>
                <Text style={[styles.distanceValue, { color: colors.text }]}>
                  {distance !== null ? (distance === 0 ? 'ARRIVED' : distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(1)} m`) : '--'}
                </Text>
              </View>

              {(targetIntel.floor || targetIntel.note) && (
                <View style={[styles.intelContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Text style={styles.intelTitle}>DESTINATION DETAILS</Text>
                  {targetIntel.floor && <Text style={[styles.intelText, { color: colors.text }]}>🏢 Floor/Unit: {targetIntel.floor}</Text>}
                  {targetIntel.note && <Text style={[styles.intelText, { color: colors.text }]}>📝 Note: {targetIntel.note}</Text>}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MapPin color={colors.subtext} size={48} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No destination set.{"\n"}Search for an address or mark your current spot.</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {target ? (
            <>
              <Text style={[styles.targetName, { color: colors.text }]}>{targetName}</Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleClearTarget}>
                <Text style={styles.secondaryButtonText}>Clear Target</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.accent, shadowColor: colors.accent }]} onPress={() => setShowSearch(true)}>
                <Search color={theme === 'dark' ? '#000' : '#fff'} size={20} />
                <Text style={[styles.buttonText, { color: theme === 'dark' ? '#000' : '#fff' }]}>SEARCH DESTINATION</Text>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.halfButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowMap(true)}>
                  <MapIcon color={colors.text} size={20} />
                  <Text style={[styles.halfButtonText, { color: colors.text }]}>PICK ON MAP</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.halfButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleSetTarget}>
                  <MapPin color={colors.text} size={20} />
                  <Text style={[styles.halfButtonText, { color: colors.text }]}>MARK HERE</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.utilityButton, { borderColor: colors.border }]} onPress={() => setShowShare(true)}>
                <Share2 color={colors.subtext} size={16} />
                <Text style={styles.utilityButtonText}>SHARE LOCATION</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    paddingTop: 10,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  gpsText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    width: '45%',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  mainView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoBox: {
    alignItems: 'center',
    width: '100%',
  },
  distanceContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  distanceLabel: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  distanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: -1,
    marginVertical: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 24,
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  targetName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    width: '100%',
  },
  halfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
  },
  halfButtonText: {
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1,
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  utilityButtonText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  intelContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  intelTitle: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  intelText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});
