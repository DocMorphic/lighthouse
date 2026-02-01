import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import { Navigation } from 'lucide-react-native';

interface CompassNeedleProps {
    angleDiff: number | null; // Difference between heading and bearing
    size?: number;
}

export function CompassNeedle({ angleDiff, size = 200 }: CompassNeedleProps) {
    // Animate the rotation smoothly
    const rotation = useDerivedValue(() => {
        if (angleDiff === null) return 0;
        return withSpring(angleDiff, {
            damping: 20,
            stiffness: 90,
            mass: 0.5,
        });
    }, [angleDiff]);

    // Color interpolation based on alignment (0° = green, 180° = red)
    const colorProgress = useDerivedValue(() => {
        if (angleDiff === null) return 1;
        // Normalize to 0-1 where 0 = aligned, 1 = opposite direction
        return Math.min(Math.abs(angleDiff) / 90, 1);
    }, [angleDiff]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            colorProgress.value,
            [0, 0.3, 1],
            ['rgba(74, 222, 128, 0.2)', 'rgba(250, 204, 21, 0.2)', 'rgba(248, 113, 113, 0.2)']
        );
        const borderColor = interpolateColor(
            colorProgress.value,
            [0, 0.3, 1],
            ['#4ade80', '#facc15', '#f87171']
        );
        return {
            backgroundColor,
            borderColor,
        };
    });

    const iconColor = angleDiff !== null && Math.abs(angleDiff) < 15 ? '#4ade80' : '#fff';

    return (
        <View style={styles.wrapper}>
            <Animated.View style={[styles.outerRing, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
                <View style={[styles.innerRing, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
                    <Animated.View style={[styles.needleContainer, animatedStyle]}>
                        <Navigation
                            color={iconColor}
                            size={size * 0.3}
                            strokeWidth={2}
                            style={{ transform: [{ rotate: '-45deg' }] }}
                        />
                    </Animated.View>
                </View>
            </Animated.View>
            {/* Direction indicators */}
            <View style={[styles.directionMarker, styles.markerTop, { top: -10 }]}>
                <View style={styles.markerDot} />
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
    markerTop: {},
    markerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ade80',
    },
});
