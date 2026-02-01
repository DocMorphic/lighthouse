import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MapPin, Compass, Target } from 'lucide-react-native';
import { useSpatialTracking } from './hooks/useSpatialTracking';
import { getRelativeAngle, Coordinate } from './utils/spatial';

export default function App() {
  const [target, setTarget] = useState<Coordinate | null>(null);
  const { currentLocation, heading, distance, bearing, error } = useSpatialTracking(target);

  // Haptic feedback loop when aligned
  useEffect(() => {
    if (heading !== null && bearing !== null && target) {
      const relAngle = Math.abs(getRelativeAngle(heading, bearing));
      if (relAngle < 10) {
        // Only vibrate if we are pointing almost directly at it
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [heading, bearing, target]);

  const handleSetTarget = () => {
    if (currentLocation) {
      setTarget(currentLocation);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LIGHTHOUSE</Text>
        <Text style={styles.subtitle}>Tactical Navigation</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Compass color="#fff" size={24} />
          <Text style={styles.statValue}>{heading?.toFixed(0) || '--'}°</Text>
          <Text style={styles.statLabel}>Heading</Text>
        </View>
        <View style={styles.statBox}>
          <Target color="#fff" size={24} />
          <Text style={styles.statValue}>{bearing?.toFixed(0) || '--'}°</Text>
          <Text style={styles.statLabel}>Target Bearing</Text>
        </View>
      </View>

      <View style={styles.mainView}>
        {target ? (
          <View style={styles.infoBox}>
            <Text style={styles.distanceLabel}>Distance to Target</Text>
            <Text style={styles.distanceValue}>
              {distance ? (distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(1)} m`) : '--'}
            </Text>
            <View style={styles.alignmentStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: heading && bearing && Math.abs(getRelativeAngle(heading, bearing)) < 15 ? '#4ade80' : '#f87171' }
                ]}
              />
              <Text style={styles.statusText}>
                {heading && bearing && Math.abs(getRelativeAngle(heading, bearing)) < 15 ? 'ALIGNED' : 'OFF COURSE'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin color="#666" size={48} />
            <Text style={styles.emptyText}>No target set. Walk to a spot and tap the button below to mark your "Home".</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSetTarget}>
          <Text style={styles.buttonText}>{target ? 'RESET TARGET' : 'SET CURRENT AS TARGET'}</Text>
        </TouchableOpacity>

        {target && (
          <Text style={styles.coordText}>
            Target: {target.latitude.toFixed(4)}, {target.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 12,
    width: '45%',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: '#666',
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
  },
  distanceLabel: {
    color: '#666',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  distanceValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  alignmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  coordText: {
    color: '#333',
    fontSize: 10,
    marginTop: 15,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
  }
});
