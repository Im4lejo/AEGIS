import Index from "./IndexNavigator"
import Authenticator from "./AuthNavigator"
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
export default function MainNavigation({ isLogged, setLog }) {
    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Authenticator" screenOptions={{ headerShown: false }} >
                <Stack.Screen name="Index" >
                    {props => (
                        <Index
                            {...props}
                            isLogged={isLogged}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="Authenticator" >
                    {props => (
                        <Authenticator
                            {...props}
                            isLogged={isLogged}
                            setLog={setLog}
                        />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    )
}