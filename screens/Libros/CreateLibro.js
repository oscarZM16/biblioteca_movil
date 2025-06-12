import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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

    const cantidad = parseInt(state.cantidad);

    try {
      await addDoc(collection(db, 'Libros'), {
        nombre: state.nombre.trim(),
        descripcion: state.descripcion.trim(),
        cantidad: cantidad,
        cantidadDisponible: cantidad,
        cantidadPrestada: 0,
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
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label={`Selecciona un ${label.toLowerCase()}`} value="" />
          {items.map((item) => (
            <Picker.Item key={item.id} label={item.nombre} value={item.nombre} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
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
          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={state.estado}
              onValueChange={(value) => handleChangeText('estado', value)}
              style={styles.picker}
            >
              <Picker.Item label="Disponible" value="disponible" />
              <Picker.Item label="Sin stock" value="sin stock" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={createNewLibro} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Guardar Libro</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007BFF',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerWrapper: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  backgroundColor: '#f9f9f9',
  overflow: 'hidden',
  minHeight: 50,
  justifyContent: 'center',
},
picker: {
  width: '100%',
  color: '#333',
  fontSize: 16,
  paddingHorizontal: 10,
},

});

export default CreateLibro;
