import { SafeAreaView } from "react-native-safe-area-context";
import { ViewStyle, StyleProp } from "react-native";
import { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: "#fff" }, style]}>
      {children}
    </SafeAreaView>
  );
}