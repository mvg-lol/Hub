import "./Connectionspt.css";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import Modal from 'react-modal'
//@ts-expect-error react scale text não tem @types
import ScaleText from "react-scale-text";
import toast, { Toaster } from "react-hot-toast";
import supabase, { getUserDisplayName, UIDsMartinho, userIsMartinho } from "../supabase/supabase";
import { Tables } from "../database.types";
import { User } from "@supabase/supabase-js";

interface Category {
    title: string;
    words: string[];
}
interface WordCategories {
    yellow: Category;
    green: Category;
    blue: Category;
    purple: Category;
    author: string;
}
enum Color {
    Yellow = "#FBEC72",
    Green = "#86CC4A",
    Blue = "#009FFF",
    Purple = "#E071FF",
}
function colorToEmoji(color: Color): string {
    switch (color) {
        case Color.Yellow:
            return "🟨";
        case Color.Green:
            return "🟩";
        case Color.Blue:
            return "🟦";
        case Color.Purple:
            return "🟪";
    }
}
type SelectedWord = {
    word: Word;
    idString: string;
};
type Word = {
    word: string;
    color: Color;
};
type GuessMade = {
    guess: SelectedWord[];
    wasSuccessful: boolean;
};
enum AnimationTypes {
    Shake = "animateShake",
    Click = "animateClick",
}

function shuffleArray(array: unknown[], returnNewArray: boolean = false) {
    const auxArray = returnNewArray ? Array.from(array) : array;
    for (let i = auxArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [auxArray[i], auxArray[j]] = [auxArray[j], auxArray[i]];
    }
    return returnNewArray ? auxArray : null;
}

function getScrambledWordsFromGame(game: WordCategories): SelectedWord[] {
    const wordList: Word[] = [];
    for (const word of game.blue.words) {
        wordList.push({ word: word, color: Color.Blue });
    }
    for (const word of game.yellow.words) {
        wordList.push({ word: word, color: Color.Yellow });
    }
    for (const word of game.purple.words) {
        wordList.push({ word: word, color: Color.Purple });
    }
    for (const word of game.green.words) {
        wordList.push({ word: word, color: Color.Green });
    }
    shuffleArray(wordList);
    return wordList.flatMap((val, index) => {
        const idString = `${val.color}#${val.word}#${index}`;
        return { word: val, idString: idString } as SelectedWord;
    });
}

function dateToMyString(date: Date, yearmonthday: boolean = false): string {
    if (!yearmonthday)
        return date
            .toLocaleDateString("pt-pt", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })
            .replaceAll("/", "-");
    else
        return date
            .toLocaleDateString("pt-pt", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })
            .split("/")
            .reverse()
            .join("-");
}


const animateButton = (
    classNameForAnimation: string,
    element: HTMLElement
) => { 
    // a classe CSS TEM de ter a variável --animation-time definida
    
    //animate button
    element.classList.add(classNameForAnimation);
    const animationTimeVar =
        getComputedStyle(element).getPropertyValue("--animation-time");
    let time = parseFloat(
        animationTimeVar.indexOf("ms") >= 0
            ? animationTimeVar.replace("ms", "")
            : animationTimeVar.replace("s", "000")
    );
    if (time < 1) {
        time = time * 1000;
    }
    setTimeout(() => {
        element.classList.remove(classNameForAnimation);
    }, time);
};

