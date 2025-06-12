import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebase';

const CreatePrestamo = (props) => {
    const [state, setState] = useState({
        usuarioId: '',
        libroId: '',
        
        fechaPrestamo: '',
        estado: 'prestado',
    });

    const [usuarios, setUsuarios] = useState([]);
    const [libros, setLibros] = useState([]);

    const handleChangeText = (name, value) => {
        setState({ ...state, [name]: value });
    };

    const guardarPrestamo = async () => {
        if (!state.usuarioId || !state.libroId || !state.fechaPrestamo) {
        Alert.alert('Campos obligatorios', 'Por favor completa todos los campos');
        return;
        }

        try {
        await addDoc(collection(db, 'Prestamos'), state);
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
                <Picker.Item key={libro.id} label={libro.nombre} value={libro.id} />
            ))}
            </Picker>
        </View>

        <Text style={styles.label}>Fecha de Préstamo</Text>
        <View style={styles.inputGroup}>
            <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            onChangeText={(value) => handleChangeText('fechaPrestamo', value)}
            />
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
