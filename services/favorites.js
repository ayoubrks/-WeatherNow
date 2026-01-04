import AsyncStorage from '@react-native-async-storage/async-storage';

const buildKey = (userId) => `@favorites_${userId}`;

export async function getFavorites(userId) {
  if (!userId) return [];
  const KEY = buildKey(userId);
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveFavorite(userId, city) {
  if (!userId) return;
  const KEY = buildKey(userId);
  const list = await getFavorites(userId);
  const already = list.find((c) => c.toLowerCase() === city.toLowerCase());
  if (already) return; // skip duplicates
  list.push(city);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function removeFavorite(userId, city) {
  if (!userId) return;
  const KEY = buildKey(userId);
  const list = await getFavorites(userId);
  const filtered = list.filter((c) => c.toLowerCase() !== city.toLowerCase());
  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
}