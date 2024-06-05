import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./Login";
import RegisterScreen from "./Register";
const AuthStack = createNativeStackNavigator();

export function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false, // 这会隐藏当前堆栈导航器的标题
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "登录", // 只在 LoginScreen 显示标题
        }}
      />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}
