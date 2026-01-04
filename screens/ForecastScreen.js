import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { getForecast } from '../services/weatherApi';
import { useTheme } from '../context/ThemeContext';

export default function ForecastScreen({ route, navigation }) {
  const { city } = route.params;
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForecast(city)
      .then(setForecast)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.day}>{item.day}</Text>
      <Image
        style={styles.tinyIcon}
        source={{ uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png` }}
      />
      <Text>
        {item.min}° - {item.max}°
      </Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.center} />;
  return (
    <View style={styles.container}>
      <Button onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
        Back
      </Button>
      <Text style={styles.title}>5-Day Forecast for {city}</Text>
      <FlatList
        data={forecast}
        keyExtractor={(item) => item.day}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  day: { fontWeight: 'bold', width: 60 },
  tinyIcon: { width: 40, height: 40 },
  center: { flex: 1, justifyContent: 'center' },
});