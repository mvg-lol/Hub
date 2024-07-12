import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css'
//import firebase from 'firebase/compat/app';
//import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useState } from 'react';
import firebaseStuff from '../../common/firebase'

export default function Login(): JSX.Element {
    const [isCriarConta, setCriarConta] = useState(false)
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const criarContaFn = () => {
        createUserWithEmailAndPassword(firebaseStuff.auth, email, password)
            .then((userCredential) => {
                console.log("created account", userCredential)
            })
            .catch((error) => {
                console.log("error creating account ", error)
                console.log(error.message, error.code)
            });
    }

    const loginFn = () => {
        signInWithEmailAndPassword(firebaseStuff.auth, email, password)
        .then((userCredential) => {
            console.log("signed in", userCredential)
        })
        .catch((error) => {
            console.log("error signing in ", error)
            console.log(error.message, error.code)
        });
    }

    return (<>
        <p onClick={()=>setCriarConta(!isCriarConta)} style={{cursor:'pointer'}}>
            {isCriarConta ? 'Criar conta' : 'Login'}
        </p>
        <button onClick={()=>console.log(password, email, isCriarConta)}>teste state</button>
        <div>
            Email: <input value={email} type='text' onChange={(e)=>setEmail(e.target.value)}/>
            Password: <input value={password} type='password' onChange={(e)=>setPassword(e.target.value)}/> 
            <button onClick={() => isCriarConta ? criarContaFn() : loginFn()}>Submeter</button>
            
        </div> 
        
    </>)
}