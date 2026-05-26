let selectedLevel = null;
let currentLevel = 1;
let score = 0;
let lives = 3;
const targetScore = 5; 
let currentAnswer = 0;

// Sparar avklarade nivåer i en lista
let completedLevels = [];

const answerInput = document.getElementById('answer-input');
const questionElement = document.getElementById('question');
const feedbackElement = document.getElementById('feedback');
const levelIndicator = document.getElementById('level-indicator');
const livesIndicator = document.getElementById('lives-indicator');
const startGameBtn = document.getElementById('start-game-btn');
const progressBar = document.getElementById('progress-bar');
const gameCard = document.getElementById('game-card');

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function selectLevel(levelNumber) {
    selectedLevel = levelNumber;
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`lvl-btn-${levelNumber}`).classList.add('selected');
    
    // Om nivån redan är avklarad, ändra knapptexten till "Gör om"
    if (completedLevels.includes(levelNumber)) {
        startGameBtn.textContent = "Gör om utmaningen";
    } else {
        startGameBtn.textContent = "Börja Utmaningen";
    }
    
    startGameBtn.disabled = false;
}

function startGame() {
    if (selectedLevel === null) return;
    currentLevel = selectedLevel;
    score = 0;
    lives = 3; // Ge 3 liv vid start
    updateProgressBar();
    updateLivesUI();
    levelIndicator.textContent = `Nivå ${currentLevel}`;
    goToScreen('game-screen');
    generateQuestion();
}

function retryCurrentLevel() {
    score = 0;
    lives = 3;
    updateProgressBar();
    updateLivesUI();
    goToScreen('game-screen');
    generateQuestion();
}

function updateLivesUI() {
    // Genererar hjärtan baserat på antal liv kvar
    livesIndicator.textContent = "❤️".repeat(lives);
}

function updateProgressBar() {
    const percentage = (score / targetScore) * 100;
    progressBar.style.width = `${percentage}%`;
}

// PROGRESSIV SVÅRIGHETSGRAD: Använder 'score' för att göra talen större
function generateQuestion() {
    let num1, num2;
    feedbackElement.textContent = "";
    answerInput.value = "";
    answerInput.focus();

    switch(currentLevel) {
        case 1: // Addition (Blir svårare för varje poäng)
            num1 = Math.floor(Math.random() * (10 + score * 5)) + 2; 
            num2 = Math.floor(Math.random() * (10 + score * 5)) + 2;
            currentAnswer = num1 + num2;
            questionElement.textContent = `${num1} + ${num2}`;
            break;
            
        case 2: // Subtraktion
            num1 = Math.floor(Math.random() * (20 + score * 8)) + 15;
            num2 = Math.floor(Math.random() * (10 + score * 3)) + 2;
            currentAnswer = num1 - num2;
            questionElement.textContent = `${num1} - ${num2}`;
            break;
            
        case 3: // Multiplikation
            // Börjar med tabell 2-5, ökar upp till tabell 2-12 i slutet av nivån
            const maxTable = 5 + score; 
            num1 = Math.floor(Math.random() * (maxTable - 2 + 1)) + 2;
            num2 = Math.floor(Math.random() * 8) + 2;
            currentAnswer = num1 * num2;
            questionElement.textContent = `${num1} × ${num2}`;
            break;
            
        case 4: // Division
            num2 = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2); 
            currentAnswer = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2);
            num1 = num2 * currentAnswer; 
            questionElement.textContent = `${num1} ÷ ${num2}`;
            break;
            
        case 5: // Potenser
            num1 = Math.floor(Math.random() * 6) + 2 + score; // Basen ökar för varje poäng
            currentAnswer = num1 * num1;
            questionElement.textContent = `${num1}²`;
            break;
            
        case 6: // Kaosläge
            const modes = ['+', '-', '×'];
            const randomMode = modes[Math.floor(Math.random() * modes.length)];
            num1 = Math.floor(Math.random() * (30 + score * 10)) + 5;
            num2 = Math.floor(Math.random() * (15 + score * 5)) + 2;
            if (randomMode === '+') currentAnswer = num1 + num2;
            if (randomMode === '-') currentAnswer = num1 - num2;
            if (randomMode === '×') { num1 = Math.floor(num1/3) + 2; num2 = Math.floor(num2/2) + 2; currentAnswer = num1 * num2; }
            questionElement.textContent = `${num1} ${randomMode} ${num2}`;
            break;
    }
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) return;

    if (userAnswer === currentAnswer) {
        score++;
        updateProgressBar();
        feedbackElement.textContent = "Helt rätt! ⚡";
        feedbackElement.className = "feedback correct";
        
        if (score >= targetScore) {
            // Spara nivån som klarad om den inte redan finns i listan
            if (!completedLevels.includes(currentLevel)) {
                completedLevels.push(currentLevel);
            }
            updateMenuButtons(); // Uppdatera utseendet i menyn direkt
            
            setTimeout(() => {
                document.getElementById('victory-text').textContent = `Du krossade utmaningen på Nivå ${currentLevel}!`;
                goToScreen('victory-screen');
            }, 400);
        } else {
            setTimeout(generateQuestion, 600);
        }
    } else {
        // FEL SVAR: Dra av ett liv!
        lives--;
        updateLivesUI();
        
        gameCard.classList.add('shake');
        setTimeout(() => gameCard.classList.remove('shake'), 400);

        if (lives <= 0) {
            // SLUT PÅ LIV: Visa Game Over-skärmen
            setTimeout(() => {
                goToScreen('game-over-screen');
            }, 400);
        } else {
            feedbackElement.textContent = `Fel svar! Du förlorade ett liv.`;
            feedbackElement.className = "feedback wrong";
            answerInput.value = "";
            answerInput.focus();
        }
    }
}

// Lägger till klassen .completed på avklarade nivåknappar i menyn
function updateMenuButtons() {
    completedLevels.forEach(levelNum => {
        const btn = document.getElementById(`lvl-btn-${levelNum}`);
        if (btn) btn.classList.add('completed');
    });
}

function resetAndGoBack() {
    selectedLevel = null;
    startGameBtn.disabled = true;
    startGameBtn.textContent = "Börja Utmaningen";
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
    updateMenuButtons(); // Säkerställ att de avklarade fortfarande är mörka
    goToScreen('level-screen');
}

document.getElementById('submit-btn').addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});
