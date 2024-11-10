import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PressableButton from './PressableButton';

export default function ShoppingListItem({
  price,
  onPress,
  isSelected,
  showCheckbox
}) {
  return (
    <PressableButton pressedHandler={onPress}>
      <View style={[
        styles.container,
        price.isMasterPrice && styles.masterPriceContainer
      ]}>
        <View style={styles.content}>
          <View style={styles.header}>
            {showCheckbox && (
              <MaterialIcons
                name={isSelected ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={isSelected ? "#007AFF" : "#666"}
                style={styles.checkbox}
              />
            )}
            <Text style={styles.productName} numberOfLines={1}>
              {price.productName}
            </Text>
            <Text style={[
              styles.price,
              price.isMasterPrice && styles.masterPrice
            ]}>
              ${price.price.toFixed(2)}
            </Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.quantity}>{price.productQuantity}</Text>
            {price.isMasterPrice && (
              <View style={styles.masterBadge}>
                <MaterialIcons name="verified" size={14} color="#007AFF" />
                <Text style={styles.masterText}>Master Price</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.dateText}>
              {new Date(price.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </PressableButton>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  masterPriceContainer: {
    backgroundColor: '#f0f9ff',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  masterPrice: {
    color: '#007AFF',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  masterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
