import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  // Cargar registros guardados al iniciar
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await AsyncStorage.getItem('timeRecords');
    if (data) setRecords(JSON.parse(data));
  };

  const saveRecords = async (newRecords) => {
    setRecords(newRecords);
    await AsyncStorage.setItem('timeRecords', JSON.stringify(newRecords));
  };

  const handleStart = () => {
    setStartTime(new Date());
    setIsWorking(true);
  };

  const handlePause = () => {
    Alert.alert(
      "¿Quieres indicar observaciones?",
      "",
      [
        { text: "No", onPress: () => finalizeRecord('') },
        { text: "Sí", onPress: () => setShowModal(true) }
      ]
    );
  };

  const finalizeRecord = (obs) => {
    const endTime = new Date();
    const newRecord = {
      fecha: startTime.toLocaleDateString(),
      inicio: startTime.toLocaleTimeString(),
      fin: endTime.toLocaleTimeString(),
      observaciones: obs
    };
    const updatedRecords = [...records, newRecord];
    saveRecords(updatedRecords);
    setIsWorking(false);
    setStartTime(null);
    setObservaciones('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏱️ TimeControl</Text>

      {!isWorking ? (
        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.btnText}>Iniciar Jornada</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.pauseBtn} onPress={handlePause}>
          <Text style={styles.btnText}>Pausar Jornada</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.subTitle}>Historial:</Text>
      <FlatList
        data={records}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.recordItem}>
            📅 {item.fecha} | ⏰ {item.inicio} → {item.fin}
            {item.observaciones ? ` | 📝 ${item.observaciones}` : ''}
          </Text>
        )}
      />

      {/* Modal para observaciones */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir observaciones</Text>
            <TextInput
              style={styles.input}
              placeholder="Motivo de las horas extra..."
              value={observaciones}
              onChangeText={setObservaciones}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  finalizeRecord(observaciones);
                  setShowModal(false);
                }}
              >
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', alignItems: 'center', paddingTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subTitle: { fontSize: 20, marginVertical: 10 },
  startBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginBottom: 20 },
  pauseBtn: { backgroundColor: '#f44336', padding: 15, borderRadius: 10, marginBottom: 20 },
  btnText: { color: '#fff', fontSize: 18 },
  recordItem: { backgroundColor: '#fff', padding: 10, marginVertical: 5, borderRadius: 5, width: 350 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 300 },
  modalTitle: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5, width: 100, alignItems: 'center' }
});
