// ==========================================
// GLOBAL STATE (MINNE)
// ==========================================
let globalTrophies = parseInt(localStorage.getItem("globalTrophies")) || 0;
let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || [];
let selectedLevelId = null;

// Spelvariabler för Kampanj
let campaignCurrentQuestion = 0;
let campaignCorrectAnswers = 0;
let currentCampaignAnswer = 0;

// Spelvariabler för Arenan (Boss)
let playerHP = 100;
let enemyHP = 120;
const maxEnemyHP = 120;
let currentBattleCorrectAnswer = 0;
let chosenWeapon = '';
let currentWeaponDamage = 0;

// Initiering vid start
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("global-trophy-count").innerText = globalTrophies;
    renderLevelGrid();
});

// ==========================================
// SKÄRMSYSTEM (NAVIGERING)
// ==========================================
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    
    // Rensa inputfält vid skärmbyte
    if(screenId === 'game-screen') document.getElementById("answer-input").value = "";
    if(screenId === 'battle-screen') document.getElementById("battle-answer-input").value = "";
}

// ==========================================
// NIVÅVALS-LOGIK
// ==========================================
function renderLevelGrid() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((btn, index) => {
        const lvlNum = index + 1;
        btn.classList.remove('selected', 'completed');
        
        if (completedLevels.includes(lvlNum)) {
            btn.classList.add('completed');
        }
        if (selectedLevelId === lvlNum) {
            btn.classList.add('selected');
        }
    });
}

function selectLevel(levelNum) {
    selectedLevelId = levelNum;
    renderLevelGrid();
    document.getElementById("start-campaign-btn").removeAttribute("disabled");
}

// ==========================================
// GENERERA MATTEMATIK (DYNAMISK)
// ==========================================
function generateMathQuestion(level) {
    let num1, num2, questionText, answer;
    
    switch(level) {
        case 1: // Enkel plus/minus
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            if(Math.random() > 0.5) {
                questionText = `${num1} + ${num2}`;
                answer = num1 + num2;
            } else {
                if(num1 < num2) { let t = num1; num1 = num2; num2 = t; } // Undvik minusresultat
                questionText = `${num1} - ${num2}`;
                answer = num1 - num2;
            }
            break;
        case 2: // Svårare plus/minus
            num1 = Math.floor(Math.random() * 30) + 10;
            num2 = Math.floor(Math.random() * 20) + 5;
            questionText = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case 3: // Gångertabeller (2, 3, 4, 5)
            num1 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
            num2 = Math.floor(Math.random() * 10) + 1;
            questionText = `${num1} x ${num2}`;
            answer = num1 * num2;
            break;
        case 4: // Gångertabeller (6, 7, 8, 9)
            num1 = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
            num2 = Math.floor(Math.random() * 10) + 1;
            questionText = `${num1} x ${num2}`;
            answer = num1 * num2;
            break;
        default: // Blandat svårt för nivå 5, 6 och Arenan
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            questionText = `${num1} x ${num2}`;
            answer = num1 * num2;
    }
    return { text: questionText, answer: answer };
}

// ==========================================
// KAMPANJLÄGET LOGIK
// ==========================================
function startCampaignGame() {
    campaignCurrentQuestion = 1;
    campaignCorrectAnswers = 0;
    goToScreen('game-screen');
    setupNextCampaignQuestion();
}

function setupNextCampaignQuestion() {
    document.getElementById("game-level-indicator").innerText = `Nivå ${selectedLevelId}`;
    document.getElementById("question-counter").innerText = `${campaignCurrentQuestion}/10`;
    document.getElementById("game-progress-bar").style.width = `${(campaignCurrentQuestion - 1) * 10}%`;
    document.getElementById("game-feedback").innerText = "";
    
    let qObj = generateMathQuestion(selectedLevelId);
    document.getElementById("game-question").innerText = qObj.text;
    currentCampaignAnswer = qObj.answer;
}

function submitCampaignAnswer() {
    const input = document.getElementById("answer-input");
    const userAns = parseInt(input.value);
    if(isNaN(userAns)) return;

    const feedback = document.getElementById("game-feedback");
    if(userAns === currentCampaignAnswer) {
        campaignCorrectAnswers++;
        feedback.className = "feedback correct";
        feedback.innerText = "Snyggt! Rätt svar.";
    } else {
        feedback.className = "feedback wrong";
        feedback.innerText = `Fel! Rätt svar var ${currentCampaignAnswer}`;
    }

    setTimeout(() => {
        if(campaignCurrentQuestion < 10) {
            campaignCurrentQuestion++;
            input.value = "";
            setupNextCampaignQuestion();
        } else {
            endCampaignGame();
        }
    }, 1200);
}

function endCampaignGame() {
    if(campaignCorrectAnswers >= 7) {
        if (!completedLevels.includes(selectedLevelId)) {
            completedLevels.push(selectedLevelId);
            localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
            globalTrophies += 1;
            localStorage.setItem("globalTrophies", globalTrophies);
            document.getElementById("global-trophy-count").innerText = globalTrophies;
        }
        document.getElementById("victory-icon").innerText = "🏆";
        document.getElementById("victory-title").innerText = "NIVÅ KLARAD!";
        document.getElementById("victory-text").innerText = `Bra jobbat! Du fick ${campaignCorrectAnswers} av 10 rätt och belönas med 1 pokal!`;
        goToScreen('victory-screen');
    } else {
        document.getElementById("fail-icon").innerText = "❌";
        document.getElementById("fail-title").innerText = "FÖRLUST!";
        document.getElementById("fail-text").innerText = `Du fick bara ${campaignCorrectAnswers} rätt. Du behöver minst 7 rätt för att klara nivån.`;
        goToScreen('game-over-screen');
    }
    renderLevelGrid();
}

