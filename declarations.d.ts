declare module 'expo-router' {
  export type Href = string | { pathname: string; params?: Record<string, any> };
  
  export const Link: any;
  
  export function useRouter(): {
    push: (href: Href) => void;
    replace: (href: Href) => void;
    back: () => void;
  };
  
  export function useLocalSearchParams<T extends Record<string, string | string[]> = Record<string, string | string[]>>(): T;

  export const DarkTheme: any;
  export const DefaultTheme: any;
  export const ThemeProvider: any;
}

declare module 'expo-router/ui' {
  export interface TabTriggerSlotProps {
    children?: import('react').ReactNode;
    isFocused?: boolean;
    [key: string]: any;
  }
  
  export interface TabListProps {
    children?: import('react').ReactNode;
    [key: string]: any;
  }
  
  export const Tabs: any;
  export const TabList: any;
  export const TabTrigger: any;
  export const TabSlot: any;
}

declare module 'expo-router/unstable-native-tabs' {
  export const NativeTabs: any;
  const content: any;
  export default content;
}

declare module 'react-native-reanimated' {
  export class Keyframe {
    constructor(definitions: Record<string, any>);
    duration(durationMs: number): Keyframe;
    withCallback(callback: (finished: boolean) => void): Keyframe;
  }
  
  export namespace Easing {
    export function elastic(x: number): any;
  }
  
  export const FadeIn: any;
  
  const Animated: {
    View: any;
    Text: any;
    Image: any;
    ScrollView: any;
  };
  
  export default Animated;
}
