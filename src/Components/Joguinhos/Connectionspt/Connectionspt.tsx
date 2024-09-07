import './Connectionspt.css'
import { collection, doc, DocumentData, documentId, FirestoreDataConverter, getDocs, orderBy, query, QueryDocumentSnapshot, setDoc, SnapshotOptions } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import myFirebase from '../../../common/firebase'
//@ts-expect-error react scale text não tem @types
import ScaleText from 'react-scale-text'
import { User } from 'firebase/auth'
import 'firebase/firestore'
import toast, { Toaster } from 'react-hot-toast'

interface Category {
    title: string;
    words: string[];
}
interface FirebaseWords {
    yellow: Category,
    green: Category,
    blue: Category,
    purple: Category,
}
interface FirebaseWordsWithDate{
    date: string,
    data: FirebaseWords
}
enum Color {
    Yellow = '#FBEC72',
    Green = '#86CC4A',
    Blue = '#009FFF',
    Purple = '#E071FF'
}
type SelectedWord = {
    word: Word,
    idString: string
};
type Word = {
    word: string,
    color: Color
}
type GuessMade = {
    guess: SelectedWord[],
    wasSuccessful: boolean
}
enum AnimationTypes {
    Shake = 'animateShake',
    Click = 'animateClick',
}

const firebaseWordsConverter: FirestoreDataConverter<FirebaseWords, FirebaseWords> = {
    toFirestore(modelObject: FirebaseWords): FirebaseWords {
        return {
            yellow: modelObject.yellow,
            purple: modelObject.purple,
            blue: modelObject.blue,
            green: modelObject.green,
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>, options?: SnapshotOptions): FirebaseWords {
        const data = snapshot.data(options)
        return {
            yellow: data.yellow,
            purple: data.purple,
            green: data.green,
            blue: data.blue,
        }
    }
}

function shuffleArray(array: unknown[], returnNewArray: boolean = false) {
    const auxArray = returnNewArray ? Array.from(array) : array
    for (let i = auxArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [auxArray[i], auxArray[j]] = [auxArray[j], auxArray[i]]
    }
    return returnNewArray ? auxArray : null
}

function getScrambledWordsFromGame(game: FirebaseWords): SelectedWord[] {
    const wordList: Word[] = []
    for (const word of game!.blue.words) {
        wordList.push({ word: word, color: Color.Blue })
    }
    for (const word of game!.yellow.words) {
        wordList.push({ word: word, color: Color.Yellow })
    }
    for (const word of game!.purple.words) {
        wordList.push({ word: word, color: Color.Purple })
    }
    for (const word of game!.green.words) {
        wordList.push({ word: word, color: Color.Green })
    }
    shuffleArray(wordList)
    return wordList.flatMap((val, index) => {
        const idString = `${val.color}#${val.word}#${index}`
        return { word: val, idString: idString } as SelectedWord
    })
}

export default function Connectionspt(): JSX.Element {
    //let connections = collection(myFirebase.db, "connections")
    const selectedWordColor = '#BBBBBB'
    const defaultWordColor = 'bisque'
    const onHoverWordColor = 'aliceblue'
    const [game, setGame] = useState<SelectedWord[]>()
    const [userMartinho, setUserMartinho] = useState<User|null>(null)
    const [firebaseWords, setFirebaseWords] = useState<FirebaseWords>()
    const [gameDatesAvailable, setGameDatesAvailable] = useState<{date:Date, game:FirebaseWords}[]>([])
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [paginateGames, setPaginateGames] = useState<number>(0)
    useEffect(() => {
        async function getConnections() {
            //const today = /*true ? Date.UTC(2024,7,7).toString() :*/ new Date(Date.now()).toLocaleDateString('pt-pt', {year: 'numeric', month:'numeric', day:'numeric'}).replaceAll("/","-");
            //const docRef = doc(myFirebase.db, "connections", today)
            //const docSnap = await getDoc(docRef)
            //console.log(docSnap.data(), docSnap.exists(), today)
            let game: FirebaseWords = {
                green: {
                    title: "Sinónimos de Lindo",
                    words: ['bonito', 'elegante', 'deslumbrante', 'vistoso']
                },
                purple: {
                    title: 'Primeira palavra de estados brasileiros',
                    words: ['belo', 'rio', 'minas', 'mato']
                },
                blue: {
                    title: 'Propriedades dum iman',
                    words: ['ferroso', 'azul', 'vermelho', 'magnético']
                },
                yellow: {
                    title: 'Parabenizar',
                    words: ['congratular', 'felicitar', 'saudar', 'salvar']
                }
            };
            //if (docSnap.exists()){
            //    game = docSnap.data() as FirebaseWords
            //} else { //obter jogo mais recente se nao houver hoje
            const q = query(collection(myFirebase.db, "connections"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const dates: {date:Date, game: FirebaseWords}[] = [
                    {date: new Date(2001,7-1,7), game}
                ]
                const res = querySnapshot.docs.map((val)=> {
                    const split = val.id.split("-").map(val => parseInt(val))
                    const obj = {
                        date:new Date(split[2], split[1]-1, split[0]),
                        game: val.data() as FirebaseWords
                    }
                    dates.push(obj)
                    return obj
                }).reduce((a,b)=> a.date > b.date ? a : b)
                game = res.game
                setSelectedDate(res.date)
                setGameDatesAvailable(dates.reverse())
            }
            //}
            setFirebaseWords(game);
            setGame(getScrambledWordsFromGame(game))
        }
        getConnections()
        //console.log(game)
        myFirebase.auth.onAuthStateChanged((user) => {
            if (user !== null && myFirebase.userIsMartinho(user.uid)) {
                setUserMartinho(user)
            } else {
                setUserMartinho(null)
            }
        });
    }, [])
    const showToast = (msg: string, emoji: '🤏' | undefined) => {
        toast(msg, {duration:3000, position:'top-center', icon:emoji, style: {backgroundColor:'black', color:'white'}});
    }
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
    const [numberOfGuessesLeft, setNumberOfGuessesLeft] = useState(4)
    const [guessesMade, setGuessesMade] = useState<GuessMade[]>([])
    const [answers, setAnswers] = useState<GuessMade[]>([])

    // a classe CSS TEM de ter a variável --animation-time definida
    const animateButton = (classNameForAnimation: string, element: HTMLElement) => {
        //animate button
        element.classList.add(classNameForAnimation)
        const animationTimeVar = getComputedStyle(element).getPropertyValue('--animation-time')
        let time = parseFloat(animationTimeVar.indexOf('ms') >= 0 ? animationTimeVar.replace("ms", "") : animationTimeVar.replace("s", "000"))
        if (time < 1) {
            time = time * 1000
        }
        setTimeout(() => {
            element.classList.remove(classNameForAnimation)
        }, time)
    }

    const addOrRemoveSelectedWord = (selectedWord: SelectedWord) => {
        const element = document.getElementById(selectedWord.idString)!

        animateButton(AnimationTypes.Click, element)

        if (selectedWords.length > 0 && selectedWords.filter(val => val.idString === selectedWord.idString).length > 0) {
            // remover selecionada
            setSelectedWords(selectedWords.filter(val => val.idString !== selectedWord.idString))
            element.style.backgroundColor = defaultWordColor
            return
        }
        if (selectedWords.length < 4) {
            setSelectedWords(selectedWords.concat(selectedWord))
            element.style.backgroundColor = selectedWordColor
        }
    }

    const removeSelection = () => {
        const gameTable = document.getElementsByClassName('gameTable')[0]!
        for (const child of gameTable.children) {
            const htmlChild = child as HTMLElement
            if (!htmlChild.id.endsWith("guess"))
                htmlChild.style.backgroundColor = defaultWordColor
        }
        setSelectedWords([])
    }

    const evaluateSubmission = () => {
        //const colorOfFirstWord = selectedWords[0].word.color
        //const wordsOfTheSameColorAsFirst = selectedWords.filter(val => val.word.color === colorOfFirstWord);
        const cores: {[key:string]:number} = {}
        selectedWords.forEach(val=>cores[val.word.color] !== undefined ? cores[val.word.color] = cores[val.word.color] + 1 : cores[val.word.color] = 1)
        const keys = Object.keys(cores)
        const isOneAway = keys.length === 2 && (cores[keys[0]] === 1 || cores[keys[0]] === 3)
        return {result: Object.keys(cores).length === 1,isOneAway: isOneAway}
    }

    const saveCurrentGuessesToLocalStorageOrDB = () => {
        {
            //save to localstorage
            localStorage.setItem(`connection${new Date(Date.now()).toLocaleDateString('pt-pt', {year: 'numeric', month:'numeric', day:'numeric'}).replaceAll("/","-")}`, JSON.stringify(guessesMade))
        }
        {
            //TODO GUARDAR NO USER NO FIREBASE
            //save to firebase
            console.error("TODO FIREBASE IMPL")
        }
    }

    const performPostEvaluateLogic = (res : {result: boolean, isOneAway: boolean}) => {
        const {result, isOneAway} = res
        let numberGuessesLeft = numberOfGuessesLeft - 1
        let wasGuessValid = 0; // se for 4, a guess foi válida
        if (!result) {
            for (const guess of guessesMade) {
                if (guess.wasSuccessful) continue
                const listOfWords = guess.guess
                for (const word of listOfWords) {
                    for (const currentWord of selectedWords) {
                        if (currentWord.word === word.word) {
                            wasGuessValid = wasGuessValid + 1
                            break
                        }
                    }
                }
                if (wasGuessValid === 4) break
                else wasGuessValid = 0
            }
            if (wasGuessValid !== 4) { // signifca que esta guess atual nunca foi feita, podemos subtrair
                setNumberOfGuessesLeft(numberGuessesLeft)
                if (isOneAway)
                    showToast('Falta um!', '🤏')
            }
            else {
                numberGuessesLeft = numberGuessesLeft + 1
                showToast('Já usaste esta combinação', undefined)
            }
        }
        const [botaoSubmeter] = document.getElementById("divBotoesConnections")!.getElementsByTagName("button")
        if (numberGuessesLeft === 0) {
            botaoSubmeter.disabled = true
        }
        const g = guessesMade.concat({ guess: selectedWords, wasSuccessful: result })
        setGuessesMade(g)
        if (result) // remover as palavras da tabela do jogo
        {
            const newGame = game!.filter(val => val.word.color != selectedWords[0].word.color)
            setGame(newGame)
            setAnswers(answers.concat(g[g.length-1]))
            if (newGame.length === 0)
                saveCurrentGuessesToLocalStorageOrDB()
        }
        else {
            for (const selectedWord of selectedWords) {
                const elem = document.getElementById(selectedWord.idString)!
                animateButton(AnimationTypes.Shake, elem)
            }
            if (numberGuessesLeft == 0) {
                saveCurrentGuessesToLocalStorageOrDB()
                const answers = Array<GuessMade>()
                answers.push({ guess: firebaseWords!.yellow.words.map((word, index) => { return { word: { word: word, color: Color.Yellow }, idString: `yellow${word}${index}` } }), wasSuccessful: true })
                answers.push({ guess: firebaseWords!.green.words.map((word, index) => { return { word: { word: word, color: Color.Green }, idString: `green${word}${index}` } }), wasSuccessful: true })
                answers.push({ guess: firebaseWords!.blue.words.map((word, index) => { return { word: { word: word, color: Color.Blue }, idString: `blue${word}${index}` } }), wasSuccessful: true })
                answers.push({ guess: firebaseWords!.purple.words.map((word, index) => { return { word: { word: word, color: Color.Purple }, idString: `purple${word}${index}` } }), wasSuccessful: true })
                setAnswers(answers)
                setGame(undefined)
            }
        }
        removeSelection()
        return result
    }

    const convertGuessToHTML = (guessMade: GuessMade) => {
        if (guessMade.guess.length === 0) return (<p>????</p>)
        if (!guessMade.wasSuccessful) return null
        let id = ''
        let wordList = ''
        const guess = guessMade.guess
        const color = guess[0].word.color;
        guess.forEach((val, index) => {
            id = id.concat(val.idString)
            wordList = wordList.concat(val.word.word.toUpperCase())
            if (index < 3) wordList = wordList.concat(', ')
        })
        let topic = ''
        switch (color) {
            case Color.Blue:
                topic = firebaseWords!.blue.title
                break;
            case Color.Yellow:
                topic = firebaseWords!.yellow.title
                break;
            case Color.Purple:
                topic = firebaseWords!.purple.title
                break;
            case Color.Green:
                topic = firebaseWords!.green.title
                break;
        }
        topic = topic.toUpperCase()
        return (
            <div className='gameTableForGuess'>
                <div key={id} id={id} className='wordGuess' style={{ backgroundColor: color }}>
                    <h4>{topic}</h4>
                    <p>{wordList}</p>
                </div>
            </div>
        )
    }

    const convertSelectedWordToTile = (selectedWord: SelectedWord) => {
        const changeBackgroundColorOnHover = (isEnter: boolean) => {
            const elem = document.getElementById(selectedWord.idString)!
            if (isEnter) {
                elem.style.backgroundColor = onHoverWordColor
            } else {
                if (selectedWords.indexOf(selectedWord) >= 0)
                    elem.style.backgroundColor = selectedWordColor
                else elem.style.backgroundColor = defaultWordColor
            }
        }
        return (
            <div id={selectedWord.idString} className='word' onClick={() => addOrRemoveSelectedWord(selectedWord)} onMouseEnter={() => changeBackgroundColorOnHover(true)} onMouseLeave={() => changeBackgroundColorOnHover(false)} key={selectedWord.idString}>
                <ScaleText maxFontSize={16 /*font size default*/} heightOnly={true}><p style={{ fontWeight: 'bold' }}>{selectedWord.word.word.toUpperCase()}</p></ScaleText>
            </div>
        );
    }

    return (
            userMartinho !== null ? 
            
            <ScriptInserirConnections martinho={userMartinho}/> : 
            
            <div>
                <Toaster/>
                <div className='gameTableParent'>
                    <h1 style={{ marginTop:'12px', marginBottom:'0px' }}>CONEXÕÕÕÕÕESSSS</h1>
                    <p style={{ fontSize:'8px', marginTop:'4px', marginBottom:'16px', textAlign:'center' }}>im connectinggggggggggggggggggg</p>
                    {
                        answers.length === 0 ? null
                            :
                            answers.map(convertGuessToHTML)
                    }
                    <div className='gameTable'>
                        {
                            game === undefined && guessesMade.length === 0 ? 
                                <h1>LOADING</h1>
                                :
                                game === undefined ?
                                    null 
                                    :
                                    game.map(convertSelectedWordToTile)
                        }
                    </div>
                    <p style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center', marginTop: '16px', marginBottom: '12px' }}>Tentativas restantes: {numberOfGuessesLeft}</p>
                    <div className='animateClick teste'>swag</div>
                </div>
                <div id="divBotoesConnections" style={{ display: 'flex', justifyContent:'center' }}>
                    <button className='connectionButton' onClick={(ev) => { animateButton(AnimationTypes.Click, ev.currentTarget); if (selectedWords.length === 4) performPostEvaluateLogic(evaluateSubmission()) }} disabled={selectedWords.length !== 4} >Submeter</button>&nbsp;
                    <button className='connectionButton' onClick={(ev) => { animateButton(AnimationTypes.Click, ev.currentTarget); removeSelection() }} disabled={selectedWords.length === 0}>Remover seleção</button>&nbsp;
                    <button className='connectionButton' onClick={(ev) => { animateButton(AnimationTypes.Click, ev.currentTarget); if (game) setGame(shuffleArray(game, true)! as SelectedWord[]) }}>Shuffle</button>
                </div>
                {
                numberOfGuessesLeft <= 0 ?
                <div className='guessGridResult' style={{paddingTop: '16px'}}>
                    {guessesMade.map((guess)=>{
                        const words = guess.guess
                        console.log(guessesMade)
                        const row = words.map((word)=>{
                            return (
                                <div className='guessSquare' style={{background:word.word.color}}>
                                </div>
                            )
                        })
                        return (<div className='guessSquareLine'>
                            {row}
                        </div>)
                    })}
                </div>
                : null
                }
                <div style={{
                    display:'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection:'column',
                    paddingTop:'12px'
                }}>
                    Escolhe outro jogo: <button className='connectionButton' disabled={paginateGames === 0 } onClick={()=>{if(paginateGames > 10) setPaginateGames(paginateGames-10); console.log(paginateGames)}}>Anteriores</button> <button className='connectionButton' disabled={paginateGames<=gameDatesAvailable.length} onClick={()=>{if(paginateGames<=gameDatesAvailable.length)setPaginateGames(paginateGames+10); console.log(paginateGames)}}>Seguintes</button> 
                    {
                        gameDatesAvailable.slice(paginateGames, paginateGames+10).map(val => (
                            <button disabled={val.date === selectedDate} onClick={()=>{
                                const game = val.game
                                setFirebaseWords(game);
                                setGame(getScrambledWordsFromGame(game))
                                setNumberOfGuessesLeft(4)
                                setAnswers([])
                                setSelectedDate(val.date)
                                setGuessesMade([])
                                setSelectedWords([])
                            }}
                            key={val.date.toString()}
                            style={{marginTop:'12px'}}
                            className='connectionButton'
                            >
                                {val.date.toLocaleDateString('pt-pt', {year: 'numeric', month:'numeric', day:'numeric'})}
                            </button>
                        ))
                    }
                </div>
            </div>
    )
}

//<button className='connectionButton' onClick={(ev) => { showToast() }}>teste</button>


function ScriptInserirConnections(props: {martinho: User}): JSX.Element {
    const [yellowWords, setYellowWords] = useState<Category>({title:'1', words: ['123','123','123','123']})
    const [blueWords, setBlueWords] = useState<Category>({title:'1', words: ['123','123','123','123']})
    const [greenWords, setGreenWords] = useState<Category>({title:'1', words: ['123','123','123','123']})
    const [purpleWords, setPurpleWords] = useState<Category>({title:'1', words: ['123','123','123','123']})
    const [errorString, setErrorString] = useState<string>('')
    const [temVirgula, setTemVirgula] = useState(true)
    const [customDate, setCustomDate] = useState<string>('')

    const firebaseWordsBuilder = (): FirebaseWords => {
        yellowWords.title = yellowWords.title.trim()
        if (yellowWords.title.endsWith("-")) {
            yellowWords.title = yellowWords.title.slice(0,yellowWords.title.length-1).trim()
        }
        blueWords.title = blueWords.title.trim()
        if (blueWords.title.endsWith("-")) {
            blueWords.title = blueWords.title.slice(0,blueWords.title.length-1).trim()
        }
        purpleWords.title = purpleWords.title.trim()
        if (purpleWords.title.endsWith("-")) {
            purpleWords.title = purpleWords.title.slice(0,purpleWords.title.length-1).trim()
        }
        greenWords.title = greenWords.title.trim()
        if (greenWords.title.endsWith("-")) {
            greenWords.title = greenWords.title.slice(0,greenWords.title.length-1).trim()
        }
        return {
            yellow: yellowWords,
            blue: blueWords,
            green: greenWords,
            purple: purpleWords
        }
    }

    const submitFunction = async () => {
        if (yellowWords.words.length !== 4 && greenWords.words.length !== 4 && blueWords.words.length !== 4 && purpleWords.words.length !== 4) {
            setErrorString(`Alguma lista sem 4 elementos exatos: Yellow: ${yellowWords.words.length} Green: ${greenWords.words.length} Blue: ${blueWords.words.length} Purple: ${purpleWords.words.length}`)
            return
        }
        if (yellowWords.title.length === 0 && greenWords.title.length === 0 && blueWords.title.length === 0 && purpleWords.title.length === 0) {
            setErrorString(`Alguma lista não tem titulo: Yellow: ${yellowWords.title.length} Green: ${greenWords.title.length} Blue: ${blueWords.title.length} Purple: ${purpleWords.title.length}`)
            return
        }
        
        if (myFirebase.userIsMartinho(props.martinho.uid)) {
            let cdate = customDate
            if (cdate.length !== 10) {
                cdate = (await getLatestConnection()).date
                console.log(cdate)
            }
            const data = firebaseWordsBuilder()
            await setDoc(doc(myFirebase.db, "connections", cdate).withConverter(firebaseWordsConverter), data)
                .then(()=>
                    setErrorString("Sucesso")
                )
                .catch(err=>setErrorString(err.toString()))

        }
    }
    const newDateFromArray = (arr:number[]):Date => new Date(arr[2], arr[1]-1, arr[0])
    const stringDateToDate = (date:string):Date => newDateFromArray(date.split("-").map(val => parseInt(val)))
    const getLatestConnection = async ():Promise<FirebaseWordsWithDate> => {
        const connectionsCol = collection(myFirebase.db, "connections").withConverter(firebaseWordsConverter);
        const q = query(connectionsCol, orderBy(documentId()))
        const qsnapshot = await getDocs(q)
        let arr:FirebaseWordsWithDate[] = []
        qsnapshot.forEach(val=>{ if(val.id.indexOf("-")>=0){ arr.push({date:val.id, data:val.data()})}})
        arr = arr.sort((a,b)=>{
            const datea = stringDateToDate(a.date)
            const dateb = stringDateToDate(b.date)
            return dateb.getTime() - datea.getTime()
        }).filter(val => !Number.isNaN(val.date)).filter((_val,index)=> index === 0)
        const date = stringDateToDate(arr[0].date)
        date.setDate(date.getDate() + 1)
        return {
            data: arr[0].data,
            date: date.toLocaleDateString('pt-pt', {year: 'numeric', month:'numeric', day:'numeric'}).replaceAll("/","-")
        }
    }

    return (
        <>
            <fieldset>
                <legend>Inserir novo connection</legend>
                <input type='checkbox' id='temvirgulacheckbox' checked={temVirgula} onChange={()=>setTemVirgula(!temVirgula)}></input>
                <label htmlFor='temvirgulacheckbox'>Tem Vírgula?</label><br></br>
                {
                    Object.keys(Color).map((currColor) => {
                        const currColorValue = Color[currColor as keyof typeof Color]
                        let stateFunction: React.Dispatch<React.SetStateAction<Category>>;
                        let category: Category
                        switch(currColorValue) {
                            case Color.Yellow: stateFunction = setYellowWords; category = yellowWords; break;
                            case Color.Blue: stateFunction = setBlueWords; category = blueWords; break;
                            case Color.Green: stateFunction = setGreenWords; category = greenWords; break;
                            case Color.Purple: stateFunction = setPurpleWords; category = purpleWords; break;
                        }
                        return (
                        <div key={currColor}>
                            <label htmlFor={currColor}>{currColor}&nbsp;&nbsp;</label>
                            <input id={currColor} type="text" value={category.words.join(temVirgula ? ',' : ' ')} onChange={(ev) => {
                                stateFunction({
                                    title: category.title, 
                                    words: ev.target.value
                                        .split(temVirgula ? ',' : ' ')
                                        .filter(str => str.length > 0)
                                        .map(str => str.trim())
                                    })
                                
                            }}></input>
                            <ul>
                                <li>
                                    <label htmlFor={currColor + ' Title'}>{currColor + ' Title'}&nbsp;&nbsp;</label>
                                    <input id={currColor + ' Title'} value={category.title} type="text" onChange={(ev) => {
                                        stateFunction({title:ev.target.value, words: category.words})
                                    }}></input>
                                </li>
                            </ul>
                        </div>)
                    })
                }
                <label htmlFor="customdate">Custom date: </label>
                <input type="date" step={1} id="customdate" name="customDate" onChange={(ev)=>{
                        try {
                            const parsedDateNumber = Date.parse(ev.target.value)
                            const parsedDate = new Date(parsedDateNumber)
                            const today = new Date(Date.now())
                            console.log(today.getDate(), parsedDate.getDate(), parsedDate.toLocaleDateString('pt-pt', {year: 'numeric', month:'numeric', day:'numeric'}).replaceAll("/","-"))
                            if (parsedDate.getFullYear() >= today.getFullYear() && parsedDate.getMonth() >= today.getMonth() && parsedDate.getDay() >= today.getDay())
                                setCustomDate(parsedDate.toLocaleDateString('pt-pt', {year: 'numeric', month:'numeric', day:'numeric'}).replaceAll("/","-"))
                            else setCustomDate('')
                        } catch (error) {
                            setCustomDate('')
                        }
                    }}
                /> <label htmlFor="customdate"><u>Colocar uma data anterior à de hoje {new Date(Date.now()).toISOString().split("T")[0]}</u> ou <u>clicar no botao para colocar data automaticamente</u> ou <u>nao mexer nisto</u> (se o input nao estiver dd/mm/aaaa é do teu pc/browser)</label>
                <br></br>
                <button onClick={()=>submitFunction()}>Submeter</button>
                <button onClick={()=>setErrorString('')}>Limpar Erro</button>
                <button onClick={()=>console.log(customDate)}>teste</button>
                <button onClick={()=>{(document.getElementById('customdate') as HTMLInputElement).value = ''; setCustomDate('')}}>Resetar data escolhida</button>
            </fieldset>
            {
                errorString.length > 0 ?
                <fieldset style={{color:errorString === 'Sucesso' ? '' : 'white', backgroundColor:errorString === 'Sucesso' ? 'green' : 'red', fontWeight:'bold'}}>
                    <legend style={{backgroundColor:errorString === 'Sucesso' ? 'green' : 'red'}}>{errorString === 'Sucesso' ? errorString : 'ERRO:'}</legend>
                    {errorString === 'Sucesso' ? null : <p>{errorString}</p>}
                </fieldset>
            : null
            }
        </>
    )
}