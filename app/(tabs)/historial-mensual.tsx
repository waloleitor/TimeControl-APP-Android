import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';

export default function HistorialMensual() {
  const [registros, setRegistros] = useState<any[]>([]);

  const cargarRegistros = async () => {
    const data = await AsyncStorage.getItem('registros');
    if (data) {
      setRegistros(JSON.parse(data));
    } else {
      setRegistros([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarRegistros();
    }, [])
  );

  const exportarWhatsApp = async () => {
    if (registros.length === 0) {
      Alert.alert('Sin datos', 'No hay registros para exportar');
      return;
    }

    let contenido = '📊 Reporte mensual de horas trabajadas:\n\n';
    registros.forEach((r, i) => {
      contenido += `${i + 1}. 📅 Fecha: ${r.fecha}\n   ⏰ Inicio: ${r.inicio}\n   🏁 Fin: ${r.fin}\n   📝 Obs: ${r.observacion || "Ninguna"}\n\n`;
    });

    const fileUri = FileSystem.cacheDirectory + 'reporte_horas.txt';
    await FileSystem.writeAsStringAsync(fileUri, contenido, { encoding: FileSystem.EncodingType.UTF8 });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
      return;
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: 'Enviar reporte de horas',
      UTI: 'public.text',
    });
  };

  const borrarHistorial = async () => {
    Alert.alert(
      "🗑️ Borrar historial",
      "¿Seguro que quieres eliminar todos los registros?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar", style: "destructive", onPress: async () => {
            await AsyncStorage.removeItem('registros');
            setRegistros([]);
            Alert.alert("✅ Historial eliminado");
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.texto}>📅 {item.fecha}</Text>
      <Text style={styles.texto}>⏰ Entrada: {item.inicio}</Text>
      <Text style={styles.texto}>🏁 Salida: {item.fin}</Text>
      <Text style={styles.texto}>📝 Obs: {item.observacion || "Ninguna"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📜 Historial Mensual</Text>

      {registros.length === 0 ? (
        <Text style={styles.sinDatos}>⚠️ No hay registros disponibles.</Text>
      ) : (
        <FlatList
          data={registros}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 300 }} // ⬅️ Aumentado 4x
        />
      )}

      <View style={styles.botonesContainer}>
        <TouchableOpacity style={styles.botonExportar} onPress={exportarWhatsApp}>
          <Text style={styles.textoBoton}>📤 Exportar a WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonEliminar} onPress={borrarHistorial}>
          <Text style={styles.textoBoton}>🗑️ Borrar Historial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    padding: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#BB86FC',
    textAlign: 'center',
    marginBottom: 20,
  },
  sinDatos: {
    color: '#999',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  texto: {
    fontSize: 16,
    marginBottom: 4,
    color: '#EEE',
  },
  botonesContainer: {
    marginTop: 10,
    marginBottom: 60, // ⬅️ Subimos los botones mucho más
  },
  botonExportar: {
    backgroundColor: '#4A00E0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    elevation: 3,
  },
  botonEliminar: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    elevation: 3,
  },
  textoBoton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
