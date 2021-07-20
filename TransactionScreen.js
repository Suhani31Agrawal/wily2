import React from 'react';
import { Text, View ,TouchableOpacity , StyleSheet , Image , TextInput , KeyboardAvoidingView , ToastAndroid, Alert  } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import firebase from "firebase"
import db from "../config"
// import { styleSheets } from 'min-document';

export default class Searchscreen extends React.Component {
  constructor (){
    super()
    this.state={
      buttonStatus:'normal',
      hasCameraPermission:null,
      scanned:false,
      scannedBookId:'',
      transactionMessage:'',
      scannedStudentId:'',
    }
  }

  getCameraPermissions=async(id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)

    this.setState({
      buttonStatus:id,
      hasCameraPermissions: status ==='granted',
      scanned:false
    })
  }

  handleBarCodeScanned=async({type,data})=>{
    const {buttonState}=this.state

    if(buttonState==='BookId'){
      this.setState({
        scanned:true,
        buttonStatus:'normal',
        scannedBookId:data
      })
    }
    else if(buttonState==='StudentId'){
      this.setState({
        scanned:true,
        buttonStatus:'normal',
        scannedStudentId:data
      })
    }
  }

  initiateBookIssue=async()=>{
    db.collection("transaction").add({
      "StudentId":this.state.scannedStudentId,
      "BookId":this.state.scannedBookId,
     " transactionType":'issue',
     " data":firebase.fireStore.TimeStamp.now().toDate()
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      "bookAvailability":false
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      "No.OfBooksIssued":firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedStudentId:'',
      scannedBookId:''
    })
  }

  initiateBookReturn=async()=>{
    db.collection("transaction").add({
      "StudentId":this.state.scannedStudentId,
      "BookId":this.state.scannedBookId,
     " transactionType":'return',
     " data":firebase.fireStore.TimeStamp.now().toDate()
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      "bookAvailability":true
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
      "No.OfBooksIssued":firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedStudentId:'',
      scannedBookId:''
    })
  }

  handleTransaction=async()=>{
    var transactionType=await this.CheckBookEligibility()
    
    if(!transactionType){
      Alert.alert("BOOK NOT EXIST IN OUR LIBRARY")
      this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
    }
    else if(transactionType==="issue"){
      var isStudentEligible=await this.CheckStudentEligibilityForBookIssue()
       if(isStudentEligible){
        this.initiateBookIssue()
        transactionMessage="BOOK ISSUED"
        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
       }
    }
    else{
      var isStudentEligible=await this.CheckStudentEligibilityForBookReturn()
      if(isStudentEligible){
      this.initiateBookReturn()
      transactionMessage="BOOK RETURNED"
      ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
    }
  }

  CheckBookEligibility=async()=>{
    const bookRef=await db.collection("books").where("BOOKID","==",this.state.scannedBookId).get()

    var transactionType=''
    if(bookRef.docs.length==0){
      transactionType=false
    }
    else{
      bookRef.docs.map(doc=>{
      var book=doc.data()
      if(book.bookAvailability){
        transactionType='issue'
      }
      else{
        transactionType='return'
      }
      })
    }
    return transactionType
  }
 
  CheckStudentEligibilityForBookIssue=async()=>{
    const studentRef=await db.collection("students").where("STDNID","==",this.state.scannedStudentId).get()

    var isStudentEligible=''
    if (studentRef.docs.length==0){
      this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
      isStudentEligible=false;
      Alert.alert("THIS STUDENT ID DOESN'T EXIST IN OUR CURRENT DATABASE")
    }
    else{
      studentRef.docs.map(doc=>{
        var student=doc.data()
        if(student.NumberOfBooksIssued<2){
         isStudentEligible=true
        }
        else{
          isStudentEligible=false
          Alert.alert("MAXIMUM ISSUES REACHED")
          this.setState({
            scannedStudentId:'',
            scannedBookId:''
          })
        }
      })
    }
    return isStudentEligible
  }

  CheckStudentEligibilityForBookReturn=async()=>{
   const transactionRef=await db.collection("transactions").where("BOOKID","==",this.state.scannedBookId).limit(1).get()

   var isStudentEligible=''
   transactionRef.docs.map(doc=>{
     var lastBookTransaction=doc.data()
     if(lastBookTransaction.STDNID==this.state.scannedStudentId){
       isStudentEligible=true
     }
     else{
       isStudentEligible=false
       Alert.alert("BOOK ISSUED BY OTHER STUDENT")
       this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
     }
   })
   return isStudentEligible
  }

  render() {
    const hasCameraPermissions=this.state.hasCameraPermissions
    const scanned=this.state.scanned
    const buttonStatus=this.state.buttonStatus

    if(buttonStatus!=='normal' && hasCameraPermissions){
      return(
        <BarCodeScanner
          onBarcodeScanned={scanned?undefined
            :this.handleBarCodeScanned
          }
          style={StyleSheet.absoluteFillObject}
        />
      )
    }
    else if(buttonStatus==='normal'){
      return (
        <KeyboardAvoidingView style={styles.container} behaviour="padding" enabled>
          <View>
            <Image
              source={require('../assets/booklogo.jpg')}
              style={{width:200,height:200}}
            />
            <Text style={{textAlign:'center',fontSize:30}}> WILY </Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              onChangeText={text=>this.setState({
                scannedBookId:text
              })}
              style={styles.inputField}
              placeholder='BookId'
              value={this.state.scannedBookId}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions('BookId')
              }}
              >
              <Text 
                style={styles.buttonText}
              >
               SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              onChangeText={text=>this.setState({
                scannedStudentId:text
              })}
              style={styles.inputField}
              placeholder='StudentId'
              value={this.state.scannedStudentId}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions('StudentId')
              }}
              >
              <Text 
                style={styles.buttonText}
              >
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.transactionAlert}>
              {this.state.transactionMessage}
            </Text>
            <TouchableOpacity 
              onPress={async()=>{
                var transactionMessage=await this.handleTransaction()
                this.setState({
                  scannedBookId:'',
                  scannedStudentId:''
                })
              }} 
              style={styles.submitButton}>
              <Text style={styles.submitButtonText}>
                SUBMIT
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles=StyleSheet.create({
  displayText:{
    fontSize:15,
    textDecorationLine:'underline',
  },
  container:{
  flex:1,
  justifyContent:'center',
  alignItems:'center',
  },
  buttonText:{
    fontSize:15,
  },
  scannedButton:{
    backgroundColor:'blue',
    padding:10,
    margin:10,
  },
  inputField:{
    width:150,
    height:40,
    borderWidth:1.5,
    fontSize:20
  },
  scanButton:{
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5, 
    borderLeftWidth: 0
  },
  inputView:{
    flexDirection:'row',
    margin:15
  },
  submitButton:{
    backgroundColor: 'black',
    width: 100,
    height:50,
    borderWidth: 1.5
  },
  submitButtonText:{
    fontSize:15,
    padding:10,
    textAlign:'center',
    fontWeight:'bold',
    color:'white'
  }
})