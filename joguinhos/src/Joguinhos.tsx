import { Link, useParams } from "react-router-dom";
import Connectionspt from "./Connections/Connections";
import Three from "./Threejs/Threejs";
import Login from "./Login/Login";

enum Game {
    Login = 'login',
    Connections = 'connections',
    Cubo = 'cubo',
}

export default function Joguinhos(): JSX.Element {
    const { game } = useParams<{ game?: string }>();
    console.log("teste joguinhos", game);

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
