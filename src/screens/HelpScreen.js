import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = ({ navigation }) => {
  const openEmail = () => {
    Alert.alert('Support', 'Open email composer to support@roadbiz.example (placeholder)');
  };

  const openArticle = (slug) => {
    Alert.alert('Article', `Open article: ${slug}`);
  };

  const openLegal = (name) => {
    Alert.alert(name, `Open ${name} (placeholder)`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ padding: 16 }}>
          <Text style={styles.sectionTitleLarge}>Support</Text>
          <TouchableOpacity style={styles.row} onPress={openEmail}>
            <View style={styles.rowLeft}><View style={styles.iconCircle}><Ionicons name="mail-outline" size={20} color="#444" /></View><Text style={styles.rowTitle}>Email</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <View style={{ height: 18 }} />
          <Text style={styles.sectionTitleLarge}>Suggested articles</Text>
          {/* Intentionally left empty as requested */}
          <View style={{ height: 8 }} />

          <View style={{ height: 18 }} />
          <Text style={styles.sectionTitleLarge}>Legal</Text>
          <TouchableOpacity style={styles.row} onPress={() => openLegal('Privacy & Cookies')}>
            <View style={styles.rowLeft}><View style={styles.iconCircle}><Ionicons name="document-text-outline" size={20} color="#444" /></View><Text style={styles.rowTitle}>Privacy & Cookies</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => openLegal('Terms of Service')}>
            <View style={styles.rowLeft}><View style={styles.iconCircle}><Ionicons name="document-text-outline" size={20} color="#444" /></View><Text style={styles.rowTitle}>Terms of Service</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => openLegal('Copyright')}>
            <View style={styles.rowLeft}><View style={styles.iconCircle}><Ionicons name="document-text-outline" size={20} color="#444" /></View><Text style={styles.rowTitle}>Copyright</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => openLegal('Third Party Notices')}>
            <View style={styles.rowLeft}><View style={styles.iconCircle}><Ionicons name="document-text-outline" size={20} color="#444" /></View><Text style={styles.rowTitle}>Third Party Notices</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionTitleLarge: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#fafafa' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
});

export default HelpScreen;
