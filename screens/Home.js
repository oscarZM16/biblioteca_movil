import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Home = (props) => {
    const handleNavigate = (screen) => {
        props.navigation.navigate(screen);
    };

    return (
        <View style={styles.container}>
        <View style={styles.row}>
            <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('LibrosList')}
            activeOpacity={0.7}
            >
            <Text style={styles.buttonText}>Ir a Lista de Libros</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('UsuariosList')}
            activeOpacity={0.7}
            >
            <Text style={styles.buttonText}>Ir a Lista de Usuarios</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.row}>
            <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('CreatePrestamo')}
            activeOpacity={0.7}
            >
            <Text style={styles.buttonText}>Ir a Crear Prestamo</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('PrestamoList')}
            activeOpacity={0.7}
            >
            <Text style={styles.buttonText}>Ir a Lista de Prestamo</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate('ReportesMenuScreen')}
            activeOpacity={0.7}
            >
            <Text style={styles.buttonText}>Ir a Reportes</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
};

const BUTTON_SIZE = 140;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        flex: 1,
        height: BUTTON_SIZE,
        backgroundColor: '#007BFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Home;
