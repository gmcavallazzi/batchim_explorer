# Korean Batchim Explorer

A small web page that shows how written Korean is pronounced. Type a word in Hangul and it shows the pronunciation, the sound-change rules that produced it, and reads it aloud.

Example: 같이 → [가치] (palatalization), 국물 → [궁물] (nasalization), 많이 → [마니] (silent ㅎ + linking).

## Features

- **Pronunciation and rules:** the pronounced form, with each rule that was applied and why
- **Rules covered:** linking (연음), simplification of final consonants, nasalization (비음화), liquidization (유음화), palatalization (구개음화), aspiration (격음화), tensification (경음화), and the rules for a final ㅎ
- **Audio:** reads the word aloud with the browser's Korean voice, if one is installed
- **On-screen keyboard:** a Korean keyboard for devices without a Korean input method
- **Reference:** a guide to each rule with examples, and a table of the 7 final-consonant sounds

## Limits

The tool applies the regular rules of the standard pronunciation rules (표준 발음법). It does not know what words mean, so:

- Each word (text between spaces) is analysed separately; sound changes across words are not shown.
- Extra sounds in compound words (ㄴ-insertion, 사이시옷) and word-specific hardening are only handled for the words listed in `COMMON_EXCEPTIONS` in `hangul.js`.
- Hardening after verb stems ending in a single ㄴ or ㅁ (신다 [신따]) is not applied, because the tool can't tell verbs from other words.
- Loanwords often don't follow the hardening rules.
- Vowel length is not shown.

## Running it

Open `index.html` in a browser. There is no build step and nothing to install.

## Files

| File | Content |
|---|---|
| `index.html` | Page layout |
| `style.css` | Styles, including dark mode and mobile layout |
| `hangul.js` | Pronunciation engine (`KoreanPhonemizer`), word exceptions, on-screen keyboard logic (`HangulAssembler`) |
| `app.js` | Page behaviour: input, audio, rule guide, batchim table |
| `tests/pronunciation.test.js` | Checks the engine against known pronunciations |

## Tests

```bash
node tests/pronunciation.test.js
```

To add a case, add the written word and its standard pronunciation to `CASES` in the test file. To fix a word the rules can't predict, add it to `COMMON_EXCEPTIONS` in `hangul.js`.
