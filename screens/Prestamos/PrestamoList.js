import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';

const PrestamoList = (props) => {
    const [prestamos, setPrestamos] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Prestamos'), async (querySnapshot) => {
        const prestamosArray = [];

        for (const prestamoDoc of querySnapshot.docs) {
            const prestamoData = prestamoDoc.data();

            // Obtener datos del usuario
            let usuario = { nombre: 'Desconocido' };
            if (prestamoData.usuarioId) {
            const usuarioRef = doc(db, 'Usuarios', prestamoData.usuarioId);
            const usuarioSnap = await getDoc(usuarioRef);
            if (usuarioSnap.exists()) {
                usuario = usuarioSnap.data();
            }
            }

            // Obtener datos del libro
            let libro = { nombre: 'Desconocido' };
            if (prestamoData.libroId) {
            const libroRef = doc(db, 'Libros', prestamoData.libroId);
            const libroSnap = await getDoc(libroRef);
            if (libroSnap.exists()) {
                libro = libroSnap.data();
            }
            }

            prestamosArray.push({
            id: prestamoDoc.id,
            fechaPrestamo: prestamoData.fechaPrestamo,
            estado: prestamoData.estado,
            usuarioNombre: usuario.nombre || prestamoData.usuarioId,
            libroNombre: libro.nombre || prestamoData.libroId,
            });
        }

        setPrestamos(prestamosArray);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Lista de Préstamos</Text>

        <TouchableOpacity
            style={styles.createButton}
            onPress={() => props.navigation.navigate('CreatePrestamo')}
            activeOpacity={0.7}
        >
            <Text style={styles.createButtonText}>Nuevo Préstamo</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
            {prestamos.map((prestamo) => (
            <ListItem
                key={prestamo.id}
                bottomDivider
                containerStyle={styles.listItem}
                onPress={() => props.navigation.navigate('PrestamoDetail', { prestamoId: prestamo.id })}
            >
                <ListItem.Content>
                <ListItem.Title style={styles.listTitle}>
                    {prestamo.usuarioNombre} → {prestamo.libroNombre}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.listSubtitle}>
                    Fecha: {prestamo.fechaPrestamo} | Estado: {prestamo.estado}
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

export default PrestamoList;
