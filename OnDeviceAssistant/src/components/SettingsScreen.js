import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { loadModel } from '../services/LLMService';

export default function SettingsScreen({ onBackPress }) {
  const defaultPath = `${RNFS.DocumentDirectoryPath}/qwen2.5-1.5b-instruct-q4_k_m.gguf`;
  const [modelPath, setModelPath] = useState(defaultPath);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadModel = async () => {
    if (!modelPath.trim()) return;
    setIsLoading(true);
    try {
      // First check if file exists
      const exists = await RNFS.exists(modelPath.trim());
      if (!exists) {
        Alert.alert('File Not Found', `The file does not exist at:\n${modelPath.trim()}`);
        setIsLoading(false);
        return;
      }
      const stat = await RNFS.stat(modelPath.trim());
      Alert.alert('File Found', `Size: ${(stat.size / 1024 / 1024).toFixed(1)} MB\nNow loading into llama.cpp...`);
      await loadModel(modelPath.trim());
      Alert.alert('Success', 'Model verified and loaded successfully.');
    } catch (e) {
      Alert.alert('Load Error', `${e.name}: ${e.message}\n\nFull: ${JSON.stringify(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Back" onPress={onBackPress} />
        <Text style={styles.title}>Settings</Text>
        <View style={{width: 50}} /> 
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>Absolute path to .gguf model file:</Text>
        <TextInput
          style={styles.input}
          value={modelPath}
          onChangeText={setModelPath}
          placeholder="/storage/emulated/0/Download/model.gguf"
          placeholderTextColor="#999"
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Button title="Verify & Load Model" onPress={handleLoadModel} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 15, paddingTop: 40, backgroundColor: '#f5f5f5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { padding: 20 },
  label: { fontSize: 16, marginBottom: 10, fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 14, color: '#000' },
});
