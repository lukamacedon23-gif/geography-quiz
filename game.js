// Global State Variables
let ytPlayablesInstance = null;
let currentQuestionIndex = 0;
let score = 0;
let randomizedQuestions = []; // This will now hold fresh questions downloaded from the internet

// Initialize the YouTube Playable Framework
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

// 1. Fetch 10 completely random Geography questions from the live internet database
async function fetchNewQuestions() {
    document.getElementById('question-text').innerText = "Downloading fresh questions...";
    document.getElementById('options-box').innerHTML = "";
    
    try {
        // Calls the Open Trivia Database specifically for Geography (Category 22)
        const response = await fetch('https://opentdb.com');
        const data = await response.json();
        
        // Convert the internet database format into our game layout format
        randomizedQuestions = data.results.map(item => {
            // Combine correct and incorrect answers into one list
            let answers = [...item.incorrect_answers];
            // Insert the correct answer at a random spot so it isn't always the first choice
            const correctIndex = Math.floor(Math.random() * (answers.length + 1));
            answers.splice(correctIndex, 0, item.correct_answer);
            
            return {
                q: decodeHTML(item.question),
                a: answers.map(ans => decodeHTML(ans)),
                correct: correctIndex
            };
        });

        // Start showing the downloaded questions
        showQuestion(currentQuestionIndex);

    } catch (error) {
        console.error("Error loading questions:", error);
        document.getElementById('question-text').innerText = "Failed to load online questions. Try replaying.";
        document.getElementById('options-box').innerHTML = `<button onclick="startQuiz()">Retry Link</button>`;
    }
}

// Helper tool to fix weird internet text symbols (like turning &quot; into ")
function decodeHTML(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    
    // 2. Instead of reading a static list, go pull brand new ones from the web!
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
    
    if (randomizedQuestions.length === 0) return; // Wait for download to finish

    if (index >= randomizedQuestions.length) {
        questionTextEl.innerText = `Game Over! Final Score: ${score}/${randomizedQuestions.length}`;
        optionsBoxEl.innerHTML = `<button onclick="startQuiz()">Play Again with NEW Questions</button>`;
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
