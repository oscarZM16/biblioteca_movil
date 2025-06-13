import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';

const MultasList = () => {
    const [multas, setMultas] = useState([]);

    useEffect(() => {
        const cargarMultas = async () => {
        const prestamosSnapshot = await getDocs(collection(db, 'Prestamos'));
        const listaMultas = [];

        for (const docSnap of prestamosSnapshot.docs) {
            const prestamo = { id: docSnap.id, ...docSnap.data() };

            if (prestamo.estado === 'finalizado' && prestamo.fechaDevuelto) {
            const multa = calcularMulta(prestamo);
            if (multa > 0) {
                let nombreUsuario = prestamo.usuarioId;
                let nombreLibro = prestamo.libroId;

                // Obtener nombre del usuario
                try {
                const usuarioDoc = await getDoc(doc(db, 'Usuarios', prestamo.usuarioId));
                if (usuarioDoc.exists()) {
                    nombreUsuario = usuarioDoc.data().nombre || prestamo.usuarioId;
                }
                } catch (error) {
                console.error('Error al obtener usuario:', error);
                }

                // Obtener nombre del libro
                try {
                const libroDoc = await getDoc(doc(db, 'Libros', prestamo.libroId));
                if (libroDoc.exists()) {
                    nombreLibro = libroDoc.data().nombre || prestamo.libroId;
                }
                } catch (error) {
                console.error('Error al obtener libro:', error);
                }

                listaMultas.push({
                ...prestamo,
                multa,
                nombreUsuario,
                nombreLibro,
                });
            }
            }
        }

        setMultas(listaMultas);
        };

        cargarMultas();
    }, []);

    const calcularMulta = (prestamo, tarifaPorDia = 1000) => {
        if (!prestamo.fechaFinalizacion || !prestamo.fechaDevuelto) return 0;
        const fechaDev = new Date(prestamo.fechaFinalizacion);
        const fechaReal = new Date(prestamo.fechaDevuelto);
        const diasRetraso = Math.ceil((fechaReal - fechaDev) / (1000 * 60 * 60 * 24));
        return diasRetraso > 0 ? diasRetraso * tarifaPorDia : 0;
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
        <Text style={styles.itemText}>Usuario: {item.nombreUsuario}</Text>
        <Text style={styles.itemText}>Libro: {item.nombreLibro}</Text>
        <Text style={styles.itemText}>Fecha límite: {item.fechaFinalizacion}</Text>
        <Text style={styles.itemText}>Fecha devolución: {item.fechaDevuelto}</Text>
        <Text style={styles.itemText}>Multa: ${item.multa} (Pendiente)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Lista de Multas</Text>
        <FlatList
            data={multas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.empty}>No hay multas registradas.</Text>}
        />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    itemContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    itemText: {
        fontSize: 15,
        marginBottom: 4,
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },
});

export default MultasList;
