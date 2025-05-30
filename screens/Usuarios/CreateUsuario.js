import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { db } from '../../database/firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateUsuario = (props) => {
    const [state, setState] = useState({
        nombre: '',
        correo: '',
        telefono: '',
    });

    const handleChangeText = (name, value) => {
        setState({ ...state, [name]: value });
    };

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^[0-9]{7,15}$/;
        return re.test(phone);
    };

    const createNewUsuario = async () => {
        if (state.nombre.trim() === '') {
        Alert.alert('Error', 'Por favor ingresa un nombre');
        return;
        }
        if (state.correo && !validateEmail(state.correo)) {
        Alert.alert('Error', 'Por favor ingresa un correo válido');
        return;
        }
        if (state.telefono && !validatePhone(state.telefono)) {
        Alert.alert('Error', 'Por favor ingresa un teléfono válido (solo números)');
        return;
        }

        try {
        await addDoc(collection(db, 'Usuarios'), {
            nombre: state.nombre.trim(),
            correo: state.correo.trim(),
            telefono: state.telefono.trim(),
        });
        props.navigation.navigate('UsuariosList');
        } catch (error) {
        console.error('Error al guardar usuario:', error);
        Alert.alert('Error', 'Hubo un error al guardar');
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
            <TextInput
            placeholder="Nombre Usuario"
            placeholderTextColor="#999"
            style={styles.input}
            value={state.nombre}
            onChangeText={(value) => handleChangeText('nombre', value)}
            autoCapitalize="words"
            returnKeyType="next"
            />
        </View>

        <View style={styles.inputGroup}>
            <TextInput
            placeholder="Correo"
            placeholderTextColor="#999"
            style={styles.input}
            value={state.correo}
            onChangeText={(value) => handleChangeText('correo', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            />
        </View>

        <View style={styles.inputGroup}>
            <TextInput
            placeholder="Teléfono"
            placeholderTextColor="#999"
            style={styles.input}
            value={state.telefono}
            onChangeText={(value) => handleChangeText('telefono', value)}
            keyboardType="phone-pad"
            returnKeyType="done"
            maxLength={15}
            />
        </View>

        <TouchableOpacity style={styles.button} onPress={createNewUsuario} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Guardar Usuario</Text>
        </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        backgroundColor: '#fff',
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        height: 48,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2196F3',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default CreateUsuario;
