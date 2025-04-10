// DOM Elements for Dashboard
const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");
const readingText = document.querySelector("#readingText");
const suggestTextBtn = document.querySelector("#suggestText");
const analysisFluency = document.querySelector("#analysisFluency");
const pronunciationErrors = document.querySelector("#pronunciationErrors");
const progressTrack = document.querySelector("#progressTrack");
const readingSpeed = document.querySelector("#readingSpeed");
const fluencyScore = document.querySelector("#fluencyScore");
const fluencyBar = document.querySelector("#fluencyBar");

// DOM Elements for AI Coach
const prompt = document.querySelector("#prompt");
const submitBtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imageBtn = document.querySelector("#image");
const imageInput = document.querySelector("#image input");

// DOM Elements for Training
const trainingView = document.getElementById("training-view");
const startCourseBtns = document.querySelectorAll(".start-course");
const trainingReadingContainer = document.getElementById("training-reading-container");
const trainingText = document.getElementById("trainingText");
const trainingBtn = document.getElementById("trainingBtn");
const trainingContent = document.getElementById("trainingContent");
const trainingVoice = document.getElementById("trainingVoice");
const trainingFluency = document.getElementById("trainingFluency");
const trainingPronunciationErrors = document.getElementById("trainingPronunciationErrors");
const trainingProgress = document.getElementById("trainingProgress");
const backToCourses = document.getElementById("backToCourses");

// DOM Elements for Statistics
const statsSummary = document.querySelector("#stats-summary");
const statsHistory = document.querySelector("#stats-history");
const statsTips = document.querySelector("#stats-tips");

// View Switching
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

navItems.forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");

        const viewId = item.getAttribute("data-view") + "-view";
        views.forEach(view => view.classList.remove("active"));
        document.getElementById(viewId).classList.add("active");

        if (viewId === "statistics-view") {
            displayStatistics();
        } else if (viewId === "training-view") {
            document.querySelector('.training-courses').style.display = "grid";
            trainingReadingContainer.style.display = "none";
        }
    });
});

// Speech Synthesis Setup
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
}

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US";

// Sample texts for suggestion
const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Reading is a window to the world of knowledge.",
    "Practice makes perfect in every skill you learn."
];

// Simulated Analysis
let startTime;
async function analyzeReading(recordedText, originalText) {
    const endTime = new Date();
    const timeDiff = (endTime - startTime) / 1000;
    const words = recordedText.split(" ").length;
    const wpm = Math.floor((words / timeDiff) * 60);

    return new Promise((resolve) => {
        setTimeout(() => {
            const fluency = Math.min(100, Math.floor(Math.random() * 120));
            const { errors, correctWords } = compareTexts(recordedText, originalText);
            resolve({
                fluencyScore: fluency,
                pronunciationErrors: errors,
                correctWords: correctWords,
                readingSpeed: wpm,
                progress: fluency > 70 ? "Good" : "Needs Practice",
                timestamp: new Date().toLocaleString()
            });
        }, 1000);
    });
}

function compareTexts(recorded, original) {
    const recordedWords = recorded.toLowerCase().split(" ");
    const originalWords = original.toLowerCase().split(" ");
    let errors = [];
    let correctWords = [];
    originalWords.forEach((word, index) => {
        if (recordedWords[index] !== word) {
            errors.push(`"${word}" mispronounced as "${recordedWords[index] || 'missing'}"`);
            correctWords.push(word);
        }
    });
    return {
        errors: errors.length > 0 ? errors : ["None"],
        correctWords: errors.length > 0 ? correctWords : []
    };
}

// Gemini API Configuration
const GEMINI_API_KEY = "AIzaSyDkeMWLHSWqJZGBwqHIMRK6w8kcmD38oyk";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    const text = aiChatBox.querySelector(".ai-chat-area");
    const messageContent = user.file.data
        ? [{ text: user.message }, { inline_data: user.file }]
        : [{ text: user.message }];

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: messageContent }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        text.innerHTML = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    } catch (error) {
        console.error("API Error:", error);
        text.innerHTML = "Sorry, I couldn’t process that. Try again!";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        user.file = {};
    }
}

