import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';

const LibroDetail = (props) => {
  const [Libros, setLibro] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
  });

  const handleChangeText = (name, value) => {
    setLibro({ ...Libros, [name]: value });
  };

  const getLibroById = async (id) => {
    const dbRef = doc(db, 'Libros', id);
    const docSnap = await getDoc(dbRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setLibro({
        nombre: data.nombre,
        descripcion: data.descripcion,
        cantidad: data.cantidad.toString(),
      });
    }
  };

  const updateLibro = async () => {
    const dbRef = doc(db, 'Libros', props.route.params.libroId);
    await updateDoc(dbRef, {
      nombre: Libros.nombre,
      descripcion: Libros.descripcion,
      cantidad: parseInt(Libros.cantidad),
    });
    Alert.alert('Libro actualizado');
    props.navigation.navigate('LibrosList');
  };

  const deleteLibro = async () => {
    const dbRef = doc(db, 'Libros', props.route.params.libroId);
    await deleteDoc(dbRef);
    props.navigation.navigate('LibrosList');
  };

  const openConfirmationAlert = () => {
    Alert.alert('Eliminar el libro', '¿Estás seguro?', [
      { text: 'Sí', onPress: () => deleteLibro() },
      { text: 'No', style: 'cancel' },
    ]);
  };

  useEffect(() => {
    getLibroById(props.route.params.libroId);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <TextInput
          placeholder="Nombre Libro"
          style={styles.input}
          value={Libros.nombre}
          onChangeText={(value) => handleChangeText('nombre', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          placeholder="Descripción Libro"
          style={[styles.input, styles.textArea]}
          value={Libros.descripcion}
          onChangeText={(value) => handleChangeText('descripcion', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          placeholder="Cantidad Libro"
          style={styles.input}
          value={Libros.cantidad}
          onChangeText={(value) => handleChangeText('cantidad', value)}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={updateLibro} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Actualizar Libro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={openConfirmationAlert} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Borrar Libro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderColor: '#2196F3',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
  },
  updateButton: {
    backgroundColor: '#007BFF', // Azul vibrante
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C', // Rojo intenso
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LibroDetail;
