import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import './Login.css'
//import firebase from 'firebase/compat/app';
//import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useState } from 'react';
import firebaseStuff from '../../common/firebase'
import { GithubAuthProvider } from 'firebase/auth';
import myFirebase from '../../common/firebase';

const githubProvider = new GithubAuthProvider();


function EmailPasswordLoginComponent(): JSX.Element {
    const [isCriarConta, setIsCriarConta] = useState(false)
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

    return (<fieldset>
        <legend>{LoginToBeUsedEnum.EmailPassword} Login</legend>
        <p onClick={()=>setIsCriarConta(!isCriarConta)} style={{cursor:'pointer'}}>
            {isCriarConta ? 'Criar conta' : 'Login'}
        </p>
        <button onClick={()=>console.log(password, email, isCriarConta)}>teste state</button>
        <div>
            Email: <input value={email} type='text' onChange={(e)=>setEmail(e.target.value)}/>
            Password: <input value={password} type='password' onChange={(e)=>setPassword(e.target.value)}/> 
            <button onClick={() => isCriarConta ? criarContaFn() : loginFn()}>Submeter</button>
            
        </div> 
    </fieldset>)

}

function GithubLoginComponent(): JSX.Element {
    const login = () => {
        console.log("boas")
            signInWithPopup(myFirebase.auth, githubProvider)
            .then((result) => {
                console.log(result)
                // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential!.accessToken;
                const user = result.user;
                console.log(token, user)
            }).catch((error) => {
                
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GithubAuthProvider.credentialFromError(error);
                console.log(errorCode, errorMessage, email, credential)
            });
    }

    return (
        <fieldset>
            <legend>{LoginToBeUsedEnum.Github} Login</legend>
            <button onClick={()=>{
                login()
            }}>GITHUB LOGIN</button>
        </fieldset>
    )
}

enum LoginToBeUsedEnum {
    EmailPassword = 'Email & Password',
    Github = 'Github',
}

export default function Login(): JSX.Element {
    const [loginToBeUsed, setLoginToBeUsed] = useState<LoginToBeUsedEnum>(LoginToBeUsedEnum.Github)
    
    const determineLoginComponentToBeUsed = () => {
        switch(loginToBeUsed) {
            case LoginToBeUsedEnum.EmailPassword: return (<EmailPasswordLoginComponent/>)
            case LoginToBeUsedEnum.Github: return (<GithubLoginComponent/>)
        }
    }
    return (<>
        <fieldset>
            <legend>Select login type</legend>
            {Object.values(LoginToBeUsedEnum).map(login => {
                return (
                    <div key={login}>
                        <input onChange={()=>{setLoginToBeUsed(login)}} checked={login === loginToBeUsed} type='radio' id={login} key={login} name="login_type" value={login}/>
                        <label htmlFor={login}>{login}</label>
                    </div>
                )
            })}
        </fieldset>
        {determineLoginComponentToBeUsed()}
        <br></br>
        <button onClick={()=>{
            signOut(myFirebase.auth)
        }}>LOGOUT</button>
        <button onClick={()=>{
            console.log(myFirebase.auth.currentUser)
            console.log(loginToBeUsed)
        }}>teste</button>

    </>)
}

