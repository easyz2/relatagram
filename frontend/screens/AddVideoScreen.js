import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config';

console.log('📍 Loaded AddVideoScreen');

const extractYouTubeId = (urlOrId) => {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|.*[?&]v=))([\w-]{11})/;
  const match = urlOrId.match(regex);
  if (match && match[1]) return match[1];
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  return null;
};

export default function AddVideoScreen({ navigation }) {
  const [videoId, setVideoId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitVideo = async () => {
    const extractedId = extractYouTubeId(videoId.trim());

    if (!extractedId) {
      Alert.alert('Invalid Link', 'Could not extract a valid YouTube ID');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(API_CONFIG.BASE_URL, {
        videoId: extractedId,
        customTitle: customTitle || undefined,
      });
      Alert.alert('Success', 'Video added successfully!');
      setVideoId('');
      setCustomTitle('');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', 'Could not add video. Check video ID.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Text style={styles.label}>YouTube Link\ Video ID *</Text>
      <TextInput
        value={videoId}
        onChangeText={setVideoId}
        placeholder="e.g. https://youtu.be/dQw4w9WgXcQ"
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      <Text style={styles.label}>Custom Title (optional)</Text>
      <TextInput
        value={customTitle}
        onChangeText={setCustomTitle}
        placeholder="e.g. Amazing Science Video"
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, submitting && { backgroundColor: '#444' }]}
        onPress={submitVideo}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Adding...' : 'Add Video'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: StatusBar.currentHeight || 10,
    backgroundColor: '#000',
    flexGrow: 1,
  },
  label: {
    color: '#fff',
    marginTop : 20,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
