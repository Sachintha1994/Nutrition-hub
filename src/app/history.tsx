import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useAppState } from '@/hooks/useAppState';
import { Colors, Spacing, BottomTabInset } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function HistoryScreen() {
  const { state } = useAppState();
  const colorScheme = useColorScheme();
  const activeScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[activeScheme];

  // Generate last 30 days for the consistency grid
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toDateString(),
        dayNum: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        // Simulate historical data for visual demo since we only store today's logs in current state
        isCompleted: Math.random() > 0.4
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.headerDate, { color: colors.textSecondary }]}>Your Progress</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Health History</Text>
        </View>
        <Ionicons name="calendar-outline" size={26} color="#bf5af2" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.four }]}
      >
        {/* Streak Card */}
        <Animated.View entering={FadeInDown.duration(600)} style={[styles.streakCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.streakContent}>
            <View style={styles.streakIconBox}>
              <Ionicons name="flame" size={42} color="#ff453a" />
            </View>
            <View>
              <Text style={[styles.streakValue, { color: colors.text }]}>{state.streak} Day Streak!</Text>
              <Text style={[styles.streakSub, { color: colors.textSecondary }]}>Keep it up! You're becoming more consistent.</Text>
            </View>
          </View>
        </Animated.View>

        {/* Consistency Grid Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Consistency Grid</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Last 30 days of activity</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.gridContainer, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.grid}>
            {calendarDays.map((day, idx) => (
              <View key={idx} style={styles.gridDayWrapper}>
                <View
                  style={[
                    styles.gridSquare,
                    { backgroundColor: day.isCompleted ? '#30d158' : colors.backgroundSelected }
                  ]}
                />
                <Text style={[styles.gridDayText, { color: colors.textSecondary }]}>{day.dayNum}</Text>
              </View>
            ))}
          </View>
          <View style={styles.gridLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.backgroundSelected }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#30d158' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Completed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Summary Stats */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overall Stats</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="trending-up" size={20} color="#0a84ff" />
            <Text style={[styles.statVal, { color: colors.text }]}>{state.weeklyHistory[state.weeklyHistory.length-1]} kcal</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today's Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="water" size={20} color="#40a9ff" />
            <Text style={[styles.statVal, { color: colors.text }]}>{state.waterLogged} ml</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Water Today</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  streakCard: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  streakIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  streakValue: {
    fontSize: 22,
    fontWeight: '800'
  },
  streakSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2
  },
  sectionHeader: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  gridContainer: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8
  },
  gridDayWrapper: {
    alignItems: 'center',
    width: 28
  },
  gridSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginBottom: 4
  },
  gridDayText: {
    fontSize: 9,
    fontWeight: '600'
  },
  gridLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: Spacing.four,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 6
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600'
  }
});
