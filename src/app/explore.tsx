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
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AnimatedView from 'react-native-reanimated';
import { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { NutritionService, NutritionItem } from '@/services/nutritionApi';
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

  // Multi-ingredient portion & custom lists
  const [ingredientPortions, setIngredientPortions] = useState<number[]>([]);
  const [activeComponents, setActiveComponents] = useState<typeof FOOD_PRESETS[0]['components']>([]);

  // New real-world search logic
  const handleSearchDatabase = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await NutritionService.searchFood(searchQuery);
      if (results && results.length > 0) {
        const topMatch = results[0];
        setSelectedFood({
          id: topMatch.id,
          name: topMatch.name,
          category: topMatch.category || 'General',
          calories: topMatch.calories,
          protein: topMatch.protein,
          carbs: topMatch.carbs,
          fats: topMatch.fats,
          macroType: 'API Result',
          image: topMatch.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
          components: [
            { label: topMatch.name, x: 20, y: 20, w: 60, h: 60, calories: topMatch.calories, protein: topMatch.protein, carbs: topMatch.carbs, fats: topMatch.fats }
          ]
        });
        setIsSearching(false);
      } else {
        alert('No matching foods found in the database. Try being more specific!');
      }
    } catch (err) {
      alert('Error connecting to nutrition database. Please check your API keys!');
    }
  };

  // Update the search results rendering to be more dynamic
  const renderSearchResults = () => {
    return (
      <ScrollView horizontal={false} nestedScrollEnabled style={{ maxHeight: 150 }} showsVerticalScrollIndicator={true}>
        <View style={styles.searchResultsGrid}>
          {/* We keep the presets as "Suggested" but the API now handles the primary search */}
          {FOOD_PRESETS.filter(food =>
            food.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(food => (
            <Pressable
              key={food.id}
              style={[styles.searchResultCard, { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundSelected }]}
              onPress={() => {
                setSelectedFood(food);
                setIsSearching(false);
              }}
            >
              <Image source={{ uri: food.image }} style={styles.searchResultImg} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.searchResultName, { color: colors.text }]}>{food.name}</Text>
                <Text style={[styles.searchResultCat, { color: colors.textSecondary }]}>Preset • {food.calories} kcal</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Custom ingredient inputs
  const [showAddCustomIngredient, setShowAddCustomIngredient] = useState(false);
  const [newIngredientLabel, setNewIngredientLabel] = useState('');
  const [newIngredientCals, setNewIngredientCals] = useState('');
  const [newIngredientProt, setNewIngredientProt] = useState('');
  const [newIngredientCarbs, setNewIngredientCarbs] = useState('');
  const [newIngredientFats, setNewIngredientFats] = useState('');

  // Sync state when food is identified
  useEffect(() => {
    if (selectedFood) {
      setActiveComponents([...selectedFood.components]);
      setIngredientPortions(selectedFood.components.map(() => 1.0));
      setCustomMealName(selectedFood.name);
      setIsCustomMeal(selectedFood.id.startsWith('custom_'));
    } else {
      setActiveComponents([]);
      setIngredientPortions([]);
      setIsCustomMeal(false);
    }
  }, [selectedFood]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScannerMode('analyzed');
        // Delay sliding bottom sheet to let bounding boxes shine!
        setTimeout(() => {
          setPortionSize(1.0);
          setShowSheet(true);
        }, 1200);
      }
    }, 600);

  };

  const handlePortionChange = (idx: number, delta: number) => {
    const updated = [...ingredientPortions];
    updated[idx] = Math.max(0.1, Number(((updated[idx] ?? 1.0) + delta).toFixed(1)));
    setIngredientPortions(updated);
  };

  const handleDeleteIngredient = (idx: number) => {
    const updatedComps = activeComponents.filter((_, i) => i !== idx);
    const updatedPortions = ingredientPortions.filter((_, i) => i !== idx);
    setActiveComponents(updatedComps);
    setIngredientPortions(updatedPortions);
  };

  const handleAddIngredient = () => {
    if (!newIngredientLabel.trim() || !newIngredientCals.trim()) {
      alert('Please enter a name and calorie count for the ingredient!');
      return;
    }
    const cals = Math.max(0, parseInt(newIngredientCals) || 0);
    const prot = Math.max(0, parseInt(newIngredientProt) || 0);
    const carbs = Math.max(0, parseInt(newIngredientCarbs) || 0);
    const fats = Math.max(0, parseInt(newIngredientFats) || 0);

    const newComp = {
      label: newIngredientLabel.trim(),
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      w: 30,
      h: 30,
      calories: cals,
      protein: prot,
      carbs: carbs,
      fats: fats
    };

    setActiveComponents([...activeComponents, newComp]);
    setIngredientPortions([...ingredientPortions, 1.0]);

    // Reset inputs
    setNewIngredientLabel('');
    setNewIngredientCals('');
    setNewIngredientProt('');
    setNewIngredientCarbs('');
    setNewIngredientFats('');
    setShowAddCustomIngredient(false);
  };

  const handleCreateCustomMeal = () => {
    const customFood = {
      id: 'custom_' + Date.now(),
      name: 'Custom Meal',
      category: 'Custom Entry',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      macroType: 'Custom',
      image: capturedImageUri || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
      components: [
        { label: 'Base Ingredient', x: 25, y: 25, w: 50, h: 50, calories: 150, protein: 10, carbs: 15, fats: 5 }
      ]
    };
    setSelectedFood(customFood);
    setIsSearching(false);
  };

  // Sum of ingredients based on individual portion sizes
  let liveCals = 0;
  let liveProt = 0;
  let liveCarbs = 0;
  let liveFats = 0;

  activeComponents.forEach((comp, idx) => {
    const multiplier = ingredientPortions[idx] ?? 1.0;
    liveCals += comp.calories * multiplier;
    liveProt += comp.protein * multiplier;
    liveCarbs += comp.carbs * multiplier;
    liveFats += comp.fats * multiplier;
  });

  liveCals = Math.round(liveCals);
  liveProt = Math.round(liveProt);
  liveCarbs = Math.round(liveCarbs);
  liveFats = Math.round(liveFats);

  const handleConfirmLog = () => {
    if (!selectedFood) return;

    logMeal(
      isCustomMeal ? customMealName.trim() : selectedFood.name,
      selectedFood.category,
      liveCals,
      liveProt,
      liveCarbs,
      liveFats,
      1.0, // Portion is custom calculated within ingredients
      selectedMealType
    );

    // Hide sheet and reset
    setShowSheet(false);
    setTimeout(() => {
      setScannerMode('idle');
      setSelectedFood(null);
      setIsSearching(false);
      setIsCustomMeal(false);
      // Route back to home summary tab
      router.push('/');
    }, 400);
  };

  // Interpolate translate Y for sweeping laser
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240] // Camera viewport height bounding limit
  });

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

          <ScrollView
            style={{ maxHeight: Dimensions.get('window').height * 0.70 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.four }}
          >
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetCategory, { color: '#bf5af2' }]}>
                  {selectedFood.category}
                </Text>
                {isCustomMeal ? (
                  <TextInput
                    style={[styles.sheetTitleInput, { color: colors.text, borderBottomColor: '#bf5af2', borderBottomWidth: 1.5 }]}
                    value={customMealName}
                    onChangeText={setCustomMealName}
                    placeholder="Name your meal..."
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.sheetTitle, { color: colors.text }]}>{selectedFood.name}</Text>
                )}
              </View>
              <Pressable style={styles.sheetCloseBtn} onPress={() => setShowSheet(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Correction UI */}
            {!isSearching ? (
              <View style={[styles.correctionRow, { backgroundColor: colors.backgroundSelected + '20' }]}>
                <Text style={[styles.correctionText, { color: colors.textSecondary }]}>
                  Incorrect food identification?
                </Text>
                <Pressable style={styles.correctionBtn} onPress={() => { setIsSearching(true); setSearchQuery(''); }}>
                  <Ionicons name="search" size={12} color="#ffffff" />
                  <Text style={styles.correctionBtnText}>Correct It</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.searchContainer}>
                <View style={styles.searchActionsRow}>
                  <TextInput
                    style={[styles.searchInput, { color: colors.text, backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundSelected, flex: 1 }]}
                    placeholder="Search database..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  <Pressable style={styles.cancelSearchBtn} onPress={() => setIsSearching(false)}>
                    <Text style={[styles.cancelSearchText, { color: '#ff453a' }]}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.customMealBtn} onPress={handleCreateCustomMeal}>
                    <Ionicons name="create" size={13} color="#ffffff" />
                    <Text style={styles.customMealBtnText}>Custom</Text>
                  </Pressable>
                </View>

                {/* Filtered preset results */}
                <ScrollView horizontal={false} nestedScrollEnabled style={{ maxHeight: 150 }} showsVerticalScrollIndicator={true}>
                  <View style={styles.searchResultsGrid}>
                    {FOOD_PRESETS.filter(food =>
                      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      food.category.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(food => (
                      <Pressable
                        key={food.id}
                        style={[styles.searchResultCard, { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundSelected }]}
                        onPress={() => {
                          setSelectedFood(food);
                          setIsSearching(false);
                        }}
                      >
                        <Image source={{ uri: food.image }} style={styles.searchResultImg} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.searchResultName, { color: colors.text }]}>{food.name}</Text>
                          <Text style={[styles.searchResultCat, { color: colors.textSecondary }]}>{food.category} • {food.calories} kcal</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Nutrients Sheet Values Grid */}
            <View style={styles.sheetNutriGrid}>
              <View style={styles.sheetNutriCol}>
                <Text style={[styles.sheetNutriValue, { color: '#bf5af2' }]}>{liveCals}</Text>
                <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Calories</Text>
              </View>

              <View style={styles.sheetNutriCol}>
                <Text style={[styles.sheetNutriValue, { color: '#0a84ff' }]}>{liveProt}g</Text>
                <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Protein</Text>
              </View>

              <View style={styles.sheetNutriCol}>
                <Text style={[styles.sheetNutriValue, { color: '#ff9f0a' }]}>{liveCarbs}g</Text>
                <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Carbs</Text>
              </View>

              <View style={styles.sheetNutriCol}>
                <Text style={[styles.sheetNutriValue, { color: '#30d158' }]}>{liveFats}g</Text>
                <Text style={[styles.sheetNutriLabel, { color: colors.textSecondary }]}>Fats</Text>
              </View>
            </View>

            {/* Ingredients Editor List Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Meal Ingredients</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>Adjust amounts below</Text>
            </View>

            <View style={styles.ingredientsList}>
              {activeComponents.map((comp, idx) => {
                const port = ingredientPortions[idx] ?? 1.0;
                const calcCals = Math.round(comp.calories * port);
                return (
                  <View key={idx} style={[styles.ingredientRow, { backgroundColor: colors.backgroundSelected }]}>
                    <Text style={[styles.ingredientLabel, { color: colors.text }]} numberOfLines={2}>
                      {comp.label}
                    </Text>
                    <View style={styles.ingredientControls}>
                      <Pressable style={styles.controlBtn} onPress={() => handlePortionChange(idx, -0.1)}>
                        <Text style={[styles.controlBtnText, { color: colors.text }]}>-</Text>
                      </Pressable>
                      <Text style={[styles.portionText, { color: colors.text }]}>{port.toFixed(1)}x</Text>
                      <Pressable style={styles.controlBtn} onPress={() => handlePortionChange(idx, 0.1)}>
                        <Text style={[styles.controlBtnText, { color: colors.text }]}>+</Text>
                      </Pressable>
                      <Text style={[styles.ingredientCals, { color: '#bf5af2' }]}>{calcCals} kcal</Text>
                      <Pressable style={styles.deleteIngredientBtn} onPress={() => handleDeleteIngredient(idx)}>
                        <Ionicons name="trash-outline" size={15} color="#ff453a" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Add Custom Ingredient Trigger */}
            {!showAddCustomIngredient ? (
              <Pressable
                style={[styles.addCustomBtn, { borderColor: '#bf5af2', backgroundColor: colors.backgroundSelected + '20' }]}
                onPress={() => setShowAddCustomIngredient(true)}
              >
                <Ionicons name="add" size={16} color="#bf5af2" />
                <Text style={[styles.addCustomBtnText, { color: '#bf5af2' }]}>Add Custom Ingredient</Text>
              </Pressable>
            ) : (
              <View style={[styles.customIngredientForm, { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundSelected }]}>
                <Text style={[styles.customFormTitle, { color: colors.text }]}>New Custom Ingredient</Text>
                
                <View style={{ gap: Spacing.two }}>
                  <View style={{ gap: 4 }}>
                    <Text style={[styles.formInputLabel, { color: colors.textSecondary }]}>Ingredient Name</Text>
                    <TextInput
                      style={[styles.customFormInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                      placeholder="e.g., Cheddar Cheese Slice"
                      placeholderTextColor={colors.textSecondary}
                      value={newIngredientLabel}
                      onChangeText={setNewIngredientLabel}
                    />
                  </View>

                  <View style={styles.formInputRow}>
                    <View style={styles.formInputCol}>
                      <Text style={[styles.formInputLabel, { color: colors.textSecondary }]}>Calories (kcal)</Text>
                      <TextInput
                        style={[styles.customFormInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                        placeholder="120"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={newIngredientCals}
                        onChangeText={setNewIngredientCals}
                      />
                    </View>
                    <View style={styles.formInputCol}>
                      <Text style={[styles.formInputLabel, { color: colors.textSecondary }]}>Protein (g)</Text>
                      <TextInput
                        style={[styles.customFormInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                        placeholder="8"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={newIngredientProt}
                        onChangeText={newIngredientProtText => setNewIngredientProt(newIngredientProtText)}
                      />
                    </View>
                  </View>

                  <View style={styles.formInputRow}>
                    <View style={styles.formInputCol}>
                      <Text style={[styles.formInputLabel, { color: colors.textSecondary }]}>Carbs (g)</Text>
                      <TextInput
                        style={[styles.customFormInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                        placeholder="1"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={newIngredientCarbs}
                        onChangeText={newIngredientCarbsText => setNewIngredientCarbs(newIngredientCarbsText)}
                      />
                    </View>
                    <View style={styles.formInputCol}>
                      <Text style={[styles.formInputLabel, { color: colors.textSecondary }]}>Fats (g)</Text>
                      <TextInput
                        style={[styles.customFormInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                        placeholder="10"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={newIngredientFats}
                        onChangeText={newIngredientFatsText => setNewIngredientFats(newIngredientFatsText)}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.formActionsRow}>
                  <Pressable style={styles.formCancelBtn} onPress={() => setShowAddCustomIngredient(false)}>
                    <Text style={[styles.formCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.formAddBtn} onPress={handleAddIngredient}>
                    <Text style={styles.formAddText}>Add Item</Text>
                  </Pressable>
                </View>
              </View>
            )}

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
          </ScrollView>
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
  },
  correctionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.two,
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.1)'
  },
  correctionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  correctionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0a84ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  correctionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  searchContainer: {
    marginVertical: Spacing.two,
    gap: Spacing.two
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 14
  },
  searchActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  cancelSearchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  cancelSearchText: {
    fontSize: 13,
    fontWeight: '600'
  },
  customMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#30d158',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  customMealBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxHeight: 200,
    paddingVertical: 4
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1
  },
  searchResultImg: {
    width: 36,
    height: 36,
    borderRadius: 8
  },
  searchResultName: {
    fontSize: 13,
    fontWeight: '700'
  },
  searchResultCat: {
    fontSize: 10,
    marginTop: 2
  },
  sheetTitleInput: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
    paddingVertical: 2,
    width: '80%'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.two
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  ingredientsList: {
    gap: Spacing.two,
    marginBottom: Spacing.three
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12
  },
  ingredientLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.two
  },
  ingredientControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  controlBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: '800'
  },
  portionText: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center'
  },
  ingredientCals: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right'
  },
  deleteIngredientBtn: {
    padding: 4,
    marginLeft: 4
  },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.three
  },
  addCustomBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  customIngredientForm: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.three
  },
  customFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  formInputRow: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  formInputCol: {
    flex: 1,
    gap: 4
  },
  formInputLabel: {
    fontSize: 10,
    fontWeight: '600'
  },
  customFormInput: {
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    fontSize: 12
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: Spacing.one
  },
  formCancelBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 8
  },
  formCancelText: {
    fontSize: 11,
    fontWeight: '600'
  },
  formAddBtn: {
    backgroundColor: '#bf5af2',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.four,
    borderRadius: 8
  },
  formAddText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  }
});
