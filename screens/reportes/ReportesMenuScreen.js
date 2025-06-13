import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ReportesMenuScreen = ({ navigation }) => {
    const opciones = [
        { label: 'Libros guardados', screen: 'ReporteLibrosGuardadosScreen' },
        { label: 'Usuarios registrados', screen: 'ReporteUsuariosRegistradosScreen' },
        { label: 'Todas las multas', screen: 'ReporteMultasTotalesScreen' },
        { label: 'Estadísticas', screen: 'ReportesScreen' },
    ];

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Menú de Reportes</Text>
        {opciones.map((op, index) => (
            <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => navigation.navigate(op.screen)}
            >
            <Text style={styles.buttonText}>{op.label}</Text>
            </TouchableOpacity>
        ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    button: {
        backgroundColor: '#3366ff',
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

export default ReportesMenuScreen;
