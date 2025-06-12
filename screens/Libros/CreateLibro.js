import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../database/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const CreateLibro = (props) => {
  const [state, setState] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    generoLiterario: '',
    tematica: '',
    publicoObjetivo: '',
    tipoObra: '',
    estado: 'disponible',
  });

  const [opciones, setOpciones] = useState({
    generos: [],
    tematicas: [],
    publicos: [],
    tipos: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const cargar = async (nombreCol) => {
        const snapshot = await getDocs(collection(db, nombreCol));
        return snapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre,
        }));
      };

      const [generos, tematicas, publicos, tipos] = await Promise.all([
        cargar('generoLiterario'),
        cargar('tematica'),
        cargar('publicoObjetivo'),
        cargar('tipoObra'),
      ]);

      setOpciones({ generos, tematicas, publicos, tipos });
    };

    cargarOpciones();
  }, []);

  const handleChangeText = (name, value) => {
    setState({ ...state, [name]: value });
  };

  const validateCantidad = (value) => /^[0-9]+$/.test(value);

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
        generoLiterario: state.generoLiterario,
        tematica: state.tematica,
        publicoObjetivo: state.publicoObjetivo,
        tipoObra: state.tipoObra,
        estado: state.estado,
      });
      props.navigation.navigate('LibrosList');
    } catch (error) {
      console.error('Error al guardar libro:', error);
      Alert.alert('Error', 'Hubo un error al guardar');
    }
  };

  const renderPicker = (label, selectedValue, onValueChange, items) => (
    <View style={styles.inputGroup}>
      <Text style={{ marginBottom: 5 }}>{label}</Text>
      <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
        <Picker.Item label={`Selecciona un ${label.toLowerCase()}`} value="" />
        {items.map((item) => (
          <Picker.Item key={item.id} label={item.nombre} value={item.nombre} />
        ))}
      </Picker>
    </View>
  );

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
          maxLength={4}
        />
      </View>

      {renderPicker('Género Literario', state.generoLiterario, (v) => handleChangeText('generoLiterario', v), opciones.generos)}
      {renderPicker('Temática', state.tematica, (v) => handleChangeText('tematica', v), opciones.tematicas)}
      {renderPicker('Público Objetivo', state.publicoObjetivo, (v) => handleChangeText('publicoObjetivo', v), opciones.publicos)}
      {renderPicker('Tipo de Obra', state.tipoObra, (v) => handleChangeText('tipoObra', v), opciones.tipos)}

      <View style={styles.inputGroup}>
        <Text style={{ marginBottom: 5 }}>Estado</Text>
        <Picker
          selectedValue={state.estado}
          onValueChange={(value) => handleChangeText('estado', value)}
          style={styles.picker}
        >
          <Picker.Item label="Disponible" value="disponible" />
          <Picker.Item label="Sin stock" value="sin stock" />
        </Picker>
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
  picker: {
    height: 48,
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
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
