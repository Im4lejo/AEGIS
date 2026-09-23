import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Productos from './ProductList';
import Inicio from "../screens/Inicio"
export default function BottomBar() {
    const Tab = createBottomTabNavigator();
    return (

        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {


                        let iconName;
                        if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Ajustes') iconName = focused ? 'settings' : 'settings-outline';
                        else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                        //return null; // Sin iconos por ahora
                    },
                    tabBarActiveTintColor: '#3b82f6',
                    tabBarInactiveTintColor: '#94a3b8',
                    headerShown: false, // Oculta el header por defecto
                })}
            >
                <Tab.Screen

                    name="Inicio"
                    component={Inicio}
                    options={{title: 'Inicio'}}
                />
                <Tab.Screen
                    name="Ajustes"
                    component={Productos}
                    options={{ title: 'Ajustes' }}
                />
                <Tab.Screen
                    name="Perfil"
                    component={Productos}
                    options={{ title: 'Perfil' }}
                />
            </Tab.Navigator>
        </NavigationContainer>

    )
}