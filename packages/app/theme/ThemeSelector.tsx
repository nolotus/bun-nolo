import { useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, setDarkMode, selectIsDark } from 'app/theme/themeSlice';
import { StyleSheet, Text, TouchableOpacity, View, Modal, Animated } from "react-native";
import { useTheme } from 'app/theme';

const styles = StyleSheet.create({

    themeControls: {
      position: 'absolute',
      right: 16,
      top: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      gap: 4
    },
    darkModeSwitch: {
      width: 56,
      height: 28,
      borderRadius: 14,
      padding: 2,
      justifyContent: 'center',
    },
    switchKnob: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fff',
      position: 'absolute',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      position: 'absolute',
      top: 60,
      right: 16,
      width: 280,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    themeOption: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 6,
    },
    colorPreview: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 8,
    },
    buttonContainer: {
      width: '85%',
      marginTop: 40,
      gap: 16
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500'
    }
  });
  
export const ThemeSelector = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDark = useSelector(selectIsDark);
    const switchAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
    
    const themes = [
      { value: 'blue', color: '#0062ff', label: '深空蓝' },
      { value: 'purple', color: '#6B46C1', label: '皇室紫' },
      { value: 'green', color: '#059669', label: '翡翠绿' },
      { value: 'orange', color: '#F97316', label: '日落橙' },
      { value: 'red', color: '#DC2626', label: '中国红' },
      { value: 'yellow', color: '#FBBF24', label: '向日黄' },
      { value: 'graphite', color: '#4B5563', label: '石墨灰' },
      { value: 'pink', color: '#EC4899', label: '浪漫粉' },
    ];
  
    const toggleDarkMode = () => {
      Animated.spring(switchAnim, {
        toValue: isDark ? 0 : 1,
        useNativeDriver: true,
      }).start();
      dispatch(setDarkMode(!isDark));
    };
  
    const handleThemeSelect = (value:string) => {
      dispatch(setTheme(value));
      setModalVisible(false);
    };
  
    return (
      <>
        <View style={styles.themeControls}>
          <TouchableOpacity
            style={[styles.themeButton, {
              backgroundColor: theme.backgroundSecondary
            }]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={{color: theme.text}}>切换主题</Text>
            <Icon 
              name={modalVisible ? "arrow-drop-up" : "arrow-drop-down"} 
              size={24} 
              color={theme.text}
            />
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[
              styles.darkModeSwitch,
              {
                backgroundColor: isDark ? '#666' : '#f0f0f0',
              }
            ]}
            onPress={toggleDarkMode}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.switchKnob,
                {
                  transform: [{
                    translateX: switchAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, 30]
                    })
                  }]
                }
              ]}
            >
              <Icon
                name={isDark ? "nights-stay" : "wb-sunny"}
                size={16}
                color={isDark ? "#666" : "#ffd700"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
  
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="fade"
        >
          <TouchableOpacity 
            style={{flex: 1}}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View 
              style={[
                styles.modalContent,
                { backgroundColor: theme.background }
              ]}
            >
              <View style={styles.themeGrid}>
                {themes.map(({ value, color, label }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        borderWidth: theme.themeName === value ? 2 : 0,
                        borderColor: color,
                      }
                    ]}
                    onPress={() => handleThemeSelect(value)}
                  >
                    <View style={[styles.colorPreview, { backgroundColor: color }]} />
                    <Text style={{ color: theme.text }}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };