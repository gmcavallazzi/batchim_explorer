/**
 * Korean Phonological Rules Engine
 * Handles Jamo decomposition/composition and sound change rules.
 */

// Constants for Hangul Composition
const HANGUL_BASE = 0xAC00;
const HANGUL_END = 0xD7A3;
const CHOSEONG_BASE = 0x1100;
const JUNGSEONG_BASE = 0x1161;
const JONGSEONG_BASE = 0x11A7;

const CHOSEONG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Exceptions for Palatalization (Native words where 'di/ti' sounds are preserved)
// No longer needed due to structural check.

// Common Pronunciation Exceptions (Dictionary-level overrides)
const COMMON_EXCEPTIONS = {
    '맛있다': { pronounced: '마시따', rule: 'Exception (Accepted Pronunciation)', desc: 'Standard allowance: [마딛따] is the rule, but [마시따] is widely accepted.' },
    '멋있다': { pronounced: '머시따', rule: 'Exception (Accepted Pronunciation)', desc: 'Standard allowance: [머딛따] is the rule, but [머시따] is widely accepted.' },
    '꽃잎': { pronounced: '꼰닙', rule: 'Compound Word Exception', desc: 'ㄴ-Insertion rule applies in this compound word.' },
    '깻잎': { pronounced: '깬닙', rule: 'Compound Word Exception', desc: 'ㄴ-Insertion rule applies in this compound word.' },
    '나뭇잎': { pronounced: '나문닙', rule: 'Compound Word Exception', desc: 'ㄴ-Insertion rule applies in this compound word.' }
};

const JUNGSEONG = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const JONGSEONG = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Mappings for complex batchim simplification (Pronunciation in isolation)
// Note: This is a simplification; actual rules depend on the following syllable.
const BATCHIM_SIMPLIFICATION = {
    'ㄳ': 'ㄱ', 'ㄵ': 'ㄴ', 'ㄶ': 'ㄴ', 'ㄺ': 'ㄱ', 'ㄻ': 'ㅁ', 'ㄼ': 'ㄹ', 'ㄽ': 'ㄹ',
    'ㄾ': 'ㄹ', 'ㄿ': 'ㅂ', 'ㅀ': 'ㄹ', 'ㅄ': 'ㅂ'
};

// Check if a character is Hangul
function isHangul(char) {
    const code = char.charCodeAt(0);
    return code >= HANGUL_BASE && code <= HANGUL_END;
}

// Decompose a Hangul Syllable into Jamo indices
function decompose(char) {
    if (!isHangul(char)) return null;
    const code = char.charCodeAt(0) - HANGUL_BASE;
    const jong = code % 28;
    const jung = ((code - jong) / 28) % 21;
    const cho = Math.floor((code - jong) / 28 / 21);
    return { cho, jung, jong, original: char };
}

// Compose Jamo indices back to Hangul
function compose(cho, jung, jong) {
    const code = HANGUL_BASE + (cho * 21 * 28) + (jung * 28) + jong;
    return String.fromCharCode(code);
}

// Convert Jamo index to character
function getJamoChars(parts) {
    return {
        cho: CHOSEONG[parts.cho],
        jung: JUNGSEONG[parts.jung],
        jong: JONGSEONG[parts.jong]
    };
}

/**
 * Phonological Rule Engine
 * Takes a string of Hangul, processes it sound-by-sound, and returns the pronunciation + explanations.
 */
class KoreanPhonemizer {
    constructor() {
        this.log = [];
    }

    reset() {
        this.log = [];
    }

    addLog(index, rule, description) {
        this.log.push({ index, rule, description });
    }

