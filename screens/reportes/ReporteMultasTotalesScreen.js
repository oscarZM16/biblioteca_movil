import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ReporteMultasTotalesScreen = () => {
    const [multas, setMultas] = useState([]);

    useEffect(() => {
        const cargarMultas = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'Prestamos'));
            const prestamos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const listaMultas = [];

            for (const p of prestamos) {
            if (p.estado === 'finalizado' && p.fechaDevuelto && p.fechaFinalizacion) {
                const dev = new Date(p.fechaDevuelto);
                const fin = new Date(p.fechaFinalizacion);
                const diasRetraso = Math.ceil((dev - fin) / (1000 * 60 * 60 * 24));

                if (diasRetraso > 0) {
                const multa = diasRetraso * 1000;

                let nombreUsuario = p.usuarioId;
                let nombreLibro = p.libroId;

                try {
                    const uSnap = await getDoc(doc(db, 'Usuarios', p.usuarioId));
                    if (uSnap.exists()) nombreUsuario = uSnap.data().nombre;
                } catch {}

                try {
                    const lSnap = await getDoc(doc(db, 'Libros', p.libroId));
                    if (lSnap.exists()) nombreLibro = lSnap.data().nombre;
                } catch {}

                listaMultas.push({
                    usuario: nombreUsuario,
                    libro: nombreLibro,
                    fechaDevuelto: p.fechaDevuelto,
                    multa
                });
                }
            }
            }

            setMultas(listaMultas);
        } catch (error) {
            console.error('Error al cargar multas:', error);
        }
        };

        cargarMultas();
    }, []);

    const exportarPDF = async () => {
        const html = `
        <html>
            <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .multa { margin-bottom: 20px; }
                hr { margin-top: 10px; margin-bottom: 10px; }
            </style>
            </head>
            <body>
            <h1>Reporte de Multas Generadas</h1>
            ${multas.map(m => `
                <div class="multa">
                <p><strong>Usuario:</strong> ${m.usuario}</p>
                <p><strong>Libro:</strong> ${m.libro}</p>
                <p><strong>Fecha de Devolución:</strong> ${m.fechaDevuelto}</p>
                <p><strong>Multa:</strong> $${m.multa}</p>
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
        <Text style={styles.title}>Todas las Multas Generadas</Text>

        <TouchableOpacity style={styles.pdfButton} onPress={exportarPDF}>
            <Text style={styles.pdfButtonText}>Exportar PDF</Text>
        </TouchableOpacity>

        {multas.map((m, i) => (
            <View key={i} style={styles.card}>
            <Text style={styles.label}>Usuario:</Text>
            <Text style={styles.value}>{m.usuario}</Text>

            <Text style={styles.label}>Libro:</Text>
            <Text style={styles.value}>{m.libro}</Text>

            <Text style={styles.label}>Fecha de Devolución:</Text>
            <Text style={styles.value}>{m.fechaDevuelto}</Text>

            <Text style={styles.label}>Multa:</Text>
            <Text style={styles.value}>${m.multa}</Text>
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
        textAlign: 'center',
        marginBottom: 20
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
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        marginBottom: 15
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

export default ReporteMultasTotalesScreen;
