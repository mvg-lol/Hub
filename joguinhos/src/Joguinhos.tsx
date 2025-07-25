import { useParams } from "react-router-dom";
import Connectionspt from "./Connections/Connections";
import Three from "./Threejs/Threejs";
import Login from "./Login/Login";
import Codenames from "./Codenames/Codenames";

enum Game {
    Codenames = 'codenames',
    Connections = 'connections',
    Login = 'login',
    Cubo = 'cubo',
}

export default function Joguinhos(): JSX.Element {
    const { game } = useParams<{ game?: string }>();
    console.log("teste joguinhos", game);

    switch (game) {
        case Game.Codenames:
            return <Codenames />;
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
                    <p>Selecione um jogo para jogar!</p>
                    {Object.values(Game).map((game) => (
                        <p key={game}>
                            <a href={`/joguinhos/${game}`}>{game}</a>
                        </p>
                    ))}
                </div>
            );
    }
}
