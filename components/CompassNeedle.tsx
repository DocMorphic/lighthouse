import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Navigation } from 'lucide-react-native';

interface CompassNeedleProps {
    angleDiff: number | null;
    size?: number;
}

export function CompassNeedle({ angleDiff, size = 200 }: CompassNeedleProps) {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (angleDiff !== null) {
            Animated.spring(rotation, {
                toValue: angleDiff,
                useNativeDriver: true,
                damping: 15,
                stiffness: 100,
            }).start();
        }
    }, [angleDiff, rotation]);

    // Calculate color based on alignment
    const getColor = () => {
        if (angleDiff === null) return { ring: '#333', icon: '#fff' };
        const absAngle = Math.abs(angleDiff);
        if (absAngle < 15) return { ring: '#4ade80', icon: '#4ade80' }; // Green - aligned
        if (absAngle < 45) return { ring: '#facc15', icon: '#fff' }; // Yellow - getting closer
        return { ring: '#f87171', icon: '#fff' }; // Red - off course
    };
    const colors = getColor();

    const rotateInterpolation = rotation.interpolate({
        inputRange: [-180, 180],
        outputRange: ['-180deg', '180deg'],
    });

    return (
        <View style={styles.wrapper}>
            <View style={[styles.outerRing, {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: colors.ring,
                backgroundColor: colors.ring + '20',
            }]}>
                <View style={[styles.innerRing, {
                    width: size * 0.7,
                    height: size * 0.7,
                    borderRadius: size * 0.35
                }]}>
                    <Animated.View style={[
                        styles.needleContainer,
                        { transform: [{ rotate: rotateInterpolation }] }
                    ]}>
                        <Navigation
                            color={colors.icon}
                            size={size * 0.3}
                            strokeWidth={2}
                            style={{ transform: [{ rotate: '-45deg' }] }}
                        />
                    </Animated.View>
                </View>
            </View>
            {/* North indicator */}
            <View style={[styles.directionMarker, { top: -10 }]}>
                <View style={[styles.markerDot, { backgroundColor: colors.ring }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    outerRing: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    innerRing: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
    },
    needleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    directionMarker: {
        position: 'absolute',
        alignItems: 'center',
    },
    markerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
