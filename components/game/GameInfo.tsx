import { gameStyles } from "@/styles/styles";
import { Text, useWindowDimensions, View } from "react-native";

interface GameInfoProps {
  level: number;
  score: number;
}

export default function GameInfo({ level, score }: GameInfoProps) {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 400;
  const isVerySmall = width < 320;
  const infoSize = isVerySmall ? 12 : isSmallScreen ? 14 : 18;

  return (
    <View style={gameStyles.infoContainer}>
      <Text style={[gameStyles.level, { fontSize: infoSize }]}>Level: {level}</Text>
      <Text style={[gameStyles.score, { fontSize: infoSize }]}>Score: {score}</Text>
    </View>
  );
}