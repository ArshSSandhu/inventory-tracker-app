// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM05LA0gUaCy2AbuNHD1lLq0jPsUvyItk",
  authDomain: "inventory-management-9e8ad.firebaseapp.com",
  projectId: "inventory-management-9e8ad",
  storageBucket: "inventory-management-9e8ad.appspot.com",
  messagingSenderId: "642120910621",
  appId: "1:642120910621:web:451a6e58b46ffd92b283f4",
  measurementId: "G-LRC3FHPR62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore}