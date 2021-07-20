import * as firebase from "firebase"
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDNBdn-DMUWUMZrOvLrOS-sw5bKOQhwF7Y",
    authDomain: "wily-3ccad.firebaseapp.com",
    projectId: "wily-3ccad",
    storageBucket: "wily-3ccad.appspot.com",
    messagingSenderId: "407127660230",
    appId: "1:407127660230:web:24d95e01212f151609e9c7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()