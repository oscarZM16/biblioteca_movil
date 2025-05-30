import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { db } from '../../database/firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateLibro = (props) => {
  const [state, setState] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
  });

  const handleChangeText = (name, value) => {
    setState({ ...state, [name]: value });
  };

  const validateCantidad = (value) => {
    const re = /^[0-9]+$/;
    return re.test(value);
  };

  const createNewLibro = async () => {
    if (state.nombre.trim() === '') {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    if (state.cantidad && !validateCantidad(state.cantidad)) {
      Alert.alert('Error', 'La cantidad debe ser un número válido');
      return;
    }

    try {
      await addDoc(collection(db, 'Libros'), {
        nombre: state.nombre.trim(),
        descripcion: state.descripcion.trim(),
        cantidad: state.cantidad.trim(),
      });
      props.navigation.navigate('LibrosList');
    } catch (error) {
      console.error('Error al guardar libro:', error);
      Alert.alert('Error', 'Hubo un error al guardar');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.inputGroup}>
        <TextInput
          placeholder="Nombre del Libro"
          placeholderTextColor="#999"
          style={styles.input}
          value={state.nombre}
          onChangeText={(value) => handleChangeText('nombre', value)}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          placeholder="Descripción"
          placeholderTextColor="#999"
          style={[styles.input, { height: 100 }]}
          value={state.descripcion}
          onChangeText={(value) => handleChangeText('descripcion', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          placeholder="Cantidad"
          placeholderTextColor="#999"
          style={styles.input}
          value={state.cantidad}
          onChangeText={(value) => handleChangeText('cantidad', value)}
          keyboardType="numeric"
          returnKeyType="done"
          maxLength={4}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={createNewLibro} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Guardar Libro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2196F3',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateLibro;
