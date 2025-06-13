import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../database/firebase';

const PrestamoDetail = ({ route, navigation }) => {
  const { prestamoId } = route.params;
  const [prestamo, setPrestamo] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [libro, setLibro] = useState(null);

  const calcularMulta = (prestamo, tarifaPorDia = 1000) => {
    if (!prestamo.fechaFinalizacion || !prestamo.fechaDevuelto) return 0;
    const fechaDev = new Date(prestamo.fechaFinalizacion);
    const fechaReal = new Date(prestamo.fechaDevuelto);
    const diasRetraso = Math.ceil((fechaReal - fechaDev) / (1000 * 60 * 60 * 24));
    return diasRetraso > 0 ? diasRetraso * tarifaPorDia : 0;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const prestamoDoc = await getDoc(doc(db, 'Prestamos', prestamoId));
      if (prestamoDoc.exists()) {
        const datosPrestamo = { id: prestamoDoc.id, ...prestamoDoc.data() };
        setPrestamo(datosPrestamo);

        const usuarioDoc = await getDoc(doc(db, 'Usuarios', datosPrestamo.usuarioId));
        if (usuarioDoc.exists()) setUsuario(usuarioDoc.data());

        const libroDoc = await getDoc(doc(db, 'Libros', datosPrestamo.libroId));
        if (libroDoc.exists()) setLibro({ id: libroDoc.id, ...libroDoc.data() });
      }
    };
    cargarDatos();
  }, []);

  const finalizarPrestamo = async () => {
    if (!prestamo || prestamo.estado === 'finalizado') {
      Alert.alert('Error', 'Este préstamo ya fue finalizado o no se encontró');
      return;
    }

    try {
      const fechaHoy = new Date().toISOString().split('T')[0];

      await updateDoc(doc(db, 'Prestamos', prestamo.id), {
        estado: 'finalizado',
        fechaDevuelto: fechaHoy,
      });

      setPrestamo(prev => ({
        ...prev,
        estado: 'finalizado',
        fechaDevuelto: fechaHoy,
      }));

      const nuevaCantidadDisponible = (libro.cantidadDisponible || 0) + 1;
      const nuevaCantidadPrestada = (libro.cantidadPrestada || 1) - 1;

      await updateDoc(doc(db, 'Libros', libro.id), {
        cantidadDisponible: nuevaCantidadDisponible,
        cantidadPrestada: nuevaCantidadPrestada,
        estado: nuevaCantidadDisponible > 0 ? 'Disponible' : 'Sin stock',
      });

      Alert.alert('Préstamo finalizado');
      navigation.goBack();
    } catch (error) {
      console.error('Error al finalizar préstamo:', error);
      Alert.alert('Error al finalizar el préstamo');
    }
  };

  if (!prestamo || !usuario || !libro) return <Text>Cargando...</Text>;

  const multa = calcularMulta(prestamo);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Préstamo</Text>

      <Text style={styles.label}>Usuario:</Text>
      <Text style={styles.value}>{usuario.nombre || prestamo.usuarioId}</Text>

      <Text style={styles.label}>Libro:</Text>
      <Text style={styles.value}>{libro.nombre || prestamo.libroId}</Text>

      <Text style={styles.label}>Fecha Préstamo:</Text>
      <Text style={styles.value}>{prestamo.fechaPrestamo}</Text>

      <Text style={styles.label}>Fecha Finalización:</Text>
      <Text style={styles.value}>{prestamo.fechaFinalizacion}</Text>

      {prestamo.fechaDevuelto && (
        <>
          <Text style={styles.label}>Fecha Devuelto:</Text>
          <Text style={styles.value}>{prestamo.fechaDevuelto}</Text>
        </>
      )}

      <Text style={styles.label}>Estado:</Text>
      <Text style={styles.value}>{prestamo.estado}</Text>

      {multa > 0 && (
        <>
          <Text style={styles.label}>Multa:</Text>
          <Text
            style={[
              styles.value,
              { color: prestamo.multaPagada ? 'green' : 'red' },
            ]}
          >
            ${multa} {prestamo.multaPagada ? '(Pagada)' : '(Pendiente)'}
          </Text>
        </>
      )}

      {prestamo.estado !== 'finalizado' && (
        <TouchableOpacity style={styles.button} onPress={finalizarPrestamo}>
          <Text style={styles.buttonText}>Finalizar Préstamo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PrestamoDetail;
