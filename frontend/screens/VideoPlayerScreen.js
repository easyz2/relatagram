import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  Dimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import axios from 'axios';
import { API_CONFIG } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const isFocused = useIsFocused();

  const [timestampConcepts, setTimestampConcepts] = useState([]);
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [showRelevantConcepts, setShowRelevantConcepts] = useState(false);
  const [allVideos, setAllVideos] = useState([]);

  useEffect(() => {
    fetchTimestampConcepts(30);
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchAllVideos();
    }
  }, [isFocused]);

  const fetchAllVideos = async () => {
    try {
      const res = await axios.get(API_CONFIG.BASE_URL);
      setAllVideos(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch all videos');
    }
  };

  const fetchTimestampConcepts = async (ts) => {
    setLoadingConcepts(true);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/${video._id}/concepts?ts=${ts}`);
      setTimestampConcepts(res.data.concepts || []);
    } catch (err) {
      console.warn('Timestamped concepts unavailable');
    } finally {
      setLoadingConcepts(false);
    }
  };

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowRelevantConcepts(!showRelevantConcepts);
  };

  const extractChapterNumber = () => {
    const first = video.aiMappedConcepts?.[0] || '';
    const match = first.match(/Chapter\s+(\d+)/i);
    return match ? `Chapter ${match[1]}` : 'Chapter';
  };

  const moreFromChannel = allVideos.filter(
    (v) => v.channel === video.channel && v.videoId !== video.videoId
  );

  return (
    <ScrollView style={styles.container}>
      <YoutubePlayer height={210} play={false} videoId={video.videoId} />

      <Text style={styles.videoTitle}>{video.title}</Text>

      {/* Channel Info */}
      <View style={styles.channelRow}>
        {video.channelImage ? (
          <Image source={{ uri: video.channelImage }} style={styles.channelIcon} />
        ) : (
          <Ionicons name="person-circle-outline" size={26} color="#aaa" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.channelName}>{video.channel || 'Unknown Channel'}</Text>
      </View>

      {/* Grey Card with Chapter, Summary, and Concept */}
      <View style={styles.greyCard}>
        <Text style={styles.chapterText}>{extractChapterNumber()}</Text>

        {/* NEW: Display the AI-generated Title here */}
        {video.aiConceptTitle && (
          <Text style={styles.cardTitle}>{video.aiConceptTitle}</Text>
        )}
        {/* END NEW */}

        <Text style={styles.cardDescription}>
          {video.aiConceptSummary || 'Summary not available.'}
        </Text>

        {video.aiMappedConcepts?.[0] && (
          <View style={styles.chipInside}>
            <Text style={styles.chipText}>{video.aiMappedConcepts[0]}</Text>
          </View>
        )}
      </View>

      {/* Relevant Concepts Dropdown */}
      <TouchableOpacity style={styles.dropdownToggle} onPress={toggleDropdown}>
        <Text style={styles.dropdownTitle}>Relevant Concepts</Text>
        <Ionicons
          name={showRelevantConcepts ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      {showRelevantConcepts && (
        <View style={styles.card}>
          {loadingConcepts ? (
            <ActivityIndicator size="small" color="#888" style={{ marginTop: 10 }} />
          ) : timestampConcepts.length > 0 ? (
            timestampConcepts.map((tc, idx) => (
              <Text key={idx} style={styles.timestampedItem}>
                ⏱ {tc.timestamp}s – {tc.concept}
              </Text>
            ))
          ) : (
            <Text style={styles.timestampedItem}>No relevant concepts available.</Text>
          )}
        </View>
      )}

      {/* More Videos From This Channel (no title) */}
      {moreFromChannel.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moreRow}>
          {moreFromChannel.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => navigation.push('Player', { video: item })}
              style={styles.smallCard}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.smallThumb} />
              <Text style={styles.smallTitle} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 0,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  channelIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  channelName: {
    color: '#ccc',
    fontSize: 13,
  },
  greyCard: {
    backgroundColor: '#fffdfdff',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  chapterText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 4,
  },
  // NEW STYLE FOR THE TITLE
  cardTitle: {
    fontSize: 14, // Adjust font size as needed
    fontWeight: 'bold', // Make it bold
    color: '#333', // Darker color for prominence
    marginBottom: 8, // Space below the title
  },
  // END NEW STYLE
  cardDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  chipInside: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30,144,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 15,
  },
  chipText: {
    color: '#00bfff',
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dropdownTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    marginTop: 2,
  },
  timestampedItem: {
    fontSize: 13,
    color: '#ccc',
    paddingVertical: 2,
  },
  moreRow: {
    marginTop: 12,
    marginBottom: 30,
  },
  smallCard: {
    width: 270,
    marginRight: 12,
  },
  smallThumb: {
    width: '100%',
    height: 180,
    borderRadius: 6,
  },
  smallTitle: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 6,
  },
});