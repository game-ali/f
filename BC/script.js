const display = document.getElementById("display");
let currentInput = "";
let operator = null;
let firstOperand = null;
let voices = [];
let selectedVoice = null;

window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.name === "{localman}");
};

function appendNumber(number) {
    currentInput += number;
    updateDisplay(currentInput);
    readOutNumber(parseInt(currentInput));
}

function appendOperator(op) {
    if (currentInput === "" && op === "-") {
        currentInput = "-";
        updateDisplay(currentInput);
        readOut("-");
        return;
    }

    if (firstOperand === null) {
        firstOperand = parseFloat(currentInput);
    } else if (operator) {
        firstOperand = operate(firstOperand, parseFloat(currentInput), operator);
        updateDisplay(firstOperand + " GHS");
    }

    operator = op;
    currentInput = "";
    readOut(op);
}

function appendDecimal() {
    if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay(currentInput);
        readOut('point');
    }
}

function clearDisplay() {
    currentInput = "";
    operator = null;
    firstOperand = null;
    updateDisplay("0 GHS");
    readOut("vilysi ahzaa");
}

function calculateResult() {
    if (operator && currentInput !== "") {
        let secondOperand = parseFloat(currentInput);
        let result = operate(firstOperand, secondOperand, operator);
        updateDisplay(result + " GHS");
        firstOperand = result;
        currentInput = "";
        operator = null;
        playVoiceNoteAndReadOutNumber(result);
    }
}

function removeLastCharacter() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || "0 GHS");
    readOut("vilysi");
}

function updateDisplay(value) {
    display.value = value;
}

function operate(a, b, operator) {
    switch (operator) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return a / b;
        default:
            return b;
    }
}

function readOut(input) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(input);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    synth.speak(utterance);
}

function readOutNumber(number) {
    const numberToWords = convertNumberToWords(number);
    readOut(numberToWords);
}

function playVoiceNoteAndReadOutNumber(number) {
    const audio = new Audio('voice.opus'); // Assuming voice.png is the audio file
    audio.play();
    audio.onended = () => {
        const numberToWords = convertNumberToWords(number);
        const oldCurrencyValue = number * 10000; // Convert to old currency
        const oldCurrencyWords = convertNumberToWords(oldCurrencyValue);
        readOut(`ahzaananin ${numberToWords} Ghana Cedis, Carnahnoola ${oldCurrencyWords} koruun ligri puoh .`);
    };
}

function convertNumberToWords(number) {
    const words = [
        'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (number < 20) {
        return words[number];
    } else if (number < 100) {
        return tens[Math.floor(number / 10) - 2] + (number % 10 === 0 ? '' : ' ' + words[number % 10]);
    } else if (number < 1000) {
        return words[Math.floor(number / 100)] + ' Hundred' + (number % 100 === 0 ? '' : ' and ' + convertNumberToWords(number % 100));
    } else if (number < 1000000) {
        return convertNumberToWords(Math.floor(number / 1000)) + ' Thousand' + (number % 1000 === 0 ? '' : ' ' + convertNumberToWords(number % 1000));
    } else if (number < 1000000000) {
        return convertNumberToWords(Math.floor(number / 1000000)) + ' Million' + (number % 1000000 === 0 ? '' : ' ' + convertNumberToWords(number % 1000000));
    } else {
        return convertNumberToWords(Math.floor(number / 1000000000)) + ' Billion' + (number % 1000000000 === 0 ? '' : ' ' + convertNumberToWords(number % 1000000000));
    }
}
