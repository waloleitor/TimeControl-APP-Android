import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const [jornadaActiva, setJornadaActiva] = useState(false);
  const [horaInicio, setHoraInicio] = useState<string | null>(null);
  const [mostrarInput, setMostrarInput] = useState(false);
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    const cargarEstado = async () => {
      const estado = await AsyncStorage.getItem('jornadaActiva');
      const inicio = await AsyncStorage.getItem('horaInicio');
      if (estado === 'true') {
        setJornadaActiva(true);
        setHoraInicio(inicio);
      }
    };
    cargarEstado();
  }, []);

  const ficharEntrada = async () => {
    const hora = new Date().toLocaleString();
    setHoraInicio(hora);
    setJornadaActiva(true);
    await AsyncStorage.setItem('jornadaActiva', 'true');
    await AsyncStorage.setItem('horaInicio', hora);
    Alert.alert('✅ Jornada iniciada', `Hora de entrada: ${hora}`);
  };

  const guardarRegistro = async (obs: string) => {
    const horaFin = new Date().toLocaleString();
    setJornadaActiva(false);
    await AsyncStorage.setItem('jornadaActiva', 'false');

    const registros = JSON.parse(await AsyncStorage.getItem('registros') || '[]');
    registros.push({
      fecha: new Date().toLocaleDateString(),
      inicio: horaInicio,
      fin: horaFin,
      observacion: obs,
    });
    await AsyncStorage.setItem('registros', JSON.stringify(registros));

    Alert.alert('📌 Jornada finalizada', `Hora de salida: ${horaFin}`);
    setObservacion('');
    setMostrarInput(false);
  };

  const finalizarJornada = () => {
    Alert.alert(
      "Observaciones",
      "¿Deseas indicar alguna observación?",
      [
        {
          text: "No",
          onPress: () => guardarRegistro(""),
          style: "cancel"
        },
        {
          text: "Sí",
          onPress: () => setMostrarInput(true)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>⏱ TimeControl</Text>
      <Text style={styles.subtitulo}>Gestión sencilla de horas s</Text>
      <Text style={styles.credito}>Hecho por @Tomás Sarciat Roch</Text>

      <TouchableOpacity
        style={[styles.boton, jornadaActiva && styles.botonDeshabilitado]}
        onPress={ficharEntrada}
        disabled={jornadaActiva}
      >
        <Text style={styles.textoBoton}>🚀 Fichar entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botonSecundario, !jornadaActiva && styles.botonDeshabilitado]}
        onPress={finalizarJornada}
        disabled={!jornadaActiva}
      >
        <Text style={styles.textoBoton}>🏁 Finalizar jornada</Text>
      </TouchableOpacity>

      {mostrarInput && (
        <View style={styles.modal}>
          <Text style={styles.textModal}>✍ Escribe tus observaciones:</Text>
          <TextInput
            style={styles.input}
            placeholder="Motivo de horas extra u observaciones"
            placeholderTextColor="#999"
            value={observacion}
            onChangeText={setObservacion}
          />
          <TouchableOpacity style={styles.botonGuardar} onPress={() => guardarRegistro(observacion)}>
            <Text style={styles.textoBoton}>Guardar observación</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Versión de la app */}
      <Text style={styles.version}>Versión 1.2.1 {Constants.expoConfig?.version || '1.2.1'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    padding: 20,
  },
  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#BB86FC',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    color: '#B0B0B0',
    marginBottom: 5,
  },
  credito: {
    fontSize: 14,
    color: '#777',
    marginBottom: 40,
  },
  boton: {
    backgroundColor: '#4A00E0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
  },
  botonSecundario: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonDeshabilitado: {
    backgroundColor: '#333',
  },
  modal: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    marginTop: 20,
    elevation: 5,
  },
  textModal: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#BB86FC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#0D0D0D',
    color: '#FFF',
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
  },
  botonGuardar: {
    backgroundColor: '#4A00E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  version: {
    color: '#FFFFFF',
    fontSize: 14,
    position: 'absolute',
    top: 20,
    right: 10,
  },

});
