import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

function ShoppingListItemSkeleton() {
  return (
    <View style={styles.itemContainer}>
      {/* Checkbox placeholder */}
      <Skeleton width={24} height={24} style={styles.checkbox} />

      {/* Main content */}
      <View style={styles.itemContent}>
        {/* Product image placeholder */}
        <Skeleton width={60} height={60} style={styles.productImage} />

        {/* Details container */}
        <View style={styles.detailsContainer}>
          {/* Top row: Product name and price */}
          <View style={styles.topRow}>
            <Skeleton width="60%" height={15} style={styles.productName} />
            <Skeleton width={60} height={16} style={styles.price} />
          </View>

          {/* Location name */}
          <Skeleton width="40%" height={13} style={styles.locationName} />

          {/* Badges row */}
          <View style={styles.badgeRow}>
            <Skeleton width={80} height={20} style={styles.badge} />
            <Skeleton width={60} height={20} style={styles.badge} />
          </View>

          {/* Date row */}
          <Skeleton width="30%" height={12} style={styles.dateText} />
        </View>
      </View>
    </View>
  );
}

function SectionHeaderSkeleton() {
  return (
    <View style={styles.sectionHeader}>
      <Skeleton width={20} height={20} style={styles.storeIcon} />
      <Skeleton width="60%" height={16} style={styles.sectionTitle} />
      <Skeleton width={50} height={14} style={styles.itemCount} />
    </View>
  );
}

function SectionFooterSkeleton() {
  return (
    <View style={styles.sectionFooter}>
      <Skeleton width={120} height={14} style={styles.sectionTotal} />
    </View>
  );
}

export default function ShoppingListSkeleton() {
  const sections = [1, 2];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContent}>
        {sections.map((section) => (
          <View key={section} style={styles.sectionContainer}>
            {/* Section Header */}
            <SectionHeaderSkeleton />

            {/* Section Items */}
            {[1, 2, 3].map((item) => (
              <ShoppingListItemSkeleton key={item} />
            ))}

            {/* Section Footer */}
            <SectionFooterSkeleton />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Actions Container */}
      <View style={styles.bottomActionsContainer}>
        <View style={styles.totalContainer}>
          <Skeleton width={100} height={16} style={styles.totalLabel} />
          <Skeleton width={80} height={20} style={styles.totalAmount} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeIcon: {
    marginRight: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    marginRight: 8,
    borderRadius: 4,
  },
  itemCount: {
    marginLeft: 'auto',
    borderRadius: 4,
  },
  // Item Styles
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  checkbox: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 3,
    borderRadius: 4,
  },
  itemContent: {
    padding: 12,
    paddingLeft: 44,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    marginRight: 12,
    borderRadius: 6,
  },
  detailsContainer: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    marginRight: 8,
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
    gap: 6,
    marginTop: 2,
  },
  badge: {
    borderRadius: 4,
  },
  dateText: {
    borderRadius: 4,
  },
  // Section Footer Styles
  sectionFooter: {
    padding: 12,
    alignItems: 'flex-end',
  },
  sectionTotal: {
    borderRadius: 4,
  },
  // Bottom Actions Container Styles
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    borderRadius: 4,
  },
  totalAmount: {
    borderRadius: 4,
  },
});
