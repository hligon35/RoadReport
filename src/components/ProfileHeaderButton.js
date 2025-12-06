import React, { useContext, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ModalCloseContext } from '../context/ModalCloseContext';

const ProfileHeaderButton = ({ size = 22 }) => {
  const navigation = useNavigation();
  const { closeAll } = useContext(ModalCloseContext) || {};

  const handlePress = useCallback(() => {
    try {
      closeAll && closeAll();
    } catch (e) {
      // ignore
    }
    navigation.navigate('Profile');
  }, [closeAll, navigation]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{ paddingBottom: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <Ionicons name="person-outline" size={size} color="#1565c0" />
    </TouchableOpacity>
  );
};
export default React.memo(ProfileHeaderButton);
