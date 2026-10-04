import axios from 'axios';

/**
 * Nutritionix API Configuration
 * Note: In a production app, these should be stored in .env files
 */
const NUTRITIONIX_APP_ID = 'YOUR_APP_ID'; // Replace with your App ID
const NUTRITIONIX_API_KEY = 'YOUR_API_KEY'; // Replace with your API Key
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-app-id': NUTRITIONIX_APP_ID,
    'x-app-key': NUTRITIONIX_API_KEY,
    'Content-Type': 'application/json',
  },
});

export interface NutritionItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category?: string;
  image?: string;
}

export const NutritionService = {
  /**
   * Search for foods using natural language or keywords
   * Example: "1 large apple" or "Grilled Chicken"
   */
  async searchFood(query: string): Promise<NutritionItem[]> {
    try {
      const response = await apiClient.post('/natural/nutrients', {
        query: query,
      });

      const foods = response.data.foods;

      return foods.map((f: any) => ({
        id: f.nu_id,
        name: f.food_name,
        calories: f.nf_calories,
        protein: f.nf_protein,
        carbs: f.nf_total_carbohydrate,
        fats: f.nf_total_fat,
        category: f.food_category,
        image: `https://nutritionix.com/images/food/${f.nu_id}.jpg` // Approximation
      }));
    } catch (error) {
      console.error('Nutritionix API Error:', error);
      throw new Error('Failed to fetch nutrition data');
    }
  },

  /**
   * Search for a specific food by keyword (returning multiple options)
   */
  async getFoodOptions(query: string): Promise<NutritionItem[]> {
    try {
      const response = await apiClient.get(`/search/instant?query=${encodeURIComponent(query)}`);

      return response.data.common.map((f: any) => ({
        id: f.nu_id,
        name: f.food_name,
        calories: 0, // Instant search doesn't provide full macros
        protein: 0,
        carbs: 0,
        fats: 0,
        category: 'General',
      }));
    } catch (error) {
      console.error('Nutritionix Search Error:', error);
      throw new Error('Failed to search for food options');
    }
  },
};