    getJongseongType(jongIndex) {
        if (jongIndex === 0) return 'NONE'; // No sound
        const char = JONGSEONG[jongIndex];

        // Representative sounds
        if (['ㄱ', 'ㄲ', 'ㄳ', 'ㄺ', 'ㅋ'].includes(char)) return 'K';
        if (['ㄴ', 'ㄵ', 'ㄶ'].includes(char)) return 'N';
        if (['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ'].includes(char)) return 'T'; // ㅎ implies T in representative sound usually, but acts specially
        if (['ㄹ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㅀ'].includes(char)) return 'L';
        if (['ㅁ', 'ㄻ'].includes(char)) return 'M';
        if (['ㅂ', 'ㅄ', 'ㄿ', 'ㅍ'].includes(char)) return 'P';
        if (['ㅇ'].includes(char)) return 'NG';

        return 'UNKNOWN';
    }

    // Main function to process a sentence
    phonemize(text, options = {}) {
        this.reset();
        this.options = { ...options, originalText: text };

        // 0. Check Common Exceptions (Full Word Match)
        if (COMMON_EXCEPTIONS[text]) {
            const ex = COMMON_EXCEPTIONS[text];
            this.addLog(0, ex.rule, ex.desc);
            return {
                original: text,
                pronounced: ex.pronounced,
                explanations: this.log
            };
        }

        // 1. Convert text to array of decomposed syllables
        let context = [];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (isHangul(char)) {
                context.push({ ...decompose(char), type: 'HANGUL' });
            } else {
                context.push({ char, type: 'OTHER' });
            }
        }

        // Rule Application Order

        // Pass 1: Syllable Boundary Effects (Resyllabification & H-reduction)
        this.applyResyllabification(context);

        // Pass 2: Aspiration (H merging)
        // Must happen BEFORE Palatalization to handle cases like 닫히다 -> 다티다 -> 다치다
        this.applyAspiration(context);

        // Pass 3: Palatalization
        // Now processes result of aspiration (e.g., if T sound was created)
        this.applyPalatalization(context);

        // Pass 4: Assimilation (Nasalization, Liquidization)
        this.applyAssimilation(context);

        // Pass 5: Tensification
        this.applyTensification(context);

        // Finally, normalize any remaining complex batchim that weren't linked
        this.applyFinalNormalization(context);

        // Reconstruct string
        let result = "";
        for (let i = 0; i < context.length; i++) {
            if (context[i].type === 'HANGUL') {
                result += compose(context[i].cho, context[i].jung, context[i].jong);
            } else {
                result += context[i].char;
            }
        }

