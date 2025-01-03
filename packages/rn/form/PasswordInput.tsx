import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'app/theme';
import Icon from "react-native-vector-icons/Ionicons";
import { Control, Controller } from 'react-hook-form';

interface PasswordInputProps extends React.ComponentProps<typeof TextInput> {
    icon?: React.ReactNode;
    error?: boolean;
    control?: Control<any>;
    name?: string;
}

const PasswordInput = ({
    icon,
    error,
    style,
    control,
    name,
    ...props
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();

    const styles = StyleSheet.create({
        wrapper: {
            position: 'relative',
            width: '100%',
        },
        input: {
            width: '100%',
            height: 42,
            paddingHorizontal: icon ? 42 : 12,
            paddingRight: 42,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? theme.error : theme.border,
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
            backgroundColor: theme.background,
            fontFamily: '-apple-system',
        },
        leftIconContainer: {
            position: 'absolute',
            left: 12,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        toggleButton: {
            position: 'absolute',
            right: 8,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 8,
        }
    });

    const renderInput = ({ field: { onChange, onBlur, value } = {} } = {}) => (
        <View style={styles.wrapper}>
            {icon && (
                <View style={styles.leftIconContainer}>
                    {icon}
                </View>
            )}
            <TextInput
                {...props}
                style={[styles.input, style]}
                secureTextEntry={!showPassword}
                placeholderTextColor={theme.textSecondary}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
            />
            <Pressable
                style={styles.toggleButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
            >
                <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                />
            </Pressable>
        </View>
    );

    if (control && name) {
        return (
            <Controller
                control={control}
                name={name}
                render={renderInput}
            />
        );
    }

    return renderInput();
};

export default PasswordInput;
