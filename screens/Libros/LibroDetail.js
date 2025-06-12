import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../database/firebase';

const LibroDetail = (props) => {
  const [Libros, setLibro] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    generoLiterario: '',
    tematica: '',
    publicoObjetivo: '',
    tipoObra: '',
  });

  const [opciones, setOpciones] = useState({
    generos: [],
    tematicas: [],
    publicos: [],
    tipos: [],
  });

  const handleChangeText = (name, value) => {
    setLibro({ ...Libros, [name]: value });
  };

  const getOpcionesDesdeFirebase = async () => {
    const colecciones = ['generoLiterario', 'tematica', 'publicoObjetivo', 'tipoObra'];
    const nuevasOpciones = {};

    for (const col of colecciones) {
      const querySnapshot = await getDocs(collection(db, col));
      nuevasOpciones[col] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
      }));
    }

    setOpciones({
      generos: nuevasOpciones.generoLiterario,
      tematicas: nuevasOpciones.tematica,
      publicos: nuevasOpciones.publicoObjetivo,
      tipos: nuevasOpciones.tipoObra,
    });
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
        generoLiterario: data.generoLiterario || '',
        tematica: data.tematica || '',
        publicoObjetivo: data.publicoObjetivo || '',
        tipoObra: data.tipoObra || '',
      });
    }
  };

  const updateLibro = async () => {
    const libroId = props.route.params.libroId;
    const dbRef = doc(db, 'Libros', libroId);

    try {
      const docSnap = await getDoc(dbRef);
      if (!docSnap.exists()) {
        Alert.alert('Error', 'El libro no existe');
        return;
      }

      const libroActual = docSnap.data();
      const nuevaCantidad = parseInt(Libros.cantidad);
      const cantidadPrestada = libroActual.cantidadPrestada || 0;

      if (isNaN(nuevaCantidad) || nuevaCantidad < cantidadPrestada) {
        Alert.alert(
          'Cantidad inválida',
          `La nueva cantidad no puede ser menor que la cantidad prestada (${cantidadPrestada}).`
        );
        return;
      }

      const nuevaCantidadDisponible = nuevaCantidad - cantidadPrestada;

      await updateDoc(dbRef, {
        nombre: Libros.nombre,
        descripcion: Libros.descripcion,
        cantidad: nuevaCantidad,
        cantidadDisponible: nuevaCantidadDisponible,
        generoLiterario: Libros.generoLiterario,
        tematica: Libros.tematica,
        publicoObjetivo: Libros.publicoObjetivo,
        tipoObra: Libros.tipoObra,
      });

      Alert.alert('Libro actualizado');
      props.navigation.navigate('LibrosList');
    } catch (error) {
      console.error('Error actualizando libro:', error);
      Alert.alert('Error', 'No se pudo actualizar el libro');
    }
  };

  const deleteLibro = async () => {
    const libroId = props.route.params.libroId;

    try {
      // Verifica si hay préstamos asociados al libro
      const prestamosSnapshot = await getDocs(
        collection(db, 'Prestamos')
      );

      const prestamosAsociados = prestamosSnapshot.docs.filter(
        doc => doc.data().libroId === libroId
      );

      if (prestamosAsociados.length > 0) {
        Alert.alert(
          'No se puede eliminar',
          'Este libro tiene préstamos asociados y no puede ser eliminado.'
        );
        return;
      }

      // Si no hay préstamos, eliminar
      const dbRef = doc(db, 'Libros', libroId);
      await deleteDoc(dbRef);
      Alert.alert('Libro eliminado correctamente');
      props.navigation.navigate('LibrosList');
    } catch (error) {
      console.error('Error eliminando libro:', error);
      Alert.alert('Error', 'No se pudo eliminar el libro');
    }
  };

  const openConfirmationAlert = () => {
    Alert.alert('Eliminar el libro', '¿Estás seguro de que deseas eliminar este libro?', [
      { text: 'Sí', onPress: deleteLibro },
      { text: 'No', style: 'cancel' },
    ]);
  };

  useEffect(() => {
    getOpcionesDesdeFirebase();
    getLibroById(props.route.params.libroId);
  }, []);

  const renderPicker = (label, selectedValue, onValueChange, items) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          dropdownIconColor="#333"
        >
          <Picker.Item label={`Seleccione ${label.toLowerCase()}`} value="" />
          {items.map((item) => (
            <Picker.Item key={item.id} label={item.nombre} value={item.nombre} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre del Libro</Text>
        <TextInput
          style={styles.input}
          value={Libros.nombre}
          onChangeText={(value) => handleChangeText('nombre', value)}
          placeholder="Ingrese el nombre"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={Libros.descripcion}
          onChangeText={(value) => handleChangeText('descripcion', value)}
          placeholder="Ingrese una descripción"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          value={Libros.cantidad}
          onChangeText={(value) => handleChangeText('cantidad', value)}
          placeholder="Ingrese la cantidad"
          keyboardType="numeric"
        />
      </View>

      {renderPicker('Género Literario', Libros.generoLiterario, (value) => handleChangeText('generoLiterario', value), opciones.generos)}
      {renderPicker('Temática', Libros.tematica, (value) => handleChangeText('tematica', value), opciones.tematicas)}
      {renderPicker('Público Objetivo', Libros.publicoObjetivo, (value) => handleChangeText('publicoObjetivo', value), opciones.publicos)}
      {renderPicker('Tipo de Obra', Libros.tipoObra, (value) => handleChangeText('tipoObra', value), opciones.tipos)}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.updateButton} onPress={updateLibro} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Actualizar Libro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={openConfirmationAlert} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Borrar Libro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 80,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  updateButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LibroDetail;
