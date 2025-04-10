// DOM Elements
const testApiBtn = document.querySelector("#testApi");
const apiInput = document.querySelector("#apiInput");
const apiResponse = document.querySelector("#apiResponse");

// DeepSeek R1 API Configuration
const DEEPSEEK_API_KEY = "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";
const DEEPSEEK_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Speech Synthesis Setup
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
}

// API Call Function
async function callDeepSeekAPI(prompt) {
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                "HTTP-Referer": "http://localhost",
                "X-Title": "Shifra AI Coach"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("API Error:", error);
        return "Sorry, there was an error connecting to the DeepSeek R1 API.";
    }
}

// Event Listener for API Test
testApiBtn.addEventListener("click", async () => {
    const prompt = apiInput.value.trim();
    if (!prompt) {
        speak("Please enter a prompt to test the API!");
        apiResponse.textContent = "Please enter a prompt to test the API!";
        return;
    }

    apiResponse.textContent = "Fetching response from DeepSeek R1...";
    speak("Fetching response from DeepSeek R1...");

    const result = await callDeepSeekAPI(prompt);
    apiResponse.textContent = result;
    speak(result);
});

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
    speak(`${greeting}! Welcome to the DeepSeek R1 API page. Enter a prompt and click Test API to see me in action!`);
}

window.addEventListener("load", wishMe);