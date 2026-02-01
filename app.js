// Initialize Phonemizer & Assembler
const phonemizer = new KoreanPhonemizer();
const assembler = new HangulAssembler();

// DOM Elements
const inputInfo = document.getElementById('koreanInput');
const speakBtn = document.getElementById('speakBtn');
const keyboardToggle = document.getElementById('keyboardToggle');
const virtualKeyBoard = document.getElementById('virtualKeyboard');
const outputDisplay = document.getElementById('pronunciationOutput');
const rulesList = document.getElementById('rulesList');
const chips = document.querySelectorAll('.chip');

// Keyboard State
let isShift = false;
const shiftMap = {
    'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ',
    'ㅔ': 'ㅖ', 'ㅐ': 'ㅒ'
};

// Speech Synthesis Setup
let synth = window.speechSynthesis;
let voices = [];

function loadVoices() {
    voices = synth.getVoices();
}

if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}
loadVoices(); // Try immediately too

// Event Listeners
inputInfo.addEventListener('input', (e) => {
    // Sync buffer if user types directly (or pastes)
    // Note: This is complex because we can't easily decompose existing text into jamos for the buffer.
    // For simplicity, if user types normally, we clear the assembler buffer to avoid conflicts.
    assembler.clear();
    handleInput();
});

speakBtn.addEventListener('click', speakCurrent);

keyboardToggle.addEventListener('click', () => {
    virtualKeyBoard.classList.toggle('hidden');
});

// Virtual Keyboard Events
virtualKeyBoard.addEventListener('click', (e) => {
    if (e.target.classList.contains('key')) {
        const key = e.target;
        const char = key.innerText;

        if (key.id === 'keyBackspace') {
            const newVal = assembler.backspace();
            updateFromKeyboard(newVal);
        } else if (key.id === 'keyShift') {
            toggleShift();
        } else {
            // Normal Key
            const newVal = assembler.add(char);
            updateFromKeyboard(newVal);

            // Auto unshift if used? Standard behavior varies. Let's keep it until toggle off for now? 
            // Usually shift is one-shot for mobile, toggle for caps lock.
            // Let's make it one-shot for convenience.
            if (isShift) toggleShift();
        }
    }
});

function toggleShift() {
    isShift = !isShift;
    const keys = document.querySelectorAll('.key');
    const keyShift = document.getElementById('keyShift');

    keyShift.style.background = isShift ? 'var(--accent)' : '';
    keyShift.style.color = isShift ? 'white' : '';

    keys.forEach(k => {
        const base = k.innerText;
        // Check if this key has a shift alternate
        // This is tricky because we replaced the text. We need original mapping.
        // Simple way: Hardcode the row updates.
        // Actually, let's just reverse map or use data attributes.
        // Quick hack: Just re-render keys or map text if in map.

        Object.entries(shiftMap).forEach(([normal, shifted]) => {
            if (isShift) {
                if (k.innerText === normal) k.innerText = shifted;
            } else {
                if (k.innerText === shifted) k.innerText = normal;
            }
        });
    });
}

function updateFromKeyboard(text) {
    // We strictly append the assembled text?
    // The assembler maintains the WHOLE string buffer?
    // Yes, assembler.add() returns result of ALL buffer.
    // But we might have mixed content if user typed elsewhere.
    // SIMPLIFICATION: The virtual keyboard owns the input when used.
    // Whatever is in assembler IS the input.
    inputInfo.value = text;
    handleInput();
}

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        inputInfo.value = chip.dataset.example;
        // Clear assembler since we loaded external text
        assembler.clear();
        // But we probably want to populate assembler with decomposed version of this text 
        // if user wants to edit it?
        // Decomposing full sentence to Jamos is doable but extra work.
        // For now: Clicking chip resets "Typing Mode" to "Edit Mode". 
        // Virtual keyboard will start fresh or need clear.
        handleInput();
        speakCurrent();
    });
});

function handleInput() {
    const text = inputInfo.value;

    // Clear if empty
    if (!text.trim()) {
        outputDisplay.textContent = '...';
        rulesList.innerHTML = '<li class="empty-state">Start typing to see sound changes...</li>';
        return;
    }

    // Run Logic
    const result = phonemizer.phonemize(text);

    // Update Display
    outputDisplay.textContent = result.pronounced || text;

    // Render Rules
    renderRules(result.explanations);
}

function renderRules(logs) {
    rulesList.innerHTML = '';

    if (logs.length === 0) {
        rulesList.innerHTML = '<li class="empty-state">No special sound rules applied.</li>';
        return;
    }

    logs.forEach(log => {
        const li = document.createElement('li');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'rule-name';
        nameSpan.textContent = log.rule;

        const descSpan = document.createElement('span');
        descSpan.className = 'rule-desc';
        descSpan.textContent = log.description; // + ` (at pos ${log.index})`;

        li.appendChild(nameSpan);
        li.appendChild(descSpan);
        rulesList.appendChild(li);
    });
}

function speakCurrent() {
    const text = inputInfo.value;
    if (!text) return;

    if (synth.speaking) {
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Select Korean Voice
    const korVoice = voices.find(v => v.lang.includes('ko'));
    if (korVoice) {
        utterance.voice = korVoice;
        utterance.lang = 'ko-KR';
    } else {
        // Fallback: try to just set lang and hope browser downloads it or uses remote
        utterance.lang = 'ko-KR';
    }

    utterance.rate = 0.8; // Slightly slower for learning
    synth.speak(utterance);
}

// ============================================
// Rules Glossary Data & Logic
// ============================================

const rulesData = [
    {
        id: 'resyllabification',
        name: 'Resyllabification (Liaison)',
        koreanName: '연음 법칙',
        description: 'When a syllable ends in a consonant and the next starts with a vowel (ㅇ), the consonant moves over to become the initial sound of the next syllable.',
        examples: [
            { word: '옷이', sound: '오시', translation: 'Clothes (subject)' },
            { word: '밥을', sound: '바블', translation: 'Rice/Meal (object)' }
        ]
    },
    {
        id: 'nasalization',
        name: 'Nasalization',
        koreanName: '비음화',
        description: 'Stop sounds (ㄱ, ㄷ, ㅂ) become nasal sounds (ㅇ, ㄴ, ㅁ) when followed by a nasal consonant (ㄴ, ㅁ). This makes the flow smoother.',
        examples: [
            { word: '국물', sound: '궁물', translation: 'Broth/Soup' },
            { word: '입니다', sound: '임니다', translation: 'To be (polite)' },
            { word: '닫는다', sound: '단는다', translation: 'Closing' }
        ]
    },
    {
        id: 'palatalization',
        name: 'Palatalization',
        koreanName: '구개음화',
        description: 'When ㄷ or ㅌ meets the vowel 이 (i), they change into their "soft" versions ㅈ and ㅊ respectively.',
        examples: [
            { word: '같이', sound: '가치', translation: 'Together' },
            { word: '굳이', sound: '구지', translation: 'Obstinately/Dare to' }
        ]
    },
    {
        id: 'aspiration',
        name: 'Aspiration (H-Merger)',
        koreanName: '격음화',
        description: 'When ㅎ (h) meets a plain stop (ㄱ, ㄷ, ㅂ, ㅈ), they merge to form the aspirated strong version (ㅋ, ㅌ, ㅍ, ㅊ).',
        examples: [
            { word: '좋다', sound: '조타', translation: 'Good' },
            { word: '입학', sound: '이팍', translation: 'Admission (school)' }
        ]
    },
    {
        id: 'tensification',
        name: 'Tensification',
        koreanName: '경음화',
        description: 'After a stop sound (ㄱ, ㄷ, ㅂ), a following plain consonant (ㄱ, ㄷ, ㅂ, ㅅ, ㅈ) hardens into a dense double consonant.',
        examples: [
            { word: '학교', sound: '학꾜', translation: 'School' },
            { word: '식당', sound: '식땅', translation: 'Restaurant' }
        ]
    },
    {
        id: 'liquidization',
        name: 'Liquidization',
        koreanName: '유음화',
        description: 'When ㄴ and ㄹ meet, the ㄴ usually turns into ㄹ, making both sounds flow as a liquid L/R sound.',
        examples: [
            { word: '신라', sound: '실라', translation: 'Silla (Dynasty)' },
            { word: '관리', sound: '괄리', translation: 'Management' }
        ]
    }
];

function renderGlossary() {
    const section = document.querySelector('.reference-section');
    if (!section) return;

    const container = document.createElement('div');
    container.className = 'glossary-container';

    const header = document.createElement('h3');
    header.textContent = 'Phonological Rules Guide';
    header.className = 'glossary-header';
    container.appendChild(header);

    rulesData.forEach(rule => {
        const card = document.createElement('div');
        card.className = 'rule-card';

        const titleRow = document.createElement('div');
        titleRow.className = 'rule-title-row';
        titleRow.innerHTML = `<strong>${rule.name}</strong> <span class="korean-term">${rule.koreanName}</span>`;

        const desc = document.createElement('p');
        desc.className = 'rule-description';
        desc.textContent = rule.description;

        const examplesBox = document.createElement('div');
        examplesBox.className = 'rule-examples';

        rule.examples.forEach(ex => {
            const exItem = document.createElement('div');
            exItem.className = 'example-item';
            exItem.innerHTML = `
                <span class="ex-word">${ex.word}</span> 
                <span class="arrow">→</span> 
                <span class="ex-sound">[${ex.sound}]</span>
                <span class="ex-trans">${ex.translation}</span>
            `;
            // Make example clickable to try
            exItem.addEventListener('click', () => {
                inputInfo.value = ex.word;
                handleInput();
                speakCurrent();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            examplesBox.appendChild(exItem);
        });

        card.appendChild(titleRow);
        card.appendChild(desc);
        card.appendChild(examplesBox);
        container.appendChild(card);
    });

    section.appendChild(container);
}

// ============================================
// Batchim Representative Sounds Data
// ============================================
const batchimGuideData = [
    {
        sound: 'ㄱ (k)',
        items: ['ㄱ', 'ㄲ', 'ㅋ', 'ㄳ', 'ㄺ'],
        note: 'All these sound like "k" (stopped) at the end.'
    },
    {
        sound: 'ㄴ (n)',
        items: ['ㄴ', 'ㄵ', 'ㄶ'],
        note: 'Sounds like "n".'
    },
    {
        sound: 'ㄷ (t)',
        items: ['ㄷ', 'ㅌ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅎ'],
        note: 'All these sound like "t" (stopped) at the end.'
    },
    {
        sound: 'ㄹ (l)',
        items: ['ㄹ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㅀ'],
        note: 'Sounds like "l".'
    },
    {
        sound: 'ㅁ (m)',
        items: ['ㅁ', 'ㄻ'],
        note: 'Sounds like "m".'
    },
    {
        sound: 'ㅂ (p)',
        items: ['ㅂ', 'ㅍ', 'ㅄ', 'ㄿ'],
        note: 'Sounds like "p" (stopped) at the end.'
    },
    {
        sound: 'ㅇ (ng)',
        items: ['ㅇ'],
        note: 'Sounds like "ng" (like in "sing").'
    }
];

function renderBatchimTable() {
    const section = document.querySelector('.reference-section');
    if (!section) return;

    const container = document.createElement('div');
    container.className = 'glossary-container';
    container.style.marginTop = '2rem';

    // Create a card wrapper for the table section
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('h3');
    header.textContent = 'Batchim Pronunciation Table';
    header.className = 'glossary-header';
    header.style.borderBottom = 'none'; // Remove underline inside card if preferred, or keep
    card.appendChild(header);

    const desc = document.createElement('p');
    desc.className = 'rule-description';
    desc.textContent = 'In Korean, many consonants change their sound when they appear at the end of a syllable (Batchim). They simplify into one of these 7 representative sounds.';
    card.appendChild(desc);

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'batchim-table-container';

    const table = document.createElement('table');
    table.className = 'batchim-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th style="width: 20%">Sound</th>
                <th style="width: 40%">Written as</th>
                <th style="width: 40%">Note</th>
            </tr>
        </thead>
        <tbody>
            ${batchimGuideData.map(row => `
                <tr>
                    <td><span class="rep-sound">[${row.sound}]</span></td>
                    <td><div class="batchim-group">${row.items.join(', ')}</div></td>
                    <td><div class="sub-note">${row.note}</div></td>
                </tr>
            `).join('')}
        </tbody>
    `;

    tableWrapper.appendChild(table);
    card.appendChild(tableWrapper);
    container.appendChild(card);
    section.appendChild(container);
}

// Initial Render
renderGlossary();
renderBatchimTable();

// ============================================
// Game Mode Logic
// ============================================

// Game State
let currentGameWord = null;

// DOM Elements for Game
const tabAnalyzer = document.getElementById('tabAnalyzer');
const tabGame = document.getElementById('tabGame');
const viewAnalyzer = document.getElementById('viewAnalyzer');
const viewGame = document.getElementById('viewGame');

const gameCategory = document.getElementById('gameCategory');
const gameWord = document.getElementById('gameWord');
const gameTranslation = document.getElementById('gameTranslation');
const gameAnswerArea = document.getElementById('gameAnswerArea');
const gamePronunciation = document.getElementById('gamePronunciation');
const gameSpeakBtn = document.getElementById('gameSpeakBtn');
const gameRules = document.getElementById('gameRules');

const btnReveal = document.getElementById('btnReveal');
const btnNext = document.getElementById('btnNext');

// Tab Switching
tabAnalyzer.addEventListener('click', () => switchTab('analyzer'));
tabGame.addEventListener('click', () => switchTab('game'));

function switchTab(tab) {
    const mainTitle = document.querySelector('header h1');
    const subtitle = document.querySelector('header .subtitle');

    if (tab === 'analyzer') {
        tabAnalyzer.classList.add('active');
        tabGame.classList.remove('active');
        viewAnalyzer.classList.remove('hidden');
        viewGame.classList.add('hidden');

        // Update Header for Analyzer
        mainTitle.textContent = 'Korean Batchim Explorer 🇰🇷';
        subtitle.textContent = 'Type Hangul to see and hear sound changes';
    } else {
        tabGame.classList.add('active');
        tabAnalyzer.classList.remove('active');
        viewGame.classList.remove('hidden');
        viewAnalyzer.classList.add('hidden');

        // Update Header for Game
        mainTitle.textContent = 'Pronunciation Flashcards 🐯';
        subtitle.textContent = 'Guess the sound, learn the rule!';

        if (!currentGameWord) {
            loadRandomWord();
        }
    }
}

// Game Actions
btnReveal.addEventListener('click', revealAnswer);
btnNext.addEventListener('click', loadRandomWord);
gameSpeakBtn.addEventListener('click', () => speakText(currentGameWord.word));

function loadRandomWord() {
    // Reset UI
    gameAnswerArea.classList.add('hidden');
    btnReveal.classList.remove('hidden');
    btnNext.classList.add('hidden');

    // Pick random word
    // Ensure dictionary is loaded, fallback if not
    const data = (typeof dictionary !== 'undefined') ? dictionary : [
        { word: '오류', trans: 'Error: Dictionary not loaded', cat: 'Error' }
    ];

    const randomIdx = Math.floor(Math.random() * data.length);
    currentGameWord = data[randomIdx];

    // Render
    gameCategory.textContent = currentGameWord.cat;
    gameCategory.classList.add('hidden'); // Hide hint by default
    gameWord.textContent = currentGameWord.word;
    gameTranslation.textContent = currentGameWord.trans;
    gameTranslation.classList.add('hidden'); // Hide translation by default
}

function revealAnswer() {
    if (!currentGameWord) return;

    // Show Category Hint
    gameCategory.classList.remove('hidden');
    gameTranslation.classList.remove('hidden');

    // Calculate Pronunciation
    const result = phonemizer.phonemize(currentGameWord.word, { isVerb: currentGameWord.isVerb });

    // Render Answer
    gamePronunciation.textContent = result.pronounced;

    // Render Rules (Re-using render logic but for game list)
    gameRules.innerHTML = '';
    if (result.explanations.length === 0) {
        gameRules.innerHTML = '<li class="empty-state">No special rules.</li>';
    } else {
        result.explanations.forEach(log => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="rule-name">${log.rule}</span> <span class="rule-desc">${log.description}</span>`;
            gameRules.appendChild(li);
        });
    }

    // Update UI State
    gameAnswerArea.classList.remove('hidden');
    btnReveal.classList.add('hidden');
    btnNext.classList.remove('hidden');

    // Auto-play audio
    speakText(currentGameWord.word);
}

function speakText(text) {
    if (!text) return;
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const korVoice = voices.find(v => v.lang.includes('ko'));
    if (korVoice) utterance.voice = korVoice;
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    synth.speak(utterance);
}
