import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Skeleton from './Skeleton';

export default function PriceDetailSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.productCard}>
          <Skeleton width="100%" height={300} style={styles.productImage} />

          <View style={styles.productInfo}>
            <View style={styles.userInfo}>
              <MaterialIcons name="account-circle" size={24} color="#666" />
              <Skeleton width={200} height={16} style={styles.userText} />
              <Skeleton width={80} height={40} style={styles.chainLogo} />
            </View>

            <Skeleton width={150} height={16} style={styles.dateText} />

            <View style={styles.locationInfo}>
              <MaterialIcons name="location-on" size={24} color="#E31837" />
              <Skeleton width="80%" height={16} style={styles.locationText} />
            </View>

            <View style={styles.priceInfo}>
              <Skeleton width={60} height={16} style={styles.priceLabel} />
              <Skeleton width={100} height={24} style={styles.price} />
            </View>

            <Skeleton width="100%" height={48} style={styles.shoppingListButton} />
          </View>
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Skeleton width={120} height={18} style={styles.sectionTitle} />

        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <View style={styles.commentUser}>
                <MaterialIcons name="account-circle" size={24} color="#666" />
                <Skeleton width={100} height={14} style={styles.commentAuthor} />
              </View>
              <Skeleton width={80} height={12} style={styles.commentDate} />
            </View>
            <Skeleton width="90%" height={16} style={styles.commentContent} />
          </View>
        ))}

        <View style={styles.commentInput}>
          <Skeleton width="80%" height={40} style={styles.input} />
          <Skeleton width={60} height={40} style={styles.submitButton} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  productCard: {
    padding: 16,
  },
  productImage: {
    borderRadius: 8,
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userText: {
    borderRadius: 4,
    marginLeft: 8,
  },
  chainLogo: {
    borderRadius: 4,
  },
  dateText: {
    borderRadius: 4,
    marginLeft: 32,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    borderRadius: 4,
    marginLeft: 8,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  priceLabel: {
    borderRadius: 4,
  },
  price: {
    borderRadius: 4,
  },
  shoppingListButton: {
    borderRadius: 8,
  },
  commentsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    borderRadius: 4,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    borderRadius: 4,
    marginLeft: 8,
  },
  commentDate: {
    borderRadius: 4,
  },
  commentContent: {
    borderRadius: 4,
    marginLeft: 32,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    borderRadius: 8,
  },
  submitButton: {
    borderRadius: 8,
  },
});
