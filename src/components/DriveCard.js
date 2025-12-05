import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Button, Alert, Image } from 'react-native';

const Tag = ({ label, color = '#4caf50' }) => (
  <View style={[styles.tag, { backgroundColor: color }]} accessible accessibilityLabel={`${label} tag`}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const DriveCard = ({ drive = {}, weekDeduction = null, onDelete = () => {}, onReclassify = () => {}, onSave = () => {} }) => {
  const [expanded, setExpanded] = useState(false);
  const [purpose, setPurpose] = useState(drive.purpose || 'Business');
  const [vehicle, setVehicle] = useState(drive.vehicle || 'Default');
  const [notes, setNotes] = useState(drive.notes || '');

  const distance = drive.distance ?? 0;
  const value = ((drive.distance ?? 0) * 0.7).toFixed(2); // placeholder calc using business rate

  const handleDelete = () => {
    Alert.alert('Delete drive', 'Are you sure you want to delete this drive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(drive) },
    ]);
  };

  return (
    <Pressable
      onPress={() => setExpanded((s) => !s)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Drive card. ${distance} miles. ${drive.purpose || 'No purpose'}. Double tap to ${expanded ? 'collapse' : 'expand'}`}>

      {/* Header row */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.distance}>{Number(distance).toFixed(1)} mi</Text>
          <Text style={styles.small}>{drive.start ? new Date(drive.start).toLocaleString() : ''} → {drive.end ? new Date(drive.end).toLocaleString() : ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.value}>${value}</Text>
          <Tag label={drive.purpose || 'Miscellaneous'} color={drive.status === 'logged' ? '#4caf50' : '#ff9800'} />
        </View>
      </View>

      {/* Expanded area */}
      {expanded && (
        <View style={styles.expanded}>
          {/* Week deduction row */}
          {typeof weekDeduction === 'number' && (
            <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f7f9fc', borderRadius: 6 }} accessible accessibilityRole="text">
              <Text style={{ fontSize: 14, color: '#333', fontWeight: '700' }}>This week's estimated usage</Text>
              <Text style={{ fontSize: 14, color: '#2e7d32', marginTop: 4 }}>${Number(weekDeduction).toFixed(2)}</Text>
            </View>
          )}
          {/* Route map preview (static placeholder image). Replace with react-native-maps or static map provider later */}
          <View style={styles.mapPlaceholder} accessible accessibilityLabel="Route map preview">
            <Image
              source={{ uri: (() => {
                // Prefer an explicit drive.mapImage
                if (drive.mapImage) return drive.mapImage;
                const mapConfig = require('../config/mapConfig').default;
                const sc = drive.startCoords || drive.startLocation;
                if (sc && sc.latitude && sc.longitude) {
                  const lat = sc.latitude;
                  const lon = sc.longitude;
                  const zoom = mapConfig.defaultZoom || 13;
                  const size = mapConfig.defaultSize || '600x300';
                  if (mapConfig.googleApiKey) {
                    // Google Static Maps
                    // Example: https://maps.googleapis.com/maps/api/staticmap?center=LAT,LON&zoom=13&size=600x300&markers=color:red|LAT,LON&key=APIKEY
                    const marker = `color:red|${lat},${lon}`;
                    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${size}&markers=${encodeURIComponent(marker)}&key=${mapConfig.googleApiKey}`;
                  }
                  // Fallback to OSM static map
                  const marker = `${lat},${lon},red-pushpin`;
                  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=${size}&markers=${marker}`;
                }
                // fallback placeholder
                return 'https://via.placeholder.com/600x300?text=Map+Preview';
              })() }}
              style={{ width: '100%', height: '100%', borderRadius: 6 }}
              resizeMode="cover"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput value={purpose} onChangeText={setPurpose} style={styles.input} accessibilityLabel="Edit purpose" />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Vehicle</Text>
            <TextInput value={vehicle} onChangeText={setVehicle} style={styles.input} accessibilityLabel="Edit vehicle" />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Notes</Text>
            <TextInput value={notes} onChangeText={setNotes} style={[styles.input, { height: 60 }]} accessibilityLabel="Edit notes" multiline />
          </View>

          <View style={styles.actionsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Button title="Reclassify" onPress={() => onReclassify(drive)} accessibilityLabel="Reclassify drive" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Button title="Delete" color="#d32f2f" onPress={handleDelete} accessibilityLabel="Delete drive" />
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <Button title="Save Changes" onPress={() => onSave({ ...drive, purpose, vehicle, notes })} accessibilityLabel="Save drive changes" />
          </View>
        </View>
      )}

    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 18,
    fontWeight: '700',
  },
  small: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  expanded: {
    marginTop: 12,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  formRow: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});

export default DriveCard;
