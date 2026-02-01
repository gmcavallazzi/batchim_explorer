const dictionary = [
    // ==========================================
    // BASIC CONVERSATION
    // ==========================================
    { word: '안녕하세요', trans: 'Hello', cat: 'Basic' },
    { word: '감사합니다', trans: 'Thank you', cat: 'Basic' },
    { word: '죄송합니다', trans: 'I am sorry', cat: 'Basic' },
    { word: '저기요', trans: 'Excuse me (to get attention)', cat: 'Basic' },
    { word: '잠시만요', trans: 'Just a moment', cat: 'Basic' },
    { word: '잘 가요', trans: 'Goodbye (Go well)', cat: 'Basic' },
    { word: '반가워요', trans: 'Nice to meet you', cat: 'Basic' },
    { word: '이름', trans: 'Name', cat: 'Basic' },
    { word: '친구', trans: 'Friend', cat: 'Basic' },
    { word: '가족', trans: 'Family', cat: 'Basic' },
    { word: '어디예요', trans: 'Where is it?', cat: 'Basic (Liaison)' }, // [어디예요]
    { word: '얼마예요', trans: 'How much is it?', cat: 'Basic (Liaison)' }, // [얼마예요]
    { word: '주세요', trans: 'Please give me', cat: 'Basic' },

    // ==========================================
    // FOOD & DRINK
    // ==========================================
    { word: '김치', trans: 'Kimchi', cat: 'Food' },
    { word: '비빔밥', trans: 'Bibimbap', cat: 'Food (Tensification)' }, // [비빔빱]
    { word: '불고기', trans: 'Bulgogi', cat: 'Food' },
    { word: '삼겹살', trans: 'Pork Belly', cat: 'Food' },
    { word: '떡볶이', trans: 'Tteokbokki', cat: 'Food (Tensification)' }, // [떡뽀끼]
    { word: '냉면', trans: 'Cold Noodles', cat: 'Food' },
    { word: '국물', trans: 'Broth/Soup', cat: 'Food (Nasalization)' }, // [궁물]
    { word: '김밥', trans: 'Kimbap', cat: 'Food (Tensification)' }, // [김빱]
    { word: '물', trans: 'Water', cat: 'Food' },
    { word: '맥주', trans: 'Beer', cat: 'Food (Tensification)' }, // [맥쭈]
    { word: '소주', trans: 'Soju', cat: 'Food' },
    { word: '밥', trans: 'Rice/Meal', cat: 'Food' },
    { word: '반찬', trans: 'Side dishes', cat: 'Food' },
    { word: '식당', trans: 'Restaurant', cat: 'Place (Tensification)' }, // [식땅]
    { word: '맛있어요', trans: 'Delicious', cat: 'Phrase (Liaison)' }, // [마시써요]
    { word: '먹고 싶어요', trans: 'I want to eat', cat: 'Phrase' },
    { word: '사과', trans: 'Apple', cat: 'Food' },
    { word: '우유', trans: 'Milk', cat: 'Food' },
    { word: '빵', trans: 'Bread', cat: 'Food' },

    // ==========================================
    // ANIMALS (New!)
    // ==========================================
    { word: '고양이', trans: 'Cat', cat: 'Animal' },
    { word: '강아지', trans: 'Puppy', cat: 'Animal' },
    { word: '개', trans: 'Dog', cat: 'Animal' },
    { word: '새', trans: 'Bird', cat: 'Animal' },
    { word: '말', trans: 'Horse', cat: 'Animal' },
    { word: '소', trans: 'Cow', cat: 'Animal' },
    { word: '돼지', trans: 'Pig', cat: 'Animal' },
    { word: '물고기', trans: 'Fish', cat: 'Animal' },
    { word: '토끼', trans: 'Rabbit', cat: 'Animal (Tensification)' }, // [토끼]
    { word: '호랑이', trans: 'Tiger', cat: 'Animal' },
    { word: '곰', trans: 'Bear', cat: 'Animal' },

    // ==========================================
    // COLORS (New!)
    // ==========================================
    { word: '색깔', trans: 'Color', cat: 'Colors (Tensification)' }, // [색깔]
    { word: '빨간색', trans: 'Red', cat: 'Colors' },
    { word: '파란색', trans: 'Blue', cat: 'Colors' },
    { word: '노란색', trans: 'Yellow', cat: 'Colors' },
    { word: '검은색', trans: 'Black', cat: 'Colors (Liaison)' }, // [거믄색]
    { word: '하얀색', trans: 'White', cat: 'Colors' },
    { word: '초록색', trans: 'Green', cat: 'Colors' },
    { word: '보라색', trans: 'Purple', cat: 'Colors' },

    // ==========================================
    // SINO-KOREAN NUMBERS
    // ==========================================
    { word: '일', trans: 'One (1)', cat: 'Number (Sino)' },
    { word: '이', trans: 'Two (2)', cat: 'Number (Sino)' },
    { word: '삼', trans: 'Three (3)', cat: 'Number (Sino)' },
    { word: '사', trans: 'Four (4)', cat: 'Number (Sino)' },
    { word: '오', trans: 'Five (5)', cat: 'Number (Sino)' },
    { word: '육', trans: 'Six (6)', cat: 'Number (Sino)' },
    { word: '칠', trans: 'Seven (7)', cat: 'Number (Sino)' },
    { word: '팔', trans: 'Eight (8)', cat: 'Number (Sino)' },
    { word: '구', trans: 'Nine (9)', cat: 'Number (Sino)' },
    { word: '십', trans: 'Ten (10)', cat: 'Number (Sino)' },
    { word: '십일', trans: 'Eleven (11)', cat: 'Number (Sino - Liaison)' }, // [시빌]
    { word: '십이', trans: 'Twelve (12)', cat: 'Number (Sino - Liaison)' }, // [시비]
    { word: '십육', trans: 'Sixteen (16)', cat: 'Number (Sino - Nasalization)' }, // [심뉵]
    { word: '이십', trans: 'Twenty (20)', cat: 'Number (Sino)' },
    { word: '백', trans: 'Hundred (100)', cat: 'Number (Sino)' },
    { word: '천', trans: 'Thousand (1,000)', cat: 'Number (Sino)' },
    { word: '만', trans: 'Ten Thousand (10,000)', cat: 'Number (Sino)' },

    // ==========================================
    // NATIVE KOREAN NUMBERS
    // ==========================================
    { word: '하나', trans: 'One', cat: 'Number (Native)' },
    { word: '둘', trans: 'Two', cat: 'Number (Native)' },
    { word: '셋', trans: 'Three', cat: 'Number (Native)' },
    { word: '넷', trans: 'Four', cat: 'Number (Native)' },
    { word: '다섯', trans: 'Five', cat: 'Number (Native)' },
    { word: '여섯', trans: 'Six', cat: 'Number (Native)' },
    { word: '일곱', trans: 'Seven', cat: 'Number (Native)' },
    { word: '여덟', trans: 'Eight', cat: 'Number (Native - Complex)' }, // [여덜]
    { word: '아홉', trans: 'Nine', cat: 'Number (Native)' },
    { word: '열', trans: 'Ten', cat: 'Number (Native)' },
    { word: '스물', trans: 'Twenty', cat: 'Number (Native)' },

    // ==========================================
    // TIME & DATES
    // ==========================================
    { word: '오늘', trans: 'Today', cat: 'Time' },
    { word: '내일', trans: 'Tomorrow', cat: 'Time' },
    { word: '어제', trans: 'Yesterday', cat: 'Time' },
    { word: '지금', trans: 'Now', cat: 'Time' },
    { word: '시', trans: 'O\'clock', cat: 'Time' },
    { word: '분', trans: 'Minute', cat: 'Time' },
    { word: '월요일', trans: 'Monday', cat: 'Time (Liaison)' }, // [워료일]
    { word: '화요일', trans: 'Tuesday', cat: 'Time' },
    { word: '수요일', trans: 'Wednesday', cat: 'Time' },
    { word: '목요일', trans: 'Thursday', cat: 'Time (Liaison)' }, // [모교일]
    { word: '금요일', trans: 'Friday', cat: 'Time (Liaison)' }, // [그묘일]
    { word: '토요일', trans: 'Saturday', cat: 'Time' },
    { word: '일요일', trans: 'Sunday', cat: 'Time (Liaison)' }, // [이료일]

    // ==========================================
    // PLACES & DIRECTIONS
    // ==========================================
    { word: '학교', trans: 'School', cat: 'Place (Tensification)' }, // [학꾜]
    { word: '병원', trans: 'Hospital', cat: 'Place' },
    { word: '약국', trans: 'Pharmacy', cat: 'Place (Tensification)' }, // [약꾹]
    { word: '화장실', trans: 'Bathroom', cat: 'Place' },
    { word: '도서관', trans: 'Library', cat: 'Place' },
    { word: '공항', trans: 'Airport', cat: 'Place' },
    { word: '지하철', trans: 'Subway', cat: 'Place' },
    { word: '역', trans: 'Station', cat: 'Place' },
    { word: '집', trans: 'House/Home', cat: 'Place' },
    { word: '서울', trans: 'Seoul', cat: 'Place' },
    { word: '부산', trans: 'Busan', cat: 'Place' },
    { word: '한국', trans: 'Korea', cat: 'Place' },
    { word: '앞', trans: 'Front', cat: 'Direction' },
    { word: '뒤', trans: 'Back', cat: 'Direction' },
    { word: '옆', trans: 'Side', cat: 'Direction' },
    { word: '오른쪽', trans: 'Right side', cat: 'Direction' },
    { word: '왼쪽', trans: 'Left side', cat: 'Direction' },

    // ==========================================
    // COMMON VERBS (Conjugated)
    // ==========================================
    { word: '가요', trans: 'Go', cat: 'Verb', isVerb: true },
    { word: '와요', trans: 'Come', cat: 'Verb', isVerb: true },
    { word: '먹어요', trans: 'Eat', cat: 'Verb (Liaison)', isVerb: true }, // [머거요]
    { word: '마셔요', trans: 'Drink', cat: 'Verb', isVerb: true },
    { word: '봐요', trans: 'See/Watch', cat: 'Verb', isVerb: true },
    { word: '들어요', trans: 'Listen', cat: 'Verb (Liaison)', isVerb: true }, // [드러요]
    { word: '해요', trans: 'Do', cat: 'Verb', isVerb: true },
    { word: '자요', trans: 'Sleep', cat: 'Verb', isVerb: true },
    { word: '일어나요', trans: 'Wake up', cat: 'Verb (Liaison)', isVerb: true }, // [이러나요]
    { word: '만나요', trans: 'Meet', cat: 'Verb', isVerb: true },
    { word: '배워요', trans: 'Learn', cat: 'Verb', isVerb: true },
    { word: '기다려요', trans: 'Wait', cat: 'Verb', isVerb: true },
    { word: '알아요', trans: 'Know', cat: 'Verb (Liaison)', isVerb: true }, // [아라요]
    { word: '몰라요', trans: 'Don\'t Know', cat: 'Verb', isVerb: true },
    { word: '닫아요', trans: 'Close', cat: 'Verb (Liaison)', isVerb: true }, // [다다요]
    { word: '열어요', trans: 'Open', cat: 'Verb (Liaison)', isVerb: true }, // [여러요]

    // ==========================================
    // ADJECTIVES
    // ==========================================
    { word: '좋아요', trans: 'Good/Like', cat: 'Adjective (H-Dropping)' }, // [조아요]
    { word: '나빠요', trans: 'Bad', cat: 'Adjective' },
    { word: '커요', trans: 'Big', cat: 'Adjective' },
    { word: '작아요', trans: 'Small', cat: 'Adjective (Liaison)' }, // [자가요]
    { word: '많아요', trans: 'Many', cat: 'Adjective (H-Dropping)' }, // [마나요]
    { word: '적어요', trans: 'Few', cat: 'Adjective (Liaison)' }, // [저거요]
    { word: '비싸요', trans: 'Expensive', cat: 'Adjective' },
    { word: '싸요', trans: 'Cheap', cat: 'Adjective' },
    { word: '바빠요', trans: 'Busy', cat: 'Adjective' },
    { word: '예뻐요', trans: 'Pretty', cat: 'Adjective' },
    { word: '어려워요', trans: 'Difficult', cat: 'Adjective' },
    { word: '쉬워요', trans: 'Easy', cat: 'Adjective' },

    // ==========================================
    // NASALIZATION (비음화) CHALLENGE
    // ==========================================
    { word: '학년', trans: 'School Year', cat: 'Nasalization' }, // [항년]
    { word: '입니다', trans: 'It is (formal)', cat: 'Nasalization' }, // [임니다]
    { word: '합니다', trans: 'Do (formal)', cat: 'Nasalization' }, // [함니다]
    { word: '닫는다', trans: 'Closes', cat: 'Nasalization' }, // [단는다]
    { word: '앞문', trans: 'Front door', cat: 'Nasalization' }, // [암문]
    { word: '한국말', trans: 'Korean language', cat: 'Nasalization' }, // [한궁말]
    { word: '박물관', trans: 'Museum', cat: 'Nasalization' }, // [방물관]
    { word: '심리학', trans: 'Psychology', cat: 'Nasalization' }, // [심니학]
    { word: '국민', trans: 'Nation/People', cat: 'Nasalization' }, // [궁민]
    { word: '업무', trans: 'Work/Task', cat: 'Nasalization' }, // [엄무]
    { word: '꽃만', trans: 'Only flowers', cat: 'Nasalization' }, // [꼰만]
    { word: '있는', trans: 'Existing', cat: 'Nasalization' }, // [인는]
    { word: '작년', trans: 'Last year', cat: 'Nasalization' }, // [장년]

    // ==========================================
    // PALATALIZATION (구개음화) CHALLENGE
    // ==========================================
    { word: '같이', trans: 'Together', cat: 'Palatalization' }, // [가치]
    { word: '굳이', trans: 'Obstinately', cat: 'Palatalization' }, // [구지]
    { word: '해돋이', trans: 'Sunrise', cat: 'Palatalization' }, // [해도지]
    { word: '맏이', trans: 'First born', cat: 'Palatalization' }, // [마지]
    { word: '붙이다', trans: 'To stick/attach', cat: 'Palatalization' }, // [부치다]
    { word: '닫히다', trans: 'To be closed', cat: 'Palatalization' }, // [다치다]

    // ==========================================
    // ASPIRATION (격음화) CHALLENGE
    // ==========================================
    { word: '좋다', trans: 'Good', cat: 'Aspiration' }, // [조타]
    { word: '어떻게', trans: 'How', cat: 'Aspiration' }, // [어떠케]
    { word: '입학', trans: 'Admission', cat: 'Aspiration' }, // [이팍]
    { word: '축하', trans: 'Congratulation', cat: 'Aspiration' }, // [추카]
    { word: '많다', trans: 'Many', cat: 'Aspiration' }, // [만타]
    { word: '놓고', trans: 'Put and...', cat: 'Aspiration' }, // [노코]
    { word: '파란', trans: 'Blue', cat: 'Aspiration (Basic)' },
    { word: '북한', trans: 'North Korea', cat: 'Aspiration' }, // [부칸]
    { word: '맏형', trans: 'Eldest brother', cat: 'Aspiration' }, // [마텽]
    { word: '백화점', trans: 'Department Store', cat: 'Aspiration' }, // [배콰점]

    // ==========================================
    // LIQUIDIZATION (유음화) CHALLENGE
    // ==========================================
    { word: '신라', trans: 'Silla (Dynasty)', cat: 'Liquidization' }, // [실라]
    { word: '관리', trans: 'Management', cat: 'Liquidization' }, // [괄리]
    { word: '설날', trans: 'Lunar New Year', cat: 'Liquidization' }, // [설랄]
    { word: '칼날', trans: 'Blade edge', cat: 'Liquidization' }, // [칼랄]
    { word: '실내', trans: 'Indoor', cat: 'Liquidization' }, // [실래]
    { word: '편리', trans: 'Convenience', cat: 'Liquidization' }, // [펼리]
    { word: '물난리', trans: 'Flood disaster', cat: 'Liquidization' }, // [물랄리]

    // ==========================================
    // TENSIFICATION (경음화) CHALLENGE
    // ==========================================
    { word: '학교', trans: 'School', cat: 'Tensification' }, // [학꾜]
    { word: '학생', trans: 'Student', cat: 'Tensification' }, // [학쌩]
    { word: '숙제', trans: 'Homework', cat: 'Tensification' }, // [숙쩨]
    { word: '작다', trans: 'Small', cat: 'Tensification' }, // [작따]
    { word: '없다', trans: 'To not have', cat: 'Tensification' }, // [업따]
    { word: '국수', trans: 'Noodles', cat: 'Tensification' }, // [국쑤]
    { word: '입술', trans: 'Lips', cat: 'Tensification' }, // [입쑬]
    { word: '책상', trans: 'Desk', cat: 'Tensification' }, // [책쌍]
    { word: '맥주', trans: 'Beer', cat: 'Tensification' }, // [맥쭈]

    // ==========================================
    // COMPLEX BATCHIM
    // ==========================================
    { word: '앉다', trans: 'To sit', cat: 'Complex Batchim' }, // [안따]
    { word: '닭', trans: 'Chicken', cat: 'Complex Batchim' }, // [닥]
    { word: '삶', trans: 'Life', cat: 'Complex Batchim' }, // [삼]
    { word: '여덟', trans: 'Eight', cat: 'Complex Batchim' }, // [여덜]
    { word: '밟다', trans: 'To step on', cat: 'Complex Batchim' }, // [밥따]
    { word: '읽다', trans: 'To read', cat: 'Complex Batchim' }, // [익따]
    { word: '짧다', trans: 'Short', cat: 'Complex Batchim' }, // [짤따]
    { word: '젊다', trans: 'Young', cat: 'Complex Batchim' }, // [점따]
    { word: '값', trans: 'Price', cat: 'Complex Batchim' }, // [갑]

    // ==========================================
    // RESYLLABIFICATION (LIAISON)
    // ==========================================
    { word: '옷이', trans: 'Clothes (subject)', cat: 'Liaison' }, // [오시]
    { word: '밥을', trans: 'Rice/Meal (object)', cat: 'Liaison' }, // [바블]
    { word: '할아버지', trans: 'Grandfather', cat: 'Basic' },
    { word: '걸어요', trans: 'Walk', cat: 'Liaison' }, // [거러요]
    { word: '먹어요', trans: 'Eat', cat: 'Liaison' }, // [머거요]
    { word: '목요일', trans: 'Thursday', cat: 'Liaison' }, // [모교일]
];
