import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SignUpScreen({ navigation }) {
  const { signup } = useAuth();
  const { colors } = useTheme();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.city || !form.email || !form.password) {
      setError('Tous les champs sont requis.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signup(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.primary }]}>Créer un compte</Text>

          <TextInput
            label="Prénom"
            value={form.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
            style={styles.input}
          />
          <TextInput
            label="Nom"
            value={form.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            style={styles.input}
          />
          <TextInput
            label="Ville"
            value={form.city}
            onChangeText={(text) => handleChange('city', text)}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            label="Mot de passe"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label="Confirmer le mot de passe"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
            S'inscrire
          </Button>

          <Button mode="text" onPress={() => navigation.navigate('SignIn')} style={styles.secondary}>
            J'ai déjà un compte
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  secondary: {
    marginTop: 12,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
});
