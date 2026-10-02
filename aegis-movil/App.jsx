import { StatusBar } from 'expo-status-bar';
import { useEffect,useState } from 'react';

import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import BootSplash from "react-native-bootsplash";
import MainNavigator from './assets/components/MainNavigator';
export default function App() {
  const [isLogged, setLog] = useState(false);
  useEffect(() => {
    const init = async () => {
      // Simula carga de recursos
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await BootSplash.hide({ fade: true });
    };

    init();
  }, []);
  /*

   */

  return (
    < SafeAreaProvider >

      <SafeAreaView style={{ flex: 1 }}>
        <MainNavigator
          isLogged={isLogged}
          setLog={setLog}
        />
      </SafeAreaView>

    </SafeAreaProvider >


  );

}

const styles = StyleSheet.create({
  container: {

    display: "flex",
    backgroundColor: '#fff',

  },
});
