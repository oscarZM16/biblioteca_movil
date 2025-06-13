import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const ReporteLibrosGuardadosScreen = () => {
    const [libros, setLibros] = useState([]);

    useEffect(() => {
        const cargarLibros = async () => {
        try {
            const librosSnapshot = await getDocs(collection(db, 'Libros'));
            const librosList = librosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
            }));
            setLibros(librosList);
        } catch (error) {
            console.error('Error al cargar libros:', error);
        }
        };

        cargarLibros();
    }, []);

    const exportarPDF = async () => {
        const html = `
        <html>
            <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .libro { margin-bottom: 20px; }
                hr { margin-top: 10px; margin-bottom: 10px; }
            </style>
            </head>
            <body>
            <h1>Reporte de Libros Guardados</h1>
            ${libros.map(libro => `
                <div class="libro">
                <p><strong>Título:</strong> ${libro.nombre || 'Sin nombre'}</p>
                <p><strong>Cantidad disponible:</strong> ${libro.cantidadDisponible || 0}</p>
                <p><strong>Estado:</strong> ${libro.estado || 'No especificado'}</p>
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
        <Text style={styles.title}>Libros Guardados</Text>

        <TouchableOpacity style={styles.pdfButton} onPress={exportarPDF}>
            <Text style={styles.pdfButtonText}>Exportar PDF</Text>
        </TouchableOpacity>

        {libros.map((libro, index) => (
            <View key={index} style={styles.card}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{libro.nombre || 'Sin nombre'}</Text>

            <Text style={styles.label}>Cantidad disponible:</Text>
            <Text style={styles.value}>{libro.cantidadDisponible || 0}</Text>

            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.value}>{libro.estado || 'No especificado'}</Text>
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
        backgroundColor: '#f1f1f1',
        marginBottom: 15,
        borderRadius: 10
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16
    },
    value: {
        marginBottom: 8,
        fontSize: 15
    }
});

export default ReporteLibrosGuardadosScreen;
