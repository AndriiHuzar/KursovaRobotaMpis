import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWa2pWH5Z24Nool2rnyCyrePh-ya9Lcio",
  authDomain: "kursova-a5f23.firebaseapp.com",
  projectId: "kursova-a5f23",
  storageBucket: "kursova-a5f23.appspot.com",
  messagingSenderId: "283277359863",
  appId: "1:283277359863:web:45d57ee12a5f7b049271f2"
};

initializeApp(firebaseConfig);

const app = createApp(App);

app.use(router);

app.config.globalProperties.$loading = 'lazy';

app.mount("#app");
