import React from 'react';
import { Text, View , TouchableOpacity , TextInput, StyleSheet, FlatList , KeyboardAvoidingView , Alert,Image } from 'react-native';
import  * as  firebase from "firebase";

export default class Searchscreen extends React.Component {

    constructor(){
        super()
        this.state={
          emailId:"",
          password:"",
        }
    }
    login=async(email,password)=>{
      if(email && password){
          try {
              const response=await firebase.auth().signInWithEmailAndPassword(email,password)
               if(response){
                   this.props.navigation.navigate("Transaction")
               }
          } 
          catch (error) {
              switch (error.code){
                  case 'auth/user-not-found':
                      Alert.alert("USER NAME INVALID")
                      break;
                  case 'auth/invalid-email':
                      Alert.alert("INCORRECT EMAIL/PASS")
                      break;
              }
          }
      }
      else{
          Alert.alert("PLEASE ENTER THE EMAIL AND PASS")
      }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{ alignItems:'center',marginTop:25,}}>
              <View>
                <Image
                    source={require('../assets/booklogo.jpg')}
                    style={{width:200,height:200}}
                />
              </View>
              <View>
               <TextInput
                    style={styles.loginBox}
                    placeholder="abc@example.com"
                    keyboardType="email-address"
                    onChangeText={(text)=>{
                        this.setState({
                        emailId:text
                        })
                    }}
                />
                <TextInput
                    style={styles.loginBox}
                    placeholder="ENTER PASS"
                    secureTextEntry={true}
                    onChangeText={(text)=>{
                        this.setState({
                        password:text
                        })
                    }}
                />
              </View>
              <View>
                <TouchableOpacity 
                    style={{width:100,height:50,borderWidth:1,marginTop:15,paddngTop:5,borderRadius:10}}
                    onPress={()=>{
                        this.login(this.state.emailId,this.state.password)
                    }}
                    >
                    <Text 
                        style={{textAlign:'center'}}
                    >
                    LOGIN
                    </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles=StyleSheet.create({
    loginBox:{
        width:300,
        height:50,
        borderWidth:1.5,
        fontSize:18,
        margin:10,
        paddingLeft:10
    }
})
