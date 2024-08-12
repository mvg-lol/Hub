import { memo, useState } from 'react';
import './App.css'
import { useNavigate } from 'react-router';

function alterarBG() {
  const num: number = Math.floor(Math.random() * 100080000)
  if (num <= 772001 && num >= 0){
    document.getElementsByTagName("body").item(0)!.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/1164552263906377749/1253707209859141663/2Q.png?ex=667826d3&is=6676d553&hm=1c19d01ed7d7a0e849e77a9819c072f199f6f9454d1ae0cefb5581ad906b2bb4&')"
  }
}

function AppUnMemo() {
  const lineStyle: React.CSSProperties = {borderTop:"2px solid black"};
  alterarBG();
  const navigate = useNavigate();
  function navigateThree() {
    navigate('/three');
  }
  function navigateLogin() {
    navigate('/login')
  }
  function navigateJoguinhos() {
    navigate('/joguinhos')
  }
  const [numeroDeVezesClicado, setNumeroDeVezesClicado] = useState(0)
  return (
      <div>
        <br/>
        <h1>
          <a style={{color:"goldenrod"}} href="https://github.com/mvg-lol">MVG</a>
        </h1>
        <br/>
        <br/>
        <hr style={lineStyle}/>
        <h2>
          <a style={{color:"#d60270"}} href="https://rabosgigantes.com">PeidosFTW</a>
        </h2>
        <br/>
        <h2>
          <a style={{color:"#d60270"}} href="https://mrbrodinha.com">MrBrodinha</a>
        </h2>
        <br/>
        <h2>
          <a style={{color:"#9b4f96"}} href="https://ricadinho.com/">RICADINHO ( GRAND OPENING!!!! )</a>
        </h2>
        <br/>
        <h2>
          <a style={{color:"#0038a8"}} href="https://pereira3.github.io/">Pereira ッ</a>
        </h2>
        <br/>
        <h2>
          <a style={{color:"#0038a8"}} href="https://www.youtube.com/watch?v=Ec4YbVP9R-A">Quim</a>
        </h2>
        <br/>
        <hr style={lineStyle}/>
        <button type='button' onClick={navigateThree}>Cubo</button>
        <button type='button' onClick={navigateJoguinhos}>Joguinhos</button>
        <div style={{width:500, height:500}} onClick={()=> {if (numeroDeVezesClicado <=5) setNumeroDeVezesClicado(numeroDeVezesClicado+1); else navigateLogin()}}></div>
      </div>
  )
}
const App = memo(AppUnMemo) //stateless component, memo faz com que ele n de rerender
export default App;
