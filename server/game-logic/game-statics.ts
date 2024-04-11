// boards
export const possibleBoards = [
    ["3xWS", "    ", "    ", "2xLS", "    ", "    ", "    ", "3xWS", "    ", "    ", "    ", "2xLS", "    ", "    ", "3xWS"],
    ["    ", "2xWS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "2xWS", "    "],
    ["    ", "    ", "2xWS", "    ", "    ", "    ", "2xLS", "    ", "2xLS", "    ", "    ", "    ", "2xWS", "    ", "    "],
    ["2xLS", "    ", "    ", "2xWS", "    ", "    ", "    ", "2xLS", "    ", "    ", "    ", "2xWS", "    ", "    ", "2xLS"],
    ["    ", "    ", "    ", "    ", "2xWS", "    ", "    ", "    ", "    ", "    ", "2xWS", "    ", "    ", "    ", "    "],
    ["    ", "3xLS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "3xLS", "    "],
    ["    ", "    ", "2xLS", "    ", "    ", "    ", "2xLS", "    ", "2xLS", "    ", "    ", "    ", "2xLS", "    ", "    "],
    ["3xWS", "    ", "    ", "2xLS", "    ", "    ", "    ", "star", "    ", "    ", "    ", "2xLS", "    ", "    ", "3xWS"],
    ["    ", "    ", "2xLS", "    ", "    ", "    ", "2xLS", "    ", "2xLS", "    ", "    ", "    ", "2xLS", "    ", "    "],
    ["    ", "3xLS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "3xLS", "    "],
    ["    ", "    ", "    ", "    ", "2xWS", "    ", "    ", "    ", "    ", "    ", "2xWS", "    ", "    ", "    ", "    "],
    ["2xLS", "    ", "    ", "2xWS", "    ", "    ", "    ", "2xLS", "    ", "    ", "    ", "2xWS", "    ", "    ", "2xLS"],
    ["    ", "    ", "2xWS", "    ", "    ", "    ", "2xLS", "    ", "2xLS", "    ", "    ", "    ", "2xWS", "    ", "    "],
    ["    ", "2xWS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "3xLS", "    ", "    ", "    ", "2xWS", "    "],
    ["3xWS", "    ", "    ", "2xLS", "    ", "    ", "    ", "3xWS", "    ", "    ", "    ", "2xLS", "    ", "    ", "3xWS"]
]


// letters

export class Tile {
    type: string
    player: any;
    letter: string;
    location: string;

    constructor (letter: string, type: string = "tile") {
        if (type === "   " ) {
            type = "empty"
        }
        this.type = type
        this.player = 1
        this.letter = letter
        this.location = "deck"
    }
}

const initialLetters = {
    "a": { "points":  1, "tiles":  9 },
    "b": { "points":  3, "tiles":  2 },
    "c": { "points":  3, "tiles":  2 },
    "d": { "points":  2, "tiles":  4 },
    "e": { "points":  1, "tiles": 12 },
    "f": { "points":  4, "tiles":  2 },
    "g": { "points":  2, "tiles":  3 },
    "h": { "points":  4, "tiles":  2 },
    "i": { "points":  1, "tiles":  9 },
    "j": { "points":  8, "tiles":  1 },
    "k": { "points":  5, "tiles":  1 },
    "l": { "points":  1, "tiles":  4 },
    "m": { "points":  3, "tiles":  2 },
    "n": { "points":  1, "tiles":  6 },
    "o": { "points":  1, "tiles":  8 },
    "p": { "points":  3, "tiles":  2 },
    "q": { "points": 10, "tiles":  1 },
    "r": { "points":  1, "tiles":  6 },
    "s": { "points":  1, "tiles":  4 },
    "t": { "points":  1, "tiles":  6 },
    "u": { "points":  1, "tiles":  4 },
    "v": { "points":  4, "tiles":  2 },
    "w": { "points":  4, "tiles":  2 },
    "x": { "points":  8, "tiles":  1 },
    "y": { "points":  4, "tiles":  2 },
    "z": { "points": 10, "tiles":  1 },
    "": { "points": 0, "tiles": 2}
}

export const letterValues: { [key: string]: number } = {
    " ": 0,
    "A": 1,
    "B": 3,
    "C": 3,
    "D": 2,
    "E": 1,
    "F": 4,
    "G": 2,
    "H": 4,
    "I": 1,
    "J": 8,
    "K": 5,
    "L": 1,
    "M": 3,
    "N": 1,
    "O": 1,
    "P": 3,
    "Q": 10,
    "R": 1,
    "S": 1,
    "T": 1,
    "U": 1,
    "V": 4,
    "W": 4,
    "X": 8,
    "Y": 4,
    "Z": 10 
}

export const shuffleDeck = () => {
    let letters = []
    for (const [letter, value] of Object.entries(initialLetters)) {
        for (let i = 0; i < value.tiles; i++) {
            letters.push(new Tile(letter))
        }
    }
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    console.log(letters)
    return letters;
}

// validate words
import * as path from 'path';
import fs from 'fs';
// const scrabbleWordsFile = path.join(__dirname, 'legalWords.txt');

// Load the Scrabble words into a Set
const legalWords = new Set();
fs.readFileSync('legalWords.txt', 'utf8')
    .split('\n')
    .forEach(word => legalWords.add(word.trim().toUpperCase()));

export const isValidWord = (word: string) => {
    return legalWords.has(word.toUpperCase());

    //TODO: add blank tile handling
}

export const calculateWordScore = (word: string) => {
    let score = 0;
    word = word.toUpperCase();
    for (let i = 0; i < word.length; i++) {
        // console.log(word[i], letterValues[word[i]])
        score += letterValues[word[i]];
    }
    return score;
}