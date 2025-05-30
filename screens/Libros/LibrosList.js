import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';

const LibrosList = (props) => {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Libros'), (querySnapshot) => {
      const librosArray = [];
      querySnapshot.forEach((doc) => {
        librosArray.push({ id: doc.id, ...doc.data() });
      });
      setLibros(librosArray);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Libros</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => props.navigation.navigate('CreateLibro')}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Crear Libro</Text>
      </TouchableOpacity>

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
              <ListItem.Subtitle style={styles.listSubtitle}>
                {libro.descripcion} - {libro.cantidad}
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
    color: '#222',
  },
  createButton: {
    backgroundColor: '#007BFF',
    marginHorizontal: 30,
    marginBottom: 20,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  listContainer: {
    marginBottom: 40,
  },
  listItem: {
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  listTitle: {
    fontWeight: '700',
    fontSize: 17,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#555',
  },
});

export default LibrosList;
