import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MealLog {
  id: string;
  time: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface UserProfile {
  name: string;
  goalCalories: number;
  weight: number;
  targetWeight: number;
  dietType: 'balanced' | 'highprotein' | 'keto' | 'vegan';
  goalProtein: number;
  goalCarbs: number;
  goalFats: number;
}

export interface AppState {
  userProfile: UserProfile;
  logs: MealLog[];
  waterLogged: number;
  activeBurn: number;
  weeklyHistory: number[];
}

const HISTORIC_BASE = [1780, 2150, 1420, 1980, 1650, 1820];

const DEFAULT_STATE: AppState = {
  userProfile: {
    name: 'Alex Carter',
    goalCalories: 2000,
    weight: 74,
    targetWeight: 72,
    dietType: 'balanced',
    goalProtein: 130,
    goalCarbs: 220,
    goalFats: 65
  },
  logs: [],
  waterLogged: 0,
  activeBurn: 0,
  weeklyHistory: [...HISTORIC_BASE]
};

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    async function loadState() {
      try {
        const saved = await AsyncStorage.getItem('nutriscan_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          // Backward compatibility check
          const userProfile = parsed.userProfile || DEFAULT_STATE.userProfile;
          if (userProfile.goalProtein === undefined) userProfile.goalProtein = 130;
          if (userProfile.goalCarbs === undefined) userProfile.goalCarbs = 220;
          if (userProfile.goalFats === undefined) userProfile.goalFats = 65;

          setState({
            userProfile,
            logs: parsed.logs || [],
            waterLogged: parsed.waterLogged ?? 0,
            activeBurn: parsed.activeBurn ?? 0,
            weeklyHistory: parsed.weeklyHistory && parsed.weeklyHistory.length > 0 ? parsed.weeklyHistory : [...HISTORIC_BASE]
          });
        }
      } catch (e) {
        console.error('Failed to load storage state', e);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  // Save state helper
  const saveState = async (updatedState: AppState) => {
    setState(updatedState);
    try {
      await AsyncStorage.setItem('nutriscan_state', JSON.stringify(updatedState));
    } catch (e) {
      console.error('Failed to save storage state', e);
    }
  };

  // Helper actions
  const logMeal = async (
    name: string,
    category: string,
    calories: number,
    protein: number,
    carbs: number,
    fats: number,
    portion: number,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    const newLog: MealLog = {
      id: 'log_' + Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name,
      category,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      portion,
      type: mealType
    };

    const updatedLogs = [...state.logs, newLog];
    
    // Sync today's total calories in weekly trends chart index 6 (today)
    const todayTotal = updatedLogs.reduce((sum, item) => sum + item.calories, 0);
    const updatedWeekly = [...state.weeklyHistory];
    updatedWeekly[updatedWeekly.length - 1] = todayTotal;

    const updatedState = {
      ...state,
      logs: updatedLogs,
      weeklyHistory: updatedWeekly
    };

    await saveState(updatedState);
  };

  const deleteMeal = async (logId: string) => {
    const updatedLogs = state.logs.filter((item: any) => item.id !== logId);
    
    // Recalculate today's total
    const todayTotal = updatedLogs.reduce((sum: number, item: any) => sum + item.calories, 0);
    const updatedWeekly = [...state.weeklyHistory];
    updatedWeekly[updatedWeekly.length - 1] = todayTotal;

    const updatedState = {
      ...state,
      logs: updatedLogs,
      weeklyHistory: updatedWeekly
    };

    await saveState(updatedState);
  };

  const addWater = async (ml: number) => {
    const updatedState = {
      ...state,
      waterLogged: state.waterLogged + ml
    };
    await saveState(updatedState);
  };

  const setWaterLevel = async (glasses: number) => {
    const updatedState = {
      ...state,
      waterLogged: glasses * 250
    };
    await saveState(updatedState);
  };

  const logCardio = async () => {
    const updatedState = {
      ...state,
      activeBurn: state.activeBurn + 150
    };
    await saveState(updatedState);
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    const updatedProfile = {
      ...state.userProfile,
      ...profileData
    } as UserProfile;

    const updatedState = {
      ...state,
      userProfile: updatedProfile
    };

    await saveState(updatedState);
  };

  const resetDailyLogs = async () => {
    const updatedWeekly = [...state.weeklyHistory];
    updatedWeekly[updatedWeekly.length - 1] = 0;

    const updatedState = {
      ...state,
      logs: [],
      waterLogged: 0,
      activeBurn: 0,
      weeklyHistory: updatedWeekly
    };

    await saveState(updatedState);
  };

  return {
    state,
    loading,
    logMeal,
    deleteMeal,
    addWater,
    setWaterLevel,
    logCardio,
    updateProfile,
    resetDailyLogs
  };
}
