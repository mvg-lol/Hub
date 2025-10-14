import supabase from '../supabase/supabase';
import { Session } from '@supabase/supabase-js';
import './Login.css'
import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Login(): JSX.Element {
    
    const [session, setSession] = useState<Session | null>(null)
    
    const searchParams = new URLSearchParams( location.toString().split("/login#")[1]);
    console.log("searchParams:", searchParams);
    if (searchParams.get('access_token') && searchParams.get('refresh_token')) {
        const access_token = searchParams.get('access_token') as string;
        const refresh_token = searchParams.get('refresh_token') as string;
        supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
            if (error) {
                console.log("Error setting session:", error.message);
            } else {
                console.log("Session set successfully:", data);
                setSession(data.session);
            }
        });
    }
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
            <Auth 
                supabaseClient={supabase} 
                appearance={{ theme: ThemeSupa }} 
                providers={['github', 'discord']} 
                socialLayout="horizontal"
                redirectTo='https://mvg.lol/joguinhos/#/login'
            />
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