function createChatBox(html, classes) {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handleChatResponse(userMessage) {
    user.message = userMessage;
    const html = `
        <img src="user.png" alt="User" id="userImage">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>`;
    prompt.value = "";
    const userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        const html = `
            <img src="1.png" alt="AI" id="aiImage">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="Loading" class="load">
            </div>`;
        const aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners for Dashboard
btn.addEventListener("click", () => {
    if (!readingText.value.trim()) {
        speak("Please enter some text to read first!");
        return;
    }
    startTime = new Date();
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
    content.textContent = "Recording...";
});

suggestTextBtn.addEventListener("click", () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    readingText.value = randomText;
    speak("Here's a suggested text for you to practice!");
});

// Event Listeners for Training
startCourseBtns.forEach(btn => {
    btn.addEventListener("click", function() {
        const practiceText = this.getAttribute("data-text");
        trainingText.value = practiceText;
        document.querySelector('.training-courses').style.display = "none";
        trainingReadingContainer.style.display = "block";
    });
});

backToCourses.addEventListener("click", () => {
    document.querySelector('.training-courses').style.display = "grid";
    trainingReadingContainer.style.display = "none";
});

trainingBtn.addEventListener("click", () => {
    if (!trainingText.value.trim()) {
        speak("Please select a training course first!");
        return;
    }
    startTime = new Date();
    recognition.start();
    trainingVoice.style.display = "block";
    trainingBtn.style.display = "none";
    trainingContent.textContent = "Recording...";
});

// Speech Recognition Handling
recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;

    if (trainingReadingContainer.style.display === "block") {
        trainingContent.textContent = transcript;
        trainingVoice.style.display = "none";
        trainingBtn.style.display = "flex";
        const analysis = await analyzeReading(transcript, trainingText.value);
        updateTrainingAnalysis(analysis);
        saveReadingSession(analysis);
        readingSpeed.textContent = `${analysis.readingSpeed} WPM`;
        fluencyScore.textContent = `${analysis.fluencyScore}%`;
        fluencyBar.style.width = `${analysis.fluencyScore}%`;
    } else {
        content.textContent = transcript;
        voice.style.display = "none";
        btn.style.display = "flex";
        const analysis = await analyzeReading(transcript, readingText.value);
        updateAnalysis(analysis);
        saveReadingSession(analysis);
        readingSpeed.textContent = `${analysis.readingSpeed} WPM`;
        fluencyScore.textContent = `${analysis.fluencyScore}%`;
        fluencyBar.style.width = `${analysis.fluencyScore}%`;
    }
};

recognition.onerror = () => {
    speak("Sorry, I couldn't understand. Please try again.");
    if (trainingReadingContainer.style.display === "block") {
        trainingVoice.style.display = "none";
        trainingBtn.style.display = "flex";
    } else {
        voice.style.display = "none";
        btn.style.display = "flex";
    }
};

// Event Listeners for AI Coach
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleChatResponse(prompt.value);
    }
});

submitBtn.addEventListener("click", () => {
    handleChatResponse(prompt.value);
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
    };
    reader.readAsDataURL(file);
});

imageBtn.addEventListener("click", () => {
    imageInput.click();
});

// Helper Functions
function updateAnalysis({ fluencyScore: fluency, pronunciationErrors: errors, correctWords, readingSpeed: wpm, progress }) {
    analysisFluency.textContent = `${fluency}%`;
    progressTrack.textContent = progress;
    readingSpeed.textContent = `${wpm} WPM`;
    fluencyScore.textContent = `${fluency}%`;
    fluencyBar.style.width = `${fluency}%`;

    if (errors[0] === "None") {
        pronunciationErrors.innerHTML = "None";
    } else {
        pronunciationErrors.innerHTML = "";
        errors.forEach((error, index) => {
            const errorItem = document.createElement("div");
            errorItem.classList.add("error-item");
            errorItem.innerHTML = `
                <span>${error}</span>
                <button class="speaker-btn" data-word="${correctWords[index]}"><i class="fas fa-volume-up"></i></button>
            `;
            pronunciationErrors.appendChild(errorItem);
        });

        document.querySelectorAll(".speaker-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const word = btn.getAttribute("data-word");
                speak(word);
            });
        });
    }
}

