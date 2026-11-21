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
inputInfo.addEventListener('input', () => {
    // Keep the on-screen keyboard in sync with text typed or pasted directly
    assembler.setText(inputInfo.value);
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

        if (key.id === 'keySpace') {
            updateFromKeyboard(assembler.add(' '));
        } else if (key.id === 'keyBackspace') {
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
    // The assembler holds the whole input as keystrokes, so its output is the full text
    inputInfo.value = text;
    handleInput();
}

function loadExample(word) {
    inputInfo.value = word;
    assembler.setText(word);
    handleInput();
    speakCurrent();
}

chips.forEach(chip => {
    chip.addEventListener('click', () => loadExample(chip.dataset.example));
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
        description: 'When a final ㄷ or ㅌ is followed by the vowel 이 (or by 히), it is pronounced as ㅈ or ㅊ.',
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
        id: 'h-rules',
        name: 'Final ㅎ',
        koreanName: 'ㅎ 발음',
        description: 'A final ㅎ (also in ㄶ, ㅀ) is silent before a vowel, and the consonant before it moves over. Before ㅅ it makes [ㅆ]; before ㄴ it is pronounced [ㄴ].',
        examples: [
            { word: '많이', sound: '마니', translation: 'A lot' },
            { word: '좋습니다', sound: '조씀니다', translation: 'It is good (formal)' },
            { word: '놓는', sound: '논는', translation: 'Putting' }
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
        description: 'When ㄴ and ㄹ meet (in either order), the ㄴ is pronounced as ㄹ, giving a long L sound. In some Sino-Korean compounds the ㄹ becomes ㄴ instead (생산량 [생산냥]).',
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
                loadExample(ex.word);
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
