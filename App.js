import { StyleSheet, Text, View, Alert, Button, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
//Novo sistema de camera no Expo SDK 51+
import { CameraView, useCameraPermissions } from 'expo-camera';

//Biblioteca para salvar a foto na galeria
import * as MediaLibrary from "expo-media-library"


export default function App() {
  //Estado de permissao da camera
  const [permissaoCam, requestPermissaoCam] = useCameraPermissions()

  //Estado de permissao da galeria
  const [permissaoMedia, requestPermissaoMedia] = MediaLibrary.usePermissions()

  //Referência da câmera (acesso direto ao componente)
  const cameraRef = useRef(null)

  //Estado da foto capturada
  const [foto, setFoto] = useState(null)

  //Pedindo permissao da galeria no inicio do app
  useEffect(() => {
    if (permissaoMedia === null) return;
    if (!permissaoMedia?.granted) {
      requestPermissaoMedia()
    }
  }, [])

  //Função para tirar foto
  const tirarFoto = async () => {
    if (cameraRef.current) {
      const dadoFoto = await cameraRef.current.takePictureAsync()//captura a imagem
      setFoto(dadoFoto)
    }
  }

  //Função Salvar na galeria
  const salvarFoto = async () => {
    if (foto?.uri) {
      try {
        await MediaLibrary.createAssetAsync(foto.uri)//Salva a imagem na galeria
        Alert.alert("Info", "Foto salva com sucesso")
        setFoto(null)//Resetar o estado para tirar nova foto
      } catch (err) {
        Alert.alert("Error", "Não foi possível salvar a imagem.")
      }
    }
  }

  //Enquanto a permissão não estiver carregada
  if (!permissaoCam) return <View />

  //Se a permissão da câmera foi negada
  if (!permissaoCam.granted) {
    return (
      <View>
        <Text>Permissão da câmera não foi concedida</Text>
        <Button title="Permitir" onPress={requestPermissaoCam} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!foto ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing='back'
          />
          <Button title='Tirar Foto' onPress={tirarFoto} />
        </>
      ) : (
        <>
          <Image source={{uri:foto.uri}} style={styles.preview} />
          <Button title='Salvar Foto' onPress={salvarFoto} />
          <Button title='Tirar outra foto' onPress={()=>setFoto(null)}/>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  preview:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  }
});
