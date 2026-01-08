import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { gameStyles } from '../../styles/styles';

export default function GameHeader() {
  const insets = useSafeAreaInsets();
  const { title, subtitle } = useResponsive();
  const logoSize = title + subtitle

  return (
    <View style={[gameStyles.header, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={[gameStyles.titleContainer, { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{
            width: logoSize,
            height: logoSize,
          }}
          contentFit="contain"
        />
        <View style={{ alignItems: 'center' }}>
          <Text style={[gameStyles.title, { fontSize: title }]}>L2W</Text>
          <Text style={[gameStyles.subtitle, { fontSize: subtitle }]}>Learn to Win</Text>
        </View>
      </View>
    </View>
  );
}

