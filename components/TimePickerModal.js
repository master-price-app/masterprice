import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 15, 30, 45];
const PERIODS = ['AM', 'PM'];

export default function TimePickerModal({
  visible,
  onClose,
  onConfirm,
  initialTime = {
    weekday: 1,
    hour: 9,
    minute: 0,
    period: 'AM'
  }
}) {
  // Keep the selected time state inside the component
  const [selectedTime, setSelectedTime] = useState(initialTime);

  // Handler for time selection
  const handleTimeSelect = useCallback((type, value) => {
    setSelectedTime(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  // Handler for confirmation
  const handleConfirm = useCallback(() => {
    const hour = selectedTime.period === 'PM' ?
      (selectedTime.hour % 12) + 12 :
      selectedTime.hour % 12;
    onConfirm(selectedTime.weekday, hour, selectedTime.minute);
  }, [selectedTime, onConfirm]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
            <Text style={styles.title}>Set Reminder Time</Text>
            <View style={styles.closeButton}></View>
          </View>

          {/* Weekday Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Day of Week</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekdayContainer}
            >
              {WEEKDAYS.map((day, index) => (
                <Pressable
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedTime.weekday === index && styles.dayButtonSelected
                  ]}
                  onPress={() => handleTimeSelect('weekday', index)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedTime.weekday === index && styles.dayButtonTextSelected
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.timeContainer}>
              {/* Hours */}
              <ScrollView
                style={styles.timeColumn}
                showsVerticalScrollIndicator={false}
              >
                {HOURS.map(hour => (
                  <Pressable
                    key={hour}
                    style={[
                      styles.timeItem,
                      selectedTime.hour === hour && styles.timeItemSelected
                    ]}
                    onPress={() => handleTimeSelect('hour', hour)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime.hour === hour && styles.timeTextSelected
                    ]}>
                      {hour}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Minutes */}
              <ScrollView 
                style={styles.timeColumn}
                showsVerticalScrollIndicator={false}
              >
                {MINUTES.map(minute => (
                  <Pressable
                    key={minute}
                    style={[
                      styles.timeItem,
                      selectedTime.minute === minute && styles.timeItemSelected
                    ]}
                    onPress={() => handleTimeSelect('minute', minute)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime.minute === minute && styles.timeTextSelected
                    ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* AM/PM */}
              <View style={styles.periodContainer}>
                {PERIODS.map(period => (
                  <Pressable
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedTime.period === period && styles.periodButtonSelected
                    ]}
                    onPress={() => handleTimeSelect('period', period)}
                  >
                    <Text style={[
                      styles.periodText,
                      selectedTime.period === period && styles.periodTextSelected
                    ]}>
                      {period}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  weekdayContainer: {
    paddingHorizontal: 4,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 15,
    color: '#333',
  },
  dayButtonTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 200,
  },
  timeColumn: {
    width: 60,
    marginHorizontal: 8,
  },
  timeItem: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  timeItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  timeText: {
    fontSize: 17,
    color: '#333',
  },
  timeTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  periodContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  periodButtonSelected: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 15,
    color: '#333',
  },
  periodTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelText: {
    color: '#666',
  },
  confirmText: {
    color: 'white',
  },
});
