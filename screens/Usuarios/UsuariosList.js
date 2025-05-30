import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { ListItem } from '@rneui/themed';

const UsuariosList = (props) => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Usuarios'), (querySnapshot) => {
        const usuariosArray = [];
        querySnapshot.forEach((doc) => {
            usuariosArray.push({ id: doc.id, ...doc.data() });
        });
        setUsuarios(usuariosArray);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Lista de Usuarios</Text>

        <TouchableOpacity
            style={styles.createButton}
            onPress={() => props.navigation.navigate('CreateUsuario')}
            activeOpacity={0.7}
        >
            <Text style={styles.createButtonText}>Crear Usuario</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
            {usuarios.map((usuario) => (
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

export default UsuariosList;
