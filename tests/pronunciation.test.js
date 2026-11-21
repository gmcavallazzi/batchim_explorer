// Run with: node tests/pronunciation.test.js
// Each entry is a written word and its standard pronunciation.
const { KoreanPhonemizer, HangulAssembler } = require('../hangul.js');

const CASES = {
    // Resyllabification (연음)
    '옷이': '오시', '밥을': '바블', '먹어요': '머거요', '목요일': '모교일', '있어요': '이써요',
    '앞에': '아페', '밖에': '바께', '부엌에': '부어케', '할아버지': '하라버지',
    // Complex batchim + vowel
    '앉아요': '안자요', '읽어요': '일거요', '닭이': '달기', '젊어요': '절머요', '값이': '갑씨',
    '몫이': '목씨', '핥아': '할타', '없어': '업써',
    // Final ㅎ
    '좋아요': '조아요', '많이': '마니', '많아요': '마나요', '싫어요': '시러요', '놓는': '논는',
    '좋습니다': '조씀니다', '많습니다': '만씀니다', '않는': '안는',
    // Aspiration (격음화)
    '좋다': '조타', '입학': '이팍', '놓고': '노코', '많고': '만코', '않다': '안타', '축하': '추카',
    '어떻게': '어떠케', '백화점': '배콰점', '맏형': '마텽',
    // Palatalization (구개음화)
    '같이': '가치', '굳이': '구지', '맏이': '마지', '해돋이': '해도지', '붙이다': '부치다',
    '닫히다': '다치다', '밭이': '바치', '디자인': '디자인', '라디오': '라디오', '잔디': '잔디',
    // Nasalization (비음화)
    '국물': '궁물', '입니다': '임니다', '감사합니다': '감사함니다', '한국말': '한궁말',
    '끝나다': '끈나다', '받는': '반는', '십만': '심만', '빛나다': '빈나다', '듣는': '든는',
    '백리': '뱅니', '독립': '동닙', '심리': '심니', '종로': '종노', '박물관': '방물관', '있는': '인는',
    // Liquidization (유음화)
    '신라': '실라', '관리': '괄리', '칼날': '칼랄', '설날': '설랄', '물냉면': '물랭면',
    // Tensification (경음화)
    '학교': '학꾜', '식당': '식땅', '잡다': '잡따', '먹고 싶어요': '먹꼬 시퍼요', '삼겹살': '삼겹쌀',
    '앉다': '안따', '젊다': '점따', '넓다': '널따', '짧다': '짤따', '밟다': '밥따', '읽다': '익따',
    '읽고': '일꼬', '맑게': '말께',
    // Simplification of final consonants
    '닭': '닥', '값': '갑', '삶': '삼', '여덟': '여덜', '앞': '압', '셋': '섿',
    // Word-level exceptions
    '맛있다': '마싣따', '맛있어요': '마시써요', '꽃잎': '꼰닙', '한여름': '한녀름', '십육': '심뉵',
    '지하철역': '지하철력', '비빔밥': '비빔빱', '닭고기': '닥꼬기', '생산량': '생산냥',
    '겉옷': '거돋', '멕시코': '멕시코',
};

const p = new KoreanPhonemizer();
let failed = 0;
for (const [word, expected] of Object.entries(CASES)) {
    const got = p.phonemize(word).pronounced;
    if (got !== expected) {
        failed++;
        console.log(`FAIL ${word}: expected [${expected}], got [${got}]`);
    }
}

// The on-screen keyboard must continue from text that was typed or pasted
const a = new HangulAssembler();
for (const text of ['같이', '읽어요 많이', '괜찮아요', '의사']) {
    a.setText(text);
    if (a.assemble() !== text) { failed++; console.log(`FAIL keyboard round-trip: ${text} → ${a.assemble()}`); }
}
a.setText('같이');
if (a.add('ㄷ') !== '같읻') { failed++; console.log('FAIL keyboard: typing after loaded text'); }

const total = Object.keys(CASES).length + 5;
console.log(failed ? `${failed} of ${total} checks failed` : `All ${total} checks passed`);
process.exit(failed ? 1 : 0);
