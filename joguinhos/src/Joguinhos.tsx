import { Link, useParams, useSearchParams } from "react-router-dom";
import Connectionspt from "./Connections/Connections";
import Three from "./Threejs/Threejs";
import Login from "./Login/Login";
import supabase from "./supabase/supabase";

enum Game {
    Login = 'login',
    Connections = 'connections',
    Cubo = 'cubo',
}

export default function Joguinhos(): JSX.Element {
    const { game } = useParams<{ game?: string }>();
    console.log("teste joguinhos", game);
    supabase.auth.getSession().then((data) => {
        console.log("session", data);
        console.log("is session null?", data.data.session === null || data.data.session === undefined);
    });
    const [searchParams] = useSearchParams();
    console.log("searchParams:", Object.fromEntries(searchParams.entries()));
    console.log("location:", location);
    switch (game) {
        case Game.Connections:
            return <Connectionspt />;
        case Game.Cubo:
            return <Three />;
        case Game.Login:
            return <Login />;
        default:
            return (
                <div>
                    <h1>Joguinhos</h1>
                    <p>Selecione um</p>
                    <ul>
                        {Object.values(Game).map((game) => (
                            <li key={game}>
                                <Link to={`${game}`}>
                                    {game.charAt(0).toUpperCase() + game.slice(1)}
                                    { game === Game.Connections ? ' (mais fixe)' : ''}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            );
    }
}
