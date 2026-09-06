import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { generateStream } from '../services/LLMService';
import DebugOverlay from './DebugOverlay';

export default function ChatScreen({ onSettingsPress }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState(null);

  const sendMessage = () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsGenerating(true);
    setStats(null);

    let assistantMessage = { role: 'assistant', content: '' };
    setMessages([...newHistory, assistantMessage]);

    generateStream(
      userMessage.content,
      newHistory,
      (token) => {
        assistantMessage.content += token;
        setMessages([...newHistory, { ...assistantMessage }]);
      },
      (newStats) => {
        setStats(newStats);
      },
      (finalText) => {
        setIsGenerating(false);
      },
      (error) => {
        assistantMessage.content += `\n[Error: ${error.message}]`;
        setMessages([...newHistory, { ...assistantMessage }]);
        setIsGenerating(false);
      }
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DebugOverlay stats={stats} />
      
      <View style={styles.header}>
        <Text style={styles.title}>On-Device AI</Text>
        <Button title="Settings" onPress={onSettingsPress} />
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((msg, idx) => (
          <View key={idx} style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
            <Text style={msg.role === 'user' ? styles.userText : styles.botText}>
              {msg.content}
            </Text>
          </View>
        ))}
        {isGenerating && <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          editable={!isGenerating}
        />
        <Button title="Send" onPress={sendMessage} disabled={isGenerating || !input.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 15, paddingTop: 40, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  chatArea: { flex: 1 },
  chatContent: { padding: 15 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF', padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  userText: { color: '#fff', fontSize: 16 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#e5e5ea', padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  botText: { color: '#000', fontSize: 16 },
  loading: { alignSelf: 'flex-start', margin: 10 },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, color: '#000', fontSize: 16 },
});
