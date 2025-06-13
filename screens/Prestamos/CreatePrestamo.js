import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreatePrestamo = (props) => {
    const [state, setState] = useState({
        usuarioId: '',
        libroId: '',
        fechaPrestamo: '',
        fechaFinalizacion: '',
        estado: 'prestado',
    });

    const [usuarios, setUsuarios] = useState([]);
    const [libros, setLibros] = useState([]);

    const [fecha, setFecha] = useState(new Date());
    const [mostrarFecha, setMostrarFecha] = useState(false);
    const [mostrarHora, setMostrarHora] = useState(false);

    const [fechaFin, setFechaFin] = useState(new Date());
    const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
    const [mostrarHoraFin, setMostrarHoraFin] = useState(false);

    const handleChangeText = (name, value) => {
        setState({ ...state, [name]: value });
    };

    const mostrarPickerFecha = () => setMostrarFecha(true);
    const mostrarPickerHora = () => setMostrarHora(true);
    const mostrarPickerFechaFin = () => setMostrarFechaFin(true);
    const mostrarPickerHoraFin = () => setMostrarHoraFin(true);

    const onChangeFecha = (event, selectedDate) => {
        const currentDate = selectedDate || fecha;
        setMostrarFecha(false);
        setFecha(currentDate);
        actualizarFechaHora(currentDate);
    };

    const onChangeHora = (event, selectedTime) => {
        const currentDate = selectedTime || fecha;
        setMostrarHora(false);
        setFecha(currentDate);
        actualizarFechaHora(currentDate);
    };

    const onChangeFechaFin = (event, selectedDate) => {
        const currentDate = selectedDate || fechaFin;
        setMostrarFechaFin(false);
        setFechaFin(currentDate);
        actualizarFechaHoraFin(currentDate);
    };

    const onChangeHoraFin = (event, selectedTime) => {
        const currentDate = selectedTime || fechaFin;
        setMostrarHoraFin(false);
        setFechaFin(currentDate);
        actualizarFechaHoraFin(currentDate);
    };

    const actualizarFechaHora = (date) => {
        const f = date;
        const formatted = `${f.getFullYear()}-${(f.getMonth() + 1).toString().padStart(2, '0')}-${f.getDate().toString().padStart(2, '0')} ${f.getHours().toString().padStart(2, '0')}:${f.getMinutes().toString().padStart(2, '0')}`;
        setState((prevState) => ({ ...prevState, fechaPrestamo: formatted }));
    };

    const actualizarFechaHoraFin = (date) => {
        const f = date;
        const formatted = `${f.getFullYear()}-${(f.getMonth() + 1).toString().padStart(2, '0')}-${f.getDate().toString().padStart(2, '0')} ${f.getHours().toString().padStart(2, '0')}:${f.getMinutes().toString().padStart(2, '0')}`;
        setState((prevState) => ({ ...prevState, fechaFinalizacion: formatted }));
    };

    const guardarPrestamo = async () => {
        if (!state.usuarioId || !state.libroId || !state.fechaPrestamo || !state.fechaFinalizacion) {
        Alert.alert('Campos obligatorios', 'Por favor completa todos los campos');
        return;
        }

        const libroSeleccionado = libros.find((libro) => libro.id === state.libroId);

        if (!libroSeleccionado) {
        Alert.alert('Error', 'Libro no encontrado');
        return;
        }

        if (libroSeleccionado.cantidadDisponible <= 0) {
        Alert.alert('Sin ejemplares disponibles', 'No se puede prestar este libro porque no hay ejemplares disponibles');
        return;
        }

        try {
        await addDoc(collection(db, 'Prestamos'), state);

        const nuevaCantidadDisponible = libroSeleccionado.cantidadDisponible - 1;
        const nuevaCantidadPrestada = (libroSeleccionado.cantidadPrestada || 0) + 1;
        const nuevoEstado = nuevaCantidadDisponible === 0 ? 'Sin stock' : 'Disponible';

        const libroRef = doc(db, 'Libros', state.libroId);
        await updateDoc(libroRef, {
            cantidadDisponible: nuevaCantidadDisponible,
            cantidadPrestada: nuevaCantidadPrestada,
            estado: nuevoEstado,
        });

        Alert.alert('Éxito', 'Préstamo registrado');
        props.navigation.navigate('PrestamoList');
        } catch (error) {
        console.error('Error al registrar el préstamo:', error);
        Alert.alert('Error', 'No se pudo registrar el préstamo');
        }
    };

    const cargarUsuarios = async () => {
        const querySnapshot = await getDocs(collection(db, 'Usuarios'));
        const usuariosData = [];
        querySnapshot.forEach((doc) => {
        usuariosData.push({ id: doc.id, ...doc.data() });
        });
        setUsuarios(usuariosData);
    };

    const cargarLibros = async () => {
        const querySnapshot = await getDocs(collection(db, 'Libros'));
        const librosData = [];
        querySnapshot.forEach((doc) => {
        librosData.push({ id: doc.id, ...doc.data() });
        });
        setLibros(librosData);
    };

    useEffect(() => {
        cargarUsuarios();
        cargarLibros();
        const now = new Date();
        const fin = new Date(now);
        fin.setDate(fin.getDate() + 7);
        setFecha(now);
        setFechaFin(fin);
        actualizarFechaHora(now);
        actualizarFechaHoraFin(fin);
    }, []);

    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Registrar Préstamo</Text>

        <Text style={styles.label}>Seleccionar Usuario</Text>
        <View style={styles.inputGroup}>
            <Picker
            selectedValue={state.usuarioId}
            onValueChange={(value) => handleChangeText('usuarioId', value)}
            >
            <Picker.Item label="Seleccione un usuario" value="" />
            {usuarios.map((usuario) => (
                <Picker.Item key={usuario.id} label={usuario.nombre || usuario.id} value={usuario.id} />
            ))}
            </Picker>
        </View>

        <Text style={styles.label}>Seleccionar Libro</Text>
        <View style={styles.inputGroup}>
            <Picker
            selectedValue={state.libroId}
            onValueChange={(value) => handleChangeText('libroId', value)}
            >
            <Picker.Item label="Seleccione un libro" value="" />
            {libros.map((libro) => (
                <Picker.Item
                key={libro.id}
                label={`${libro.nombre} (${libro.cantidadDisponible || 0} disponibles)`}
                value={libro.id}
                />
            ))}
            </Picker>
        </View>

        <Text style={styles.label}>Fecha de Préstamo</Text>
        <View style={styles.inputGroup}>
            <TouchableOpacity onPress={mostrarPickerFecha}>
            <Text style={styles.textInput}>
                {state.fechaPrestamo ? state.fechaPrestamo.split(' ')[0] : 'Seleccionar fecha'}
            </Text>
            </TouchableOpacity>
            {mostrarFecha && (
            <DateTimePicker
                value={fecha}
                mode="date"
                display="default"
                onChange={onChangeFecha}
            />
            )}
        </View>

        <Text style={styles.label}>Hora de Préstamo</Text>
        <View style={styles.inputGroup}>
            <TouchableOpacity onPress={mostrarPickerHora}>
            <Text style={styles.textInput}>
                {state.fechaPrestamo ? state.fechaPrestamo.split(' ')[1] : 'Seleccionar hora'}
            </Text>
            </TouchableOpacity>
            {mostrarHora && (
            <DateTimePicker
                value={fecha}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={onChangeHora}
            />
            )}
        </View>

        <Text style={styles.label}>Fecha de Finalización</Text>
        <View style={styles.inputGroup}>
            <TouchableOpacity onPress={mostrarPickerFechaFin}>
            <Text style={styles.textInput}>
                {state.fechaFinalizacion ? state.fechaFinalizacion.split(' ')[0] : 'Seleccionar fecha'}
            </Text>
            </TouchableOpacity>
            {mostrarFechaFin && (
            <DateTimePicker
                value={fechaFin}
                mode="date"
                display="default"
                onChange={onChangeFechaFin}
            />
            )}
        </View>

        <Text style={styles.label}>Hora de Finalización</Text>
        <View style={styles.inputGroup}>
            <TouchableOpacity onPress={mostrarPickerHoraFin}>
            <Text style={styles.textInput}>
                {state.fechaFinalizacion ? state.fechaFinalizacion.split(' ')[1] : 'Seleccionar hora'}
            </Text>
            </TouchableOpacity>
            {mostrarHoraFin && (
            <DateTimePicker
                value={fechaFin}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={onChangeHoraFin}
            />
            )}
        </View>

        <TouchableOpacity style={styles.button} onPress={guardarPrestamo} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Guardar Préstamo</Text>
        </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 25,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    inputGroup: {
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        marginBottom: 20,
    },
    textInput: {
        height: 40,
        fontSize: 16,
        paddingVertical: 8,
        color: '#000',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default CreatePrestamo;
