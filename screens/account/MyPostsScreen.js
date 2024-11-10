import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PricePostListItem from '../../components/PricePostListItem';

export default function MyPostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock posts
  const mockPosts = [
    {
      id: '1',
      productId: '1234567890',
      productName: 'Coke Diet 2L',
      productImageUrl: 'https://images.openfoodfacts.org/images/products/004/900/005/0110/front_fr.3.400.jpg',
      price: 3.99,
      martId: '1',
      martName: 'Walmart',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      expiryDate: Date.now() + 1000 * 60 * 60 * 24 * 2,
      status: 'active',
      isMasterPrice: true,
    },
    {
      id: '2',
      productId: '1234567891',
      productName: 'Coke 2L',
      productImageUrl: 'https://images.openfoodfacts.org/images/products/544/900/000/0439/front_en.292.400.jpg',
      price: 2.49,
      martId: '2',
      martName: 'Save-On-Foods',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      expiryDate: Date.now() + 1000 * 60 * 60 * 24 * 3,
      status: 'expired',
      isMasterPrice: false,
    },
    // ... more posts
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetchUserPosts();
      // setPosts(response.data);
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="post-add" size={48} color="#999" />
        <Text style={styles.emptyText}>You haven't posted any prices yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={posts}
      renderItem={({ item }) => (
        <PricePostListItem
          post={item}
          onPress={() => navigation.navigate('PriceDetail', { postId: item.id })}
        />
      )}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});