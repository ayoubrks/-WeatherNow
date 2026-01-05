import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';

import { TextInput, Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import { getWeather } from '../services/weatherApi';
import { saveFavorite, getFavorites, removeFavorite } from '../services/favorites';

import * as Location from 'expo-location';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, profile, logout } = useAuth();

  const [city, setCity] = useState('');

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [locating, setLocating] = useState(false);
  const { dark, toggle, colors } = useTheme();

  useEffect(() => {
    const loadFav = async () => {
      if (!user?.uid) {
        setFavorites([]);
        await SplashScreen.hideAsync();
        return;
      }
      const favs = await getFavorites(user.uid);
      setFavorites(favs);
      await SplashScreen.hideAsync();
    };

    loadFav();
    const unsubscribe = navigation.addListener('focus', loadFav);
    return unsubscribe;
  }, [navigation, user?.uid]);

  useEffect(() => {
    if (profile?.city) {
      setCity(profile.city);
    }
  }, [profile?.city]);

  const handleSearch = async (inputCity) => {
    const targetCity = inputCity ?? city;
    if (!targetCity) return;
    console.log('🌍 city to search:', targetCity);   // <-- add this
    setLoading(true);
    setError('');
    try {
      const data = await getWeather(targetCity);
      setWeather(data);
      const favs = await getFavorites(user?.uid);

      setIsFav(favs.some((c) => c.toLowerCase() === data.name.toLowerCase()));
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  async function handleLocation() {
    setLocating(true);
    setError('');
    try {
      // 1. Ask permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLocating(false);
        return;
      }

      // 2. Get latitude & longitude
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // 3. Convert coords → city name (reverse geocode)
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityName = place?.city || place?.subregion || 'Unknown';

      // 4. Auto-fill the input and search
      setCity(cityName);
      await handleSearch(cityName);
    } catch (err) {
      setError('Could not get location');
    } finally {
      setLocating(false);
    }
  }

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
    },
    container: {
      padding: 30,
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    headerCard: {
      marginBottom: 20,
      backgroundColor: colors.card,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    headerLeft: {
      flexShrink: 1,
    },
    headerRight: {
      alignItems: 'flex-end',
      gap: 4,
    },

    title: { fontSize: 32, textAlign: 'center', marginBottom: 20, color: colors.primary },
    input: { marginBottom: 15, backgroundColor: colors.card },
    button: { marginTop: 10 },
    margin: { marginTop: 20 },
    error: { color: colors.error, textAlign: 'center', marginTop: 10 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 20,
      marginTop: 20,
      alignItems: 'center',
      elevation: 3,
    },

    city: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    temp: { fontSize: 48, color: colors.primary },
    desc: { fontSize: 18, textTransform: 'capitalize', color: colors.text },
    tinyLogo: { width: 50, height: 50 },
    favTitle: { fontSize: 18, marginTop: 20, marginBottom: 5, textAlign: 'center', color: colors.text },
    favoritesList: {
      gap: 8,
      marginBottom: 24,
    },
    favoriteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Button
          mode="text"
          icon={dark ? 'weather-night' : 'white-balance-sunny'}
          onPress={toggle}
          style={{ alignSelf: 'flex-end' }}>
          {dark ? 'Dark' : 'Light'}
        </Button>

        {profile && (
          <Card style={styles.headerCard}>
            <Card.Content style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
                  Bonjour {profile.firstName} {profile.lastName}
                </Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={{ color: colors.text }}>Ville : {profile.city}</Text>
                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>{profile.email}</Text>
                <Button mode="outlined" icon="logout" onPress={logout}>
                  Déconnexion
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <Text style={styles.title}>WeatherNow</Text>
        <TextInput
          label="Enter city"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <Button
          mode="text"
          icon="crosshairs-gps"
          onPress={handleLocation}
          loading={locating}
          disabled={locating}>
          Use my location
        </Button>

        <Button mode="contained" onPress={() => handleSearch()} style={styles.button}>
          Search
        </Button>

        {loading && <ActivityIndicator size="large" style={styles.margin} />}
        {error && <Text style={styles.error}>{error}</Text>}

        {weather && (
          <View style={styles.card}>
            <Text style={styles.city}>{weather.name}</Text>
            <Text style={styles.temp}>{weather.temp} °C</Text>
            <Text style={styles.desc}>{weather.description}</Text>
            <Image
              style={styles.tinyLogo}
              source={{
                uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
              }}
            />
          </View>
        )}
        {weather && (
          <>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Forecast', { city: weather.name })}
              style={{ marginTop: 15 }}>
              See 5-Day Forecast
            </Button>

            <Button
              icon={isFav ? 'delete' : 'star'}
              mode={isFav ? 'outlined' : 'contained'}
              onPress={async () => {
                if (!user?.uid) return;
                if (!weather?.name) return;
                if (isFav) {
                  await removeFavorite(user.uid, weather.name);
                  setIsFav(false);
                } else {
                  await saveFavorite(user.uid, weather.name);
                  setIsFav(true);
                }
                const favs = await getFavorites(user.uid);
                setFavorites(favs);
              }}
              style={{ marginTop: 10 }}>
              {isFav ? 'Remove from Favorites' : '⭐ Add to Favorites'}
            </Button>
          </>
        )}
        {favorites.length > 0 && (
          <>
            <Text style={styles.favTitle}>Favorites</Text>
            <View style={styles.favoritesList}>
              {favorites.map((item) => (
                <View key={item} style={styles.favoriteRow}>
                  <Button
                    mode="text"
                    onPress={async () => {
                      setCity(item);
                      await handleSearch(item);
                    }}>
                    {item}
                  </Button>
                  <Button
                    mode="text"
                    icon="delete"
                    onPress={async () => {
                      if (!user?.uid) return;
                      await removeFavorite(user.uid, item);
                      const favs = await getFavorites(user.uid);
                      setFavorites(favs);
                      if (weather?.name?.toLowerCase() === item.toLowerCase()) {
                        setIsFav(false);
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}