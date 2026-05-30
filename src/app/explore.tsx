import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Easing,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

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
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
    components: [
      { label: 'Poached Eggs (2)', x: 15, y: 25, w: 32, h: 32, calories: 140, protein: 12, carbs: 1, fats: 10 },
      { label: 'Avocado Mash', x: 45, y: 20, w: 42, h: 35, calories: 160, protein: 2, carbs: 9, fats: 12 },
      { label: 'Sourdough Toast (1 slice)', x: 20, y: 55, w: 65, h: 35, calories: 120, protein: 4, carbs: 26, fats: 0 }
    ]
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    components: [
      { label: 'Grilled Salmon (150g)', x: 12, y: 15, w: 50, h: 42, calories: 310, protein: 34, carbs: 0, fats: 18 },
      { label: 'Steamed Quinoa (100g)', x: 42, y: 50, w: 45, h: 38, calories: 120, protein: 4, carbs: 21, fats: 2 },
      { label: 'Olive Oil Avocado Dress', x: 10, y: 62, w: 30, h: 28, calories: 150, protein: 4, carbs: 7, fats: 12 }
    ]
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
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    components: [
      { label: 'Double Beef Patties', x: 10, y: 32, w: 78, h: 36, calories: 460, protein: 38, carbs: 0, fats: 34 },
      { label: 'Cheddar Cheese Slice (2)', x: 15, y: 25, w: 68, h: 12, calories: 180, protein: 8, carbs: 1, fats: 14 },
      { label: 'Brioche Bun', x: 5, y: 5, w: 88, h: 22, calories: 180, protein: 2, carbs: 44, fats: 0 }
    ]
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
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    components: [
      { label: 'Hummus & Falafel (3)', x: 15, y: 15, w: 38, h: 38, calories: 180, protein: 6, carbs: 18, fats: 9 },
      { label: 'Chickpeas & Quinoa', x: 50, y: 22, w: 38, h: 42, calories: 150, protein: 4, carbs: 30, fats: 2 },
      { label: 'Cherry Tomatoes & Greens', x: 22, y: 58, w: 55, h: 32, calories: 60, protein: 2, carbs: 4, fats: 5 }
    ]
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
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    components: [
      { label: 'Mozzarella & Pepperoni', x: 25, y: 15, w: 55, h: 48, calories: 180, protein: 8, carbs: 2, fats: 15 },
      { label: 'Woodfired Crust', x: 8, y: 5, w: 84, h: 84, calories: 160, protein: 6, carbs: 36, fats: 0 }
    ]
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
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80',
    components: [
      { label: 'Grilled Chicken (120g)', x: 15, y: 20, w: 48, h: 36, calories: 190, protein: 28, carbs: 0, fats: 8 },
      { label: 'Parmesan & Croutons', x: 50, y: 48, w: 38, h: 32, calories: 110, protein: 4, carbs: 8, fats: 6 },
      { label: 'Creamy Caesar Dress', x: 25, y: 58, w: 32, h: 28, calories: 150, protein: 2, carbs: 2, fats: 16 }
    ]
  }
];

const ANALYSIS_STEPS = [
  'Initializing neural vision models...',
  'Detecting meal boundaries & portion depth...',
  'Parsing nutritional density indexes...',
  'Calibrating active macronutrients volume...',
  'AI Analysis successfully verified!'
];

