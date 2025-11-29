import { gameStyles } from "@/styles/styles";
import { Text, View } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";

interface GameInfoProps {
  level: number;
  score: number;
}

/**
 * Displays level and score information
 */
export default function GameInfo({ level, score }: GameInfoProps) {
  const { info } = useResponsive();

  return (
    <View style={gameStyles.infoContainer}>
      <Text style={[gameStyles.level, { fontSize: info }]}>Level: {level}</Text>
      <Text style={[gameStyles.score, { fontSize: info }]}>Score: {score}</Text>
    </View>
  );
}