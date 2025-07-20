import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';

console.log('📍 Loaded SearchScreen');

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (err) {
      console.warn('Failed to load recent searches');
    }
  };

  const saveSearchQuery = async (q) => {
    try {
      const existing = [q, ...recentSearches.filter(item => item !== q)];
      const trimmed = existing.slice(0, 10); // max 10
      setRecentSearches(trimmed);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(trimmed));
    } catch (err) {
      console.warn('Failed to save search query');
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (err) {
      console.warn('Could not clear recent searches');
    }
  };

  const performSearch = async (q) => {
    if (!q) return;
    Keyboard.dismiss();
    setLoading(true);
    setQuery(q);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/search?q=${encodeURIComponent(q)}`);
      setResults(res.data || []);
      saveSearchQuery(q);
    } catch (err) {
      console.warn('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Player', { video: item })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecent = ({ item }) => (
    <TouchableOpacity style={styles.recentItem} onPress={() => performSearch(item)}>
      <Text style={styles.recentText}> ↙ {item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <TextInput
        placeholder="Search NCERT concepts..."
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => performSearch(query)}
        style={styles.input}
        returnKeyType="search"
      />

      {loading && <ActivityIndicator color="#1a73e8" style={{ marginVertical: 20 }} />}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderVideo}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {!loading && results.length === 0 && (
        <View style={styles.recentWrap}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearBtn}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={recentSearches}
            renderItem={renderRecent}
            keyExtractor={(item, idx) => idx.toString()}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: StatusBar.currentHeight-50 || 14,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumb: {
    width: 110,
    height: 70,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    paddingTop: 6,
    paddingRight: 10,
  },
  recentWrap: {
    marginTop: 5,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearBtn: {
    color: '#aaa',
    fontSize: 13,
  },
  recentItem: {
    paddingVertical: 8,
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  recentText: {
    color: '#ccc',
    fontSize: 14,
  },
});
