import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useContext(AuthContext);

  const handleSignup = async () => {
    if (!formData.firstname || !formData.lastname || !formData.email || 
        !formData.phone || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    const result = await signup(formData);
    setLoading(false);

    if (result.success) {
      setSuccess('Account created! Please login');
      setTimeout(() => navigation.navigate('Login'), 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            label="First Name"
            value={formData.firstname}
            onChangeText={(text) => setFormData({...formData, firstname: text})}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Last Name"
            value={formData.lastname}
            onChangeText={(text) => setFormData({...formData, lastname: text})}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          <Button 
            mode="contained" 
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign Up
          </Button>

          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            Already have an account? Login
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#6200ee',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  linkButton: {
    marginTop: 10,
  },
});
