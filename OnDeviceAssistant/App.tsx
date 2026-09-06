import React, { useState } from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import ChatScreen from './src/components/ChatScreen';
import SettingsScreen from './src/components/SettingsScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState('chat');

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff'}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#000' : '#fff'} />
      {currentScreen === 'chat' ? (
        <ChatScreen onSettingsPress={() => setCurrentScreen('settings')} />
      ) : (
        <SettingsScreen onBackPress={() => setCurrentScreen('chat')} />
      )}
    </SafeAreaView>
  );
}

export default App;
