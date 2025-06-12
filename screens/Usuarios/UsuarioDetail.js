import React, { useEffect, useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, deleteDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../database/firebase';

const UsuarioDetail = (props) => {
    const [usuario, setUsuario] = useState({
        nombre: '',
        correo: '',
        telefono: '',
    });

    const handleChangeText = (name, value) => {
        setUsuario({ ...usuario, [name]: value });
    };

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^[0-9]{7,15}$/;
        return re.test(phone);
    };

    const getUsuarioById = async (id) => {
        try {
            const dbRef = doc(db, 'Usuarios', id);
            const docSnap = await getDoc(dbRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setUsuario({
                    nombre: data.nombre || '',
                    correo: data.correo || '',
                    telefono: data.telefono || '',
                });
            } else {
                Alert.alert('Error', 'Usuario no encontrado');
                props.navigation.goBack();
            }
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            Alert.alert('Error', 'No se pudo cargar el usuario');
            props.navigation.goBack();
        }
    };

    const updateUsuario = async () => {
        if (usuario.nombre.trim() === '') {
            Alert.alert('Error', 'Por favor ingresa un nombre');
            return;
        }
        if (usuario.correo && !validateEmail(usuario.correo)) {
            Alert.alert('Error', 'Por favor ingresa un correo válido');
            return;
        }
        if (usuario.telefono && !validatePhone(usuario.telefono)) {
            Alert.alert('Error', 'Por favor ingresa un teléfono válido (solo números)');
            return;
        }

        try {
            const dbRef = doc(db, 'Usuarios', props.route.params.usuarioId);
            await updateDoc(dbRef, {
                nombre: usuario.nombre.trim(),
                correo: usuario.correo.trim(),
                telefono: usuario.telefono.trim(),
            });
            Alert.alert('Éxito', 'Usuario actualizado correctamente');
            props.navigation.navigate('UsuariosList');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            Alert.alert('Error', 'Hubo un error al actualizar');
        }
    };

    const deleteUsuario = async () => {
        try {
            const usuarioId = props.route.params.usuarioId;

            // Verificar si el usuario tiene préstamos
            const prestamosSnapshot = await getDocs(collection(db, 'Prestamos'));
            const tienePrestamos = prestamosSnapshot.docs.some(doc => doc.data().usuarioId === usuarioId);

            if (tienePrestamos) {
                Alert.alert('No se puede eliminar', 'Este usuario tiene préstamos asociados.');
                return;
            }

            // Eliminar usuario si no tiene préstamos
            const dbRef = doc(db, 'Usuarios', usuarioId);
            await deleteDoc(dbRef);
            Alert.alert('Éxito', 'Usuario eliminado');
            props.navigation.navigate('UsuariosList');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            Alert.alert('Error', 'No se pudo eliminar el usuario');
        }
    };

    const openConfirmationAlert = () => {
        Alert.alert(
            'Eliminar Usuario',
            '¿Estás seguro que deseas eliminar este usuario?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: deleteUsuario },
            ]
        );
    };

    useEffect(() => {
        getUsuarioById(props.route.params.usuarioId);
    }, []);

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}>
                <TextInput
                    placeholder="Nombre Usuario"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={usuario.nombre}
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
                    value={usuario.correo}
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
                    value={usuario.telefono}
                    onChangeText={(value) => handleChangeText('telefono', value)}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    maxLength={15}
                />
            </View>

            <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={updateUsuario} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Actualizar Usuario</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={openConfirmationAlert} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Eliminar Usuario</Text>
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
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        shadowColor: '#000',
    },
    updateButton: {
        backgroundColor: '#007BFF',
        shadowColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        shadowColor: '#f44336',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default UsuarioDetail;
