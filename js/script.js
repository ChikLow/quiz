const main_screen = document.querySelector(".main-screen");
const start_screen = document.querySelector(".start-screen");
const stats_screen = document.querySelector(".stats-screen");
const question = document.querySelector(".question");
const answers = document.querySelector(".answers");
const answer_buttons = document.querySelectorAll(".answer-button");
const start_button = document.querySelector('.start-button');
const stats_button = document.querySelector('.stats-button');
const back_button = document.querySelector('.back-button');
const secondsElement = document.getElementById('seconds');
const skip_btn = document.querySelector('.skip-btn');

let correctAnswersCounter = 0;
let totalAnswersCounter = 0;

back_button.style.display = "none";
stats_screen.style.display = 'none';

// Functions to handle cookies
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// Function to shuffle the answers
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomSign() {
    let signs = ["+", "-", "*", "/"];
    return signs[randint(0, 3)];
}

class Question {
    constructor() {
        this.num1 = randint(1, 30);
        this.num2 = randint(1, 30);
        this.sign = getRandomSign();
        this.question = `${this.num1} ${this.sign} ${this.num2}`;
        this.correct = this.calculateCorrectAnswer();
        this.answers = this.generateAnswers();
        shuffle(this.answers);
    }

    calculateCorrectAnswer() {
        switch (this.sign) {
            case '+':
                return this.num1 + this.num2;
            case '-':
                return this.num1 - this.num2;
            case '*':
                return this.num1 * this.num2;
            case '/':
                return Math.round(this.num1 / this.num2);
        }
    }

    generateAnswers() {
        return [
            this.correct,
            randint(this.correct - 15, this.correct - 1),
            randint(this.correct + 1, this.correct + 15),
            randint(this.correct - 10, this.correct - 1),
            randint(this.correct + 1, this.correct + 10),
        ];
    }

    display() {
        question.innerHTML = this.question;
        answer_buttons.forEach((button, i) => {
            button.innerHTML = this.answers[i];
        });
    }
}

// Function to update the stats display
function updateStatsScreen() {
    const bestAccuracy = getCookie('bestAccuracy') || 0;
    const totalCorrect = getCookie('totalCorrect') || 0;
    const totalQuestions = getCookie('totalQuestions') || 0;
    const allTimeAccuracy = getCookie('allTimeAccuracy') || 0;

    stats_screen.innerHTML = `
        <div class='label-stats'>Your statistics</div>
        <p id='best-accuracy'>Best Accuracy: ${bestAccuracy}%</p>
        <p id='total-correct'>Total Correct: ${totalCorrect}</p>
        <p id='total-questions'>Total Questions: ${totalQuestions}</p>
        <p id='all-time-accuracy'>All Time Accuracy: ${allTimeAccuracy}%</p>
    `;
}

skip_btn.addEventListener("click", function () {
    totalAnswersCounter += 1;
    current_question = new Question();
    current_question.display();
    console.log("wrong")
})

start_button.addEventListener("click", function () {
    start_screen.style.display = "none";
    main_screen.style.display = "flex";
    current_question = new Question();
    current_question.display();
    correctAnswersCounter = 0;
    totalAnswersCounter = 0;

    setTimeout(function () {
        const accuracy = Math.round(correctAnswersCounter * 100 / totalAnswersCounter);
        let bestAccuracy = parseFloat(getCookie('bestAccuracy')) || 0;
        let totalCorrect = parseInt(getCookie('totalCorrect')) || 0;
        let totalQuestions = parseInt(getCookie('totalQuestions')) || 0;
        let allTimeAccuracy = Math.round(totalCorrect * 100 / totalQuestions);

        totalCorrect += correctAnswersCounter;
        totalQuestions += totalAnswersCounter;

        if (accuracy > bestAccuracy) {
            bestAccuracy = accuracy;
            setCookie('bestAccuracy', bestAccuracy, 365);
        }
        setCookie('totalCorrect', totalCorrect, 365);
        setCookie('totalQuestions', totalQuestions, 365);
        setCookie('allTimeAccuracy', allTimeAccuracy, 365);

        let result = document.querySelector('.result');
        result.innerHTML = `Correct: ${correctAnswersCounter}<br>
        Total: ${totalAnswersCounter}<br>
        Accuracy: ${accuracy}%`;

        updateStatsScreen();
        start_screen.style.display = "flex";
        main_screen.style.display = "none";
    }, 10000);
});

stats_button.addEventListener("click", function () {
    start_screen.style.display = "none";
    stats_screen.style.display = "flex";
    back_button.style.display = "flex";
    updateStatsScreen();
    anime({
        targets: '.label-stats',
        keyframes: [
            { top: -40 },
            { top: 75 },
            { top: 15 }
        ],
        duration: 1000,
        easing: 'linear'
    });
});

back_button.addEventListener("click", function () {
    start_screen.style.display = "flex";
    stats_screen.style.display = "none";
    back_button.style.display = "none";
});

answer_buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        if (button.innerHTML == current_question.correct) {
            correctAnswersCounter += 1;
            button.style.background = "#00bf33";
            anime({
                targets: button,
                background: "#000000",
                duration: 500,
                delay: 100,
                easing: "linear"
            });
            console.log("Right");
        } else {
            button.style.background = "#e32222";
            anime({
                targets: button,
                background: "#000000",
                duration: 500,
                delay: 100,
                easing: "linear"
            });
            console.log("Wrong");
        }
        totalAnswersCounter += 1;
        current_question = new Question();
        current_question.display();
    });
});

// Timer functionality
let initialTime = 10;
let timeLeft = initialTime;
let timerInterval;

function updateTimerDisplay() {
    secondsElement.textContent = `left:${timeLeft}s`;
}

start_button.addEventListener("click", function startTimer() {
    if (!timerInterval) {
        if (timeLeft === 0) {
            timeLeft = initialTime;
            updateTimerDisplay();
        }

        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }, 1000);
    }
});

updateTimerDisplay();