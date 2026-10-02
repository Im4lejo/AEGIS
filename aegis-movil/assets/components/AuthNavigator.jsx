import Login from "./Login"
import Authenticator from "./AuthIndex"
import Register from "./Register"
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
export default function AuthNavigation({ isLogged, setLog }) {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login"  >
                {props => (
                    <Login
                        {...props}
                        isLogged={isLogged}
                        setLog={setLog}
                    />
                )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Auth">
                {props => (
                    <Authenticator
                        {...props}
                        setLog={setLog}
                    />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    )
}