import { StyleSheet, Text, View, Alert, Button, Image, Linking } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
//Novo sistema de camera no Expo SDK 51+
import { CameraView, useCameraPermissions } from 'expo-camera';

//Biblioteca para salvar a foto na galeria
import * as MediaLibrary from "expo-media-library"

//Importando biblioteca de compartilhamento
import * as Sharing from 'expo-sharing';


export default function App() {
  //Estado de permissao da camera
  const [permissaoCam, requestPermissaoCam] = useCameraPermissions()

  //Estado de permissao da galeria
  const [permissaoMedia, requestPermissaoMedia] = MediaLibrary.usePermissions()

  //Referência da câmera (acesso direto ao componente)
  const cameraRef = useRef(null)

  //Estado da foto capturada
  const [foto, setFoto] = useState(null)

  //Estado para alternar as cameras (frontal e traseira)
  const[isFrontCamera,setIsFrontCamera]=useState(false)

  //Estado para gerenciar o flash do dispositivo
  const[flashLigado,setFlashLigado]=useState(false)

  //Estado para configurar se foi escaneado
  const[scaneado,setScaneado] = useState(false)

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

  //Alternar o valor do estado (true/false)
  const alternarCamera = () =>{
    setIsFrontCamera(!isFrontCamera)
  }

  //Alternar o flash
  const alternarFlash = () =>{
    setFlashLigado(!flashLigado)
  }

  //Função para compartilhamento da foto
  const compartilharFoto = async()=>{
    if(foto?.uri && Sharing.isAvailableAsync()){
      await Sharing.shareAsync(foto.uri)//Envia o arq para tela de compartilhar
    }else{
      Alert.alert("Error","Compartilhamento não disponível no dispositivo.")
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
            facing={isFrontCamera?'front':'back'}
            flash={flashLigado?'on':'off'}
            onBarcodeScanned={({type,data})=>{
              if(!scaneado){
                setScaneado(true)
                Alert.alert("Código Detectado",`Tipo:${type}\nValor:${data}`,
                  [
                  {
                    text:'Cancelar'
                  },
                  {
                    text:'Pesquisar produto',
                    onPress:()=>{
                      const url = `https://pt.product-search.net/?q=${data}`
                      Linking.openURL(url)
                    }
                  }
                  ])
              }
            }}
          />
          <Button title='Tirar Foto' onPress={tirarFoto} />
          <Button title='Alterar câmera' onPress={alternarCamera} />
          <Button title={flashLigado?'Desligar Flash':'Ligar Flash'} onPress={alternarFlash}/>
          {scaneado && <Button title='Escanear novamente' onPress={()=>setScaneado(false)}/>}
        </>
      ) : (
        <>
          <Image source={{uri:foto.uri}} style={styles.preview} />
          <Button title='Salvar Foto' onPress={salvarFoto} />
          <Button title='Tirar outra foto' onPress={()=>setFoto(null)}/>
          <Button title='Compartilhar foto' onPress={compartilharFoto}/>
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
