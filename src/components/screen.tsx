import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children, style }) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: "#fff" }, style]}>
      {children}
    </SafeAreaView>
  );
}