import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View, Modal, TextInput } from 'react-native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const calcularMulta = (prestamo, tarifaPorDia = 1000) => {
    if (!prestamo.fechaDevolucion || !prestamo.fechaDevuelto) return 0;
    const fechaDev = new Date(prestamo.fechaDevolucion);
    const fechaReal = new Date(prestamo.fechaDevuelto);
    const diasRetraso = Math.ceil((fechaReal - fechaDev) / (1000 * 60 * 60 * 24));
    return diasRetraso > 0 ? diasRetraso * tarifaPorDia : 0;
};

const PrestamoList = (props) => {
    const [prestamos, setPrestamos] = useState([]);
    const [todosLosPrestamos, setTodosLosPrestamos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filtros, setFiltros] = useState({
        libro: '',
        usuario: '',
    });

    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
    const [mostrarPickerFin, setMostrarPickerFin] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Prestamos'), async (querySnapshot) => {
            const prestamosArray = [];

            for (const prestamoDoc of querySnapshot.docs) {
                const prestamoData = prestamoDoc.data();

                let usuario = { nombre: 'Desconocido' };
                if (prestamoData.usuarioId) {
                    const usuarioRef = doc(db, 'Usuarios', prestamoData.usuarioId);
                    const usuarioSnap = await getDoc(usuarioRef);
                    if (usuarioSnap.exists()) usuario = usuarioSnap.data();
                }

                let libro = { nombre: 'Desconocido' };
                if (prestamoData.libroId) {
                    const libroRef = doc(db, 'Libros', prestamoData.libroId);
                    const libroSnap = await getDoc(libroRef);
                    if (libroSnap.exists()) libro = libroSnap.data();
                }

                prestamosArray.push({
                    id: prestamoDoc.id,
                    fechaPrestamo: prestamoData.fechaPrestamo,
                    fechaDevolucion: prestamoData.fechaDevolucion,
                    fechaDevuelto: prestamoData.fechaDevuelto || null,
                    multaPagada: prestamoData.multaPagada || false,
                    estado: prestamoData.estado,
                    usuarioNombre: usuario.nombre || prestamoData.usuarioId,
                    libroNombre: libro.nombre || prestamoData.libroId,
                    multa: calcularMulta(prestamoData),
                });
            }

            setTodosLosPrestamos(prestamosArray);
            setPrestamos(prestamosArray);
        });

        return () => unsubscribe();
    }, []);

    const aplicarFiltros = () => {
        const filtrados = todosLosPrestamos.filter((p) => {
            const fechaPrestamo = new Date(p.fechaPrestamo);
            const dentroDelRango =
                (!fechaInicio || fechaPrestamo >= fechaInicio) &&
                (!fechaFin || fechaPrestamo <= fechaFin);

            return (
                (filtros.libro === '' || p.libroNombre.toLowerCase().includes(filtros.libro.toLowerCase())) &&
                (filtros.usuario === '' || p.usuarioNombre.toLowerCase().includes(filtros.usuario.toLowerCase())) &&
                dentroDelRango
            );
        });

        setPrestamos(filtrados);
        setModalVisible(false);
    };

    const limpiarFiltros = () => {
        setFiltros({ libro: '', usuario: '' });
        setFechaInicio(null);
        setFechaFin(null);
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

                <TouchableOpacity
                    style={[styles.button, styles.multas]}
                    onPress={() => props.navigation.navigate('MultasList')}
                >
                    <Text style={styles.buttonText}>Multas</Text>
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
                            {prestamo.fechaDevuelto && (
                                <Text style={styles.listSubtitle}>
                                    Devuelto el: {prestamo.fechaDevuelto}
                                </Text>
                            )}
                            {prestamo.multa > 0 && (
                                <Text style={{ color: prestamo.multaPagada ? 'green' : 'red' }}>
                                    Multa: ${prestamo.multa} {prestamo.multaPagada ? '(Pagada)' : '(Pendiente)'}
                                </Text>
                            )}
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
                        <Text style={styles.label}>Desde (Fecha Inicio)</Text>
                        <TouchableOpacity onPress={() => setMostrarPickerInicio(true)} style={styles.input}>
                            <Text>{fechaInicio ? moment(fechaInicio).format('YYYY-MM-DD') : 'Seleccionar fecha'}</Text>
                        </TouchableOpacity>
                        {mostrarPickerInicio && (
                            <DateTimePicker
                                value={fechaInicio || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setMostrarPickerInicio(false);
                                    if (selectedDate) setFechaInicio(selectedDate);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hasta (Fecha Fin)</Text>
                        <TouchableOpacity onPress={() => setMostrarPickerFin(true)} style={styles.input}>
                            <Text>{fechaFin ? moment(fechaFin).format('YYYY-MM-DD') : 'Seleccionar fecha'}</Text>
                        </TouchableOpacity>
                        {mostrarPickerFin && (
                            <DateTimePicker
                                value={fechaFin || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setMostrarPickerFin(false);
                                    if (selectedDate) setFechaFin(selectedDate);
                                }}
                            />
                        )}
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
    topButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, gap: 10 },
    button: { flexGrow: 1, flexBasis: '40%', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    create: { backgroundColor: '#007BFF' },
    home: { backgroundColor: '#6F42C1' },
    filter: { backgroundColor: '#28a745' },
    multas: { backgroundColor: '#dc3545' },
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
        justifyContent: 'center',
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
