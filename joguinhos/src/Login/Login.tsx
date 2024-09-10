import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, UserCredential, GithubAuthProvider } from 'firebase/auth';
import './Login.css'
import 'firebaseui/dist/firebaseui.css'
import { useEffect, useState } from 'react';
import myFirebase from '../../common/firebase';

const githubProvider = new GithubAuthProvider();

type EmptyFunction<T> = (result:T) =>void;

interface PropsLoginComponent {
    onSuccessfulLogin: EmptyFunction<UserCredential>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUnsuccessfulLogin: EmptyFunction<any>,
}

function EmailPasswordLoginComponent(): JSX.Element {
    const [isCriarConta, setIsCriarConta] = useState(false)
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const criarContaFn = () => {
        createUserWithEmailAndPassword(myFirebase.auth, email, password)
            .then((userCredential) => {
                console.log("created account", userCredential)
            })
            .catch((error) => {
                console.log("error creating account ", error)
                console.log(error.message, error.code)
            });
    }

    const loginFn = () => {
        signInWithEmailAndPassword(myFirebase.auth, email, password)
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

function GithubLoginComponent(props:Readonly<PropsLoginComponent>): JSX.Element {
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
                props.onSuccessfulLogin(result);
            }).catch((error) => {
                
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GithubAuthProvider.credentialFromError(error);
                console.log(errorCode, errorMessage, email, credential)
                props.onUnsuccessfulLogin(error)
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
    const [isSuccessfulLogin, setIsSuccessfulLogin] = useState<{isSuccess?: boolean, message?: string}>({})
    const determineLoginComponentToBeUsed = () => {
        switch(loginToBeUsed) {
            case LoginToBeUsedEnum.EmailPassword: return (<EmailPasswordLoginComponent/>)
            case LoginToBeUsedEnum.Github: return (<GithubLoginComponent onSuccessfulLogin={()=>setIsSuccessfulLogin({isSuccess:true})} onUnsuccessfulLogin={(error)=>setIsSuccessfulLogin({isSuccess: false, message:`${error.code} - ${error!.message}`})}/>)
        }
    }

    useEffect(()=>{
        console.log(myFirebase.auth.currentUser)
        if (myFirebase.auth.currentUser !== null)
            setIsSuccessfulLogin({isSuccess:true})
    },[])

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
        {
            myFirebase.auth.currentUser !== null ? <button onClick={()=>{
                signOut(myFirebase.auth).then(()=>setIsSuccessfulLogin({}))
            }}>LOGOUT</button> : null
        }
        <button onClick={()=>{
            console.log(myFirebase.auth.currentUser)
            console.log(loginToBeUsed)
            console.log(isSuccessfulLogin)
        }}>teste.</button>
        {
            isSuccessfulLogin.isSuccess === undefined ? 
                null
                :
                <div>
                    <h4>{isSuccessfulLogin.isSuccess ? 'Login com successo' : 'Login sem sucesso'}</h4>
                    {isSuccessfulLogin.isSuccess === false ? <p>{isSuccessfulLogin.message}</p> : null}
                </div>
        }
    </>)
}

