import React, { useEffect, useState } from 'react';
import {
  ScrollView, Text, TouchableOpacity, StyleSheet, View, Modal, TextInput
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';

const UsuariosList = (props) => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterNombre, setFilterNombre] = useState('');
  const [filterCorreo, setFilterCorreo] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Usuarios'), (querySnapshot) => {
      const usuariosArray = [];
      querySnapshot.forEach((doc) => {
        usuariosArray.push({ id: doc.id, ...doc.data() });
      });
      setUsuarios(usuariosArray);
      setFilteredUsuarios(usuariosArray);
    });

    return () => unsubscribe();
  }, []);

  const applyFilters = () => {
    const nombre = filterNombre.trim().toLowerCase();
    const correo = filterCorreo.trim().toLowerCase();

    const filtered = usuarios.filter((usuario) => {
      const nombreMatch = nombre === '' || usuario.nombre?.toLowerCase().includes(nombre);
      const correoMatch = correo === '' || usuario.correo?.toLowerCase().includes(correo);
      return nombreMatch && correoMatch;
    });

    setFilteredUsuarios(filtered);
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setFilterNombre('');
    setFilterCorreo('');
    setFilteredUsuarios(usuarios);
    setFilterModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>

      <View style={styles.topButtons}>
        <TouchableOpacity
          style={[styles.button, styles.create]}
          onPress={() => props.navigation.navigate('CreateUsuario')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Crear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.filter]}
          onPress={() => setFilterModalVisible(true)}
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
        {filteredUsuarios.map((usuario) => (
          <ListItem
            key={usuario.id}
            bottomDivider
            containerStyle={styles.listItem}
            onPress={() =>
              props.navigation.navigate('UsuarioDetail', {
                usuarioId: usuario.id,
              })
            }
          >
            <ListItem.Content>
              <ListItem.Title style={styles.listTitle}>{usuario.nombre}</ListItem.Title>
              <ListItem.Subtitle style={styles.listSubtitle}>
                {usuario.correo} - {usuario.telefono}
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </View>

      <Modal animationType="slide" transparent={false} visible={filterModalVisible}>
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.title}>Filtrar Usuarios</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={filterNombre}
              onChangeText={setFilterNombre}
              placeholder="Nombre del usuario"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              value={filterCorreo}
              onChangeText={setFilterCorreo}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
              <Text style={styles.buttonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
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
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  create: {
    backgroundColor: '#007BFF',
    marginRight: 5,
  },
  filter: {
    backgroundColor: '#28A745',
    marginLeft: 5,
    marginRight: 5,
  },
  home: {
    backgroundColor: '#6F42C1',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listContainer: { marginBottom: 40 },
  listItem: { borderRadius: 8, marginBottom: 10, backgroundColor: '#f8f8f8' },
  listTitle: { fontWeight: '700', fontSize: 17 },
  listSubtitle: { fontSize: 14, color: '#555', marginBottom: 4 },

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
  modalButtons: {
    marginTop: 20,
    gap: 10,
  },
  applyButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
});

export default UsuariosList;
