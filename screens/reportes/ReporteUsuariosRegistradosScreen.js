import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ReporteUsuariosRegistradosScreen = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const cargarUsuarios = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'Usuarios'));
            const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsuarios(lista);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
        };

        cargarUsuarios();
    }, []);

    const exportarPDF = async () => {
        const html = `
        <html>
            <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .usuario { margin-bottom: 20px; }
                hr { margin-top: 10px; margin-bottom: 10px; }
            </style>
            </head>
            <body>
            <h1>Reporte de Usuarios Registrados</h1>
            ${usuarios.map(usuario => `
                <div class="usuario">
                <p><strong>Nombre:</strong> ${usuario.nombre || 'Sin nombre'}</p>
                <p><strong>Correo:</strong> ${usuario.correo || 'No disponible'}</p>
                <hr/>
                </div>
            `).join('')}
            </body>
        </html>
        `;

        try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
        } catch (error) {
        console.error('Error al exportar PDF:', error);
        Alert.alert('Error', 'No se pudo exportar el PDF.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Usuarios Registrados</Text>

        <TouchableOpacity style={styles.pdfButton} onPress={exportarPDF}>
            <Text style={styles.pdfButtonText}>Exportar PDF</Text>
        </TouchableOpacity>

        {usuarios.map((usuario, index) => (
            <View key={index} style={styles.card}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{usuario.nombre || 'Sin nombre'}</Text>

            <Text style={styles.label}>Correo:</Text>
            <Text style={styles.value}>{usuario.correo || 'No disponible'}</Text>
            </View>
        ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    pdfButton: {
        backgroundColor: '#3366ff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center'
    },
    pdfButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    card: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        marginBottom: 15,
        borderRadius: 10
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16
    },
    value: {
        fontSize: 15,
        marginBottom: 5
    }
});

export default ReporteUsuariosRegistradosScreen;
