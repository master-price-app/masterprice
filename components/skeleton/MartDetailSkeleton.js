import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Skeleton from './Skeleton';

export default function MartDetailSkeleton() {
  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.headerContainer}>
        <Skeleton width={120} height={60} style={styles.logo} />
        <Skeleton width={200} height={20} style={styles.chainName} />
        <Skeleton width="100%" height={48} style={styles.notificationButton} />
      </View>

      <View style={styles.mapContainer}>
        <Skeleton width="100%" height={300} style={styles.map} />

        <View style={styles.locationButton}>
          <Skeleton width={44} height={44} style={styles.roundButton} />
        </View>

        <View style={styles.navigateButtonContainer}>
          <Skeleton width={120} height={40} style={styles.navigateButton} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="location-on" size={24} color="#E31837" />
          <Skeleton width={100} height={18} style={styles.sectionTitle} />
        </View>
        <Skeleton width="80%" height={16} style={styles.locationName} />
        <Skeleton width="100%" height={48} style={styles.address} />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="access-time" size={24} color="#E31837" />
          <Skeleton width={100} height={18} style={styles.sectionTitle} />
        </View>

        {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
          <View key={index} style={styles.hoursRow}>
            <Skeleton width={100} height={14} style={styles.dayLabel} />
            <Skeleton width={150} height={14} style={styles.timeLabel} />
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
  headerContainer: {
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    borderRadius: 4,
  },
  chainName: {
    borderRadius: 4,
  },
  notificationButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    borderRadius: 12,
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  roundButton: {
    borderRadius: 22,
  },
  navigateButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  navigateButton: {
    borderRadius: 20,
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    borderRadius: 4,
  },
  locationName: {
    borderRadius: 4,
  },
  address: {
    borderRadius: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayLabel: {
    borderRadius: 4,
  },
  timeLabel: {
    borderRadius: 4,
  },
});
