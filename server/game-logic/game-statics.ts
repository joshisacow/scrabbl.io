// boards
export const possibleBoards = [[
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
]]


// letters

const initialLetters = {
    "A": { "points":  1, "tiles":  9 },
    "B": { "points":  3, "tiles":  2 },
    "C": { "points":  3, "tiles":  2 },
    "D": { "points":  2, "tiles":  4 },
    "E": { "points":  1, "tiles": 12 },
    "F": { "points":  4, "tiles":  2 },
    "G": { "points":  2, "tiles":  3 },
    "H": { "points":  4, "tiles":  2 },
    "I": { "points":  1, "tiles":  9 },
    "J": { "points":  8, "tiles":  1 },
    "K": { "points":  5, "tiles":  1 },
    "L": { "points":  1, "tiles":  4 },
    "M": { "points":  3, "tiles":  2 },
    "N": { "points":  1, "tiles":  6 },
    "O": { "points":  1, "tiles":  8 },
    "P": { "points":  3, "tiles":  2 },
    "Q": { "points": 10, "tiles":  1 },
    "R": { "points":  1, "tiles":  6 },
    "S": { "points":  1, "tiles":  4 },
    "T": { "points":  1, "tiles":  6 },
    "U": { "points":  1, "tiles":  4 },
    "V": { "points":  4, "tiles":  2 },
    "W": { "points":  4, "tiles":  2 },
    "X": { "points":  8, "tiles":  1 },
    "Y": { "points":  4, "tiles":  2 },
    "Z": { "points": 10, "tiles":  1 },
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

export const newDeck = () => {
    let letters = []
    for (const [letter, value] of Object.entries(initialLetters)) {
        for (let i = 0; i < value.tiles; i++) {
            letters.push(letter)
        }
    }
    const deck = shuffleDeck(letters);
    return deck;
}

export const shuffleDeck = (deck: string[]) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// validate words
import fs from 'fs';
import path from 'path';
// Load the Scrabble words into a Set
const legalWords = new Set();
const filePath = path.join(__dirname, 'legalWords.txt');
fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .forEach(word => legalWords.add(word.trim().toUpperCase()));

export const isValidWord = (word: string) => {
    word = word.toUpperCase();
    if (legalWords.has(word)) {
        return true;
    }

    // blank tile handling

    let blankCount = (word.match(/ /g) || []).length;
    console.log(blankCount, word)
    if (blankCount === 1) {
        for (let i = 0; i < 26; i++) {
            let newWord = word.replace(/ /, String.fromCharCode(65 + i));
            if (legalWords.has(newWord)) {
                return true;
            }
        }
    } else if (blankCount === 2) {
        for (let i = 0; i < 26; i++) {
            let temp = word.replace(/ /, String.fromCharCode(65 + i));
            for (let j = 0; j < 26; j++) {
                let newWord = temp.replace(/ /, String.fromCharCode(65 + j))
                if (legalWords.has(newWord)) {
                    return true;
                }
            }
        }
    }

    return false;
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
