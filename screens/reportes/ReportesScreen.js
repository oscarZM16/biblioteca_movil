import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';

const ReportesScreen = () => {
    const [librosMasPrestados, setLibrosMasPrestados] = useState([]);
    const [usuariosActivos, setUsuariosActivos] = useState([]);
    const [multasGeneradas, setMultasGeneradas] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const prestamosSnapshot = await getDocs(collection(db, 'Prestamos'));
        const prestamos = prestamosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const librosMap = {};
        const usuariosMap = {};
        const multas = [];

        for (const p of prestamos) {
        librosMap[p.libroId] = (librosMap[p.libroId] || 0) + 1;
        usuariosMap[p.usuarioId] = (usuariosMap[p.usuarioId] || 0) + 1;

        if (p.estado === 'finalizado' && p.fechaDevuelto && p.fechaFinalizacion) {
            const dev = new Date(p.fechaDevuelto);
            const fin = new Date(p.fechaFinalizacion);
            const diasRetraso = Math.ceil((dev - fin) / (1000 * 60 * 60 * 24));
            if (diasRetraso > 0) {
            multas.push({
                usuarioId: p.usuarioId,
                libroId: p.libroId,
                fechaDevuelto: p.fechaDevuelto,
                fechaFinalizacion: p.fechaFinalizacion,
                multa: diasRetraso * 1000,
            });
            }
        }
        }

        const librosConNombres = await Promise.all(
        Object.entries(librosMap).map(async ([id, count]) => {
            let nombre = id;
            try {
            const docSnap = await getDoc(doc(db, 'Libros', id));
            if (docSnap.exists()) {
                nombre = docSnap.data().nombre || id;
            }
            } catch (error) {
            console.error('Error obteniendo libro:', error);
            }
            return { id, nombre, count };
        })
        );
        librosConNombres.sort((a, b) => b.count - a.count);
        setLibrosMasPrestados(librosConNombres);

        const usuariosConNombres = await Promise.all(
        Object.entries(usuariosMap).map(async ([id, count]) => {
            let nombre = id;
            try {
            const docSnap = await getDoc(doc(db, 'Usuarios', id));
            if (docSnap.exists()) {
                nombre = docSnap.data().nombre || id;
            }
            } catch (error) {
            console.error('Error obteniendo usuario:', error);
            }
            return { id, nombre, count };
        })
        );
        usuariosConNombres.sort((a, b) => b.count - a.count);
        setUsuariosActivos(usuariosConNombres);

        const multasConNombres = await Promise.all(
        multas.map(async (m) => {
            let nombreUsuario = m.usuarioId;
            let nombreLibro = m.libroId;

            try {
            const usuarioSnap = await getDoc(doc(db, 'Usuarios', m.usuarioId));
            if (usuarioSnap.exists()) nombreUsuario = usuarioSnap.data().nombre || m.usuarioId;
            } catch {}

            try {
            const libroSnap = await getDoc(doc(db, 'Libros', m.libroId));
            if (libroSnap.exists()) nombreLibro = libroSnap.data().nombre || m.libroId;
            } catch {}

            return { ...m, nombreUsuario, nombreLibro };
        })
        );
        setMultasGeneradas(multasConNombres);
    };

    const generarPDF = async (htmlContent) => {
        const { uri } = await printToFileAsync({ html: htmlContent, base64: false });
        await Sharing.shareAsync(uri);
    };

    const renderReporteHTML = () => {
        return `
        <html>
            <body>
            <h1>Reportes de Biblioteca</h1>
            <h2>Libros más prestados</h2>
            <ul>${librosMasPrestados.map(l => `<li>${l.nombre}: ${l.count} préstamos</li>`).join('')}</ul>
            <h2>Usuarios con más préstamos</h2>
            <ul>${usuariosActivos.map(u => `<li>${u.nombre}: ${u.count} préstamos</li>`).join('')}</ul>
            <h2>Multas generadas</h2>
            <ul>${multasGeneradas.map(m => `<li>Usuario: ${m.nombreUsuario}, Libro: ${m.nombreLibro}, Multa: $${m.multa}</li>`).join('')}</ul>
            </body>
        </html>
        `;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reportes de Biblioteca</Text>

        <Text style={styles.subtitle}>Libros más prestados</Text>
        {librosMasPrestados.map((l, idx) => (
            <Text key={idx} style={styles.item}>{l.nombre}: {l.count} préstamos</Text>
        ))}

        <Text style={styles.subtitle}>Usuarios con más préstamos</Text>
        {usuariosActivos.map((u, idx) => (
            <Text key={idx} style={styles.item}>{u.nombre}: {u.count} préstamos</Text>
        ))}

        <Text style={styles.subtitle}>Multas generadas</Text>
        {multasGeneradas.map((m, idx) => (
            <Text key={idx} style={styles.item}>
            Usuario: {m.nombreUsuario}, Libro: {m.nombreLibro}, Devuelto: {m.fechaDevuelto}, Multa: ${m.multa}
            </Text>
        ))}

        <TouchableOpacity style={styles.pdfButton} onPress={() => generarPDF(renderReporteHTML())}>
            <Text style={styles.pdfButtonText}>Exportar PDF</Text>
        </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    item: {
        fontSize: 15,
        marginVertical: 4,
    },
    pdfButton: {
        marginTop: 30,
        backgroundColor: '#3366ff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    pdfButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ReportesScreen;
