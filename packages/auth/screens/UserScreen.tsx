import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from 'app/theme';
import { ThemeSelector } from 'app/theme/ThemeSelector';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center", 
    position: 'relative',
    paddingTop: 60
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

export function UserScreen({ navigation }) {
  const theme = useTheme();
  
  const goToLogin = () => {
    navigation.navigate("Auth", { screen: "Login" });
  };
  
  const goToRegister = () => {
    navigation.navigate("Auth", { screen: "Register" });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <ThemeSelector />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: theme.primary}]}
          onPress={goToLogin}
        >
          <Text style={[styles.buttonText, {color: '#fff'}]}>登录</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 1,
            borderColor: theme.primary
          }]}
          onPress={goToRegister}
        >
          <Text style={[styles.buttonText, {color: theme.primary}]}>注册</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