// ==========================================
// BATTLE MODE (BOSSEN) LOGIK
// ==========================================
function startBattleArena() {
    playerHP = 100;
    enemyHP = maxEnemyHP;
    updateBattleHUD();
    
    document.getElementById("battle-feedback").innerText = "Välj ett vapen nedan för att ladda din attack!";
    document.getElementById("battle-quiz-container").classList.add("hidden");
    document.getElementById("inventory-section").classList.remove("hidden");
    
    goToScreen('battle-screen');
}

function selectWeapon(weaponType) {
    chosenWeapon = weaponType;
    
    if(weaponType === 'light') { currentWeaponDamage = 15; }
    else if(weaponType === 'medium') { currentWeaponDamage = 30; }
    else if(weaponType === 'heavy') { currentWeaponDamage = 55; }

    // Generera en slumpmässig svår fråga för bossen
    let qObj = generateMathQuestion(5); 
    currentBattleCorrectAnswer = qObj.answer;
    
    document.getElementById("battle-question").innerText = qObj.text;
    document.getElementById("battle-answer-input").value = "";
    
    // Göm vapen-grid, visa inmatningsfältet
    document.getElementById("inventory-section").classList.add("hidden");
    document.getElementById("battle-quiz-container").classList.remove("hidden");
    document.getElementById("battle-feedback").innerText = `Laddar vapen... Svara för att skjuta!`;
}

function submitBattleAnswer() {
    const input = document.getElementById("battle-answer-input");
    const userAns = parseInt(input.value);
    if(isNaN(userAns)) return;

    if(userAns === currentBattleCorrectAnswer) {
        // SPELAREN TRÄFFAR BOSSEN
        enemyHP -= currentWeaponDamage;
        if(enemyHP < 0) enemyHP = 0;
        updateBattleHUD();
        document.getElementById("battle-feedback").innerText = `💥 BOM! Du träffar bossen och gör ${currentWeaponDamage} skada!`;
        
        if(enemyHP <= 0) {
            setTimeout(() => { triggerBattleVictory(); }, 1200);
            return;
        }
    } else {
        // BOSSEN SLÅR TILLBAKA (REKYLSKADA)
        let recoilDamage = 15;
        if(chosenWeapon === 'medium') recoilDamage = 25;
        if(chosenWeapon === 'heavy') recoilDamage = 40;

        playerHP -= recoilDamage;
        if(playerHP < 0) playerHP = 0;
        updateBattleHUD();
        document.getElementById("battle-feedback").innerText = `❌ REKYLEXPLOSION! Du missade och bossen straffar dig med ${recoilDamage} skada!`;
        
        if(playerHP <= 0) {
            setTimeout(() => { triggerBattleGameOver(); }, 1200);
            return;
        }
    }

    // Återställ runda efter skada har delats ut
    setTimeout(() => {
        document.getElementById("battle-quiz-container").classList.add("hidden");
        document.getElementById("inventory-section").classList.remove("hidden");
        document.getElementById("battle-feedback").innerText = "Välj nästa vapen för att anfalla igen!";
    }, 1500);
}

function updateBattleHUD() {
    // Uppdatera Boss bar
    let enemyPct = (enemyHP / maxEnemyHP) * 100;
    document.getElementById("enemy-hp-bar").style.width = `${enemyPct}%`;
    document.getElementById("enemy-hp-text").innerText = `${enemyHP} / ${maxEnemyHP} HP`;

    // Uppdatera Spelarens bar
    document.getElementById("player-hp-bar").style.width = `${playerHP}%`;
    document.getElementById("player-hp-text").innerText = `${playerHP} / 100 HP`;
}

// BESIGER BOSSEN EVENT
function triggerBattleVictory() {
    globalTrophies += 5; // Stor belöning!
    localStorage.setItem("globalTrophies", globalTrophies);
    document.getElementById("global-trophy-count").innerText = globalTrophies;

    document.getElementById("victory-icon").innerText = "👑";
    document.getElementById("victory-title").innerText = "BOSSEN ÄR KROSSAD!";
    document.getElementById("victory-text").innerText = "Legendariskt! Du har rensat Arenan och stängt ner systemets virus. Du belönas med +5 Pokaler!";
    goToScreen('victory-screen');
}

// SPELAREN DÖR EVENT
function triggerBattleGameOver() {
    document.getElementById("fail-icon").innerText = "💀";
    document.getElementById("fail-title").innerText = "ARENA TERMINATED";
    document.getElementById("fail-text").innerText = "Ditt liv nådde 0. Bossen krossade ditt försvar den här gången!";
    
    // Rikta om "Försök igen"-knappen till att köra igång arenan igen istället för kampanjen
    const retryBtn = document.querySelector(".retry-btn");
    retryBtn.setAttribute("onclick", "startBattleArena()");
    
    goToScreen('game-over-screen');
}

// Try again knapp för vanliga kampanjläget
function retryCurrentGame() {
    // Återställ klickfunktionen till standard och kör kampanj
    const retryBtn = document.querySelector(".retry-btn");
    retryBtn.setAttribute("onclick", "retryCurrentGame()");
    startCampaignGame();
}

// Nollställ allt
function resetAllProgress() {
    if(confirm("Är du säker på att du vill radera alla pokaler och klarade nivåer?")) {
        localStorage.clear();
        globalTrophies = 0;
        completedLevels = [];
        selectedLevelId = null;
        document.getElementById("global-trophy-count").innerText = 0;
        document.getElementById("start-campaign-btn").setAttribute("disabled", "true");
        renderLevelGrid();
    }
}
