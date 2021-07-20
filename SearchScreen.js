import React from 'react';
import { Text, View , TouchableOpacity , TextInput, StyleSheet, FlatList } from 'react-native';
import db from "../config"

export default class Searchscreen extends React.Component {

    constructor(props){
      super(props)
      this.state={
        allTransactions:[],
        lastVisibleTransction:null,
        search:""
      }
    }

    searchTransaction=async(text)=>{
      var enteredText=text.split("")
      if(enteredText[0].toUpperCase()==="B"){
        const transaction=await db.collection("transactions").where("BOOKID","==",text).get()
        transaction.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
          })
        })
      }
      else if(enteredText[0].toUpperCase()==="S"){
        const transaction=await db.collection("transactions").where("STDNID","==",text).get()
        transaction.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
          })
        })
      }
    }

    fetchMoreTransaction=async(text)=>{
      var text=this.state.search.toUpperCase()
      var enteredText=text.split("")
      if(enteredText[0].toUpperCase()==="B"){
        const query=await db.collection("transactions").where("BOOKID","==",text).startAfter(this.state.lastVisibleTransction).limit(10).get()
        transaction.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
          })
        })
      }
      else if(enteredText[0].toUpperCase()==="S"){
        const query=await db.collection("transactions").where("STDNID","==",text).startAfter(this.state.lastVisibleTransction).limit(10).get()
        transaction.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
          })
        })
      }
    }

    componentDidMount=async()=>{
      const query=await db.collection("transactions").limit(10).get()
      query.docs.map((doc)=>{
        this.setState({
          allTransactions:[],
          lastVisibleTransaction:doc
        })
      })
    }

    render() {
      return (
        <View style={styles.container}>
          <View style={styles.bar}>
            <TextInput
              style={styles.search}
              placeholder="STUDENTID OR BOOKID"
              onChangeText={(text)=>{
                this.setState({
                  search:text
                })
              }}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={()=>{
                this.searchTransaction(this.state.search)
              }}>
              <Text>
                SEARCH
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList 
          data={this.state.allTransactions}
          renderItem={(item)=>{
            <View style={{borderBottomWidth:3}}>
              <Text>{"BOOKID:"+item.BOOKID}</Text>
              <Text>{"STUDENTID:"+item.STDNID}</Text>
              <Text>{"TRANSACTIONTYPE:"+item.transactionType}</Text>
              <Text>{"DATE:"+item.date.toDate()}</Text>
            </View>
          }}
          keyExtractor={(item,index)=>index.toString()}
          onEndReached={this.fetchMoreTransaction}
          onEndReachedThreshHold={0.7}
          />
        </View>
      );
    }
  }

  const styles=StyleSheet.create({
    container: { 
      flex: 1,
      marginTop: 50
    },
    searchBar:{
      flexDirection:'row',
      height:30,
      width:'auto', 
      borderWidth:0.5,
      alignItems:'center', 
      backgroundColor:'white',
    },
    bar:{ 
      borderWidth:2,
      height:30,
      width:355,
      paddingLeft:10,
    },
    searchButton:{ 
      borderWidth:1,
      height:30,
      width:55,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })