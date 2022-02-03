import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    let responseMessage = '';
    const inputWord = req.query.word;
    if (!inputWord) {
        context.res = {
            status: 400,
            body: 'Invalid word : missing'
        };
        return;
    }
    var words = context.bindings.inputWords;
    const dateToday = new Date().toJSON().split('T')[0].replace('-', '').replace('-', ''); //yyyyMMdd
    const wordOfTheDay = words.find(word => word.id === dateToday);
    if (wordOfTheDay.word.length != inputWord.length) {
        context.res = {
            status: 400,
            body: 'Invalid word length'
        };
        return;
    }
    if(inputWord === wordOfTheDay.word) {
        context.res = {
            body: 'ggggg'
        };
        return;
    }

    try {
        const dict = await axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + inputWord);
        context.log(dict);
    } catch (ex) {
        context.log(ex);
        context.res = {
            status: 400,
            body: 'Invalid word : not found in dictionary'
        };
        return;
    }

    for (let i = 0; i < inputWord.length; i++) {
        responseMessage += getLetterStatus(wordOfTheDay.word, inputWord[i], i)
    }
    context.res = {
        body: responseMessage
    };

};

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