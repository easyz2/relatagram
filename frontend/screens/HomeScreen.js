import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
  SafeAreaView,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(API_CONFIG.BASE_URL);
      const all = res.data;
      setVideos(all);
      const shuffled = [...all].sort(() => Math.random() - 0.5);
      setFeaturedVideos(shuffled.slice(0, 5));
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchVideos);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredVideos.length > 0) {
        const nextIndex = (carouselIndex + 1) % featuredVideos.length;
        setCarouselIndex(nextIndex);
        carouselRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselIndex, featuredVideos]);

  const groupedByChannel = () => {
    const grouped = {};
    videos.forEach((vid) => {
      if (!grouped[vid.channel]) grouped[vid.channel] = [];
      grouped[vid.channel].push(vid);
    });
    return grouped;
  };

  const goToPlayer = (video) => {
    navigation.navigate('Player', { video });
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Video?',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteVideo(id),
        },
      ]
    );
  };

  const deleteVideo = async (id) => {
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/${id}`);
      fetchVideos();
    } catch (err) {
      Alert.alert('Error', 'Could not delete video.');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const grouped = groupedByChannel();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>Relatagram</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchVideos} />}
        >
          {/* Carousel */}
          <ScrollView
            horizontal
            pagingEnabled
            ref={carouselRef}
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCarouselIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {featuredVideos.map((vid) => (
              <TouchableOpacity key={vid._id} onPress={() => goToPlayer(vid)}>
                <View style={styles.carouselItem}>
                  <Image source={{ uri: vid.thumbnail }} style={styles.banner} />
                  <Text style={styles.duration}>{formatDuration(vid.duration || 0)}</Text>
                  <View style={styles.carouselDots}>
                    {featuredVideos.map((_, i) => (
                      <View
                        key={i}
                        style={[styles.dot, i === carouselIndex ? styles.dotActive : styles.dotInactive]}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Grouped Videos */}
          {Object.entries(grouped).map(([channel, vids]) => (
            <View key={channel}>
              <Text style={styles.channelHeading}>{channel}</Text>
              <FlatList
                data={vids}
                keyExtractor={(vid) => vid._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                renderItem={({ item: vid }) => (
                  <TouchableOpacity
                    key={vid._id}
                    style={styles.videoCardHorizontal}
                    onPress={() => goToPlayer(vid)}
                    onLongPress={() => confirmDelete(vid._id)}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: vid.thumbnail }} style={styles.thumb} />
                      {vid.duration !== undefined && (
                        <View style={styles.overlayDurationBox}>
                          <Text style={styles.overlayDurationText}>
                            {formatDuration(vid.duration)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardTextWrap}>
                      <Text style={styles.videoTitle} numberOfLines={2}>{vid.title}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => confirmDelete(vid._id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  appTitle: {
    fontFamily: 'Pacifico',
    fontSize: 24,
    color: '#fff',
  },
  carousel: {
    marginBottom: 10,
    marginTop: 4,
  },
  carouselItem: {
    width: screenWidth,
    height: (screenWidth * 9) / 16 + 50,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  duration: {
    position: 'absolute',
    bottom: 28,
    right: 12,
    backgroundColor: '#000a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: '#fff',
    fontSize: 12,
    borderRadius: 4,
  },
  carouselDots: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotInactive: {
    backgroundColor: '#8886',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  channelHeading: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 6,
  },
  videoCardHorizontal: {
    width: 160,
    backgroundColor: '#111',
    borderRadius: 6,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: 100,
  },
  overlayDurationBox: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#000a',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 10,
  },
  overlayDurationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  cardTextWrap: {
    padding: 8,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 13,
  },
  durationSmall: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 4,
  },
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#333a',
    borderRadius: 20,
    padding: 4,
  },
});