        return {
            original: text,
            pronounced: result,
            explanations: this.log
        };
    }

    applyResyllabification(ctx) {
        for (let i = 0; i < ctx.length - 1; i++) {
            const curr = ctx[i];
            const next = ctx[i + 1];

            if (curr.type !== 'HANGUL' || next.type !== 'HANGUL') continue;

            if (curr.jong !== 0 && next.cho === 11) {
                // Special case: ㅎ (27 in JONG) often drops or weakens, but generally moves over if not ㅎ.
                // If it is ㅎ(27), it often drops in spoken Korean between voiced sounds, but strictly resyllabifies or aspirates.
                // Standard pronunciation rule: ㅎ in batchim drops when followed by vowel.
                if (curr.jong === 27) { // ㅎ
                    this.addLog(i, "ㅎ-Deletion", `${getJamoChars(curr).jong} disappears before a vowel.`);
                    curr.jong = 0;
                    // Next remains ㅇ (silent placeholder) effectively
                }
                // ㅇ (21) in JONG is NG sound, it does NOT move over.
                else if (curr.jong === 21) {
                    // Do nothing, NG stays.
                }
                else {
                    const jongChar = JONGSEONG[curr.jong];

                    // Handle Complex Batchim splitting
                    // ㄳ -> ㄱ, ㅅ moves
                    const complexMap = {
                        'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'],
                        'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'],
                        'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'],
                        'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ']
                    };

                    if (complexMap[jongChar]) {
                        const [remain, move] = complexMap[jongChar];

                        // Handle ㅎ (h) in complex batchim followed by vowel
                        if (move === 'ㅎ') {
                            // ㄶ, ㅀ -> h drops.
                            this.addLog(i, "Resyllabification (Complex)", `${jongChar} splits, ㅎ is silent.`);
                            curr.jong = this.getJongIndex(remain);
                            // next remains unchanged (vowel start)
                            continue;
                        }

                        this.addLog(i, "Resyllabification (Complex)", `${jongChar} splits: ${remain} stays, ${move} moves to next syllable.`);
                        curr.jong = this.getJongIndex(remain);
                        next.cho = this.getChoIndex(this.tensify(move)); // Oftentimes moved consonant tensifies? No, just moves. e.g. 값이 -> 갑씨 (yes tensifies mostly for ㅅ)
                    } else {
                        // Simple Batchim
                        let targetChar = jongChar;
                        this.addLog(i, "Resyllabification", `${jongChar} moves to replace the empty initial sound.`);
                        curr.jong = 0;
                        next.cho = this.getChoIndex(targetChar);
                    }
                }
            }
        }
    }

    applyPalatalization(ctx) {
        for (let i = 0; i < ctx.length - 1; i++) {
            const curr = ctx[i];
            const next = ctx[i + 1];
            if (curr.type !== 'HANGUL' || next.type !== 'HANGUL') continue;

            const targetCho = CHOSEONG[next.cho];
            const targetJung = JUNGSEONG[next.jung];

            // Structural Check: Did this 'ㄷ' or 'ㅌ' come from the original writing?
            // If the user literally wrote '디' or '티', we assume they want that sound 
            // (e.g., '잔디', '티끌', '라디오'). Palatalization is a change rule, not a reading rule for these.

            const originalNext = decompose(next.original);
            if (originalNext) { // Should exist
                const originalChoChar = CHOSEONG[originalNext.cho];
                // If original onset was explicitly ㄷ or ㅌ, do NOT palatalize.
                if (['ㄷ', 'ㅌ'].includes(originalChoChar)) {
                    continue;
                }
            }

            // Check for ㄷ -> ㅈ
            if (targetCho === 'ㄷ' && targetJung.startsWith('ㅣ')) {
                this.addLog(i + 1, "Palatalization", `ㄷ becomes ㅈ before ${targetJung}.`);
                next.cho = this.getChoIndex('ㅈ');
            }
            // Check for ㅌ -> ㅊ
            else if (targetCho === 'ㅌ' && targetJung.startsWith('ㅣ')) {
                this.addLog(i + 1, "Palatalization", `ㅌ becomes ㅊ before ${targetJung}.`);
                next.cho = this.getChoIndex('ㅊ');
            }
        }
    }

    // Simplistic Tensification of moved ㅅ?
    tensify(char) {
        const map = { 'ㅅ': 'ㅆ' }; // Mostly just s -> ss in complex batchim liaison?
        return map[char] || char;
    }

    applyAspiration(ctx) {
        for (let i = 0; i < ctx.length - 1; i++) {
            const curr = ctx[i];
            const next = ctx[i + 1];
            if (curr.type !== 'HANGUL' || next.type !== 'HANGUL') continue;

            const currJongChar = JONGSEONG[curr.jong]; // Could be 0
            const nextChoChar = CHOSEONG[next.cho];

            let hSource = null;
            let target = null;
            let direction = null; // 'forward' or 'backward'

            // Forward: ㅎ + Stop
            if (['ㅎ', 'ㄶ', 'ㅀ'].includes(currJongChar) && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(nextChoChar)) {
                hSource = curr;
                target = next;
                direction = 'forward';
            } else {
                // Backward: Stop (or complex stop) + ㅎ
                // Check if batchim contains a stop that can merge with ㅎ
                let baseSound = this.toRepresentative(currJongChar);

                // Special handling for complex batchim that have a stop but different representative
                const complexStops = { 'ㄵ': 'ㅈ', 'ㄼ': 'ㅂ', 'ㄾ': 'ㅌ' };
                if (complexStops[currJongChar]) {
                    baseSound = complexStops[currJongChar];
                }

                if (['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(baseSound) && nextChoChar === 'ㅎ') {
                    hSource = next;
                    target = curr;
                    direction = 'backward';
                }
            }

            if (direction) {
                const pairs = { 'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅂ': 'ㅍ', 'ㅈ': 'ㅊ' };

                if (direction === 'forward') {
                    const base = nextChoChar;
                    const aspirate = pairs[base];
                    this.addLog(i, "Aspiration", `ㅎ merges with ${base} to form ${aspirate}.`);

                    curr.jong = (['ㄶ', 'ㅀ'].includes(currJongChar)) ? this.getJongIndex(currJongChar === 'ㄶ' ? 'ㄴ' : 'ㄹ') : 0; // Reduce batchim
                    next.cho = this.getChoIndex(aspirate);
                } else {
                    // Backward
                    let baseSound = this.toRepresentative(currJongChar);
                    const complexStops = { 'ㄵ': 'ㅈ', 'ㄼ': 'ㅂ', 'ㄾ': 'ㅌ' };
                    if (complexStops[currJongChar]) baseSound = complexStops[currJongChar];

                    if (pairs[baseSound]) {
                        const aspirate = pairs[baseSound];
                        this.addLog(i, "Aspiration", `${currJongChar} merges with ㅎ to form ${aspirate}.`);

                        // Remove batchim from current, keeping remainder if complex
                        const complexMap = {
                            'ㄺ': 'ㄹ', 'ㄼ': 'ㄹ',
                            'ㄵ': 'ㄴ', 'ㄾ': 'ㄹ'
                        };

                        if (complexMap[currJongChar]) {
                            curr.jong = this.getJongIndex(complexMap[currJongChar]);
                        } else {
                            curr.jong = 0;
                        }

                        next.cho = this.getChoIndex(aspirate);
                    }
                }
            }
        }
    }

    applyTensification(ctx) {
        // Post-obstruent tensification:
        // Stop sound (ㄱ, ㄷ, ㅂ) + Lenis (ㄱ, ㄷ, ㅂ, ㅅ, ㅈ) -> Fortis (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ)
        for (let i = 0; i < ctx.length - 1; i++) {
            const curr = ctx[i];
            const next = ctx[i + 1];
            if (curr.type !== 'HANGUL' || next.type !== 'HANGUL') continue;

            // Get sound of current batchim
            const rep = this.toRepresentative(JONGSEONG[curr.jong]);
            const nextCho = CHOSEONG[next.cho];

            // Condition: P, T, or K sound (Obstruents)
            if (['ㄱ', 'ㄷ', 'ㅂ'].includes(rep)) {
                const map = { 'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅂ': 'ㅃ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ' };
                if (map[nextCho]) {
                    this.addLog(i + 1, "Tensification", `Initial ${nextCho} hardens to ${map[nextCho]} after stop sound.`);
                    next.cho = this.getChoIndex(map[nextCho]);
                }
            }
        }
    }

    applyAssimilation(ctx) {
        // Nasalization
        // 1. Obstruent (ㄱ, ㄷ, ㅂ) + Nasal (ㄴ, ㅁ) -> Nasal (ㅇ, ㄴ, ㅁ)
        //    ㄱ -> ㅇ
        //    ㄷ -> ㄴ
        //    ㅂ -> ㅁ

        // 2. T/K/P + ㄹ -> N + N (Interaction)
        //    Usually: Stop + ㄹ -> Stop + ㄴ -> Nasal + ㄴ (Two steps)
        //    e.g. 백리 -> [백니] -> [뱅니]
        //    We simulate this loop or check explicitly.

        // Liquidization
        // ㄴ + ㄹ -> ㄹ + ㄹ (and vice versa)

        for (let i = 0; i < ctx.length - 1; i++) {
            const curr = ctx[i];
            const next = ctx[i + 1];
            if (curr.type !== 'HANGUL' || next.type !== 'HANGUL') continue;

            let prevBatchim = this.toRepresentative(JONGSEONG[curr.jong]);
            let nextCho = CHOSEONG[next.cho];

            // Liquidization (ㄹ rules)
            if ((prevBatchim === 'ㄴ' && nextCho === 'ㄹ') || (prevBatchim === 'ㄹ' && nextCho === 'ㄴ')) {
                this.addLog(i, "Liquidization", `ㄴ and ㄹ meet to become ㄹㄹ.`);
                curr.jong = this.getJongIndex('ㄹ');
                next.cho = this.getChoIndex('ㄹ');
                continue; // stop other rules for this pair
            }

            // Nasalization Type 1: Stop + Nasal
            if (['ㄱ', 'ㄷ', 'ㅂ'].includes(prevBatchim) && ['ㄴ', 'ㅁ'].includes(nextCho)) {
                const nasalMap = { 'ㄱ': 'ㅇ', 'ㄷ': 'ㄴ', 'ㅂ': 'ㅁ' };
                const newSound = nasalMap[prevBatchim];
                this.addLog(i, "Nasalization", `Stop ${prevBatchim} becomes nasal ${newSound} before ${nextCho}.`);

                // Update batchim. NOTE: We must find the JONGSEONG index for the new sound.
                // Be careful that we are changing the sound, not necessarily the writing, but this tool visualizes pronunciation.
                // We just swap the batchim to the simple nasal version.
                curr.jong = this.getJongIndex(newSound);

                // Update for next pass logic?
                prevBatchim = newSound;
            }

            // Nasalization Type 2: Stop + ㄹ -> Nasal + ㄴ
            // This effectively changes the NEXT Sound too.
            // 국력 (Guk-ryeok) -> [궁녁]
            if (['ㄱ', 'ㄷ', 'ㅂ', 'ㅁ', 'ㅇ'].includes(prevBatchim) && nextCho === 'ㄹ') {
                // If nasal + ㄹ -> nasal + n
                // If stop + ㄹ -> nasal + n

                if (['ㅁ', 'ㅇ'].includes(prevBatchim)) {
                    // Standard Nasalization of Liquid
                    this.addLog(i + 1, "Nasalization", `ㄹ becomes ㄴ after nasal.`);
                    next.cho = this.getChoIndex('ㄴ');
                } else if (['ㄱ', 'ㄷ', 'ㅂ'].includes(prevBatchim)) {
                    // Double change
                    // 1. ㄹ -> ㄴ
                    // 2. Stop -> Nasal (triggered by the new ㄴ)
                    this.addLog(i, "Nasalization (Mutual)", `Stop + ㄹ interaction: Both change to nasals.`);

                    const nasalMap = { 'ㄱ': 'ㅇ', 'ㄷ': 'ㄴ', 'ㅂ': 'ㅁ' };
                    curr.jong = this.getJongIndex(nasalMap[prevBatchim]);
                    next.cho = this.getChoIndex('ㄴ');
                }
            }
        }
    }

    applyFinalNormalization(ctx) {
        // Just ensures that any leftover batchim is displayed as its representative sound
        // if it is followed by nothing or a consonant (implied).
        // However, for "Pronunciation" display, we usually want to show the specific representative 
        // throughout the text? Or only at the end?
        // Usually, internal changes (nasalization) already normalized it.
        // But `닭` alone -> `닥` (Simplification).
        // If it wasn't linked or modified, we simplify it now.

        for (let i = 0; i < ctx.length; i++) {
            const curr = ctx[i];
            if (curr.type !== 'HANGUL') continue;

            // Check if 0 or already simple?
            const char = JONGSEONG[curr.jong];
            if (!char) continue;

            // If next is empty (end of string) or next is consonant (break), we simplify.
            // Our previous logic didn't simplify cluster if no interaction happened.
            // e.g. 닭 -> 닭 (No change logged).
            // We should change it to 닥 for pronunciation.

            const rep = this.toRepresentative(char);
            if (rep !== char) {
                // Check context: if we are at end, or we didn't link.
                // We know we didn't link if we are here and jong is not 0 (because link sets jong to 0).
                // EXCEPT if we had nasalization, which changed it to a simple nasal already.

                // So we just unconditionally simplify to component batchim for display?
                // Wait, `값` -> [갑].
                this.addLog(i, "Simplification", `${char} simplifies to ${rep}.`);
                curr.jong = this.getJongIndex(rep);
            }
        }
    }

    // Helper: Map any batchim to its sound Representative (7 sounds: ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ)
    toRepresentative(jongChar) {
        if (!jongChar) return '';
        // 1. ㄱ, ㄲ, ㄳ, ㄺ, ㅋ -> ㄱ (K)
        // 2. ㄴ, ㄵ, ㄶ -> ㄴ (N)
        // 3. ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ -> ㄷ (T)
        // 4. ㄹ, ㄼ, ㄽ, ㄾ, ㅀ -> ㄹ (L)
        // 5. ㅁ, ㄻ -> ㅁ (M)
        // 6. ㅂ, ㅄ, ㄿ, ㅍ -> ㅂ (P)
        // 7. ㅇ -> ㅇ (NG)

        // Note: ㄺ (lg) usually k (chicken 닭 -> dak), but sometimes l (clear 맑다 -> malta)?
        // 맑다 -> [막따] (exceptions exist). Standard rule: ㄺ -> ㄱ usually before consonant.
        // ㄼ (lb) -> ㄹ (yeolp -> yeol), except 밟다 (bapta).

        // Use a standard map for 90% cases
        if (['ㄱ', 'ㄲ', 'ㄳ', 'ㄺ', 'ㅋ'].includes(jongChar)) return 'ㄱ';
        if (['ㄴ', 'ㄵ', 'ㄶ'].includes(jongChar)) return 'ㄴ';
        if (['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ', 'ㄸ', 'ㅉ'].includes(jongChar)) return 'ㄷ'; // ㄸ, ㅉ not standard batchim but possible in typos
        if (['ㄹ', 'ㄽ', 'ㄾ', 'ㅀ', 'ㄼ'].includes(jongChar)) return 'ㄹ'; // Exception: 밟 -> 밥
        if (['ㅁ', 'ㄻ'].includes(jongChar)) return 'ㅁ';
        if (['ㅂ', 'ㅄ', 'ㄿ', 'ㅍ'].includes(jongChar)) return 'ㅂ';
        if (['ㅇ'].includes(jongChar)) return 'ㅇ';

        return jongChar;
    }

    getChoIndex(char) {
        return CHOSEONG.indexOf(char);
    }

    getJongIndex(char) {
        return JONGSEONG.indexOf(char);
    }
}

