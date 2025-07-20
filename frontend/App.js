import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AddVideoScreen from './screens/AddVideoScreen';
import SearchScreen from './screens/SearchScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Add Video' ? 'add-circle-outline' : 'home-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabbarbackgroundColor: '#000',

        tabBarStyle: {
          backgroundColor: '#000', // Overall tab bar background to black
          borderTopWidth: 0, // Remove the default top border line
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Video" component={AddVideoScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Pacifico: require('./assets/fonts/Pacifico-Regular.ttf'), // Make sure the font is in assets/fonts/
  });

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Player"
          component={VideoPlayerScreen}
          options={{
            title: 'Watch & Learn',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