function updateTrainingAnalysis({ fluencyScore: fluency, pronunciationErrors: errors, correctWords, readingSpeed: wpm, progress }) {
    trainingFluency.textContent = `${fluency}%`;
    trainingProgress.textContent = progress;

    if (errors[0] === "None") {
        trainingPronunciationErrors.innerHTML = "None";
    } else {
        trainingPronunciationErrors.innerHTML = "";
        errors.forEach((error, index) => {
            const errorItem = document.createElement("div");
            errorItem.classList.add("error-item");
            errorItem.innerHTML = `
                <span>${error}</span>
                <button class="speaker-btn" data-word="${correctWords[index]}"><i class="fas fa-volume-up"></i></button>
            `;
            trainingPronunciationErrors.appendChild(errorItem);
        });

        document.querySelectorAll(".speaker-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const word = btn.getAttribute("data-word");
                speak(word);
            });
        });
    }
}

function resetAnalysis() {
    analysisFluency.textContent = "-";
    pronunciationErrors.innerHTML = "-";
    progressTrack.textContent = "-";
    readingSpeed.textContent = "0 WPM";
    fluencyScore.textContent = "0%";
    fluencyBar.style.width = "0%";
    trainingFluency.textContent = "-";
    trainingPronunciationErrors.innerHTML = "-";
    trainingProgress.textContent = "-";
}

function saveReadingSession(analysis) {
    let sessions = JSON.parse(localStorage.getItem("readingSessions")) || [];
    sessions.push(analysis);
    localStorage.setItem("readingSessions", JSON.stringify(sessions));
}

function displayStatistics() {
    const sessions = JSON.parse(localStorage.getItem("readingSessions")) || [];
    if (sessions.length === 0) {
        statsSummary.innerHTML = "<p>No reading sessions yet. Start practicing to see your progress!</p>";
        statsHistory.innerHTML = "";
        statsTips.innerHTML = "";
        return;
    }

    const avgWpm = Math.round(sessions.reduce((sum, s) => sum + s.readingSpeed, 0) / sessions.length);
    const avgFluency = Math.round(sessions.reduce((sum, s) => sum + s.fluencyScore, 0) / sessions.length);
    statsSummary.innerHTML = `
        <p>Average Reading Speed: <span>${avgWpm} WPM</span></p>
        <p>Average Fluency: <span>${avgFluency}%</span></p>
        <div class="progress-trend"><div class="progress-trend-bar" style="width: ${avgFluency}%"></div></div>
    `;

    let historyHtml = "<h4>Past Sessions</h4><table class='stats-table'><tr><th>Date</th><th>WPM</th><th>Fluency</th><th>Errors</th></tr>";
    sessions.forEach(session => {
        historyHtml += `
            <tr>
                <td>${session.timestamp}</td>
                <td>${session.readingSpeed} WPM</td>
                <td>${session.fluencyScore}%</td>
                <td>${session.pronunciationErrors.join(", ")}</td>
            </tr>
        `;
    });
    historyHtml += "</table>";
    statsHistory.innerHTML = historyHtml;

    let tips = "<h4>Improvement Tips</h4><ul>";
    if (avgWpm < 200) tips += "<li>Practice short, simple sentences to boost your speed.</li>";
    if (avgFluency < 70) tips += "<li>Focus on clear pronunciation—slow down and enunciate.</li>";
    if (sessions.some(s => s.pronunciationErrors[0] !== "None")) tips += "<li>Review common errors and practice those words.</li>";
    tips += "</ul>";
    statsTips.innerHTML = tips;
}

// Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleButton = document.getElementById('sidebarToggle');

    function toggleSidebar() {
        const scrollPosition = sidebar.scrollTop;
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        toggleButton.classList.toggle('collapsed');
        setTimeout(() => {
            sidebar.scrollTop = scrollPosition;
        }, 0);
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }

    toggleButton.addEventListener('click', toggleSidebar);

    const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (wasCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
        toggleButton.classList.add('collapsed');
    }

    function handleResize() {
        if (window.innerWidth <= 992) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
            toggleButton.classList.add('collapsed');
            localStorage.setItem('sidebarCollapsed', 'true');
        } else if (!wasCollapsed) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
            toggleButton.classList.remove('collapsed');
            localStorage.setItem('sidebarCollapsed', 'false');
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize();
});

// Initial Greeting
function wishMe() {
    const hours = new Date().getHours();
    let greeting = hours < 12 ? "Good Morning" : hours < 16 ? "Good Afternoon" : "Good Evening";
    speak(`${greeting}! I'm Shifra, your AI reading coach. Let's improve your skills or chat with me!`);
}

window.addEventListener("load", () => {
    wishMe();
    resetAnalysis();
});