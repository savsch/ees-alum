import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut,onAuthStateChanged } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBjyBhl4WOsJy080eFtdQsBReCz29c8QOQ",
    authDomain: "sece-b5243.firebaseapp.com",
    projectId: "sece-b5243",
    storageBucket: "sece-b5243.firebasestorage.app",
    messagingSenderId: "1006158139697",
    appId: "1:1006158139697:web:a5b9305a8b21332d126010",
    measurementId: "G-S1E1RNXQ3N"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        return null;
    }
};

const logout = async () => {
    try {
        await signOut(auth);
        console.log("User Logged Out");
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

export { auth, signInWithGoogle, logout,onAuthStateChanged };
