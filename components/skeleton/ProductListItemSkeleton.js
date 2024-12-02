import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function ProductListItemSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Skeleton width={80} height={80} style={styles.image} />

        <View style={styles.info}>
          <Skeleton width="85%" height={16} style={styles.nameSkele} />
          <Skeleton width="60%" height={16} style={styles.nameSkele} />
          <Skeleton width="60%" height={14} style={styles.brandSkele} />
          <Skeleton width="40%" height={14} style={styles.quantitySkele} />
          <Skeleton width="50%" height={12} style={styles.codeSkele} />
        </View>

        <View style={styles.priceContainer}>
          <Skeleton width={40} height={12} style={styles.fromSkele} />
          <Skeleton width={60} height={16} style={styles.priceSkele} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameSkele: {
    marginBottom: 4,
    borderRadius: 4,
  },
  brandSkele: {
    marginBottom: 4,
    borderRadius: 4,
  },
  quantitySkele: {
    marginBottom: 4,
    borderRadius: 4,
  },
  codeSkele: {
    borderRadius: 4,
  },
  priceContainer: {
    marginLeft: 'auto',
    paddingLeft: 12,
    alignItems: 'flex-end',
    minWidth: 80,
  },
  fromSkele: {
    marginBottom: 2,
    borderRadius: 4,
  },
  priceSkele: {
    borderRadius: 4,
  },
});