export default function Connectionspt(): JSX.Element {
    //let connections = collection(myFirebase.db, "connections")
    const selectedWordColor = "#BBBBBB";
    const defaultWordColor = "bisque";
    const onHoverWordColor = "aliceblue";
    const [game, setGame] = useState<SelectedWord[]>();
    const [userMartinho, setUserMartinho] = useState<User | null>(null);
    const [firebaseWords, setFirebaseWords] = useState<WordCategories>();
    const [gameDatesAvailable, setGameDatesAvailable] = useState<Date[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    //const [paginateGames, setPaginateGames] = useState<number>(0)

    const selectToGame = (data: Tables<'connections'>) => {
        return {
            green: {
                title: data.green_title!,
                words: data.green_words!.split("||")
            },
            purple: {
                title: data.purple_title!,
                words: data.purple_words!.split("||")
            },
            blue: {
                title: data.blue_title!,
                words: data.blue_words!.split("||")
            },
            yellow: {
                title: data.yellow_title!,
                words: data.yellow_words!.split("||")
            },
            author: data.author!
        }
    }

    useEffect(() => {
        for (let i = 0; i < localStorage.length; i++) {
            // remover entradas bugadas
            const key = localStorage.key(i)!;
            if (key.startsWith("connection")) {
                const guesses = JSON.parse(localStorage.getItem(key)!) as GuessMade[];
                if (guesses.length === 3) localStorage.removeItem(key);
            }
        }
        async function getConnections() {
            let game: WordCategories = {
                green: {
                    title: "Sinónimos de Lindo",
                    words: ["bonito", "elegante", "deslumbrante", "vistoso"],
                },
                purple: {
                    title: "Primeira palavra de estados brasileiros",
                    words: ["belo", "rio", "minas", "mato"],
                },
                blue: {
                    title: "Propriedades dum iman",
                    words: ["ferroso", "azul", "vermelho", "magnético"],
                },
                yellow: {
                    title: "Parabenizar",
                    words: ["congratular", "felicitar", "saudar", "salvar"],
                },
                author: UIDsMartinho.Github
            };
            const q = await supabase.from('connections')
                .select('*').eq('date', dateToMyString(selectedDate, true)).single();
            if (!q.error) {
                const data = q.data;
                const split = data.id.split("-");
                const date = new Date(parseInt(split[0]), parseInt(split[1]) - 1, parseInt(split[2]));
                game = selectToGame(data);
                setSelectedDate(date);
                const qd = await supabase.from('connections')
                    .select('id').neq('date', dateToMyString(selectedDate, true))
                const dates = qd.data!.map((val) => {const d = val.id.split("-"); return new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]))})
                setGameDatesAvailable(dates.reverse());
            }
            //}
            setFirebaseWords(game);
            setGame(getScrambledWordsFromGame(game));
        }
        getConnections();
        supabase.auth.getUser().then(({ data }) => { 
            if (data.user !== null && userIsMartinho(data.user.id)) {
                setUserMartinho(data.user);
            } else {
                setUserMartinho(null);
            }
        })
        .catch((err) => {
            console.error("Error fetching user:", err);
        });
    }, [selectedDate]);
    const showToast = (msg: string, emoji: "📋" | "🤏" | undefined) => {
        toast(msg, {
            duration: 3000,
            position: "top-center",
            icon: emoji,
            style: { backgroundColor: "black", color: "white" },
        });
    };
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
    const [numberOfGuessesLeft, setNumberOfGuessesLeft] = useState(4);
    const [guessesMade, setGuessesMade] = useState<GuessMade[]>([]);
    const [answers, setAnswers] = useState<GuessMade[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(userMartinho !== null);

    const addOrRemoveSelectedWord = (selectedWord: SelectedWord) => {
        const element = document.getElementById(selectedWord.idString)!;

        animateButton(AnimationTypes.Click, element);

        if (
            selectedWords.length > 0 &&
            selectedWords.filter((val) => val.idString === selectedWord.idString)
                .length > 0
        ) {
            // remover selecionada
            setSelectedWords(
                selectedWords.filter((val) => val.idString !== selectedWord.idString)
            );
            element.style.backgroundColor = defaultWordColor;
            return;
        }
        if (selectedWords.length < 4) {
            setSelectedWords(selectedWords.concat(selectedWord));
            element.style.backgroundColor = selectedWordColor;
        }
    };

    const removeSelection = () => {
        const gameTable = document.getElementsByClassName("gameTable")[0];
        for (const child of gameTable.children) {
            const htmlChild = child as HTMLElement;
            if (!htmlChild.id.endsWith("guess"))
                htmlChild.style.backgroundColor = defaultWordColor;
        }
        setSelectedWords([]);
    };

    const evaluateSubmission = () => {
        const cores: { [key: string]: number } = {};
        selectedWords.forEach((val) =>
            cores[val.word.color] !== undefined
                ? (cores[val.word.color] = cores[val.word.color] + 1)
                : (cores[val.word.color] = 1)
        );
        const keys = Object.keys(cores);
        const isOneAway =
            keys.length === 2 && (cores[keys[0]] === 1 || cores[keys[0]] === 3);
        return { result: Object.keys(cores).length === 1, isOneAway: isOneAway };
    };

    const saveCurrentGuessesToLocalStorageOrDB = (guess: GuessMade[]) => {
        const dateString = `connection${dateToMyString(selectedDate)}`;

        //save to localstorage
        if (localStorage.getItem(dateString) === null)
            localStorage.setItem(dateString, JSON.stringify(guess));

        //TODO GUARDAR NO USER NO FIREBASE
        //save to firebase
        console.error("TODO FIREBASE IMPL");
    };

    const performPostEvaluateLogic = (res: {
        result: boolean;
        isOneAway: boolean;
    }) => {
        const { result, isOneAway } = res;
        let numberGuessesLeft = numberOfGuessesLeft - 1;
        let wasGuessValid = 0; // se for 4, a guess foi válida
        if (!result) {
            for (const guess of guessesMade) {
                if (guess.wasSuccessful) continue;
                const listOfWords = guess.guess;
                for (const word of listOfWords) {
                    for (const currentWord of selectedWords) {
                        if (currentWord.word === word.word) {
                            wasGuessValid = wasGuessValid + 1;
                            break;
                        }
                    }
                }
                if (wasGuessValid === 4) break;
                else wasGuessValid = 0;
            }
            if (wasGuessValid !== 4) {
                // signifca que esta guess atual nunca foi feita, podemos subtrair
                setNumberOfGuessesLeft(numberGuessesLeft);
                if (isOneAway) showToast("Falta um!", "🤏");
            } else {
                numberGuessesLeft = numberGuessesLeft + 1;
                showToast("Já usaste esta combinação", undefined);
            }
        }
        const [botaoSubmeter] = document
            .getElementById("divBotoesConnections")!
            .getElementsByTagName("button");
        if (numberGuessesLeft === 0) {
            botaoSubmeter.disabled = true;
        }
        const g = guessesMade.concat({
            guess: selectedWords,
            wasSuccessful: result,
        });
        setGuessesMade(g);
        if (result) {
            // remover as palavras da tabela do jogo
            const newGame = game!.filter(
                (val) => val.word.color != selectedWords[0].word.color
            );
            setGame(newGame);
            setAnswers(answers.concat(g[g.length - 1]));
            if (newGame.length === 0) saveCurrentGuessesToLocalStorageOrDB(g);
        } else {
            for (const selectedWord of selectedWords) {
                const elem = document.getElementById(selectedWord.idString)!;
                animateButton(AnimationTypes.Shake, elem);
            }
            if (numberGuessesLeft == 0) {
                saveCurrentGuessesToLocalStorageOrDB(g);
                const answers = Array<GuessMade>();
                answers.push({
                    guess: firebaseWords!.yellow.words.map((word, index) => {
                        return {
                            word: { word: word, color: Color.Yellow },
                            idString: `yellow${word}${index}`,
                        };
                    }),
                    wasSuccessful: true,
                });
                answers.push({
                    guess: firebaseWords!.green.words.map((word, index) => {
                        return {
                            word: { word: word, color: Color.Green },
                            idString: `green${word}${index}`,
                        };
                    }),
                    wasSuccessful: true,
                });
                answers.push({
                    guess: firebaseWords!.blue.words.map((word, index) => {
                        return {
                            word: { word: word, color: Color.Blue },
                            idString: `blue${word}${index}`,
                        };
                    }),
                    wasSuccessful: true,
                });
                answers.push({
                    guess: firebaseWords!.purple.words.map((word, index) => {
                        return {
                            word: { word: word, color: Color.Purple },
                            idString: `purple${word}${index}`,
                        };
                    }),
                    wasSuccessful: true,
                });
                setAnswers(answers);
                setGame(undefined);
            }
        }
        removeSelection();
        return result;
    };

    const convertGuessToHTML = (guessMade: GuessMade) => {
        if (guessMade.guess.length === 0) return <p>????</p>;
        if (!guessMade.wasSuccessful) return null;
        let id = "";
        let wordList = "";
        const guess = guessMade.guess;
        const color = guess[0].word.color;
        guess.forEach((val, index) => {
            id = id.concat(val.idString);
            wordList = wordList.concat(val.word.word.toUpperCase());
            if (index < 3) wordList = wordList.concat(", ");
        });
        let topic = "";
        switch (color) {
            case Color.Blue:
                topic = firebaseWords!.blue.title;
                break;
            case Color.Yellow:
                topic = firebaseWords!.yellow.title;
                break;
            case Color.Purple:
                topic = firebaseWords!.purple.title;
                break;
            case Color.Green:
                topic = firebaseWords!.green.title;
                break;
        }
        topic = topic.toUpperCase();
        return (
            <div className="gameTableForGuess">
                <div
                    key={id}
                    id={id}
                    className="wordGuess"
                    style={{ backgroundColor: color }}
                >
                    <h4>{topic}</h4>
                    <p>{wordList}</p>
                </div>
            </div>
        );
    };

    const convertSelectedWordToTile = (selectedWord: SelectedWord) => {
        const changeBackgroundColorOnHover = (isEnter: boolean) => {
            const elem = document.getElementById(selectedWord.idString)!;
            if (isEnter) {
                elem.style.backgroundColor = onHoverWordColor;
            } else {
                if (selectedWords.indexOf(selectedWord) >= 0)
                    elem.style.backgroundColor = selectedWordColor;
                else elem.style.backgroundColor = defaultWordColor;
            }
        };
        return (
            <div
                id={selectedWord.idString}
                className="word"
                onClick={() => addOrRemoveSelectedWord(selectedWord)}
                onMouseEnter={() => changeBackgroundColorOnHover(true)}
                onMouseLeave={() => changeBackgroundColorOnHover(false)}
                key={selectedWord.idString}
            >
                <ScaleText maxFontSize={16 /*font size default*/} heightOnly={true}>
                    <p style={{ fontWeight: "bold" }}>
                        {selectedWord.word.word.toUpperCase()}
                    </p>
                </ScaleText>
            </div>
        );
    };

    return (
        <div>
            {(isSubmitting) ? (<button className="connectionButton" onClick={()=> {if(userMartinho !== null) setIsSubmitting(!isSubmitting)}}>Trocar view</button>) : null}
            {
                (isSubmitting && userMartinho !== null) ? (
                    <ScriptInserirConnections martinho={userMartinho} />
                ) : (
                    <div>
                        <Toaster />
                        <Helmet>
                            <title>Conexões de {dateToMyString(selectedDate)}</title>
                            <link rel="canonical" href="https://mvg.lol/joguinhos/" />
                            <meta name="title" content={`Jogo das Conexões - by https://martinho.pt`}/>
                            <meta name="author" content="https://martinho.pt"/>
                            <meta name="description" content={`Jogo das Conexões - dia ${dateToMyString(selectedDate)}`}/>
                            <meta itemProp="name" content="https://mvg.lol - Conexões" />
                            <meta itemProp="author" content="https://martinho.pt" />
                            <meta itemProp="description" content={`Jogo das Conexões - dia ${dateToMyString(selectedDate)}`} />
                            <meta property="og:url" content="https://mvg.lol - Conexões" />
                            <meta property="og:type" content="website" />
                            <meta property="og:description" content={`Jogo das Conexões - dia ${dateToMyString(selectedDate)}`} />
                            <meta property="og:title" content={`Jogo das Conexões - by https://martinho.pt`} />
                            <meta property="twitter:card" content="summary_large_image" />
                            <meta property="twitter:title" content={`Jogo das Conexões - by https://martinho.pt`} />
                            <meta property="twitter:description" content={`Jogo das Conexões - dia ${dateToMyString(selectedDate)}`} />
                        </Helmet>
                        <div className="gameTableParent">
                            <h1 style={{ marginBottom: "0px" }}>
                                CONEXÕÕÕÕÕESSSS
                            </h1>
                            <p
                                style={{
                                    fontSize: "8px",
                                    marginTop: "4px",
                                    marginBottom: "16px",
                                    textAlign: "center",
                                }}
                            >
                                im connectinggggggggggggggggggg
                            </p>
                            <BotaoAtivarNotificacoes trocarViewFunc={(userMartinho== null || !userIsMartinho(userMartinho.id)) ? null : ()=>{setIsSubmitting(!isSubmitting)}}/>
                            {answers.length === 0 ? null : answers.map(convertGuessToHTML)}
                            <div className="gameTable">
                                {game === undefined && guessesMade.length === 0 ? (
                                    <h1>LOADING...</h1>
                                ) : game === undefined ? null : (
                                    game.map(convertSelectedWordToTile)
                                )}
                            </div>
                            <p
                                style={{
                                    fontWeight: "bold",
                                    fontSize: 24,
                                    textAlign: "center",
                                    marginTop: "16px",
                                    marginBottom: "12px",
                                }}
                            >
                                Tentativas restantes: {numberOfGuessesLeft}
                            </p>
                            <div className="animateClick teste">swag</div>
                        </div>
                        <div
                            id="divBotoesConnections"
                            className="buttonParents"
                        >
                            <button
                                className="connectionButton"
                                onClick={(ev) => {
                                    animateButton(AnimationTypes.Click, ev.currentTarget);
                                    if (selectedWords.length === 4)
                                        performPostEvaluateLogic(evaluateSubmission());
                                }}
                                disabled={selectedWords.length !== 4}
                            >
                                Submeter
                            </button>
                            <button
                                className="connectionButton"
                                onClick={(ev) => {
                                    animateButton(AnimationTypes.Click, ev.currentTarget);
                                    removeSelection();
                                }}
                                disabled={selectedWords.length === 0}
                            >
                                Remover seleção
                            </button>
                            <button
                                className="connectionButton"
                                onClick={(ev) => {
                                    animateButton(AnimationTypes.Click, ev.currentTarget);
                                    if (game) setGame(shuffleArray(game, true)! as SelectedWord[]);
                                }}
                            >
                                Shuffle
                            </button>
                        </div>
                        <p className="buttonParents">Feito por: <div style={{fontWeight:'bold'}}>{firebaseWords?.author == undefined ? "martinho.pt" : getUserDisplayName(userMartinho)}</div></p>
                        {numberOfGuessesLeft <= 0 || game?.length === 0 ? (
                            <div className="guessGridResult" style={{ paddingTop: "16px" }}>
                                {guessesMade.map((guess) => {
                                    const words = guess.guess;
                                    const row = words.map((word) => {
                                        return (
                                            <div
                                                key={word.idString}
                                                className="guessSquare"
                                                style={{ background: word.word.color }}
                                            ></div>
                                        );
                                    });
                                    return (
                                        <div
                                            key={
                                                guess.wasSuccessful +
                                                guess.guess.map((x) => x.word.word).join("")
                                            }
                                            className="guessSquareLine"
                                        >
                                            {row}
                                        </div>
                                    );
                                })}
                                &nbsp;
                                <button
                                    className="connectionButton"
                                    onClick={(ev) => {
                                        animateButton(AnimationTypes.Click, ev.currentTarget);
                                        const rows: string[] = [];
                                        guessesMade.forEach((guess) => {
                                            let str = "";
                                            guess.guess.forEach((val) => {
                                                str = str + colorToEmoji(val.word.color);
                                            });
                                            rows.push(str);
                                        });
                                        const str = `Conexões de ${dateToMyString(
                                            selectedDate
                                        )}\n${rows.join("\n")}\nJoga em https://mvg.lol/joguinhos`;
                                        const blob = new Blob([str], { type: "text/plain" });
                                        const data = [new ClipboardItem({ "text/plain": blob })];
                                        navigator.clipboard
                                            .write(data)
                                            .then(() => {
                                                console.log("wrotten");
                                                showToast("Copiado!", "📋");
                                            })
                                            .catch((err) => console.log("not wrotten", err));
                                    }}
                                >
                                    Partilhar
                                </button>
                            </div>
                        ) : null}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                paddingTop: "12px",
                            }}
                        >
                            Escolhe outro jogo:{" "}
                            {/*<button className='connectionButton' disabled={paginateGames === 0 } onClick={()=>{if(paginateGames > 10) setPaginateGames(paginateGames-10); console.log(paginateGames)}}>Anteriores</button> <button className='connectionButton' disabled={paginateGames<=gameDatesAvailable.length} onClick={()=>{if(paginateGames<=gameDatesAvailable.length)setPaginateGames(paginateGames+10); console.log(paginateGames)}}>Seguintes</button>*/}
                            {gameDatesAvailable /*.slice(paginateGames, paginateGames+10)*/
                                .map((val) => {
                                    const date = dateToMyString(val);
                                    let addDone = false;
                                    let result = "";
                                    if (localStorage.getItem(`connection${date}`) !== null) {
                                        addDone = true;
                                        const guesses = JSON.parse(
                                            localStorage.getItem(`connection${date}`)!
                                        ) as GuessMade[];
                                        if (guesses.filter((val) => val.wasSuccessful).length === 4)
                                            result = "y";
                                        else result = "n";
                                    }
                                    return (
                                        <button
                                            disabled={val === selectedDate}
                                            onClick={async () => {
                                                const connection = await supabase.from('connections')
                                                    .select('*').eq('id',date).single()
                                                const game = selectToGame(connection.data!);
                                                setFirebaseWords(game);
                                                setGame(getScrambledWordsFromGame(game));
                                                setNumberOfGuessesLeft(4);
                                                setAnswers([]);
                                                setSelectedDate(val);
                                                setGuessesMade([]);
                                                setSelectedWords([]);
                                            }}
                                            key={val.toString()}
                                            style={{ marginTop: "12px" }}
                                            className="connectionButton"
                                        >
                                            {date
                                                .replaceAll("-", "/")
                                                .concat(
                                                    addDone
                                                        ? result === "y"
                                                            ? " ✅"
                                                            : result === "n"
                                                                ? " ❎"
                                                                : ""
                                                        : ""
                                                )}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                )
            }
        </div>
    );
}


function BotaoAtivarNotificacoes(props:{ trocarViewFunc: (() => void) | null; }): JSX.Element {

    const [modalIsOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
    
    }

    function closeModal() {
        setIsOpen(false);
    }

    const customStyles: Modal.Styles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            maxWidth:'400px',
            transform: 'translate(-50%, -50%)',
            alignContent:'center'
        },
    };
    return (
        <div className="buttonParents" style={{ paddingBottom:'8px' }}>
            <button
            className="connectionButton"
            onClick={(ev) => {
                animateButton(AnimationTypes.Click, ev.currentTarget);
                //TODO: implementar notificações
            }}
            >
            Ativar notificações
            </button>
            <button
            className="connectionButton"
            onClick={openModal}
            >
                Como Jogar
            </button>
            {
                props.trocarViewFunc != null ?
                (<button
                className="connectionButton"
                onClick={props.trocarViewFunc}
                >
                    Trocar View
                </button>)
                : null
            }
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                contentLabel="Instrucoes"
                style={customStyles}
            >
                    <h1>Como jogar</h1>
                    <p style={{
            textAlign: 'left',
            justifyContent:'left'}}>
                        - Existem 4 categorias: {colorToEmoji(Color.Yellow)}, {colorToEmoji(Color.Green)}, {colorToEmoji(Color.Blue)}, {colorToEmoji(Color.Purple)},
                        <br></br>Sendo que o nível de dificuldade mais fácil é o {colorToEmoji(Color.Yellow)} e o mais difícil o {colorToEmoji(Color.Purple)}.
                        <br></br><br></br>- Cada categoria tem 4 palavras associadas, deves escolhar 4 palavras que achas que pertencem ao mesmo grupo.
                        <br></br><br></br>- Nunca serão categorias como "Estas 4 palavras acabam todos em ão" ou "Verbos", mas sim algo como "Palavras associadas aos descobrimentos".
                        <br></br><br></br>- Por exemplo: Palavras associadas aos descobrimentos: Caravela, Lusíadas, Esfera Armilar, Mar
                    </p>
                    <center>
                    <button
                    className="connectionButton"
                    onClick={closeModal}
                    >
                        Fechar
                    </button>
                    </center>
                    
                </Modal>
        </div>
    )
}


