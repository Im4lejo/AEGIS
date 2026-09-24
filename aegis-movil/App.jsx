import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ProductosHor from './assets/components/ProductList';
import ProductosVer from './assets/components/ProductList2';
import BootSplash from "react-native-bootsplash";
import BottomBar from './assets/components/BottomBar';
import Login from './assets/components/Login';
export default function App() {

  useEffect(() => {
    const init = async () => {
      // Simula carga de recursos
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await BootSplash.hide({ fade: true });
    };
   
    init();
  }, []);
  /*
    < SafeAreaProvider >
      
      <SafeAreaView style={{ flex: 1 }}>
        <BottomBar />
      </SafeAreaView>
          
    </SafeAreaProvider >
   */

  return (
      <Login/>
      
  );

}

const styles = StyleSheet.create({
  container: {

    display: "flex",
    backgroundColor: '#fff',

  },
});
