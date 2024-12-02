import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function ProductDetailSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.productHeader}>
        <View style={styles.productBasicInfo}>
          <Skeleton width={40} height={40} style={styles.productThumbnail} />

          <View style={styles.productTextInfo}>
            <Skeleton width="80%" height={16} style={styles.nameSkele} />
            <Skeleton width="60%" height={14} style={styles.subInfoSkele} />
          </View>
        </View>
      </View>

      <View style={styles.mapSection}>
        <Skeleton width="100%" height={300} style={styles.mapSkele} />
        <View style={styles.locationButton}>
          <Skeleton width={44} height={44} style={styles.locationButtonSkele} />
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.sectionHeader}>
          <Skeleton width={120} height={18} style={styles.titleSkele} />
          <Skeleton width={100} height={32} style={styles.addButtonSkele} />
        </View>

        <View style={styles.sortContainer}>
          <Skeleton width={100} height={14} style={styles.sortTextSkele} />
          <Skeleton width={40} height={24} style={styles.switchSkele} />
        </View>

        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.priceItemContainer}>
            <View style={styles.priceItemLeft}>
              <Skeleton
                width="70%"
                height={16}
                style={styles.priceItemTitleSkele}
              />
              <Skeleton
                width="50%"
                height={14}
                style={styles.priceItemSubSkele}
              />
            </View>
            <Skeleton
              width={60}
              height={24}
              style={styles.priceAmountSkele}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  productHeader: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  productBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productThumbnail: {
    borderRadius: 8,
    marginRight: 12,
  },
  productTextInfo: {
    flex: 1,
  },
  nameSkele: {
    borderRadius: 4,
    marginBottom: 8,
  },
  subInfoSkele: {
    borderRadius: 4,
  },
  mapSection: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapSkele: {
    borderRadius: 12,
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  locationButtonSkele: {
    borderRadius: 22,
  },
  priceSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSkele: {
    borderRadius: 4,
  },
  addButtonSkele: {
    borderRadius: 6,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  sortTextSkele: {
    borderRadius: 4,
    marginRight: 8,
  },
  switchSkele: {
    borderRadius: 12,
  },
  priceItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  priceItemTitleSkele: {
    borderRadius: 4,
    marginBottom: 8,
  },
  priceItemSubSkele: {
    borderRadius: 4,
  },
  priceAmountSkele: {
    borderRadius: 4,
  },
});
