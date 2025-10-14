import supabase from '../supabase/supabase';
import { Session } from '@supabase/supabase-js';
import './Login.css'
import { useEffect, useState } from 'react';

export default function Login(): JSX.Element {
    
    const [session, setSession] = useState<Session | null>(null)
    
    const searchParams = new URLSearchParams( location.toString().split("/login#")[1]);
    console.log("searchParams:", searchParams);
    
    useEffect(() => {
        supabase.auth.getSession().then((data)=>{
            setSession(data.data.session)
        })
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, sessionRecv) => {
            setSession(sessionRecv)
        })
        return () => subscription.unsubscribe()
    }, [])

    return (<>
    <h1>⛔️⚠️ Login NAO ESTA A FUNCIONAR BEM!!!!!!!!! EM CONSTRUCAO ⚠️⛔️</h1>
        {!session ? (
            
            <div>
                <div>Not logged in</div>
                <button onClick={() => {
                    supabase.auth.signInWithOAuth({
                        provider: 'github',
                    }).then((data) => {
                        console.log("login data:", data);
                    });
                }}>Login with GitHub</button>
            </div>
        ) : (
            <div>
                <div>Logged in!</div>
                <button onClick={() => {
                supabase.auth.signOut().then(() => {
                    setSession(null);
                });
                }}>Logout</button>
            </div>
        )}
    </>)
}

