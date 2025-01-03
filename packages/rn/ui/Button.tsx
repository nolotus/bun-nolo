import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { useTheme } from 'app/theme';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue
} from 'react-native-reanimated';

interface ButtonProps {
    variant?: 'primary' | 'secondary';
    status?: 'error';
    size?: 'small' | 'medium' | 'large';
    icon?: React.ReactNode;
    loading?: boolean;
    block?: boolean;
    disabled?: boolean;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

const Button = ({
    variant = 'primary',
    status,
    size = 'medium',
    icon,
    loading,
    disabled,
    block,
    style,
    onPress,
    children,
}: ButtonProps) => {
    const theme = useTheme();
    const scale = useSharedValue(1);

    const buttonType = status === 'error' ? 'danger' : variant;

    const styles = StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            overflow: 'hidden',
            opacity: disabled || loading ? 0.6 : 1,
            width: block ? '100%' : 'auto',
        },
        small: {
            height: 28,
            paddingHorizontal: 12,
        },
        medium: {
            height: 34,
            paddingHorizontal: 16,
        },
        large: {
            height: 42,
            paddingHorizontal: 24,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        text: {
            fontWeight: '500',
            fontSize: size === 'small' ? 13 : size === 'large' ? 15 : 14,
        },
        primary: {
            backgroundColor: theme.primary,
            shadowColor: theme.primaryGhost,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
        },
        secondary: {
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 1,
            borderColor: theme.border,
        },
        danger: {
            backgroundColor: theme.error,
            shadowColor: 'rgba(239, 68, 68, 0.2)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
        },
        primaryText: {
            color: 'white',
        },
        secondaryText: {
            color: theme.text,
        },
        dangerText: {
            color: 'white',
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(0.98);
        }
    };

    const handlePressOut = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(1);
        }
    };

    return (
        <Animated.View style={[animatedStyle, style]}>
            <Pressable
                onPress={disabled || loading ? undefined : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.button,
                    styles[size],
                    styles[buttonType],
                ]}
            >
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color={buttonType === 'secondary' ? theme.text : 'white'}
                        />
                    ) : (
                        <>
                            {icon}
                            <Text style={[
                                styles.text,
                                styles[`${buttonType}Text`]
                            ]}>
                                {children}
                            </Text>
                        </>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default Button;
