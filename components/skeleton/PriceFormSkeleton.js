import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function PriceFormSkeleton() {
  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.formCard}>
          <View style={styles.inputSection}>
            <Skeleton width={120} height={16} style={styles.label} />
            <View style={styles.imageSection}>
              <Skeleton width="100%" height={200} style={styles.imagePlaceholder} />
              <View style={styles.imageButtons}>
                <Skeleton width={120} height={44} style={styles.imageButton} />
                <Skeleton width={120} height={44} style={styles.imageButton} />
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Skeleton width={100} height={16} style={styles.label} />
            <Skeleton width="80%" height={16} style={styles.value} />
          </View>

          <View style={styles.infoSection}>
            <Skeleton width={120} height={16} style={styles.label} />
            <Skeleton width="60%" height={16} style={styles.value} />
          </View>

          <View style={styles.inputSection}>
            <Skeleton width={80} height={16} style={styles.label} />
            <Skeleton width="100%" height={48} style={styles.inputContainer} />
          </View>

          <View style={styles.inputSection}>
            <Skeleton width={120} height={16} style={styles.label} />
            <Skeleton width="100%" height={300} style={styles.mapContainer} />
          </View>

          <Skeleton width="100%" height={48} style={styles.submitButton} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 20,
  },
  inputSection: {
    gap: 8,
  },
  label: {
    borderRadius: 4,
  },
  imageSection: {
    gap: 8,
  },
  imagePlaceholder: {
    borderRadius: 8,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageButton: {
    borderRadius: 8,
  },
  infoSection: {
    gap: 8,
  },
  value: {
    borderRadius: 4,
  },
  inputContainer: {
    borderRadius: 8,
  },
  mapContainer: {
    borderRadius: 8,
  },
  submitButton: {
    borderRadius: 8,
    marginTop: 8,
  },
});
