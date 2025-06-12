import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View, Modal, TextInput } from 'react-native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';

const PrestamoList = (props) => {
    const [prestamos, setPrestamos] = useState([]);
    const [todosLosPrestamos, setTodosLosPrestamos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filtros, setFiltros] = useState({
        libro: '',
        usuario: '',
        fecha: '',
    });

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
            if (usuarioSnap.exists()) usuario = usuarioSnap.data();
            }

            // Obtener datos del libro
            let libro = { nombre: 'Desconocido' };
            if (prestamoData.libroId) {
            const libroRef = doc(db, 'Libros', prestamoData.libroId);
            const libroSnap = await getDoc(libroRef);
            if (libroSnap.exists()) libro = libroSnap.data();
            }

            prestamosArray.push({
            id: prestamoDoc.id,
            fechaPrestamo: prestamoData.fechaPrestamo,
            estado: prestamoData.estado,
            usuarioNombre: usuario.nombre || prestamoData.usuarioId,
            libroNombre: libro.nombre || prestamoData.libroId,
            });
        }

        setTodosLosPrestamos(prestamosArray);
        setPrestamos(prestamosArray);
        });

        return () => unsubscribe();
    }, []);

    const aplicarFiltros = () => {
        const filtrados = todosLosPrestamos.filter((p) =>
        (filtros.libro === '' || p.libroNombre.toLowerCase().includes(filtros.libro.toLowerCase())) &&
        (filtros.usuario === '' || p.usuarioNombre.toLowerCase().includes(filtros.usuario.toLowerCase())) &&
        (filtros.fecha === '' || p.fechaPrestamo.includes(filtros.fecha))
        );
        setPrestamos(filtrados);
        setModalVisible(false);
    };

    const limpiarFiltros = () => {
        setFiltros({ libro: '', usuario: '', fecha: '' });
        setPrestamos(todosLosPrestamos);
        setModalVisible(false);
    };

    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Lista de Préstamos</Text>

        <View style={styles.topButtons}>
            <TouchableOpacity
            style={[styles.button, styles.create]}
            onPress={() => props.navigation.navigate('CreatePrestamo')}
            >
            <Text style={styles.buttonText}>Solicitar</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.button, styles.filter]}
            onPress={() => setModalVisible(true)}
            >
            <Text style={styles.buttonText}>Filtrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.button, styles.home]}
            onPress={() => props.navigation.navigate('Home')}
            >
            <Text style={styles.buttonText}>Inicio</Text>
            </TouchableOpacity>
        </View>

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

        <Modal visible={modalVisible} animationType="slide">
            <ScrollView style={styles.modalContainer}>
            <Text style={styles.title}>Filtrar Préstamos</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Libro</Text>
                <TextInput
                style={styles.input}
                value={filtros.libro}
                onChangeText={(text) => setFiltros({ ...filtros, libro: text })}
                placeholder="Nombre del libro"
                placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                style={styles.input}
                value={filtros.usuario}
                onChangeText={(text) => setFiltros({ ...filtros, usuario: text })}
                placeholder="Nombre del usuario"
                placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de Préstamo</Text>
                <TextInput
                style={styles.input}
                value={filtros.fecha}
                onChangeText={(text) => setFiltros({ ...filtros, fecha: text })}
                placeholder="Ej: 2025-06-12"
                placeholderTextColor="#999"
                />
            </View>

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
    topButtons: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
    button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    create: { backgroundColor: '#007BFF', marginRight: 5 },
    home: { backgroundColor: '#6F42C1', marginLeft: 5 },
    filter: { backgroundColor: '#28a745', marginLeft: 5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    listContainer: { marginBottom: 40 },
    listItem: { borderRadius: 8, marginBottom: 10, backgroundColor: '#f8f8f8' },
    listTitle: { fontWeight: '700', fontSize: 17 },
    listSubtitle: { fontSize: 14, color: '#555' },
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
    modalButtons: { marginTop: 20, gap: 10 },
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

export default PrestamoList;
