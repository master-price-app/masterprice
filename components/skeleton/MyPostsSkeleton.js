import { FlatList, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

function PricePostItemSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Skeleton width={80} height={80} style={styles.productImage} />

        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <Skeleton width="60%" height={16} style={styles.productName} />
            <Skeleton width={60} height={16} style={styles.price} />
          </View>

          <Skeleton width="40%" height={14} style={styles.locationName} />

          <View style={styles.badgeRow}>
            <Skeleton width={80} height={20} style={styles.badge} />
            <Skeleton width={60} height={20} style={styles.badge} />
          </View>

          <View style={styles.dateRow}>
            <Skeleton width={100} height={12} style={styles.dateText} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function MyPostsSkeleton() {
  const skeletonData = Array(5).fill(null);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={skeletonData}
      renderItem={() => <PricePostItemSkeleton />}
      keyExtractor={(_, index) => index.toString()}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
    flexDirection: 'row',
  },
  productImage: {
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    borderRadius: 4,
  },
  price: {
    borderRadius: 4,
  },
  locationName: {
    borderRadius: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderRadius: 4,
  },
  dateRow: {
    marginTop: 4,
  },
  dateText: {
    borderRadius: 4,
  },
});
