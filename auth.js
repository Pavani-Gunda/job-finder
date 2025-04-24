
    import { initializeApp } from "firebase/app";
    import{getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from "firebase/auth";
    import { GoogleAuthProvider } from "firebase/auth/web-extension";
    import{getFirestore,doc,setDoc,getDoc} from "firebase/firestore";
    // Your web app's Firebase configuration

    const firebaseConfig = {
      apiKey: "AIzaSyCRci1cHDflH9G_u7kLaE2zhY9n0Yzbko0",
      authDomain: "job-finder-14951.firebaseapp.com",
      projectId: "job-finder-14951",
      storageBucket: "job-finder-14951.firebasestorage.app",
      messagingSenderId: "19924450070",
      appId: "1:19924450070:web:b213f414ba94d809c32e37"
    };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider=new GoogleAuthProvider();
export { auth, db, provider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, doc, setDoc, getDoc };