function ScriptInserirConnections(
    props: Readonly<{ martinho: User }>
): JSX.Element {
    const [yellowWords, setYellowWords] = useState<Category>({
        title: "1",
        words: ["123", "123", "123", "123"],
    });
    const [blueWords, setBlueWords] = useState<Category>({
        title: "1",
        words: ["123", "123", "123", "123"],
    });
    const [greenWords, setGreenWords] = useState<Category>({
        title: "1",
        words: ["123", "123", "123", "123"],
    });
    const [purpleWords, setPurpleWords] = useState<Category>({
        title: "1",
        words: ["123", "123", "123", "123"],
    });
    const [errorString, setErrorString] = useState<string>("");
    const [temVirgula, setTemVirgula] = useState(true);
    const [customDate, setCustomDate] = useState<string>("");

    const firebaseWordsBuilder = (): WordCategories => {
        yellowWords.title = yellowWords.title.trim();
        if (yellowWords.title.endsWith("-")) {
            yellowWords.title = yellowWords.title
                .slice(0, yellowWords.title.length - 1)
                .trim();
        }
        blueWords.title = blueWords.title.trim();
        if (blueWords.title.endsWith("-")) {
            blueWords.title = blueWords.title
                .slice(0, blueWords.title.length - 1)
                .trim();
        }
        purpleWords.title = purpleWords.title.trim();
        if (purpleWords.title.endsWith("-")) {
            purpleWords.title = purpleWords.title
                .slice(0, purpleWords.title.length - 1)
                .trim();
        }
        greenWords.title = greenWords.title.trim();
        if (greenWords.title.endsWith("-")) {
            greenWords.title = greenWords.title
                .slice(0, greenWords.title.length - 1)
                .trim();
        }
        const displayName = getUserDisplayName(props.martinho)
        return {
            yellow: yellowWords,
            blue: blueWords,
            green: greenWords,
            purple: purpleWords,
            author: displayName === "Unknown User" ? "Martinho" : displayName
        };
    };

    const submitFunction = async () => {
        if (
            yellowWords.words.length !== 4 &&
            greenWords.words.length !== 4 &&
            blueWords.words.length !== 4 &&
            purpleWords.words.length !== 4
        ) {
            setErrorString(
                `Alguma lista sem 4 elementos exatos: Yellow: ${yellowWords.words.length} Green: ${greenWords.words.length} Blue: ${blueWords.words.length} Purple: ${purpleWords.words.length}`
            );
            return;
        }
        if (
            yellowWords.title.length === 0 &&
            greenWords.title.length === 0 &&
            blueWords.title.length === 0 &&
            purpleWords.title.length === 0
        ) {
            setErrorString(
                `Alguma lista não tem titulo: Yellow: ${yellowWords.title.length} Green: ${greenWords.title.length} Blue: ${blueWords.title.length} Purple: ${purpleWords.title.length}`
            );
            return;
        }

        if (userIsMartinho(props.martinho.id)) {
            let cdate = customDate;
            if (cdate.length !== 10) {
                const words = await supabase.from('connections')
                    .select('id').order('id', { ascending: false }).limit(1).single();
                const dateObj = stringDateToDate(words.data!.id!);
                dateObj.setDate(dateObj.getDate() + 7);
                cdate = dateToMyString(dateObj, true);
            }

            const data = firebaseWordsBuilder();
            const insert = await supabase.from('connections')
                .insert({
                    id: cdate,
                    yellow_words: data.yellow.words.join("||"),
                    blue_words: data.blue.words.join("||"),
                    green_words: data.green.words.join("||"),
                    purple_words: data.purple.words.join("||"),
                    yellow_title: data.yellow.title,
                    blue_title: data.blue.title,
                    green_title: data.green.title,
                    purple_title: data.purple.title,
                    author: data.author,
                });
            if (insert.error) {
                console.log("Error inserting data:", insert.error);
                setErrorString(insert.error.message);
                return;
            } else {
                setErrorString(`Sucesso Data - ${cdate}`);
                console.log("oi",errorString)
            }
        }
    };
    const newDateFromArray = (arr: number[]): Date =>
        new Date(arr[0], arr[1] - 1, arr[2]);
    const stringDateToDate = (date: string): Date =>
        newDateFromArray(date.split("-").map((val) => parseInt(val)));

    const teste = async () => {
        console.log(customDate);
        /*const connectionsCol = collection(myFirebase.db, "connections").withConverter(firebaseWordsConverter);
            const q = query(connectionsCol, orderBy(documentId()))
            const qsnapshot = await getDocs(q)
            let arr = []
            qsnapshot.forEach(x =>{ console.log(x.data() as FirebaseWords, x.id);arr.push(x)})
            arr = arr.reverse()
            arr = arr.slice(0,3).reverse()
            console.log("____________")
            arr.forEach(x => console.log(x.data(), x.id))
            await setDoc(doc(myFirebase.db, "connections", "2024-09-19").withConverter(firebaseWordsConverter), arr[0].data())
            await setDoc(doc(myFirebase.db, "connections", "2024-09-22").withConverter(firebaseWordsConverter), arr[1].data())
            await setDoc(doc(myFirebase.db, "connections", "2024-09-29").withConverter(firebaseWordsConverter), arr[2].data())*/
    };

    return (
        <>
            <fieldset>
                <legend>Inserir novo connection</legend>
                <input
                    type="checkbox"
                    id="temvirgulacheckbox"
                    checked={temVirgula}
                    onChange={() => setTemVirgula(!temVirgula)}
                ></input>
                <label htmlFor="temvirgulacheckbox">Tem Vírgula?</label>
                <br></br>
                {Object.keys(Color).map((currColor) => {
                    const currColorValue = Color[currColor as keyof typeof Color];
                    let stateFunction: React.Dispatch<React.SetStateAction<Category>>;
                    let category: Category;
                    switch (currColorValue) {
                        case Color.Yellow:
                            stateFunction = setYellowWords;
                            category = yellowWords;
                            break;
                        case Color.Blue:
                            stateFunction = setBlueWords;
                            category = blueWords;
                            break;
                        case Color.Green:
                            stateFunction = setGreenWords;
                            category = greenWords;
                            break;
                        case Color.Purple:
                            stateFunction = setPurpleWords;
                            category = purpleWords;
                            break;
                    }
                    return (
                        <div key={currColor}>
                            <label htmlFor={currColor}>{currColor}&nbsp;&nbsp;</label>
                            <input
                                id={currColor}
                                type="text"
                                value={category.words.join(temVirgula ? "," : " ")}
                                onChange={(ev) => {
                                    stateFunction({
                                        title: category.title,
                                        words: ev.target.value
                                            .split(temVirgula ? "," : " ")
                                            .filter((str) => str.length > 0)
                                            //.map((str) => str.trim()),
                                    });
                                }}
                            ></input>
                            <ul>
                                <li>
                                    <label htmlFor={currColor + " Title"}>
                                        {currColor + " Title"}&nbsp;&nbsp;
                                    </label>
                                    <input
                                        id={currColor + " Title"}
                                        value={category.title}
                                        type="text"
                                        onChange={(ev) => {
                                            stateFunction({
                                                title: ev.target.value,
                                                words: category.words,
                                            });
                                        }}
                                    ></input>
                                </li>
                            </ul>
                        </div>
                    );
                })}
                <label htmlFor="customdate">Custom date: </label>
                <input
                    type="date"
                    step={1}
                    id="customdate"
                    name="customDate"
                    onChange={(ev) => {
                        try {
                            const parsedDateNumber = Date.parse(ev.target.value);
                            let parsedDate = new Date(parsedDateNumber);
                            parsedDate = new Date(
                                parsedDate.getFullYear(),
                                parsedDate.getMonth(),
                                parsedDate.getDate()
                            );
                            let today = new Date(Date.now());
                            today = new Date(
                                today.getFullYear(),
                                today.getMonth(),
                                today.getDate()
                            );
                            if (parsedDate >= today) {
                                if (parsedDate.getDate() !== 0) {
                                    parsedDate.setDate(
                                        parsedDate.getDate() + ((7 - parsedDate.getDay()) % 7)
                                    );
                                }
                                setCustomDate(dateToMyString(parsedDate, true));
                            } else setCustomDate("");
                        } catch (error) {
                            console.error(error)
                            setCustomDate("");
                        }
                    }}
                />{" "}
                <label htmlFor="customdate">
                    <u>
                        VAI COLOCAR A DATA NO DOMINGO A SEGUIR A QUE COLOCASTE Colocar uma
                        data anterior à de hoje{" "}
                        {new Date(Date.now()).toISOString().split("T")[0]}
                    </u>{" "}
                    ou <u>clicar no botao para colocar data automaticamente</u> ou{" "}
                    <u>nao mexer nisto</u> (se o input nao estiver dd/mm/aaaa é do teu
                    pc/browser)
                </label>
                <br></br>
                <button onClick={() => submitFunction()}>Submeter</button>
                <button onClick={() => setErrorString("")}>Limpar Erro</button>
                <button
                    onClick={() => {
                        console.log(customDate);
                        teste();
                    }}
                >
                    teste
                </button>
                <button
                    onClick={() => {
                        (document.getElementById("customdate") as HTMLInputElement).value =
                            "";
                        setCustomDate("");
                    }}
                >
                    Resetar data escolhida
                </button>
            </fieldset>
            {errorString.length > 0 ? (
                <fieldset
                    style={{
                        color: errorString.startsWith("Sucesso -") ? "" : "white",
                        backgroundColor: errorString.startsWith("Sucesso")
                            ? "green"
                            : "red",
                        fontWeight: "bold",
                    }}
                >
                    <legend
                        style={{
                            backgroundColor: errorString.startsWith("Sucesso")
                                ? "green"
                                : "red",
                        }}
                    >
                        {errorString.startsWith("Sucesso") ? "Sucesso" : "ERRO:"}
                    </legend>
                    {errorString === "Sucesso" ? null : (
                        <p>{errorString.split("Sucesso")[1].trim()}</p>
                    )}
                </fieldset>
            ) : null}
        </>
    );
}
