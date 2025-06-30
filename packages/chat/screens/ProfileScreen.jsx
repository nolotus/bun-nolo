// ProfileScreen.jsx
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useTheme } from 'app/theme';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    contentContainer: {
      flex: 1,
      marginTop: 40, // 给顶部ThemeSelector留出空间
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomWidth: 1,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 15,
    },
    userInfo: {
      flex: 1,
    },
    username: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    email: {
      fontSize: 14,
    },
    menuContainer: {
      marginTop: 30,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
    },
    menuText: {
      fontSize: 16,
      marginLeft: 10,
    },
    logoutButton: {
      marginTop: 40,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
  });
  
  
  export function ProfileScreen({ navigation }) {
    const theme = useTheme();
  
  
    const handleLogout = () => {
      navigation.navigate("User");
    };
  
  
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        
        <View style={styles.contentContainer}>
          <View style={[styles.header, {borderBottomColor: theme.border}]}>
            <Image 
              style={styles.avatar}
              source={{uri: 'https://via.placeholder.com/80'}}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.username, {color: theme.text}]}>用户名</Text>
              <Text style={[styles.email, {color: theme.textSecondary}]}>user@example.com</Text>
            </View>
          </View>
  
  
          <View style={styles.menuContainer}>
            <TouchableOpacity style={[styles.menuItem, {borderBottomColor: theme.border}]}>
              <Text style={[styles.menuText, {color: theme.text}]}>系统设置</Text>
            </TouchableOpacity>
  
  
            <TouchableOpacity style={[styles.menuItem, {borderBottomColor: theme.border}]}>
            onPress={() => navigation.navigate('Statistics')}// 添加导航('UserMain');
            <Text style={[styles.menuText, {color: theme.text}]}>账户统计</Text>
              
            </TouchableOpacity>
            
          </View>
  
  
          <TouchableOpacity 
            style={[styles.logoutButton, {backgroundColor: theme.error}]}
            onPress={handleLogout}
          >
            <Text style={{color: '#fff', fontSize: 16}}>退出登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  


