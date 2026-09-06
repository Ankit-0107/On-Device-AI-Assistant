import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugOverlay({ stats }) {
  if (!stats) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.text}>TTFT: {stats.ttft ? `${stats.ttft}ms` : '--'}</Text>
      <Text style={styles.text}>Tok/s: {stats.toks ? stats.toks : '--'}</Text>
      <Text style={styles.text}>RAM: ~Est (Monitor in Studio)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    zIndex: 999,
  },
  text: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 10,
  }
});