export default function ScanScreen() {
  const { logMeal } = useAppState();
  const router = useRouter();
  const params = useLocalSearchParams<{ presetId?: string }>();

  const colorScheme = useColorScheme();
  const activeScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[activeScheme];

  // Core scanner state
  const [scannerMode, setScannerMode] = useState<'idle' | 'scanning' | 'analyzed'>('idle');
  const [selectedFood, setSelectedFood] = useState<typeof FOOD_PRESETS[0] | null>(null);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  // Bottom Sheet Form State
  const [showSheet, setShowSheet] = useState(false);
  const [portionSize, setPortionSize] = useState(1.0);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  // Animation values
  const laserAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const reticleScale = useRef(new Animated.Value(1)).current;

  // Camera & Image picker states
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const handlePickImage = async () => {
    setIsCameraActive(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setCapturedImageUri(pickedUri);
      const randomPreset = FOOD_PRESETS[Math.floor(Math.random() * FOOD_PRESETS.length)];
      const customScannedFood = {
        ...randomPreset,
        name: 'Scanned Food Photo',
        image: pickedUri,
      };
      triggerScan(customScannedFood);
    }
  };

  const handleStartCamera = async () => {
    setCapturedImageUri(null);
    if (!permission || !permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        alert('Camera permission is required to scan meals in real time!');
        return;
      }
    }
    setIsCameraActive(true);
    setScannerMode('idle');
    setSelectedFood(null);
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        if (photo && photo.uri) {
          setCapturedImageUri(photo.uri);
          setIsCameraActive(false);
          const randomPreset = FOOD_PRESETS[Math.floor(Math.random() * FOOD_PRESETS.length)];
          const customScannedFood = {
            ...randomPreset,
            name: 'Camera Scanned Dish',
            image: photo.uri,
          };
          triggerScan(customScannedFood);
        }
      } catch (err) {
        console.error('Error taking photo:', err);
      }
    }
  };

  // Catch triggers from home preset click
  useEffect(() => {
    if (params.presetId) {
      const match = FOOD_PRESETS.find((f) => f.id === params.presetId);
      if (match) {
        // Run simulator
        triggerScan(match);
      }
    }
  }, [params.presetId]);

  // Sweep laser loop animation
  useEffect(() => {
    if (scannerMode === 'scanning') {
      laserAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true
          })
        ])
      ).start();

      // Pulsing reticle
      Animated.loop(
        Animated.sequence([
          Animated.timing(reticleScale, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.timing(reticleScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      laserAnim.stopAnimation();
      reticleScale.stopAnimation();
    }
  }, [scannerMode]);

  // Handle Apple Bottom Sheet Slide Animation
  useEffect(() => {
    if (showSheet) {
      Animated.spring(sheetAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(sheetAnim, {
        toValue: Dimensions.get('window').height,
        duration: 350,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true
      }).start();
    }
  }, [showSheet]);

  const triggerScan = (food: typeof FOOD_PRESETS[0]) => {
    if (scannerMode === 'scanning') return;
    setScannerMode('scanning');
    setSelectedFood(food);
    setAnalysisStepIndex(0);
    setShowSheet(false);

    // Auto set meal category based on current local hour
    const hour = new Date().getHours();
    if (hour < 11) setSelectedMealType('breakfast');
    else if (hour < 16) setSelectedMealType('lunch');
    else if (hour < 21) setSelectedMealType('dinner');
    else setSelectedMealType('snack');

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < ANALYSIS_STEPS.length) {
        setAnalysisStepIndex(currentStep);
      } else {
        clearInterval(interval);
        setScannerMode('analyzed');
        // Delay sliding bottom sheet to let bounding boxes shine!
        setTimeout(() => {
          setPortionSize(1.0);
          setShowSheet(true);
        }, 1200);
      }
    }, 600);
  };

  const handleConfirmLog = () => {
    if (!selectedFood) return;

    const scaledCals = selectedFood.calories * portionSize;
    const scaledProt = selectedFood.protein * portionSize;
    const scaledCarbs = selectedFood.carbs * portionSize;
    const scaledFats = selectedFood.fats * portionSize;

    logMeal(
      selectedFood.name,
      selectedFood.category,
      scaledCals,
      scaledProt,
      scaledCarbs,
      scaledFats,
      portionSize,
      selectedMealType
    );

    // Hide sheet and reset
    setShowSheet(false);
    setTimeout(() => {
      setScannerMode('idle');
      setSelectedFood(null);
      // Route back to home summary tab
      router.push('/');
    }, 400);
  };

  // Interpolate translate Y for sweeping laser
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240] // Camera viewport height bounding limit
  });

  // Calculate live nutrient values according to slider
  const liveCals = selectedFood ? Math.round(selectedFood.calories * portionSize) : 0;
  const liveProt = selectedFood ? Math.round(selectedFood.protein * portionSize) : 0;
  const liveCarbs = selectedFood ? Math.round(selectedFood.carbs * portionSize) : 0;
  const liveFats = selectedFood ? Math.round(selectedFood.fats * portionSize) : 0;

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.headerDate, { color: colors.textSecondary }]}>AI Vision Scan</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Meal</Text>
        </View>
        <Ionicons name="scan" size={26} color="#bf5af2" />
      </View>

      {/* Main Scanner Scroll Container */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + Spacing.four }
        ]}
      >
        {/* Sleek Camera / Upload Controls */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Pressable
            style={[
              { backgroundColor: colors.backgroundElement, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 16 },
              isCameraActive && { borderColor: '#bf5af2', borderWidth: 1.5 }
            ]}
            onPress={handleStartCamera}
          >
            <Ionicons name="camera" size={18} color="#bf5af2" />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Live Camera Scan</Text>
          </Pressable>

          <Pressable
            style={{ backgroundColor: colors.backgroundElement, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 16 }}
            onPress={handlePickImage}
          >
            <Ionicons name="image" size={18} color="#0a84ff" />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Upload Photo</Text>
          </Pressable>
        </View>

        {/* Fututistic Camera Viewfinder View */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderContainer}>
            {/* Viewfinder Image State */}
            {isCameraActive ? (
              <CameraView
                style={styles.viewfinderImg}
                ref={cameraRef}
                facing="back"
              >
                {/* Overlay with shutter button to take a photo */}
                <Pressable style={styles.cameraCaptureOverlay} onPress={handleTakePhoto}>
                  <View style={styles.cameraShutterButton}>
                    <View style={styles.cameraShutterInner} />
                  </View>
                  <Text style={styles.cameraCaptureInstruction}>Tap shutter button to snap & scan</Text>
                </Pressable>
              </CameraView>
            ) : (
              selectedFood ? (
                <Image source={{ uri: selectedFood.image }} style={styles.viewfinderImg} />
              ) : (
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80' }}
                  style={styles.viewfinderImg}
                />
              )
            )}

            {/* Sweep Laser line overlay */}
            {scannerMode === 'scanning' && (
              <Animated.View
                style={[styles.sweepLaser, { transform: [{ translateY: laserTranslateY }] }]}
              />
            )}

            {/* Glow reticle border */}
            {(scannerMode === 'idle' || scannerMode === 'scanning') && (
              <Animated.View
                style={[
                  styles.glowReticle,
                  scannerMode === 'scanning' && styles.glowReticleScanning,
                  { transform: [{ scale: reticleScale }] }
                ]}
              />
            )}

            {/* Bounding Coordinate box overlays */}
            {scannerMode === 'analyzed' &&
              selectedFood?.components &&
              selectedFood.components.map((comp, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.boundingBox,
                    {
                      left: `${comp.x}%`,
                      top: `${comp.y}%`,
                      width: `${comp.w}%`,
                      height: `${comp.h}%`
                    }
                  ]}
                >
                  <View style={styles.boundingBoxDot} />
                  <View style={styles.boundingBoxTag}>
                    <Text style={styles.boundingBoxTagText}>{comp.label}</Text>
                  </View>
                </View>
              ))}

            {/* Simulated Live Scan Banner */}
            {scannerMode === 'scanning' && (
              <View style={styles.bannerOverlay}>
                <ActivityIndicator size="small" color="#bf5af2" />
                <Text style={styles.bannerText}>{ANALYSIS_STEPS[analysisStepIndex]}</Text>
              </View>
            )}

            {/* Bounding box success overlay tag */}
            {scannerMode === 'analyzed' && (
              <View style={[styles.bannerOverlay, styles.bannerOverlaySuccess]}>
                <Ionicons name="checkmark-circle" size={16} color="#30d158" />
                <Text style={[styles.bannerText, { color: '#ffffff' }]}>
                  {selectedFood?.name} identified!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Preset Selector Panel */}
        <View style={styles.presetsSelectorHeader}>
          <Text style={[styles.presetsSelectorTitle, { color: colors.text }]}>Or Tap Presets to Scan</Text>
          <Text style={[styles.presetsSelectorSub, { color: colors.textSecondary }]}>
            Simulate calorie portions scanner instantly
          </Text>
        </View>

        <View style={styles.presetsSelectorGrid}>
          {FOOD_PRESETS.map((food) => (
            <Pressable
              key={food.id}
              style={[
                styles.gridCard,
                { backgroundColor: colors.backgroundElement },
                selectedFood?.id === food.id && { borderColor: '#bf5af2', borderWidth: 2 }
              ]}
              onPress={() => triggerScan(food)}
            >
              <Image source={{ uri: food.image }} style={styles.gridCardImg} />
              <View style={styles.gridCardInfo}>
                <Text style={[styles.gridCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {food.name}
                </Text>
                <Text style={[styles.gridCardCal, { color: colors.textSecondary }]}>
                  {food.calories} kcal • {food.macroType}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* --- APPLE SLIDING BOTTOM SHEET --- */}
      {showSheet && selectedFood && (
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              backgroundColor: colors.backgroundElement,
              transform: [{ translateY: sheetAnim }]
            }
          ]}
        >
          {/* Grabber indicator */}
          <View style={[styles.sheetGrabber, { backgroundColor: colors.backgroundSelected }]} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetCategory, { color: '#bf5af2' }]}>{selectedFood.category}</Text>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{selectedFood.name}</Text>
            </View>
            <Pressable style={styles.sheetCloseBtn} onPress={() => setShowSheet(false)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          {/* Nutrients Sheet Values Grid */}
          <View style={styles.sheetNutriGrid}>
            <View style={styles.sheetNutriCol}>
              <Text style={[styles.sheetNutriValue, { color: '#0a84ff' }]}>{liveCals}</Text>
              <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Calories</Text>
            </View>

            <View style={styles.sheetNutriCol}>
              <Text style={[styles.sheetNutriValue, { color: colors.text }]}>{liveProt}g</Text>
              <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Protein</Text>
            </View>

            <View style={styles.sheetNutriCol}>
              <Text style={[styles.sheetNutriValue, { color: colors.text }]}>{liveCarbs}g</Text>
              <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Carbs</Text>
            </View>

            <View style={styles.sheetNutriCol}>
              <Text style={[styles.sheetNutriValue, { color: colors.text }]}>{liveFats}g</Text>
              <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Fats</Text>
            </View>
          </View>

          {/* Portion adjusting options */}
          <View style={styles.portionAdjusterBox}>
            <View style={styles.portionLabelRow}>
              <Text style={[styles.portionTitle, { color: colors.text }]}>Adjust Portion Size</Text>
              <Text style={[styles.portionValueTag, { color: '#bf5af2' }]}>
                {portionSize.toFixed(2)}x ({portionSize === 1 ? 'Standard' : portionSize < 1 ? 'Small' : 'Large'})
              </Text>
            </View>

            {/* Styled buttons instead of raw inputs for high fidelity */}
            <View style={styles.portionQuickButtonsRow}>
              {([0.25, 0.5, 1.0, 1.5, 2.0, 3.0] as const).map((size) => (
                <Pressable
                  key={size}
                  style={[
                    styles.portionQuickBtn,
                    { backgroundColor: colors.backgroundSelected },
                    portionSize === size && { backgroundColor: '#bf5af2' }
                  ]}
                  onPress={() => setPortionSize(size)}
                >
                  <Text
                    style={[
                      styles.portionQuickBtnText,
                      { color: colors.text },
                      portionSize === size && { color: '#ffffff', fontWeight: 'bold' }
                    ]}
                  >
                    {size}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category of meal type */}
          <Text style={[styles.mealCategoryLabel, { color: colors.text }]}>Select Meal Category</Text>
          <View style={styles.mealSelectorRow}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.mealSelectBtn,
                  { backgroundColor: colors.backgroundSelected },
                  selectedMealType === type && { backgroundColor: '#30d158' }
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text
                  style={[
                    styles.mealSelectBtnText,
                    { color: colors.text },
                    selectedMealType === type && { color: '#ffffff', fontWeight: 'bold' }
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Confirm btn */}
          <Pressable style={styles.sheetLogConfirmBtn} onPress={handleConfirmLog}>
            <Ionicons name="checkmark-done" size={20} color="#ffffff" />
            <Text style={styles.sheetLogConfirmBtnText}>Log Meal to Dashboard</Text>
          </Pressable>
        </Animated.View>
      )}
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%'
  },
  viewfinderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four
  },
  viewfinderContainer: {
    width: '100%',
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6
  },
  viewfinderImg: {
    width: '100%',
    height: '100%',
    opacity: 0.8
  },
  sweepLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#bf5af2',
    shadowColor: '#bf5af2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3
  },
  glowReticle: {
    position: 'absolute',
    alignSelf: 'center',
    top: 40,
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 24,
    opacity: 0.35
  },
  glowReticleScanning: {
    borderColor: '#bf5af2',
    borderWidth: 2.5,
    opacity: 0.95
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#bf5af2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#bf5af2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4
  },
  boundingBoxDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff'
  },
  boundingBoxTag: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  boundingBoxTagText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: Spacing.three,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  bannerOverlaySuccess: {
    borderColor: 'rgba(48, 209, 88, 0.3)',
    backgroundColor: 'rgba(28, 28, 30, 0.95)'
  },
  bannerText: {
    color: '#bf5af2',
    fontSize: 12,
    fontWeight: '700'
  },
  presetsSelectorHeader: {
    marginVertical: Spacing.two
  },
  presetsSelectorTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  presetsSelectorSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  presetsSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: Spacing.two
  },
  gridCard: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.02)',
    flexGrow: 1,
    minWidth: 140
  },
  gridCardImg: {
    width: '100%',
    height: 100
  },
  gridCardInfo: {
    padding: Spacing.three
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  gridCardCal: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2000
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Spacing.two
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three
  },
  sheetCategory: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2
  },
  sheetCloseBtn: {
    padding: 4
  },
  sheetNutriGrid: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: Spacing.three
  },
  sheetNutriCol: {
    flex: 1,
    alignItems: 'center'
  },
  sheetNutriValue: {
    fontSize: 18,
    fontWeight: '800'
  },
  sheetNutriLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
  },
  portionAdjusterBox: {
    marginBottom: Spacing.three
  },
  portionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two
  },
  portionTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  portionValueTag: {
    fontSize: 13,
    fontWeight: '700'
  },
  portionQuickButtonsRow: {
    flexDirection: 'row',
    gap: 6
  },
  portionQuickBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  portionQuickBtnText: {
    fontSize: 11,
    fontWeight: '600'
  },
  mealCategoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.two
  },
  mealSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.four
  },
  mealSelectBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mealSelectBtnText: {
    fontSize: 11,
    fontWeight: '600'
  },
  sheetLogConfirmBtn: {
    backgroundColor: '#bf5af2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#bf5af2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  sheetLogConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  cameraCaptureOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  cameraShutterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  cameraShutterInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff'
  },
  cameraCaptureInstruction: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  }
});
