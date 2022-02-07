import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    let responseMessage = '';
    // validate word input
    const inputWordStr = req.query.word;
    if (!inputWordStr) {
        context.res = {
            status: 400,
            body: 'Invalid word : missing'
        };
        return;
    }
    // convert input word to upper case
    const inputWord = inputWordStr.toUpperCase();

    // get all words from DB
    var words = context.bindings.dbWords;

    // today's date in yyyyMMdd
    const dateToday = new Date().toJSON().split('T')[0].replace('-', '').replace('-', '');

    // find the today's word
    const wordOfTheDay = words.find(word => word.id === dateToday);

    // convert today's word to upper case
    const theWord = wordOfTheDay.word.toUpperCase();

    // throw Invalid word length if input word is not 5 char long
    if (theWord.length != inputWord.length) {
        context.res = {
            status: 400,
            body: 'Invalid word length'
        };
        return;
    }

    // if the words match, return prematurely
    if(inputWord === theWord) {
        context.res = {
            body: 'ggggg'
        };
        return;
    }

    // check if the input word is a valid english word
    try {
        const dict = await axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + inputWord);
        context.log(dict);
    } catch (ex) {
        context.log(ex);
        context.res = {
            status: 400,
            body: 'Invalid word : not a valid english word'
        };
        return;
    }

    // compute response for the input word
    for (let i = 0; i < inputWord.length; i++) {
        responseMessage += getLetterStatus(theWord, inputWord[i], i)
    }
    context.res = {
        body: responseMessage
    };

};

// get the status of a letter in a word.
// g if letter position matched, y if letter found but incorrect position, b if letter not found.
const getLetterStatus = function (word, letter, index): string {
    const expectedIndex = word.indexOf(letter);
    if (expectedIndex == -1) {
        return 'b';
    } else if (index != expectedIndex) {
        return 'y';
    }
    return 'g';
}

export default httpTrigger;