/**
 * Hangul Assembler
 * A state-machine based IME to combine Jamos into Hangul Blocks naturally.
 */
class HangulAssembler {
    constructor() {
        this.buffer = [];
    }

    add(jamo) {
        this.buffer.push(jamo);
        return this.assemble();
    }

    backspace() {
        this.buffer.pop();
        return this.assemble();
    }

    clear() {
        this.buffer = [];
        return "";
    }

    assemble() {
        let result = "";

        let state = 0; // 0: Start, 1: Cho, 2: Cho+Jung, 3: Cho+Jung+Jong
        let cho = -1, jung = -1, jong = 0;

        const flush = () => {
            if (state === 1) result += CHOSEONG[cho];
            else if (state === 2) result += compose(cho, jung, 0);
            else if (state === 3) result += compose(cho, jung, jong);
            state = 0; cho = -1; jung = -1; jong = 0;
        };

        for (let i = 0; i < this.buffer.length; i++) {
            const char = this.buffer[i];
            const isV = this.isJu(char);
            const isC = this.isCho(char) || this.isJo(char);

            if (state === 0) {
                if (isC) {
                    cho = CHOSEONG.indexOf(char);
                    if (cho === -1) result += char;
                    else state = 1;
                } else if (isV) {
                    result += char;
                } else {
                    result += char;
                }
            }
            else if (state === 1) { // Has Cho
                if (isV) {
                    jung = JUNGSEONG.indexOf(char);
                    state = 2;
                } else if (isC) {
                    flush();
                    cho = CHOSEONG.indexOf(char);
                    if (cho !== -1) state = 1;
                    else result += char;
                } else {
                    flush();
                    result += char;
                }
            }
            else if (state === 2) { // Has Cho + Jung
                if (isV) {
                    // Check compound vowel
                    const curJungChar = JUNGSEONG[jung];
                    const compound = this.getCompoundVowel(curJungChar, char);
                    if (compound) {
                        jung = JUNGSEONG.indexOf(compound);
                        // Stay in state 2
                    } else {
                        flush();
                        result += char;
                    }
                } else if (isC) {
                    const tempJong = JONGSEONG.indexOf(char);
                    if (tempJong > 0) {
                        jong = tempJong;
                        state = 3;
                    } else {
                        flush();
                        cho = CHOSEONG.indexOf(char);
                        if (cho !== -1) state = 1;
                        else result += char;
                    }
                } else {
                    flush();
                    result += char;
                }
            }
            else if (state === 3) { // Has Cho + Jung + Jong
                if (isV) {
                    // Resyllabification: Jong moves to next Cho
                    const curJongChar = JONGSEONG[jong];
                    const complexMap = {
                        'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'],
                        'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'],
                        'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'],
                        'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ']
                    };

