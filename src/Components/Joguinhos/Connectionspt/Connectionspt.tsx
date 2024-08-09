import './Connectionspt.css'

//@ts-expect-error todo impl unused
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
//@ts-expect-error todo impl unused
import myFirebase from '../../../common/firebase'
//@ts-expect-error react scale text não tem @types
import ScaleText from 'react-scale-text'

type Category = {
    title: string,
    words: string[]
}
type FirebaseWords = {
    yellow: Category,
    green: Category,
    blue: Category,
    purple: Category,
    date: number
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
    const [firebaseWords, setFirebaseWords] = useState<FirebaseWords>()
    useEffect(() => {
        async function getConnections() {
            //TODO FIREBASE
            //const docRef = doc(myFirebase.db, "connections", "connection")
            //const docSnap = await getDoc(docRef)
            //console.log(docSnap.data())
            const game: FirebaseWords = {
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
                },
                date: Date.now()
            };
            setFirebaseWords(game);
            setGame(getScrambledWordsFromGame(game))
        }
        getConnections()
        console.log(game)
    }, [])
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
    const [numberOfGuessesLeft, setNumberOfGuessesLeft] = useState(4)
    const [guessesMade, setGuessesMade] = useState<GuessMade[]>([])

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
        const colorOfFirstWord = selectedWords[0].word.color
        const wordsOfTheSameColorAsFirst = selectedWords.filter(val => val.word.color === colorOfFirstWord);
        return wordsOfTheSameColorAsFirst.length === 4
    }

    const saveCurrentGuessesToLocalStorageOrDB = () => {
        {
            //save to localstorage
            localStorage.setItem(`connection${firebaseWords?.date}`, JSON.stringify(guessesMade))
        }
        {
            //save to firebase
            console.error("TODO FIREBASE IMPL")
        }
    }

    const performPostEvaluateLogic = (result: boolean) => {
        const numberGuessesLeft = numberOfGuessesLeft - 1
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
            if (wasGuessValid !== 4) // signifca que esta guess atual nunca foi feita, podemos subtrair
                setNumberOfGuessesLeft(numberGuessesLeft)
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
                setGuessesMade(answers)
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
        <div>
            <div className='gameTableParent'>
            <h1 style={{ marginTop:'12px', marginBottom:'0px' }}>CONEXÕÕÕÕÕESSSS</h1>
            <p style={{ fontSize:'8px', marginTop:'4px', marginBottom:'16px', textAlign:'center' }}>im connectinggggggggggggggggggg</p>
                {
                    guessesMade.length === 0 ? null
                        :
                        guessesMade.map(convertGuessToHTML)
                }
                <div className='gameTable'>
                    {
                        game === undefined && guessesMade.length === 0 ? <h1>LOADING</h1>
                            :
                            game === undefined ? null : game.map(convertSelectedWordToTile)
                    }
                </div>
                <p style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center', marginTop: '16px', marginBottom: '12px' }}>Tentativas restantes: {numberOfGuessesLeft}</p>
                <div id="divBotoesConnections" style={{ justifySelf: 'center', paddingLeft: '1.5%' }}>
                    <button className='connectionButton' onClick={(ev) => { animateButton(AnimationTypes.Click, ev.currentTarget); if (selectedWords.length === 4) performPostEvaluateLogic(evaluateSubmission()) }} disabled={selectedWords.length !== 4} >Submeter</button>&nbsp;
                    <button className='connectionButton' onClick={(ev) => { animateButton(AnimationTypes.Click, ev.currentTarget); removeSelection() }} disabled={selectedWords.length === 0}>Remover seleção</button>&nbsp;
                    <button className='connectionButton' onClick={(ev) => { animateButton(AnimationTypes.Click, ev.currentTarget); if (game) setGame(shuffleArray(game!, true)! as SelectedWord[]) }}>Shuffle</button>
                </div>
                <div className='animateClick teste'>swag</div>
            </div>
        </div>
    )
}