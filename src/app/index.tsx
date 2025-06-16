import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleClear = () => setQuery('');
  const handleSearch = () => {
    if (query?.trim()) {
      router.push({ pathname: '/results', params: { q: query } });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="Search GitHub repositories..."
          value={query}
          onChangeText={setQuery}
          right={query ? <TextInput.Icon icon="close" onPress={handleClear} /> : null}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Search
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
  },
  buttonContent: {
    height: 56,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 18,
  },
});
