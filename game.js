let ytPlayablesInstance = null;
let currentQuestionIndex = 0;
let score = 0;
let randomizedQuestions = [];
let sessionToken = ""; // Stores our unique anti-repeat key

window.addEventListener('load', () => {
    if (typeof YTPlayables !== 'undefined') {
        YTPlayables.init().then((instance) => {
            ytPlayablesInstance = instance;
            ytPlayablesInstance.firstFrameReady();
            startQuiz();
        }).catch((err) => {
            console.error("YouTube SDK failed:", err);
            startQuiz(); 
        });
    } else {
        startQuiz(); 
    }
});

// Fetches a brand new anti-repeat key from the server
async function getSessionToken() {
    try {
        const response = await fetch('https://opentdb.com');
        const data = await response.json();
        if (data.response_code === 0) {
            sessionToken = data.token;
        }
    } catch (error) {
        console.error("Could not get session token:", error);
    }
}

async function fetchNewQuestions() {
    document.getElementById('question-text').innerText = "Downloading unique questions...";
    document.getElementById('options-box').innerHTML = "";
    
    // If we don't have an anti-repeat token yet, go get one first!
    if (!sessionToken) {
        await getSessionToken();
    }
    
    try {
        // Appends the token & a random timestamp cache-buster to completely eliminate identical results!
        const response = await fetch(`https://opentdb.com{sessionToken}&cb=${Date.now()}`);
        const data = await response.json();
        
        // If we ran out of unique questions, reset the token memory and try again
        if (data.response_code === 3 || data.response_code === 4) {
            await fetch(`https://opentdb.com{sessionToken}`);
            return fetchNewQuestions();
        }

        randomizedQuestions = data.results.map(item => {
            let answers = [...item.incorrect_answers];
            const correctIndex = Math.floor(Math.random() * (answers.length + 1));
            answers.splice(correctIndex, 0, item.correct_answer);
            
            return {
                q: decodeHTML(item.question),
                a: answers.map(ans => decodeHTML(ans)),
                correct: correctIndex
            };
        });

        showQuestion(currentQuestionIndex);

    } catch (error) {
        console.error("Error loading questions:", error);
        document.getElementById('question-text').innerText = "Failed to load questions. Click retry.";
        document.getElementById('options-box').innerHTML = `<button onclick="startQuiz()">Retry</button>`;
    }
}

function decodeHTML(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    fetchNewQuestions();
    
    if (ytPlayablesInstance) {
        ytPlayablesInstance.gameReady();
    }
}

function showQuestion(index) {
    const questionTextEl = document.getElementById('question-text');
    const optionsBoxEl = document.getElementById('options-box');
    const qNumberEl = document.getElementById('question-number');
    const scoreEl = document.getElementById('score-display');

    scoreEl.innerText = `Score: ${score}`;
    
    if (randomizedQuestions.length === 0) return;

    if (index >= randomizedQuestions.length) {
        questionTextEl.innerText = `Game Over! Final Score: ${score}/${randomizedQuestions.length}`;
        optionsBoxEl.innerHTML = `<button onclick="startQuiz()">Play Again with BRAND NEW Questions</button>`;
        qNumberEl.innerText = "Completed!";
        return;
    }

    qNumberEl.innerText = `Question: ${index + 1}/${randomizedQuestions.length}`;
    
    let current = randomizedQuestions[index];
    questionTextEl.innerText = current.q;
    
    let optionsHTML = "";
    current.a.forEach((option, i) => {
        optionsHTML += `<button onclick="checkAnswer(${index}, ${i})">${option}</button>`;
    });
    optionsBoxEl.innerHTML = optionsHTML;
}

function checkAnswer(qIndex, choiceIndex) {
    if (choiceIndex === randomizedQuestions[qIndex].correct) {
        score++;
        alert("Correct!");
    } else {
        alert(`Incorrect! The right answer was: ${randomizedQuestions[qIndex].a[randomizedQuestions[qIndex].correct]}`);
    }
    
    currentQuestionIndex++;
    showQuestion(currentQuestionIndex);
}