                    let leftJongIndex = 0;
                    let rightChoChar = curJongChar;

                    if (complexMap[curJongChar]) {
                        leftJongIndex = JONGSEONG.indexOf(complexMap[curJongChar][0]);
                        rightChoChar = complexMap[curJongChar][1];
                    }

                    result += compose(cho, jung, leftJongIndex);

                    cho = CHOSEONG.indexOf(rightChoChar);
                    jung = JUNGSEONG.indexOf(char);
                    jong = 0;
                    state = 2;
                }
                else if (isC) {
                    const curJongChar = JONGSEONG[jong];
                    const potentialComplex = this.getComplexBatchim(curJongChar, char);
                    if (potentialComplex) {
                        jong = JONGSEONG.indexOf(potentialComplex);
                    } else {
                        flush();
                        cho = CHOSEONG.indexOf(char);
                        if (cho !== -1) state = 1;
                        else result += char;
                    }
                } else {
                    flush();
                    result += char;
                }
            }
        }
        flush();
        return result;
    }

    isCho(c) { return CHOSEONG.includes(c); }
    isJu(c) { return JUNGSEONG.includes(c); }
    isJo(c) { return JONGSEONG.includes(c); }

    getCompoundVowel(v1, v2) {
        const compounds = {
            'ㅗ': { 'ㅏ': 'ㅘ', 'ㅐ': 'ㅙ', 'ㅣ': 'ㅚ' },
            'ㅜ': { 'ㅓ': 'ㅝ', 'ㅔ': 'ㅞ', 'ㅣ': 'ㅟ' },
            'ㅡ': { 'ㅣ': 'ㅢ' }
        };
        return (compounds[v1] && compounds[v1][v2]) || null;
    }

    getComplexBatchim(j1, j2) {
        const combinations = {
            'ㄱ': { 'ㅅ': 'ㄳ' },
            'ㄴ': { 'ㅈ': 'ㄵ', 'ㅎ': 'ㄶ' },
            'ㄹ': { 'ㄱ': 'ㄺ', 'ㅁ': 'ㄻ', 'ㅂ': 'ㄼ', 'ㅅ': 'ㄽ', 'ㅌ': 'ㄾ', 'ㅍ': 'ㄿ', 'ㅎ': 'ㅀ' },
            'ㅂ': { 'ㅅ': 'ㅄ' }
        };
        return (combinations[j1] && combinations[j1][j2]) || null;
    }
}

// Export for usage
// window.KoreanPhonemizer = KoreanPhonemizer;
