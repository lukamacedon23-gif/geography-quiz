// Global State Variables
let ytPlayablesInstance = null;
let currentQuestionIndex = 0;
let score = 0;

// Quiz Database matching your random request layout (Capitals, T/F, Find Mistake)
const quizData = [
    { q: "What is the capital of Canada?", a: ["Ottawa", "Toronto", "Vancouver"], correct: 0 },
    { q: "True or False: The Nile is the longest river in the world.", a: ["True", "False"], correct: 0 },
    { q: "Find the mistake: Paris is the capital city of Italy.", a: ["Paris", "capital city", "Italy"], correct: 2 },
    { q: "What is the capital of Japan?", a: ["Kyoto", "Tokyo", "Osaka"], correct: 1 },
    { q: "True or False: Australia is both a country and a continent.", a: ["True", "False"], correct: 0 },
    { q: "Find the mistake: The Amazon rainforest is located primarily in Africa.", a: ["Amazon", "primarily", "Africa"], correct: 2 }
];

// Initialize the YouTube Playable Framework Environment
window.addEventListener('load', () => {
    if (typeof YTPlayables !== 'undefined') {
        YTPlayables.init().then((instance) => {
            ytPlayablesInstance = instance;
            
            // Notify YouTube core infrastructure the first layout frame is drawn
            ytPlayablesInstance.firstFrameReady();
            
            startQuiz();
        }).catch((err) => {
            console.error("YouTube SDK initialization failed:", err);
            startQuiz(); // Fallback to local offline play execution
        });
    } else {
        startQuiz(); // Fallback for native computer browser execution
    }
});

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showQuestion(currentQuestionIndex);
    
    // Inform YouTube structural back-end the game interface loop is active
    if (ytPlayablesInstance) {
        ytPlayablesInstance.gameReady();
    }
}

function showQuestion(index) {
    const questionTextEl = document.getElementById('question-text');
    const optionsBoxEl = document.getElementById('options-box');
    const qNumberEl = document.getElementById('question-number');
    const scoreEl = document.getElementById('score-display');

    // Update ongoing dashboard stats
    scoreEl.innerText = `Score: ${score}`;
    
    if (index >= quizData.length) {
        questionTextEl.innerText = `Game Over! Final Score: ${score}/${quizData.length}`;
        optionsBoxEl.innerHTML = `<button onclick="startQuiz()">Play Again</button>`;
        qNumberEl.innerText = "Completed!";
        return;
    }

    qNumberEl.innerText = `Question: ${index + 1}/${quizData.length}`;
    let current = quizData[index];
    questionTextEl.innerText = current.q;
    
    let optionsHTML = "";
    current.a.forEach((option, i) => {
        optionsHTML += `<button onclick="checkAnswer(${index}, ${i})">${option}</button>`;
    });
    optionsBoxEl.innerHTML = optionsHTML;
}

function checkAnswer(qIndex, choiceIndex) {
    if (choiceIndex === quizData[qIndex].correct) {
        score++;
        alert("Correct!");
    } else {
        alert("Incorrect selection!");
    }
    
    currentQuestionIndex++;
    showQuestion(currentQuestionIndex);
}
