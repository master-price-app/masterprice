import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PressableButton from './PressableButton';

export default function PriceListItem({ price, onPress }) {
  return (
    <PressableButton pressedHandler={onPress}>
      <View style={[
        styles.priceItem,
        price.isMasterPrice && styles.masterPriceItem
      ]}>
        <View style={styles.priceHeader}>
          <View style={styles.storeInfo}>
            <MaterialIcons name="store" size={16} color="#666" />
            <Text style={styles.storeText}>{price.store}</Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={[
              styles.priceText,
              price.isMasterPrice && styles.masterPriceText
            ]}>
              ${price.price.toFixed(2)}
            </Text>
            {price.isMasterPrice && (
              <View style={styles.masterBadge}>
                <MaterialIcons name="verified" size={14} color="#007AFF" />
                <Text style={styles.masterText}>Master Price</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceFooter}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.dateText}>
            {new Date(price.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </PressableButton>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  priceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  masterPriceItem: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF20',
    marginVertical: 4,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  masterPriceText: {
    color: '#007AFF',
  },
  masterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  masterText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  priceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
