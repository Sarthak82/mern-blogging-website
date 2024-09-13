import { signInWithPopup } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';


import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCD63sEf6RHrhcyniDPBcF0-MTK1witiKo",
  authDomain: "mern-stack-blogging-webs-de980.firebaseapp.com",
  projectId: "mern-stack-blogging-webs-de980",
  storageBucket: "mern-stack-blogging-webs-de980.appspot.com",
  messagingSenderId: "276985979662",
  appId: "1:276985979662:web:40f09a96710d181f1cad5f"
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export const authWithGoogle = async () => {
    let user =null
    await signInWithPopup(auth, provider)
    .then((result =>{
        user=result.user
    })).catch((error)=>{
        console.log(error)
    })
    
    return user
};