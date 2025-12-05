import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ModalCloseContext } from '../context/ModalCloseContext';

const ProfileHeaderButton = ({ size = 22 }) => {
  const navigation = useNavigation();
  const { closeAll } = useContext(ModalCloseContext) || {};

  return (
    <TouchableOpacity
      onPress={() => { try { closeAll && closeAll(); } catch (e) {} ; navigation.navigate('Profile'); }}
      style={{ paddingBottom: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <Ionicons name="person-outline" size={size} color="#1565c0" />
    </TouchableOpacity>
  );
};

export default ProfileHeaderButton;
