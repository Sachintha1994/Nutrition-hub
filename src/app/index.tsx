import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { useAppState } from '@/hooks/useAppState';
import { Colors, Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from 'react-native';

const FOOD_PRESETS = [
  {
    id: 'avocado_toast',
    name: 'Avocado Toast & Eggs',
    category: 'Healthy Breakfast',
    calories: 420,
    protein: 18,
    carbs: 36,
    fats: 22,
    macroType: 'Balanced',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80'
  },
  {
    id: 'salmon_salad',
    name: 'Grilled Salmon Quinoa Bowl',
    category: 'High Protein Lunch',
    calories: 580,
    protein: 42,
    carbs: 28,
    fats: 32,
    macroType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
  },
  {
    id: 'cheeseburger',
    name: 'Classic Double Cheeseburger',
    category: 'Cheat Meal / Dinner',
    calories: 820,
    protein: 48,
    carbs: 45,
    fats: 48,
    macroType: 'High Fat',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
  },
  {
    id: 'quinoa_bowl',
    name: 'Mediterranean Salad Bowl',
    category: 'Vegan Lunch',
    calories: 390,
    protein: 12,
    carbs: 52,
    fats: 16,
    macroType: 'High Carb',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'
  },
  {
    id: 'pizza',
    name: 'Gourmet Pepperoni Pizza Slice',
    category: 'Casual Dinner',
    calories: 340,
    protein: 14,
    carbs: 38,
    fats: 15,
    macroType: 'Balanced',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'
  },
  {
    id: 'caesar_salad',
    name: 'Grilled Chicken Caesar Salad',
    category: 'Keto Friendly Lunch',
    calories: 450,
    protein: 34,
    carbs: 10,
    fats: 30,
    macroType: 'High Protein',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80'
  }
];

export default function HomeScreen() {
  const {
    state,
    loading,
    logMeal,
    deleteMeal,
    addWater,
    setWaterLevel,
    logCardio,
    updateProfile,
    resetDailyLogs
  } = useAppState();

  const [activeSegment, setActiveSegment] = useState<'summary' | 'trends' | 'profile'>('summary');
  const [isEditingInlineGoals, setIsEditingInlineGoals] = useState(false);
  const colorScheme = useColorScheme();
  const activeScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[activeScheme];
  const router = useRouter();

  // Profile fields bindings
  const [profileName, setProfileName] = useState('');
  const [profileGoalCalories, setProfileGoalCalories] = useState('');
  const [profileWeight, setProfileWeight] = useState('');
  const [profileTargetWeight, setProfileTargetWeight] = useState('');
  const [profileDietType, setProfileDietType] = useState<'balanced' | 'highprotein' | 'keto' | 'vegan'>('balanced');
  const [profileProtein, setProfileProtein] = useState('');
  const [profileCarbs, setProfileCarbs] = useState('');
  const [profileFats, setProfileFats] = useState('');

  useEffect(() => {
    if (!loading && state.userProfile) {
      setProfileName(state.userProfile.name);
      setProfileGoalCalories(String(state.userProfile.goalCalories));
      setProfileWeight(String(state.userProfile.weight));
      setProfileTargetWeight(String(state.userProfile.targetWeight));
      setProfileDietType(state.userProfile.dietType);
      setProfileProtein(String(state.userProfile.goalProtein));
      setProfileCarbs(String(state.userProfile.goalCarbs));
      setProfileFats(String(state.userProfile.goalFats));
    }
  }, [loading, state.userProfile]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#0a84ff" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading health hub...</Text>
      </View>
    );
  }

  // Eaten totals calculations
  let eatenCals = 0;
  let eatenProt = 0;
  let eatenCarbs = 0;
  let eatenFats = 0;

  state.logs.forEach((item) => {
    eatenCals += item.calories;
    eatenProt += item.protein;
    eatenCarbs += item.carbs;
    eatenFats += item.fats;
  });

  const goalCalories = state.userProfile.goalCalories || 2000;
  const activeBurn = state.activeBurn || 0;
  const remainingCals = goalCalories - eatenCals + activeBurn;

  // Circle progress calculation (r=52, circumference = 2 * PI * r = 326.7)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, eatenCals / Math.max(1, goalCalories + activeBurn));
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Macro progress ratios
  const goalProt = state.userProfile.goalProtein || 130;
  const goalCarbs = state.userProfile.goalCarbs || 220;
  const goalFats = state.userProfile.goalFats || 65;

  const protPct = Math.min(1, eatenProt / goalProt);
  const carbsPct = Math.min(1, eatenCarbs / goalCarbs);
  const fatsPct = Math.min(1, eatenFats / goalFats);

  // Water calculations
  const waterMl = state.waterLogged || 0;
  const activeGlasses = Math.min(8, Math.floor(waterMl / 250));

  // Profile update submit
  const handleUpdateProfile = () => {
    const parsedCals = parseInt(profileGoalCalories) || 2000;
    const parsedWeight = parseFloat(profileWeight) || 74;
    const parsedTarget = parseFloat(profileTargetWeight) || 72;
    const parsedProt = parseInt(profileProtein) || 130;
    const parsedCarbs = parseInt(profileCarbs) || 220;
    const parsedFats = parseInt(profileFats) || 65;

    updateProfile({
      name: profileName,
      goalCalories: parsedCals,
      weight: parsedWeight,
      targetWeight: parsedTarget,
      dietType: profileDietType,
      goalProtein: parsedProt,
      goalCarbs: parsedCarbs,
      goalFats: parsedFats
    });
  };

  // Diet category auto calculator helper
  const handleDietChange = (diet: 'balanced' | 'highprotein' | 'keto' | 'vegan') => {
    setProfileDietType(diet);
    const targetCals = parseInt(profileGoalCalories) || 2000;
    let pRatio = 0.25;
    let cRatio = 0.50;
    let fRatio = 0.25;

    if (diet === 'highprotein') {
      pRatio = 0.35;
      cRatio = 0.35;
      fRatio = 0.30;
    } else if (diet === 'keto') {
      pRatio = 0.25;
      cRatio = 0.05;
      fRatio = 0.70;
    } else if (diet === 'vegan') {
      pRatio = 0.15;
      cRatio = 0.65;
      fRatio = 0.20;
    }

    const calculatedProt = Math.round((targetCals * pRatio) / 4);
    const calculatedCarbs = Math.round((targetCals * cRatio) / 4);
    const calculatedFats = Math.round((targetCals * fRatio) / 9);

    setProfileProtein(String(calculatedProt));
    setProfileCarbs(String(calculatedCarbs));
    setProfileFats(String(calculatedFats));
  };

  // Trends Bezier curve generator
  const drawTrendsChart = () => {
    const weeklyCals = [...state.weeklyHistory];
    // Scale according to highest intake
    const maxVal = Math.max(2500, ...weeklyCals);
    const width = 340;
    const height = 120;
    const paddingY = 15;
    const stepX = width / 6;

    const points = weeklyCals.map((val, idx) => {
      const x = idx * stepX;
      const ratio = val / maxVal;
      const y = height - paddingY - ratio * (height - 2 * paddingY);
      return { x, y, val };
    });

    if (points.length === 0) return { dLine: '', dArea: '', points: [] };

    let dLine = `M ${points[0].x} ${points[0].y}`;
    let dArea = `M ${points[0].x} ${height} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i - 1].x + stepX / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i].x - stepX / 2;
      const cpY2 = points[i].y;

      dLine += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
      dArea += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }

    dArea += ` L ${points[points.length - 1].x} ${height} Z`;

    const averageVal = Math.round(weeklyCals.reduce((a, b) => a + b, 0) / weeklyCals.length);

    return { dLine, dArea, points, averageVal };
  };

  const chartData = drawTrendsChart();

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.headerDate, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>NutriScan Hub</Text>
        </View>
        <Ionicons name="fitness-outline" size={28} color="#0a84ff" />
      </View>

      {/* Segmented Top Navigator */}
      <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundElement }]}>
        <Pressable
          style={[styles.segmentBtn, activeSegment === 'summary' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('summary')}
        >
          <Ionicons
            name="grid"
            size={16}
            color={activeSegment === 'summary' ? '#ffffff' : colors.textSecondary}
          />
          <Text style={[styles.segmentBtnText, { color: activeSegment === 'summary' ? '#ffffff' : colors.textSecondary }]}>
            Summary
          </Text>
        </Pressable>

        <Pressable
          style={[styles.segmentBtn, activeSegment === 'trends' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('trends')}
        >
          <Ionicons
            name="analytics"
            size={16}
            color={activeSegment === 'trends' ? '#ffffff' : colors.textSecondary}
          />
          <Text style={[styles.segmentBtnText, { color: activeSegment === 'trends' ? '#ffffff' : colors.textSecondary }]}>
            Trends
          </Text>
        </Pressable>

        <Pressable
          style={[styles.segmentBtn, activeSegment === 'profile' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('profile')}
        >
          <Ionicons
            name="person"
            size={16}
            color={activeSegment === 'profile' ? '#ffffff' : colors.textSecondary}
          />
          <Text style={[styles.segmentBtnText, { color: activeSegment === 'profile' ? '#ffffff' : colors.textSecondary }]}>
            Goals
          </Text>
        </Pressable>
      </View>

      {/* Main Content Areas */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + Spacing.four }
        ]}
      >
        {/* --- 1. SUMMARY VIEW --- */}
        {activeSegment === 'summary' && (
          <View style={styles.paneContainer}>
            {/* Calorie Ring Progress Card */}
            <View style={[styles.card, styles.calCard, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.calRingContainer}>
                {/* SVG Calorie Circle Progress */}
                <View style={styles.ringVisual}>
                  <Svg width={128} height={128} viewBox="0 0 120 120">
                    <Defs>
                      <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#0a84ff" />
                        <Stop offset="100%" stopColor="#bf5af2" />
                      </LinearGradient>
                    </Defs>
                    {/* Ring BG */}
                    <Circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke={colors.backgroundSelected}
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Ring fill */}
                    <Circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="url(#ringGrad)"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <View style={styles.ringCenterText}>
                    <Text style={[styles.ringCalories, { color: colors.text }]}>
                      {remainingCals < 0 ? Math.abs(remainingCals) : remainingCals}
                    </Text>
                    <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>
                      {remainingCals < 0 ? 'Over' : 'Left'}
                    </Text>
                  </View>
                </View>

                {/* Calorie Numeric Breakdown */}
                <View style={styles.calBreakdown}>
                  <View style={styles.calRow}>
                    <View style={[styles.calDot, { backgroundColor: '#0a84ff' }]} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View>
                        <Text style={[styles.calLabel, { color: colors.textSecondary }]}>Goal</Text>
                        <Text style={[styles.calValue, { color: colors.text }]}>{goalCalories} kcal</Text>
                      </View>
                      <Pressable 
                        style={{ padding: 4, borderRadius: 8, backgroundColor: colors.backgroundSelected }} 
                        onPress={() => setIsEditingInlineGoals(!isEditingInlineGoals)}
                      >
                        <Ionicons name="create-outline" size={14} color="#0a84ff" />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.calRow}>
                    <View style={[styles.calDot, { backgroundColor: '#bf5af2' }]} />
                    <View>
                      <Text style={[styles.calLabel, { color: colors.textSecondary }]}>Food</Text>
                      <Text style={[styles.calValue, { color: colors.text }]}>{eatenCals} kcal</Text>
                    </View>
                  </View>

                  <View style={styles.calRow}>
                    <View style={[styles.calDot, { backgroundColor: '#ff453a' }]} />
                    <View>
                      <Text style={[styles.calLabel, { color: colors.textSecondary }]}>Active</Text>
                      <Text style={[styles.calValue, { color: colors.text }]}>{activeBurn} kcal</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Inline Goal Editing Form */}
            {isEditingInlineGoals && (
              <View style={[styles.card, { backgroundColor: colors.backgroundElement, marginTop: 12, padding: 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Edit Daily Budgets</Text>
                  <Pressable onPress={() => setIsEditingInlineGoals(false)}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
                
                <View style={{ gap: 10 }}>
                  <View style={styles.formRow}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Calorie Budget (kcal)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                      value={profileGoalCalories}
                      onChangeText={(val) => {
                        setProfileGoalCalories(val);
                        // Live update goal protein/carbs/fats based on diet standard
                        const targetCals = parseInt(val) || 2000;
                        let pRatio = 0.25, cRatio = 0.50, fRatio = 0.25;
                        if (profileDietType === 'highprotein') { pRatio = 0.35; cRatio = 0.35; fRatio = 0.30; }
                        else if (profileDietType === 'keto') { pRatio = 0.25; cRatio = 0.05; fRatio = 0.70; }
                        else if (profileDietType === 'vegan') { pRatio = 0.15; cRatio = 0.65; fRatio = 0.20; }
                        setProfileProtein(String(Math.round((targetCals * pRatio) / 4)));
                        setProfileCarbs(String(Math.round((targetCals * cRatio) / 4)));
                        setProfileFats(String(Math.round((targetCals * fRatio) / 9)));
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={[styles.formRow, { flex: 1 }]}>
                      <Text style={[styles.formLabel, { color: colors.text }]}>Protein (g)</Text>
                      <TextInput
                        style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                        value={profileProtein}
                        onChangeText={setProfileProtein}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.formRow, { flex: 1 }]}>
                      <Text style={[styles.formLabel, { color: colors.text }]}>Carbs (g)</Text>
                      <TextInput
                        style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                        value={profileCarbs}
                        onChangeText={setProfileCarbs}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.formRow, { flex: 1 }]}>
                      <Text style={[styles.formLabel, { color: colors.text }]}>Fats (g)</Text>
                      <TextInput
                        style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                        value={profileFats}
                        onChangeText={setProfileFats}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Pressable 
                    style={[styles.saveBtn, { marginTop: 8, paddingVertical: 10 }]} 
                    onPress={() => {
                      handleUpdateProfile();
                      setIsEditingInlineGoals(false);
                    }}
                  >
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                    <Text style={styles.saveBtnText}>Save Budgets</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Macros Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Macronutrients</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Daily Goal Breakdown</Text>
            </View>

            <View style={styles.macrosRow}>
              {/* Protein Card */}
              <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={styles.macroCardHeader}>
                  <Text style={[styles.macroName, { color: colors.text }]}>Protein</Text>
                  <Text style={[styles.macroValText, { color: colors.text }]}>{eatenProt}g</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundSelected }]}>
                  <View style={[styles.progressBarFill, { width: `${protPct * 100}%`, backgroundColor: '#0a84ff' }]} />
                </View>
                <Text style={[styles.macroTargetText, { color: colors.textSecondary }]}>
                  Goal: {goalProt}g • {Math.max(0, goalProt - eatenProt)}g left
                </Text>
              </View>

              {/* Carbs Card */}
              <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={styles.macroCardHeader}>
                  <Text style={[styles.macroName, { color: colors.text }]}>Carbs</Text>
                  <Text style={[styles.macroValText, { color: colors.text }]}>{eatenCarbs}g</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundSelected }]}>
                  <View style={[styles.progressBarFill, { width: `${carbsPct * 100}%`, backgroundColor: '#ff9f0a' }]} />
                </View>
                <Text style={[styles.macroTargetText, { color: colors.textSecondary }]}>
                  Goal: {goalCarbs}g • {Math.max(0, goalCarbs - eatenCarbs)}g left
                </Text>
              </View>

              {/* Fats Card */}
              <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={styles.macroCardHeader}>
                  <Text style={[styles.macroName, { color: colors.text }]}>Fats</Text>
                  <Text style={[styles.macroValText, { color: colors.text }]}>{eatenFats}g</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundSelected }]}>
                  <View style={[styles.progressBarFill, { width: `${fatsPct * 100}%`, backgroundColor: '#30d158' }]} />
                </View>
                <Text style={[styles.macroTargetText, { color: colors.textSecondary }]}>
                  Goal: {goalFats}g • {Math.max(0, goalFats - eatenFats)}g left
                </Text>
              </View>
            </View>

            {/* Quick Logging Activities Widgets */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Widgets</Text>
            </View>

            <View style={styles.widgetsContainer}>
              {/* Water Intake Tracker */}
              <View style={[styles.widgetCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={styles.widgetHeader}>
                  <Ionicons name="water" size={18} color="#40a9ff" />
                  <Text style={[styles.widgetTitleText, { color: colors.text }]}>Water Intake</Text>
                </View>
                <Text style={[styles.widgetSecondary, { color: colors.textSecondary }]}>Target: 2000 ml</Text>
                <Text style={[styles.widgetValBig, { color: colors.text }]}>{waterMl} ml</Text>

                {/* Glasses of water indicators */}
                <View style={styles.waterCapsulesRow}>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <Pressable
                      key={idx}
                      style={[
                        styles.waterGlassCap,
                        { borderColor: '#40a9ff' },
                        idx < activeGlasses && { backgroundColor: '#40a9ff' }
                      ]}
                      onPress={() => setWaterLevel(idx + 1)}
                    />
                  ))}
                </View>

                <Pressable style={styles.widgetBtn} onPress={() => addWater(250)}>
                  <Ionicons name="add" size={16} color="#ffffff" />
                  <Text style={styles.widgetBtnText}>Add Cup (+250ml)</Text>
                </Pressable>
              </View>

              {/* Cardio Active Burn widget */}
              <View style={[styles.widgetCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={styles.widgetHeader}>
                  <Ionicons name="flame" size={18} color="#ff453a" />
                  <Text style={[styles.widgetTitleText, { color: colors.text }]}>Cardio Burn</Text>
                </View>
                <Text style={[styles.widgetSecondary, { color: colors.textSecondary }]}>Exercise Logger</Text>
                <Text style={[styles.widgetValBig, { color: colors.text }]}>{activeBurn} kcal</Text>

                <View style={styles.cardioIndicatorContainer}>
                  <Ionicons name="bicycle" size={32} color={activeBurn > 0 ? '#ff453a' : colors.textSecondary} />
                  <Text style={[styles.cardioIndicatorSub, { color: colors.textSecondary }]}>
                    Logged workouts today
                  </Text>
                </View>

                <Pressable style={[styles.widgetBtn, { backgroundColor: '#ff453a' }]} onPress={logCardio}>
                  <Ionicons name="add" size={16} color="#ffffff" />
                  <Text style={styles.widgetBtnText}>Log Workout (+150)</Text>
                </Pressable>
              </View>
            </View>

            {/* Quick Log presets */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Food Presets</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Tap to simulate instant scan</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {FOOD_PRESETS.map((food) => (
                <Pressable
                  key={food.id}
                  style={[styles.presetCard, { backgroundColor: colors.backgroundElement }]}
                  onPress={() => {
                    // Navigate to scan page passing the preset ID
                    router.push({
                      pathname: '/explore',
                      params: { presetId: food.id }
                    });
                  }}
                >
                  <Image source={{ uri: food.image }} style={styles.presetCardImg} />
                  <View style={styles.presetCardInfo}>
                    <Text style={[styles.presetCardTitle, { color: colors.text }]} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={[styles.presetCardCal, { color: colors.textSecondary }]}>
                      {food.calories} kcal • {food.macroType}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- 2. TRENDS VIEW --- */}
        {activeSegment === 'trends' && (
          <View style={styles.paneContainer}>
            {/* SVG Trends Line Chart */}
            <View style={[styles.card, styles.chartCard, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.chartTitleText, { color: colors.text }]}>Calorie Intake Trend</Text>
              <View style={styles.chartHeaderRow}>
                <View>
                  <Text style={[styles.chartAverageVal, { color: colors.text }]}>{chartData.averageVal} kcal</Text>
                  <Text style={[styles.chartAverageSub, { color: colors.textSecondary }]}>Daily Average</Text>
                </View>
                <Ionicons name="trending-up-outline" size={24} color="#0a84ff" />
              </View>

              {/* Weekly SVG Chart */}
              <View style={styles.svgContainer}>
                <Svg width={340} height={120}>
                  {/* Grid Lines */}
                  <Path d="M0 20 L340 20" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <Path d="M0 60 L340 60" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <Path d="M0 100 L340 100" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  {/* Target Line */}
                  <Path d="M0 50 L340 50" stroke="rgba(10, 132, 255, 0.25)" strokeWidth={1.5} strokeDasharray="4,4" />

                  {/* Gradient Background under path */}
                  <Defs>
                    <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#0a84ff" stopOpacity={0.6} />
                      <Stop offset="100%" stopColor="#bf5af2" stopOpacity={0} />
                    </LinearGradient>
                  </Defs>

                  {/* Area fill */}
                  {chartData.dArea ? <Path d={chartData.dArea} fill="url(#areaGrad)" /> : null}

                  {/* Bezier line */}
                  {chartData.dLine ? (
                    <Path
                      d={chartData.dLine}
                      fill="none"
                      stroke="#0a84ff"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  ) : null}

                  {/* Coordinate pulsing nodes */}
                  {chartData.points.map((p, idx) => (
                    <Circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={idx === 6 ? 6 : 4}
                      fill={idx === 6 ? '#bf5af2' : '#0a84ff'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Svg>
              </View>

              {/* Axis labels */}
              <View style={styles.chartAxisRow}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <Text key={idx} style={[styles.axisText, { color: colors.textSecondary }]}>
                    {day}
                  </Text>
                ))}
              </View>
            </View>

            {/* Today's logged meals list */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Logged Meals</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Manage your food history</Text>
            </View>

            {state.logs.length === 0 ? (
              <View style={[styles.emptyTimeline, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="restaurant-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyTextTitle, { color: colors.text }]}>No meals logged yet</Text>
                <Text style={[styles.emptyTextSub, { color: colors.textSecondary }]}>
                  Navigate to the Scan tab to analyze a meal!
                </Text>
              </View>
            ) : (
              <View style={styles.timelineContainer}>
                {state.logs
                  .slice()
                  .reverse()
                  .map((item) => (
                    <View
                      key={item.id}
                      style={[styles.timelineItem, { backgroundColor: colors.backgroundElement }]}
                    >
                      <View
                        style={[
                          styles.timelineIconBox,
                          {
                            backgroundColor:
                              item.type === 'breakfast'
                                ? '#0a84ff'
                                : item.type === 'lunch'
                                ? '#ff9f0a'
                                : item.type === 'dinner'
                                ? '#bf5af2'
                                : '#30d158'
                          }
                        ]}
                      >
                        <Ionicons
                          name={
                            item.type === 'breakfast'
                              ? 'cafe'
                              : item.type === 'lunch'
                              ? 'fast-food'
                              : item.type === 'dinner'
                              ? 'restaurant'
                              : 'nutrition'
                          }
                          size={18}
                          color="#ffffff"
                        />
                      </View>
                      <View style={styles.timelineInfo}>
                        <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.timelineSubText, { color: colors.textSecondary }]}>
                          {item.time} • Portion {item.portion}x • P: {item.protein}g C: {item.carbs}g F:{' '}
                          {item.fats}g
                        </Text>
                      </View>
                      <View style={styles.timelineActionRow}>
                        <Text style={[styles.timelineCals, { color: colors.text }]}>{item.calories} kcal</Text>
                        <Pressable style={styles.timelineTrashBtn} onPress={() => deleteMeal(item.id)}>
                          <Ionicons name="trash-outline" size={16} color="#ff453a" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Clear database row */}
            <Pressable
              style={[styles.clearBtn, { borderColor: colors.backgroundSelected }]}
              onPress={resetDailyLogs}
            >
              <Ionicons name="refresh" size={16} color="#ff453a" />
              <Text style={styles.clearBtnText}>Reset Daily Health Data</Text>
            </Pressable>
          </View>
        )}

        {/* --- 3. PROFILE VIEW --- */}
        {activeSegment === 'profile' && (
          <View style={styles.paneContainer}>
            {/* Quick Profile Summary Header Card */}
            <View style={[styles.card, styles.profileCard, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.profileAvatarBox}>
                <Text style={styles.avatarText}>{profileName.charAt(0).toUpperCase() || 'A'}</Text>
              </View>
              <Text style={[styles.profileNameDisplay, { color: colors.text }]}>{profileName}</Text>
              <Text style={[styles.profileSubDisplay, { color: colors.textSecondary }]}>
                Goal: Target {profileTargetWeight}kg • {profileDietType.toUpperCase()}
              </Text>
            </View>

            {/* Form Settings */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings & Budgets</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Customize weights and nutrition
              </Text>
            </View>

            <View style={[styles.formContainer, { backgroundColor: colors.backgroundElement }]}>
              {/* Name */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>My Name</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Enter name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Calorie Budget */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Calorie Goal (kcal)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileGoalCalories}
                  onChangeText={setProfileGoalCalories}
                  keyboardType="numeric"
                  placeholder="2000"
                />
              </View>

              {/* Weight */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Current Weight (kg)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileWeight}
                  onChangeText={setProfileWeight}
                  keyboardType="numeric"
                  placeholder="74"
                />
              </View>

              {/* Target Weight */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Target Weight (kg)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileTargetWeight}
                  onChangeText={setProfileTargetWeight}
                  keyboardType="numeric"
                  placeholder="72"
                />
              </View>

              {/* Diet Type Selector */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Diet Standard</Text>
                <View style={styles.dietPillsContainer}>
                  {([
                    { label: 'Balanced', value: 'balanced' },
                    { label: 'High-Prot', value: 'highprotein' },
                    { label: 'Keto', value: 'keto' },
                    { label: 'Vegan', value: 'vegan' }
                  ] as const).map((diet) => (
                    <Pressable
                      key={diet.value}
                      style={[
                        styles.dietPill,
                        { backgroundColor: colors.backgroundSelected },
                        profileDietType === diet.value && { backgroundColor: '#0a84ff' }
                      ]}
                      onPress={() => handleDietChange(diet.value)}
                    >
                      <Text
                        style={[
                          styles.dietPillText,
                          { color: colors.text },
                          profileDietType === diet.value && { color: '#ffffff', fontWeight: 'bold' }
                        ]}
                      >
                        {diet.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Manual Protein */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Protein Goal (g)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileProtein}
                  onChangeText={setProfileProtein}
                  keyboardType="numeric"
                />
              </View>

              {/* Manual Carbs */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Carbs Goal (g)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileCarbs}
                  onChangeText={setProfileCarbs}
                  keyboardType="numeric"
                />
              </View>

              {/* Manual Fats */}
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Fats Goal (g)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={profileFats}
                  onChangeText={setProfileFats}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Pressable style={styles.saveBtn} onPress={handleUpdateProfile}>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.saveBtnText}>Update Profile Budgets</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500'
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
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    padding: 4,
    borderRadius: 12,
    gap: 4
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: 8
  },
  segmentBtnActive: {
    backgroundColor: '#0a84ff',
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600'
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%'
  },
  paneContainer: {
    gap: Spacing.four
  },
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  calCard: {},
  calRingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: Spacing.three
  },
  ringVisual: {
    width: 128,
    height: 128,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ringCenterText: {
    position: 'absolute',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ringCalories: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28
  },
  ringLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1
  },
  calBreakdown: {
    flex: 1,
    gap: 12,
    minWidth: 140
  },
  calRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  calDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  calLabel: {
    fontSize: 11,
    fontWeight: '500'
  },
  calValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1
  },
  sectionHeader: {
    marginTop: Spacing.two
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
  macrosRow: {
    flexDirection: 'row',
    gap: 8
  },
  macroCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.two + 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  macroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  macroName: {
    fontSize: 12,
    fontWeight: '600'
  },
  macroValText: {
    fontSize: 12,
    fontWeight: '700'
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  macroTargetText: {
    fontSize: 9,
    fontWeight: '600'
  },
  widgetsContainer: {
    flexDirection: 'row',
    gap: 12
  },
  widgetCard: {
    flex: 1,
    borderRadius: 20,
    padding: Spacing.three,
    justifyContent: 'space-between',
    minHeight: 180
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  widgetTitleText: {
    fontSize: 13,
    fontWeight: '700'
  },
  widgetSecondary: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1
  },
  widgetValBig: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: Spacing.two
  },
  waterCapsulesRow: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.three
  },
  waterGlassCap: {
    width: 10,
    height: 20,
    borderWidth: 1,
    borderRadius: 3
  },
  widgetBtn: {
    backgroundColor: '#0a84ff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
    gap: 4,
    marginTop: 4
  },
  widgetBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  cardioIndicatorContainer: {
    alignItems: 'center',
    marginVertical: Spacing.one,
    gap: 4
  },
  cardioIndicatorSub: {
    fontSize: 9,
    fontWeight: '500'
  },
  presetsRow: {
    marginHorizontal: -Spacing.four,
    paddingHorizontal: Spacing.four
  },
  presetCard: {
    width: 160,
    borderRadius: 16,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  presetCardImg: {
    width: '100%',
    height: 90
  },
  presetCardInfo: {
    padding: Spacing.two
  },
  presetCardTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  presetCardCal: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2
  },
  chartCard: {},
  chartTitleText: {
    fontSize: 14,
    fontWeight: '700'
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.three
  },
  chartAverageVal: {
    fontSize: 22,
    fontWeight: '800'
  },
  chartAverageSub: {
    fontSize: 10,
    fontWeight: '600'
  },
  svgContainer: {
    height: 120,
    alignItems: 'center'
  },
  chartAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: Spacing.two
  },
  axisText: {
    fontSize: 10,
    fontWeight: '600',
    width: 40,
    textAlign: 'center'
  },
  emptyTimeline: {
    borderRadius: 20,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 150
  },
  emptyTextTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4
  },
  emptyTextSub: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16
  },
  timelineContainer: {
    gap: 8
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two
  },
  timelineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timelineInfo: {
    flex: 1
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  timelineSubText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2
  },
  timelineActionRow: {
    alignItems: 'flex-end',
    gap: 4
  },
  timelineCals: {
    fontSize: 13,
    fontWeight: '700'
  },
  timelineTrashBtn: {
    padding: 2
  },
  clearBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    gap: 6,
    marginTop: Spacing.two
  },
  clearBtnText: {
    color: '#ff453a',
    fontSize: 13,
    fontWeight: '700'
  },
  profileCard: {
    alignItems: 'center',
    gap: 8
  },
  profileAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800'
  },
  profileNameDisplay: {
    fontSize: 20,
    fontWeight: '800'
  },
  profileSubDisplay: {
    fontSize: 11,
    fontWeight: '600'
  },
  formContainer: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three
  },
  formRow: {
    gap: 6
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9
  },
  formInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontWeight: '600'
  },
  dietPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2
  },
  dietPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10
  },
  dietPillText: {
    fontSize: 12,
    fontWeight: '600'
  },
  saveBtn: {
    backgroundColor: '#30d158',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 14,
    gap: 6,
    marginTop: Spacing.two,
    shadowColor: '#30d158',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
