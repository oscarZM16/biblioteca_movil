// LibrosList.js
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View, Modal, TextInput } from 'react-native';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';

const LibrosList = (props) => {
  const [libros, setLibros] = useState([]);
  const [todosLosLibros, setTodosLosLibros] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtros, setFiltros] = useState({
    nombre: '',
    generoLiterario: '',
    tematica: '',
    publicoObjetivo: '',
    tipoObra: '',
  });

  const [generos, setGeneros] = useState([]);
  const [tematicas, setTematicas] = useState([]);
  const [publicos, setPublicos] = useState([]);
  const [tiposObra, setTiposObra] = useState([]);

  useEffect(() => {
    const unsubscribeLibros = onSnapshot(collection(db, 'Libros'), (querySnapshot) => {
      const librosArray = [];
      querySnapshot.forEach((doc) => librosArray.push({ id: doc.id, ...doc.data() }));
      setTodosLosLibros(librosArray);
      setLibros(librosArray);
    });

    const cargarCategorias = async () => {
      const cargar = async (col, setter) => {
        const snapshot = await getDocs(collection(db, col));
        const items = snapshot.docs.map(doc => doc.data().nombre);
        setter(items);
      };

      cargar('generoLiterario', setGeneros);
      cargar('tematica', setTematicas);
      cargar('publicoObjetivo', setPublicos);
      cargar('tipoObra', setTiposObra);
    };

    cargarCategorias();

    return () => unsubscribeLibros();
  }, []);

  const aplicarFiltros = () => {
    const filtrados = todosLosLibros.filter((libro) => {
      return (
        (filtros.nombre === '' || libro.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
        (filtros.generoLiterario === '' || libro.generoLiterario === filtros.generoLiterario) &&
        (filtros.tematica === '' || libro.tematica === filtros.tematica) &&
        (filtros.publicoObjetivo === '' || libro.publicoObjetivo === filtros.publicoObjetivo) &&
        (filtros.tipoObra === '' || libro.tipoObra === filtros.tipoObra)
      );
    });
    setLibros(filtrados);
    setModalVisible(false);
  };

  const limpiarFiltros = () => {
    setFiltros({
      nombre: '',
      generoLiterario: '',
      tematica: '',
      publicoObjetivo: '',
      tipoObra: '',
    });
    setLibros(todosLosLibros);
    setModalVisible(false);
  };

  const renderPicker = (label, value, onChange, items) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
        <Picker.Item label={`Seleccione ${label.toLowerCase()}`} value="" />
        {items.map((item, i) => (
          <Picker.Item key={i} label={item} value={item} />
        ))}
      </Picker>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Libros</Text>

      <View style={styles.topButtons}>
        <TouchableOpacity
          style={[styles.button, styles.create]}
          onPress={() => props.navigation.navigate('CreateLibro')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Crear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.filter]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Filtrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.home]}
          onPress={() => props.navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {libros.map((libro) => (
          <ListItem
            key={libro.id}
            bottomDivider
            containerStyle={styles.listItem}
            onPress={() => props.navigation.navigate('LibroDetail', { libroId: libro.id })}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.listTitle}>{libro.nombre}</ListItem.Title>
              <ListItem.Subtitle style={styles.listSubtitle}>{libro.descripcion}</ListItem.Subtitle>
              <Text style={styles.metaText}>Cantidad total: {libro.cantidad}</Text>
              <Text style={styles.metaText}>Cantidad disponible: {libro.cantidadDisponible}</Text>
              <Text style={styles.metaText}>Cantidad prestada: {libro.cantidadPrestada}</Text>
              <Text style={styles.metaText}>Género: {libro.generoLiterario}</Text>
              <Text style={styles.metaText}>Temática: {libro.tematica}</Text>
              <Text style={styles.metaText}>Público: {libro.publicoObjetivo}</Text>
              <Text style={styles.metaText}>Tipo de Obra: {libro.tipoObra}</Text>
              <Text style={styles.metaText}>Estado: {libro.estado}</Text>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </View>

      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.title}>Filtrar Libros</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={filtros.nombre}
              onChangeText={(text) => setFiltros({ ...filtros, nombre: text })}
              placeholder="Nombre del libro"
              placeholderTextColor="#999"
            />
          </View>

          {renderPicker('Género Literario', filtros.generoLiterario,
            (value) => setFiltros({ ...filtros, generoLiterario: value }), generos)}
          {renderPicker('Temática', filtros.tematica,
            (value) => setFiltros({ ...filtros, tematica: value }), tematicas)}
          {renderPicker('Público Objetivo', filtros.publicoObjetivo,
            (value) => setFiltros({ ...filtros, publicoObjetivo: value }), publicos)}
          {renderPicker('Tipo de Obra', filtros.tipoObra,
            (value) => setFiltros({ ...filtros, tipoObra: value }), tiposObra)}

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={aplicarFiltros} style={styles.applyButton}>
              <Text style={styles.buttonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={limpiarFiltros} style={styles.clearButton}>
              <Text style={styles.buttonText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 15, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 15, color: '#222' },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  create: {
    backgroundColor: '#007BFF',
  },
  filter: {
    backgroundColor: '#28A745',
  },
  home: {
    backgroundColor: '#6F42C1',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listContainer: { marginBottom: 40 },
  listItem: { borderRadius: 8, marginBottom: 10, backgroundColor: '#f8f8f8' },
  listTitle: { fontWeight: '700', fontSize: 17 },
  listSubtitle: { fontSize: 14, color: '#555', marginBottom: 4 },
  metaText: { fontSize: 13, color: '#666' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalButtons: {
    marginTop: 20,
    gap: 10,
  },
  applyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default LibrosList;
