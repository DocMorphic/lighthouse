import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Navigation } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

interface CompassNeedleProps {
    angleDiff: number | null;
    size?: number;
}

// Helper to calculate SVG path for an arc
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", x, y,
        "Z"
    ].join(" ");
    return d;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

export function CompassNeedle({ angleDiff, size = 200 }: CompassNeedleProps) {
    const rotation = useRef(new Animated.Value(0)).current;

    // Animate rotation
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

    // Calculate colors
    const getColor = () => {
        if (angleDiff === null) return { ring: '#333', icon: '#fff', arc: 'transparent' };
        const absAngle = Math.abs(angleDiff);
        if (absAngle < 15) return { ring: '#4ade80', icon: '#4ade80', arc: 'rgba(74, 222, 128, 0.3)' }; // Green
        if (absAngle < 45) return { ring: '#facc15', icon: '#fff', arc: 'rgba(250, 204, 21, 0.3)' }; // Yellow
        return { ring: '#f87171', icon: '#fff', arc: 'rgba(248, 113, 113, 0.3)' }; // Red
    };
    const colors = getColor();

    const rotateInterpolation = rotation.interpolate({
        inputRange: [-180, 180],
        outputRange: ['-180deg', '180deg'],
    });

    // Arc Logic
    const arcRadius = size / 2 - 4; // Inside the ring
    const center = size / 2;
    const currentAngle = angleDiff || 0;

    let arcPath = "";
    if (Math.abs(currentAngle) > 2) {
        // We limit the arc to +/- 179.9 degrees to strictly stay within the circle's bounds without collapsing
        if (currentAngle > 0) {
            arcPath = describeArc(center, center, arcRadius, 0, Math.min(currentAngle, 179.9));
        } else {
            arcPath = describeArc(center, center, arcRadius, Math.max(currentAngle, -179.9), 0);
        }
    }

    return (
        <View style={styles.wrapper}>
            {/* Background Arc Layer */}
            <View style={{ position: 'absolute' }}>
                <Svg height={size} width={size}>
                    <Path d={arcPath} fill={colors.arc} />
                </Svg>
            </View>

            <View style={[styles.outerRing, {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: colors.ring,
                backgroundColor: 'transparent',
            }]}>
                {/* Inner Hub */}
                <View style={[styles.innerRing, {
                    width: size * 0.2,
                    height: size * 0.2,
                    borderRadius: size * 0.1,
                    zIndex: 20
                }]} />

                {/* Rotatable Needle */}
                <Animated.View style={[
                    styles.needleLayer,
                    { width: size, height: size },
                    { transform: [{ rotate: rotateInterpolation }] }
                ]}>
                    {/* The Arrow itself */}
                    <View style={{ position: 'absolute', top: size * 0.15 }}>
                        <Navigation
                            color={colors.icon}
                            size={size * 0.25}
                            strokeWidth={3}
                            style={{ transform: [{ rotate: '-45deg' }] }}
                        />
                    </View>

                    {/* Connection Line */}
                    <View style={[styles.needleLine, { height: size * 0.35, backgroundColor: colors.icon }]} />
                </Animated.View>
            </View>

            {/* Static North Indicator (Top of Phone aka Forward) */}
            <View style={[styles.directionMarker, { top: -12 }]}>
                <View style={[styles.markerTriangle, { borderBottomColor: colors.ring }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: 20,
        marginBottom: 20,
    },
    outerRing: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
    },
    innerRing: {
        backgroundColor: '#1a1a1a',
        borderWidth: 2,
        borderColor: '#333',
        position: 'absolute',
    },
    needleLayer: {
        alignItems: 'center',
        justifyContent: 'flex-start', // Align to top
        position: 'absolute',
    },
    needleLine: {
        width: 2,
        marginTop: 5,
        borderRadius: 1,
    },
    directionMarker: {
        position: 'absolute',
        alignItems: 'center',
    },
    markerTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
});
