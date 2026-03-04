// ======================================================================
// 손평마스터 - 손해평가사 시험 학습 사이트 Main Application
// ======================================================================

(function () {
  'use strict';

  // ── Global State ──
  const STORAGE_KEY = 'sonpyeong_v2';
  const subjectShortNames = {
    '상법(보험편)': '상법 보험편',
    '농어업재해보험법령': '재해보험법',
    '농학개론 중 재배학 및 원예작물학': '농학개론'
  };

  let questions = [];
  let flashcards = [];
  let lawTexts = { sangbub: '', insurance: '', guideline: '' };
  let passRates = null;
  let parsedLaws = { sangbub: [], insurance: [], guideline: [] };

  // Quiz state
  let quizQuestions = [];
  let quizIndex = 0;
  let quizAnswers = {}; // { index: selectedOption }
  let quizMode = 'sequential';

  // Flashcard state
  let fcDeck = [];
  let fcIndex = 0;
  let fcFlipped = false;

  // Current law tab
  let currentLawTab = 'sangbub';

  // Persisted state
  let state = {
    solved: {},      // { questionId: { correct: bool, count: int, lastDate: str, selectedAnswer: int } }
    bookmarks: [],   // [questionId, ...]
    fcCards: {}       // { cardId: { level: 0-3, nextReview: timestamp } }
  };

  // ── Load State ──
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.solved = parsed.solved || {};
        state.bookmarks = parsed.bookmarks || [];
        state.fcCards = parsed.fcCards || {};
      }
    } catch (e) {
      console.warn('State load error:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('State save error:', e);
    }
  }

  // ── Data Loading ──
  async function loadData() {
    try {
      const [qRes, fRes, lRes, liRes, lgRes, prRes] = await Promise.all([
        fetch('data/questions_new.json'),
        fetch('data/flashcards_new.json'),
        fetch('data/law.txt'),
        fetch('data/law_insurance.txt'),
        fetch('data/law_guideline.txt'),
        fetch('data/pass_rates.json')
      ]);

      questions = await qRes.json();
      flashcards = await fRes.json();
      lawTexts.sangbub = await lRes.text();
      lawTexts.insurance = await liRes.text();
      lawTexts.guideline = await lgRes.text();
      passRates = await prRes.json();

      // Parse laws
      parsedLaws.sangbub = parseLaw(lawTexts.sangbub);
      parsedLaws.insurance = parseLaw(lawTexts.insurance);
      parsedLaws.guideline = parseLaw(lawTexts.guideline);

      // Init all components
      initHome();
      initFilters();
      initFlashcards();
      initLaw();
      initSummary();
      updateAnalytics();

    } catch (err) {
      console.error('Data loading error:', err);
      document.getElementById('page-home').innerHTML =
        '<div class="card" style="text-align:center;color:var(--danger);padding:40px">' +
        '<p style="font-size:16px;font-weight:700">데이터 로딩 실패</p>' +
        '<p style="font-size:13px;margin-top:8px">data 폴더의 파일을 확인해주세요.</p>' +
        '<p style="font-size:12px;margin-top:8px;color:var(--gray-400)">' + escapeHtml(err.message) + '</p></div>';
    }
  }

  // ── Navigation ──
  window.navigateTo = function (page, skipPush) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.classList.add('animate-in');
      setTimeout(() => targetPage.classList.remove('animate-in'), 300);
    }

    const navBtn = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (navBtn) navBtn.classList.add('active');

    // URL 경로 업데이트 (History API)
    if (!skipPush) {
      const newPath = (page === 'home') ? '/' : '/' + page;
      history.pushState({ page: page }, '', newPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh data on page load
    if (page === 'home') updateHome();
    if (page === 'analytics') updateAnalytics();
    if (page === 'flashcard') renderFlashcard();
  };

  // URL 경로 기반 라우팅
  const validPages = ['home', 'quiz', 'flashcard', 'law', 'summary', 'analytics'];

  function handleRoute() {
    // 기존 해시 URL 하위 호환 (/#quiz → /quiz 리다이렉트)
    const hash = window.location.hash.replace('#', '');
    if (hash && validPages.includes(hash)) {
      const newPath = '/' + hash;
      history.replaceState({ page: hash }, '', newPath);
      navigateTo(hash, true);
      return;
    }

    // pathname 기반 라우팅
    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (path && validPages.includes(path)) {
      navigateTo(path, true);
    } else {
      navigateTo('home', true);
    }
  }

  // 브라우저 뒤로/앞으로 버튼 지원
  window.addEventListener('popstate', function () {
    handleRoute();
  });

  // ── HOME ──
  function initHome() {
    updateHome();
    showDailyTip();
    showPassRate('first', null);
  }

  function updateHome() {
    const totalQ = questions.length;
    const solvedIds = Object.keys(state.solved);
    const solvedCount = solvedIds.length;
    const correctCount = solvedIds.filter(id => state.solved[id].correct).length;
    const wrongIds = solvedIds.filter(id => !state.solved[id].correct);
    const accuracy = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;
    const pct = totalQ > 0 ? Math.round((solvedCount / totalQ) * 100) : 0;

    setText('stat-total', totalQ);
    setText('stat-flashcard', flashcards.length);
    setText('stat-acc', solvedCount > 0 ? accuracy + '%' : '-');
    setText('home-progress-pct', pct + '%');
    setText('home-solved', solvedCount);
    setText('home-accuracy', accuracy);

    const bar = document.getElementById('home-progress-bar');
    if (bar) bar.style.width = pct + '%';

    // Wrong summary
    const wrongEl = document.getElementById('wrong-summary');
    if (wrongIds.length > 0) {
      wrongEl.style.display = 'block';
      setText('wrong-count', wrongIds.length + '개');
    } else {
      wrongEl.style.display = 'none';
    }

    // Bookmark summary
    const bmEl = document.getElementById('bookmark-summary');
    if (state.bookmarks.length > 0) {
      bmEl.style.display = 'block';
      setText('bookmark-count', state.bookmarks.length + '개');
    } else {
      bmEl.style.display = 'none';
    }
  }

  function showDailyTip() {
    const tips = [
      '상법 보험편의 강행규정(제663조)을 꼭 숙지하세요. 보험계약자에게 불리하게 변경 못합니다.',
      '손해평가요령 제7조 손해평가반 구성을 정확히 알아두세요. 2인 이상 1조로 구성합니다.',
      '농어업재해보험법 제2조 정의 규정은 매년 출제됩니다. 용어 정의를 꼼꼼히 학습하세요.',
      '보험의 3대 원칙: 대수의 법칙, 수지균등의 원칙, 급부반대급부 균등의 원칙을 비교 암기하세요.',
      '고지의무(제651조)와 통지의무(제652조)의 차이점을 비교해서 외우세요.',
      '재배학에서 일장효과(광주성)는 매년 출제됩니다. 장일/단일/중일 식물 구분을 확실히 하세요.',
      '보험대위(제681~682조)는 잔존물대위와 청구권대위로 나뉩니다. 차이점을 비교하세요.',
      '과수의 결과습성(당년지 결과, 전년지 결과)은 작물별로 정리해두면 시험에 유리합니다.',
      '재해보험사업자의 의무와 보험가입자의 의무를 구분해서 정리하세요.',
      '원예작물학에서 채소의 분류(과채류, 엽경채류, 근채류)를 정확히 숙지하세요.',
      '인보험과 손해보험의 차이점을 표로 정리하면 기억에 오래 남습니다.',
      '필수 원소 16가지 중 다량원소(C,H,O,N,P,K,Ca,Mg,S)와 미량원소를 구분하세요.',
      '화재보험(제682~687조)과 해상보험 규정은 매년 1~2문제 출제됩니다.',
      '교차손해평가 제도(손해평가요령 제12조)의 목적과 절차를 이해하세요.',
      '보험계약의 해지 사유별(고지의무 위반, 위험변경증가, 보험료 미납) 효과를 비교하세요.'
    ];
    const today = new Date();
    const idx = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % tips.length;
    setText('daily-tip', tips[idx]);
  }

  window.showPassRate = function (type, btn) {
    if (btn) {
      const bar = btn.parentElement;
      bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    const container = document.getElementById('pass-rate-table');
    if (!passRates || !passRates[type]) {
      container.innerHTML = '<p style="text-align:center;color:var(--gray-400);padding:20px">데이터 없음</p>';
      return;
    }

    const d = passRates[type];
    let html = '<table class="pass-table"><thead><tr>';
    d.headers.forEach(h => { html += '<th>' + escapeHtml(h) + '</th>'; });
    html += '</tr></thead><tbody>';
    d.data.forEach(row => {
      html += '<tr><td style="font-weight:700;background:var(--gray-50)">' + escapeHtml(row.label) + '</td>';
      row.values.forEach(v => { html += '<td>' + escapeHtml(v) + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  };

  window.startQuickQuiz = function () {
    // Random 10 questions
    const shuffled = shuffleArray([...questions]);
    quizQuestions = shuffled.slice(0, 10);
    quizIndex = 0;
    quizAnswers = {};
    showQuizActive();
    renderQuestion();
  };

  window.startWrongReview = function () {
    const wrongIds = Object.keys(state.solved).filter(id => !state.solved[id].correct);
    if (wrongIds.length === 0) {
      alert('오답이 없습니다!');
      return;
    }
    quizQuestions = questions.filter(q => wrongIds.includes(q.id));
    quizQuestions = shuffleArray(quizQuestions);
    quizIndex = 0;
    quizAnswers = {};
    navigateTo('quiz');
    showQuizActive();
    renderQuestion();
  };

  window.startBookmarkReview = function () {
    if (state.bookmarks.length === 0) {
      alert('북마크된 문제가 없습니다!');
      return;
    }
    quizQuestions = questions.filter(q => state.bookmarks.includes(q.id));
    quizIndex = 0;
    quizAnswers = {};
    navigateTo('quiz');
    showQuizActive();
    renderQuestion();
  };

  window.resetProgress = function () {
    if (confirm('모든 학습 기록이 초기화됩니다. 계속하시겠습니까?')) {
      state = { solved: {}, bookmarks: [], fcCards: {} };
      saveState();
      updateHome();
      updateAnalytics();
      alert('학습 기록이 초기화되었습니다.');
    }
  };

  // ── QUIZ ──
  function initFilters() {
    // Year filters
    const years = [...new Set(questions.map(q => q.exam_year))].sort();
    const yearBar = document.getElementById('year-filter');
    if (yearBar) {
      yearBar.innerHTML = years.map(y =>
        '<button class="filter-chip active" onclick="toggleYearFilter(this)" data-value="' + y + '">' + y + '년</button>'
      ).join('');
    }

    // Subject filters
    const subjects = [...new Set(questions.map(q => q.subject))];
    const subBar = document.getElementById('subject-filter');
    if (subBar) {
      subBar.innerHTML = subjects.map(s =>
        '<button class="filter-chip active" onclick="toggleSubjectFilter(this)" data-value="' + s + '">' +
        (subjectShortNames[s] || s) + '</button>'
      ).join('');
    }

    updateSelectedCount();
  }

  window.toggleYearFilter = function (el) {
    el.classList.toggle('active');
    updateSelectedCount();
  };

  window.toggleSubjectFilter = function (el) {
    el.classList.toggle('active');
    updateSelectedCount();
  };

  function getFilteredQuestions() {
    const yearBtns = document.querySelectorAll('#year-filter .filter-chip.active');
    const subBtns = document.querySelectorAll('#subject-filter .filter-chip.active');
    const selectedYears = [...yearBtns].map(b => parseInt(b.dataset.value));
    const selectedSubjects = [...subBtns].map(b => b.dataset.value);

    return questions.filter(q =>
      selectedYears.includes(q.exam_year) && selectedSubjects.includes(q.subject)
    );
  }

  function updateSelectedCount() {
    const cnt = getFilteredQuestions().length;
    setText('selected-count', cnt);
  }

  window.selectMode = function (mode) {
    quizMode = mode;
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    const el = document.getElementById('mode-' + mode);
    if (el) el.classList.add('selected');
  };

  window.startQuiz = function () {
    let filtered = getFilteredQuestions();
    if (filtered.length === 0) {
      alert('선택된 문제가 없습니다. 필터를 확인해주세요.');
      return;
    }

    if (quizMode === 'random') {
      filtered = shuffleArray([...filtered]);
    } else if (quizMode === 'weak') {
      // Prioritize wrong answers, then unsolved, then correct
      filtered = [...filtered].sort((a, b) => {
        const sa = state.solved[a.id];
        const sb = state.solved[b.id];
        const scoreA = sa ? (sa.correct ? 2 : 0) : 1;
        const scoreB = sb ? (sb.correct ? 2 : 0) : 1;
        return scoreA - scoreB;
      });
    }

    quizQuestions = filtered;
    quizIndex = 0;
    quizAnswers = {};
    showQuizActive();
    renderQuestion();
  };

  function showQuizActive() {
    document.getElementById('quiz-setup').style.display = 'none';
    document.getElementById('quiz-active').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
  }

  window.showQuizSetup = function () {
    document.getElementById('quiz-setup').style.display = 'block';
    document.getElementById('quiz-active').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';
    updateSelectedCount();
  };

  // Helper: parse answer string (handles "2", "2,3", "1,2,3,4" etc.)
  function parseCorrectAnswers(answerStr) {
    return String(answerStr).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  }

  function isCorrectAnswer(selectedNum, answerStr) {
    const corrects = parseCorrectAnswers(answerStr);
    return corrects.includes(selectedNum);
  }

  function renderQuestion() {
    if (quizQuestions.length === 0) return;

    const q = quizQuestions[quizIndex];
    const total = quizQuestions.length;
    const answered = quizAnswers[quizIndex] !== undefined;
    const selectedOpt = quizAnswers[quizIndex];
    const correctAnswers = parseCorrectAnswers(q.answer);
    const isMultiAnswer = correctAnswers.length > 1;

    // Progress
    setText('quiz-progress', (quizIndex + 1) + ' / ' + total);
    const bar = document.getElementById('quiz-progress-bar');
    if (bar) bar.style.width = ((quizIndex + 1) / total * 100) + '%';

    // Bookmark
    const bmBtn = document.getElementById('quiz-bookmark');
    if (bmBtn) {
      bmBtn.textContent = state.bookmarks.includes(q.id) ? '★' : '☆';
      bmBtn.className = 'bookmark-btn' + (state.bookmarks.includes(q.id) ? ' active' : '');
    }

    // Question area
    const area = document.getElementById('quiz-question-area');
    const shortSubject = subjectShortNames[q.subject] || q.subject;

    let html = '<div class="question-card">';
    html += '<div class="q-meta">';
    html += '<span class="q-badge year">' + q.exam_year + '년 ' + q.round + '회</span>';
    html += '<span class="q-badge subject">' + escapeHtml(shortSubject) + '</span>';
    html += '<span class="q-badge number">' + q.number + '번</span>';

    if (isMultiAnswer) {
      html += '<span class="q-badge" style="background:var(--warning-light);color:var(--warning)">복수정답</span>';
    }

    // Cross-reference law articles
    const lawRefs = extractLawRefs(q.explanation);
    lawRefs.forEach(ref => {
      html += ' <span class="q-badge law-link" onclick="goToLawArticle(\'' + escapeHtml(ref) + '\')" title="법령 조문 보기">⚖️ ' + escapeHtml(ref) + '</span>';
    });

    html += '</div>';
    html += '<div class="q-text">' + escapeHtml(q.question) + '</div>';

    // Options
    q.options.forEach((opt, i) => {
      const num = i + 1;
      let cls = 'option-btn';
      if (answered) {
        if (correctAnswers.includes(num)) cls += ' correct';
        else if (num === selectedOpt && !correctAnswers.includes(num)) cls += ' wrong';
        else cls += ' dimmed';
      }
      html += '<button class="' + cls + '" ' + (answered ? 'disabled' : 'onclick="selectAnswer(' + num + ')"') + '>';
      html += '<span class="opt-num">' + num + '</span>';
      html += '<span>' + escapeHtml(opt) + '</span>';
      html += '</button>';
    });

    // Explanation
    if (answered) {
      html += '<div class="explanation-box show">' + formatExplanation(q.explanation) + '</div>';
      if (q.memory_tip) {
        html += '<div class="memory-tip-box show">💡 ' + escapeHtml(q.memory_tip) + '</div>';
      }
    }

    html += '</div>';
    area.innerHTML = html;

    // Nav button text
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
      if (quizIndex === total - 1 && answered) {
        nextBtn.textContent = '결과 보기 ▶';
      } else {
        nextBtn.textContent = '다음 ▶';
      }
    }
  }

  window.selectAnswer = function (num) {
    if (quizAnswers[quizIndex] !== undefined) return;

    const q = quizQuestions[quizIndex];
    const isCorrect = isCorrectAnswer(num, q.answer);

    quizAnswers[quizIndex] = num;

    // Save to state
    state.solved[q.id] = {
      correct: isCorrect,
      count: (state.solved[q.id]?.count || 0) + 1,
      lastDate: new Date().toISOString(),
      selectedAnswer: num
    };
    saveState();

    renderQuestion();
  };

  window.toggleBookmark = function () {
    if (quizQuestions.length === 0) return;
    const q = quizQuestions[quizIndex];
    const idx = state.bookmarks.indexOf(q.id);
    if (idx > -1) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push(q.id);
    }
    saveState();
    renderQuestion();
  };

  window.quizPrev = function () {
    if (quizIndex > 0) {
      quizIndex--;
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  window.quizNext = function () {
    const total = quizQuestions.length;
    if (quizIndex < total - 1) {
      quizIndex++;
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (quizAnswers[quizIndex] !== undefined) {
      showQuizResult();
    }
  };

  function showQuizResult() {
    document.getElementById('quiz-active').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';

    const total = quizQuestions.length;
    let correct = 0;
    const wrongList = [];

    for (let i = 0; i < total; i++) {
      const q = quizQuestions[i];
      const selected = quizAnswers[i];
      const correctAnswers = parseCorrectAnswers(q.answer);
      if (correctAnswers.includes(selected)) {
        correct++;
      } else if (selected !== undefined) {
        wrongList.push({ q, selected, correctOpt: q.answer, index: i });
      }
    }

    const pct = Math.round((correct / total) * 100);
    setText('result-score', pct + '%');
    setText('result-detail', correct + ' / ' + total + ' 정답');

    // Wrong list
    const wrongContainer = document.getElementById('result-wrong-list');
    if (wrongList.length === 0) {
      wrongContainer.innerHTML = '<div class="card" style="text-align:center;padding:24px;color:var(--success)"><p style="font-size:16px;font-weight:700">🎉 전문 정답!</p></div>';
    } else {
      let html = '';
      wrongList.forEach(w => {
        const shortSubject = subjectShortNames[w.q.subject] || w.q.subject;
        html += '<div class="wrong-answer-item">';
        html += '<div class="q-meta" style="margin-bottom:8px">';
        html += '<span class="q-badge year">' + w.q.exam_year + '년</span>';
        html += '<span class="q-badge subject">' + escapeHtml(shortSubject) + '</span>';
        html += '<span class="q-badge number">' + w.q.number + '번</span>';
        html += '</div>';
        html += '<div class="wa-question">' + escapeHtml(w.q.question) + '</div>';
        html += '<div class="wa-detail">';
        html += '<span class="wa-wrong">내 답: ' + w.selected + '번</span> · ';
        html += '<span class="wa-correct">정답: ' + w.correctOpt + '번</span>';
        html += '</div></div>';
      });
      wrongContainer.innerHTML = html;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.reviewWrongFromResult = function () {
    const wrongQs = [];
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      const selected = quizAnswers[i];
      const correctAnswers = parseCorrectAnswers(q.answer);
      if (selected !== undefined && !correctAnswers.includes(selected)) {
        wrongQs.push(q);
      }
    }
    if (wrongQs.length === 0) {
      alert('오답이 없습니다!');
      return;
    }
    quizQuestions = wrongQs;
    quizIndex = 0;
    quizAnswers = {};
    showQuizActive();
    renderQuestion();
  };

  // ── FLASHCARD ──
  function initFlashcards() {
    // Init SR state for new cards
    flashcards.forEach(card => {
      if (!state.fcCards[card.id]) {
        state.fcCards[card.id] = { level: 0, nextReview: 0 };
      }
    });
    saveState();

    // Subject filters
    const subjects = [...new Set(flashcards.map(c => c.subject))];
    const filterBar = document.getElementById('fc-subject-filter');
    if (filterBar) {
      filterBar.innerHTML = subjects.map(s =>
        '<button class="filter-chip active" onclick="toggleFcSubject(this)" data-value="' + s + '">' +
        (subjectShortNames[s] || s) + '</button>'
      ).join('');
    }

    filterFlashcards();
  }

  function filterFlashcards() {
    const activeBtns = document.querySelectorAll('#fc-subject-filter .filter-chip.active');
    const selectedSubjects = [...activeBtns].map(b => b.dataset.value);
    const now = Date.now();

    // Filter by subject
    let filtered = flashcards.filter(c => selectedSubjects.includes(c.subject));

    // Sort by SR: due cards first, then new, then mastered
    filtered.sort((a, b) => {
      const sa = state.fcCards[a.id] || { level: 0, nextReview: 0 };
      const sb = state.fcCards[b.id] || { level: 0, nextReview: 0 };

      // Due for review
      const aDue = sa.nextReview <= now ? 0 : 1;
      const bDue = sb.nextReview <= now ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;

      // Lower level first
      return sa.level - sb.level;
    });

    fcDeck = filtered;
    fcIndex = 0;
    fcFlipped = false;
    renderFlashcard();
  }

  window.toggleFcSubject = function (el) {
    el.classList.toggle('active');
    filterFlashcards();
  };

  function renderFlashcard() {
    if (fcDeck.length === 0) {
      setText('fc-front', '선택된 카드가 없습니다');
      setText('fc-back', '');
      setText('fc-progress', '0 / 0');
      return;
    }

    const card = fcDeck[fcIndex];
    const sr = state.fcCards[card.id] || { level: 0, nextReview: 0 };

    setHtml('fc-front', escapeHtml(card.front).replace(/\n/g, '<br>'));
    setHtml('fc-back', escapeHtml(card.back).replace(/\n/g, '<br>'));
    setText('fc-progress', (fcIndex + 1) + ' / ' + fcDeck.length);

    // Reset flip
    const fcEl = document.getElementById('flashcard');
    if (fcEl) {
      fcEl.classList.remove('flipped');
      fcFlipped = false;
    }

    // SR Badge
    const badge = document.getElementById('fc-sr-badge');
    if (badge) {
      const levelNames = ['새 카드', '학습중', '복습', '마스터'];
      const levelClasses = ['sr-new', 'sr-learning', 'sr-review', 'sr-review'];
      badge.textContent = levelNames[sr.level] || '새 카드';
      badge.className = 'sr-badge ' + (levelClasses[sr.level] || 'sr-new');
    }

    // Known count
    const knownCount = Object.values(state.fcCards).filter(c => c.level >= 3).length;
    setText('fc-known-count', knownCount);
    setText('fc-total-count', flashcards.length);
  }

  window.flipCard = function () {
    const fcEl = document.getElementById('flashcard');
    if (fcEl) {
      fcEl.classList.toggle('flipped');
      fcFlipped = !fcFlipped;
    }
  };

  window.fcKnow = function () {
    if (fcDeck.length === 0) return;
    const card = fcDeck[fcIndex];
    const sr = state.fcCards[card.id] || { level: 0, nextReview: 0 };

    // Level up
    sr.level = Math.min(sr.level + 1, 3);

    // Set next review time based on level
    const intervals = [600000, 86400000, 604800000]; // 10min, 1day, 7days
    if (sr.level <= 2) {
      sr.nextReview = Date.now() + intervals[sr.level - 1];
    } else {
      sr.nextReview = Date.now() + 2592000000; // 30 days for mastered
    }

    state.fcCards[card.id] = sr;
    saveState();
    fcNextCard();
  };

  window.fcDontKnow = function () {
    if (fcDeck.length === 0) return;
    const card = fcDeck[fcIndex];

    // Reset to level 0
    state.fcCards[card.id] = { level: 0, nextReview: 0 };
    saveState();
    fcNextCard();
  };

  window.fcSkip = function () {
    if (fcDeck.length === 0) return;
    fcNextCard();
  };

  function fcNextCard() {
    if (fcDeck.length === 0) return;
    if (fcIndex < fcDeck.length - 1) {
      fcIndex++;
    } else {
      fcIndex = 0;
    }
    fcFlipped = false;
    renderFlashcard();
  }

  // ── LAW VIEWER ──
  function initLaw() {
    renderLaw(parsedLaws.sangbub);
  }

  function parseLaw(text) {
    const articles = [];
    // Clean up noise
    const lines = text.split('\n').filter(l => !l.includes('조문체계도버튼') && l.trim() !== '');

    let currentArticle = null;
    let currentContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match article headers like "제1조(목적)" or "제638조(보험계약의 의의)"
      const articleMatch = line.match(/^(제\d+조(?:의\d+)?)\s*(\(.*?\))?\s*(.*)/);

      if (articleMatch) {
        // Save previous article
        if (currentArticle) {
          articles.push({
            title: currentArticle,
            content: currentContent.join('\n')
          });
        }
        currentArticle = articleMatch[1] + (articleMatch[2] || '');
        currentContent = [line];
      } else if (line.match(/^제\d+장\s/) || line.match(/^제\d+절\s/)) {
        // Chapter/section header
        if (currentArticle) {
          articles.push({
            title: currentArticle,
            content: currentContent.join('\n')
          });
          currentArticle = null;
          currentContent = [];
        }
        articles.push({
          title: line,
          content: '',
          isChapter: true
        });
      } else if (currentArticle) {
        currentContent.push(line);
      } else if (line.match(/^제\d+편\s/) || i < 5) {
        // Title or initial lines
        if (!currentArticle) {
          articles.push({ title: line, content: '', isChapter: true });
        }
      }
    }

    // Push last article
    if (currentArticle) {
      articles.push({
        title: currentArticle,
        content: currentContent.join('\n')
      });
    }

    return articles;
  }

  function renderLaw(articles, query) {
    const container = document.getElementById('law-content');
    if (!articles || articles.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>조문을 불러올 수 없습니다</p></div>';
      return;
    }

    let html = '';
    let visibleCount = 0;

    articles.forEach((art, idx) => {
      let titleHtml = escapeHtml(art.title);
      let contentHtml = escapeHtml(art.content);

      // If searching, filter and highlight
      if (query) {
        const lowerTitle = art.title.toLowerCase();
        const lowerContent = art.content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerTitle.includes(lowerQuery) && !lowerContent.includes(lowerQuery)) {
          return; // Skip non-matching
        }
        titleHtml = highlightText(art.title, query);
        contentHtml = highlightText(art.content, query);
      }

      visibleCount++;

      if (art.isChapter) {
        html += '<div class="law-article" style="background:var(--primary-light);padding:12px 16px;margin:8px 0;border-radius:8px;border-bottom:none">';
        html += '<div class="law-title" style="margin-bottom:0;font-size:14px">' + titleHtml + '</div>';
        html += '</div>';
      } else {
        html += '<div class="law-article" id="law-art-' + idx + '">';
        html += '<div class="law-title">' + titleHtml + '</div>';
        if (art.content) {
          html += '<div style="white-space:pre-wrap">' + contentHtml + '</div>';
        }
        html += '</div>';
      }
    });

    if (query && visibleCount === 0) {
      html = '<div class="empty-state"><div class="empty-icon">🔍</div><p>"' + escapeHtml(query) + '"에 대한 검색 결과가 없습니다</p></div>';
    }

    container.innerHTML = html;
  }

  window.switchLaw = function (tab, btn) {
    currentLawTab = tab;

    if (btn) {
      document.querySelectorAll('#law-tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    // Clear search
    const searchInput = document.getElementById('law-search-input');
    if (searchInput) searchInput.value = '';

    renderLaw(parsedLaws[tab]);
  };

  window.searchLaw = function () {
    const input = document.getElementById('law-search-input');
    const query = input ? input.value.trim() : '';
    renderLaw(parsedLaws[currentLawTab], query);
  };

  window.goToLawArticle = function (ref) {
    // Navigate to law page and search for the reference
    navigateTo('law');

    // Determine which law tab based on reference
    const refLower = ref.toLowerCase();
    if (refLower.includes('손해평가') || refLower.includes('평가요령')) {
      switchLaw('guideline', document.querySelectorAll('#law-tab-bar .tab-btn')[2]);
    } else if (refLower.includes('재해보험') || refLower.includes('농어업')) {
      switchLaw('insurance', document.querySelectorAll('#law-tab-bar .tab-btn')[1]);
    } else {
      switchLaw('sangbub', document.querySelectorAll('#law-tab-bar .tab-btn')[0]);
    }

    // Search for the article number
    const artNum = ref.match(/제\d+조(?:의\d+)?/);
    if (artNum) {
      setTimeout(() => {
        const searchInput = document.getElementById('law-search-input');
        if (searchInput) {
          searchInput.value = artNum[0];
          searchLaw();
        }
      }, 100);
    }
  };

  // ── SUMMARY ──
  function initSummary() {
    const sections = [
      {
        title: '📘 상법 보험편 핵심정리',
        content: `
<h4>1. 보험계약 총론</h4>
<ul>
<li><strong>보험계약의 의의(제638조)</strong>: 보험료 지급 → 불확정 사고 시 보험금 지급 약정. 낙성·불요식·유상·쌍무·사행계약</li>
<li><strong>보험계약 성립(제638조의2)</strong>: 청약+보험료 수령 후 30일 내 낙부 통지. 해태 시 승낙 간주</li>
<li><strong>약관 교부·설명의무(제638조의3)</strong>: 위반 시 성립일로부터 3개월 내 취소 가능</li>
<li><strong>타인을 위한 보험(제639조)</strong>: 위임 없이도 체결 가능. 손해보험은 고지의무 있음</li>
<li><strong>보험증권(제640조)</strong>: 보험자는 계약 성립 시 지체없이 교부</li>
</ul>

<h4>2. 고지의무·통지의무</h4>
<ul>
<li><strong>고지의무(제651조)</strong>: 계약 체결 시 중요사항 고지. 위반 시 해지 가능(1개월 내, 알게 된 날부터)</li>
<li><strong>통지의무(제652조)</strong>: 계약 후 위험 현저히 변경·증가 시 지체없이 통지</li>
<li><strong>위험변경증가(제653조)</strong>: 통지의무 위반 → 1개월 내 해지 가능</li>
</ul>

<h4>3. 보험금 청구와 소멸시효</h4>
<ul>
<li><strong>보험금 청구권 소멸시효</strong>: 3년(보험금), 3년(보험료반환), 2년(보험료)</li>
<li><strong>보험사고 발생 통지</strong>: 지체없이 보험자에게 통지</li>
</ul>

<h4>4. 강행규정(제663조) ★★★</h4>
<ul>
<li>보험계약자·피보험자·보험수익자에게 <strong>불리하게 변경 불가</strong></li>
<li>단, 해상보험 등 기업성 보험은 예외</li>
</ul>

<h4>5. 손해보험 핵심</h4>
<ul>
<li><strong>피보험이익(제668조)</strong>: 금전으로 산정할 수 있는 이익</li>
<li><strong>초과보험(제669조)</strong>: 보험금액이 보험가액 초과 → 초과부분 무효</li>
<li><strong>중복보험(제672조)</strong>: 여러 보험자의 보상총액이 보험가액 초과 시 각 보험자 비례보상</li>
<li><strong>보험대위(제681·682조)</strong>: 잔존물대위(전부보험 시), 청구권대위(제3자 책임)</li>
</ul>

<h4>6. 인보험 핵심</h4>
<ul>
<li><strong>생명보험(제730조~)</strong>: 타인의 생명 → 서면동의 필요. 15세 미만·심신상실자·심신박약자 사망보험 무효</li>
<li><strong>상해보험(제737조~)</strong>: 손해보험 성격. 잔존물대위·청구권대위 없음</li>
<li><strong>사기에 의한 초과보험</strong>: 계약 전부 무효</li>
</ul>
        `
      },
      {
        title: '📗 농어업재해보험법령 핵심정리',
        content: `
<h4>1. 총칙</h4>
<ul>
<li><strong>목적(제1조)</strong>: 농어업재해로 인한 손해 보상 → 경영 안정 + 생산성 향상 + 국민경제 발전</li>
<li><strong>정의(제2조)</strong>: 농업재해=자연재해·병충해·조수해·질병·화재 / 어업재해=자연재해·질병·화재</li>
<li><strong>보험가입금액</strong>: 최대 보상 한도액 / <strong>보험료</strong>: 가입자→사업자 납부 / <strong>보험금</strong>: 사업자→가입자 지급</li>
</ul>

<h4>2. 재해보험사업</h4>
<ul>
<li><strong>보험사업자(제7조)</strong>: 농협(농작물·가축), 산림조합(임산물), 수협(양식수산물)</li>
<li><strong>보험목적물</strong>: 농작물, 임산물, 가축, 양식수산물, 농어업용 시설물</li>
<li><strong>국가·지자체 지원(제19조)</strong>: 보험료 일부 보조, 운영비 지원</li>
</ul>

<h4>3. 손해평가(제11조) ★★★</h4>
<ul>
<li><strong>손해평가인</strong>: 재해보험사업자가 위촉. 실무교육 이수 필요</li>
<li><strong>손해평가사(제11조의4)</strong>: 1차·2차 시험 합격자. 자격증 발급</li>
<li><strong>손해평가 절차</strong>: 피해사실 확인 → 보험가액 및 손해액 평가 → 보험금 산정</li>
<li><strong>교차손해평가(제12조)</strong>: 공정성 확보를 위해 다른 지역 손해평가인이 재평가</li>
</ul>

<h4>4. 재보험(제20조)</h4>
<ul>
<li>정부가 재보험사업 실시. 재해보험사업자가 보험의 위험 일부를 정부에 전가</li>
<li>농업재해재보험기금 설치·운용</li>
</ul>

<h4>5. 벌칙</h4>
<ul>
<li><strong>1년 이하 징역/1천만원 이하 벌금</strong>: 거짓·부정한 방법으로 보험금 수령</li>
<li><strong>500만원 이하 과태료</strong>: 손해평가 방해·거부, 자료 미제출</li>
</ul>
        `
      },
      {
        title: '📙 손해평가요령 핵심정리',
        content: `
<h4>1. 총칙</h4>
<ul>
<li><strong>손해평가(제1~2조)</strong>: 피해사실 확인 + 평가하는 일련의 과정</li>
<li><strong>손해평가인</strong>: 재해보험사업자가 위촉 / <strong>손해평가사</strong>: 자격시험 합격자</li>
<li><strong>손해평가보조인</strong>: 손해평가 업무를 보조</li>
</ul>

<h4>2. 손해평가반 구성(제7조) ★★★</h4>
<ul>
<li><strong>2인 이상 1조</strong>로 손해평가반 구성</li>
<li>손해평가인 또는 손해평가사가 반드시 포함</li>
<li>보험가입자는 손해평가반에 포함 불가</li>
</ul>

<h4>3. 손해평가 절차</h4>
<ul>
<li>①피해접수 → ②현장확인 → ③손해평가 실시 → ④평가결과 통보</li>
<li>평가결과에 이의가 있는 경우 <strong>재평가 신청</strong> 가능</li>
</ul>

<h4>4. 교차손해평가(제12조) ★★★</h4>
<ul>
<li><strong>목적</strong>: 손해평가의 공정성과 객관성 확보</li>
<li>다른 지역의 손해평가인·손해평가사가 실시</li>
<li>재해보험사업자가 필요시 실시</li>
</ul>

<h4>5. 보험금 산정</h4>
<ul>
<li>손해액 = 보험가액 × 피해율</li>
<li>보험금 = 손해액 - 자기부담금(지급공제액)</li>
<li>자기부담비율: 품목별·상품별 상이</li>
</ul>
        `
      },
      {
        title: '📕 농학개론(재배학·원예작물학) 핵심정리',
        content: `
<h4>1. 재배학 기초</h4>
<ul>
<li><strong>작물 분류</strong>: 식용작물(곡류·두류·서류), 공예작물(섬유·유지·당료), 사료작물, 녹비작물</li>
<li><strong>필수원소 16종</strong>: 다량(C,H,O,N,P,K,Ca,Mg,S) + 미량(Fe,Mn,B,Zn,Cu,Mo,Cl)</li>
<li><strong>비료 3요소</strong>: N(질소)-잎 생장, P(인산)-뿌리·개화, K(칼리)-줄기 강화·내병성</li>
</ul>

<h4>2. 광합성과 환경</h4>
<ul>
<li><strong>광포화점</strong>: C3식물 낮음, C4식물 높음</li>
<li><strong>광주성(일장효과)</strong>: 장일식물(밀,보리,시금치), 단일식물(벼,콩,국화,코스모스), 중일식물(토마토,옥수수)</li>
<li><strong>춘화처리(버널리제이션)</strong>: 저온 경과 후 개화 촉진. 추파맥류, 양배추 등</li>
</ul>

<h4>3. 토양과 수분</h4>
<ul>
<li><strong>토양산도</strong>: 대부분 작물 pH 6.0~7.0 적합. 산성토양→석회 시용</li>
<li><strong>수분</strong>: 포장용수량(pF 1.8~2.5), 위조점(pF 4.2), 유효수분=포장용수량-위조점</li>
<li><strong>관수 방법</strong>: 지면관수, 살수관수(스프링클러), 점적관수(드립)</li>
</ul>

<h4>4. 원예작물학</h4>
<ul>
<li><strong>채소 분류</strong>: 과채류(토마토,고추,오이), 엽경채류(배추,상추,시금치), 근채류(무,당근)</li>
<li><strong>과수 결과습성</strong>: 당년지(포도,감), 전년지(사과,배,복숭아), 2년지(감귤류 일부)</li>
<li><strong>접목</strong>: 대목(뿌리)+접수(줄기). 내병성·내한성 향상 목적</li>
</ul>

<h4>5. 병충해와 재해</h4>
<ul>
<li><strong>병해 3요소</strong>: 병원체 + 기주(작물) + 환경</li>
<li><strong>생리장해</strong>: 영양결핍, 일소, 냉해, 동해, 도복(쓰러짐)</li>
<li><strong>농업기상재해</strong>: 한해(가뭄), 수해(침수), 풍해, 냉해, 상해(서리), 설해(눈)</li>
</ul>

<h4>6. 주요 암기 포인트</h4>
<ul>
<li><strong>질소 결핍</strong>: 하위엽 황화 / <strong>칼리 결핍</strong>: 하위엽 가장자리 갈변</li>
<li><strong>철 결핍</strong>: 상위엽(신엽) 황백화 / <strong>붕소 결핍</strong>: 생장점 고사</li>
<li><strong>역선택</strong>: 고위험자가 보험에 많이 가입(정보비대칭) / <strong>도덕적 해이</strong>: 보험가입 후 주의태만</li>
</ul>
        `
      }
    ];

    const container = document.getElementById('summary-content');
    if (!container) return;

    let html = '';
    sections.forEach((sec, i) => {
      html += '<div class="summary-section">';
      html += '<div class="section-header" onclick="toggleSection(this)">';
      html += '<h3>' + sec.title + '</h3>';
      html += '<span class="arrow">▼</span>';
      html += '</div>';
      html += '<div class="summary-body">' + sec.content + '</div>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  window.toggleSection = function (el) {
    el.classList.toggle('open');
    const body = el.nextElementSibling;
    if (body) body.classList.toggle('open');
  };

  // ── ANALYTICS ──
  function updateAnalytics() {
    const solvedIds = Object.keys(state.solved);
    const totalSolved = solvedIds.length;
    const correctCount = solvedIds.filter(id => state.solved[id].correct).length;
    const wrongCount = totalSolved - correctCount;

    setText('anal-total', totalSolved);
    setText('anal-correct', correctCount);
    setText('anal-wrong', wrongCount);

    // Per Subject
    renderSubjectStats();

    // Per Year
    renderYearChart();

    // Weak points
    renderWeakPoints();

    // Recent wrong
    renderRecentWrong();
  }

  function renderSubjectStats() {
    const container = document.getElementById('anal-subjects');
    if (!container) return;

    const subjects = [...new Set(questions.map(q => q.subject))];
    let html = '';

    subjects.forEach(sub => {
      const subQs = questions.filter(q => q.subject === sub);
      const solvedInSub = subQs.filter(q => state.solved[q.id]);
      const correctInSub = solvedInSub.filter(q => state.solved[q.id].correct);
      const totalInSub = subQs.length;
      const solvedCount = solvedInSub.length;
      const correctPct = solvedCount > 0 ? Math.round((correctInSub.length / solvedCount) * 100) : 0;
      const progressPct = totalInSub > 0 ? Math.round((solvedCount / totalInSub) * 100) : 0;
      const shortName = subjectShortNames[sub] || sub;

      html += '<div style="margin-bottom:16px">';
      html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px">';
      html += '<span style="font-size:13px;font-weight:600">' + escapeHtml(shortName) + '</span>';
      html += '<span style="font-size:13px;font-weight:700;color:var(--primary)">' + correctPct + '%</span>';
      html += '</div>';
      html += '<div class="progress-bar-container" style="margin-top:0;height:10px">';
      html += '<div class="progress-bar-fill" style="width:' + correctPct + '%;transition:width 0.5s"></div>';
      html += '</div>';
      html += '<div style="font-size:11px;color:var(--gray-400);margin-top:4px">' + solvedCount + '/' + totalInSub + '문제 풀음 (' + progressPct + '%)</div>';
      html += '</div>';
    });

    if (html === '') {
      html = '<div class="empty-state" style="padding:24px"><div class="empty-icon">📊</div><p>아직 풀은 문제가 없습니다</p></div>';
    }

    container.innerHTML = html;
  }

  function renderYearChart() {
    const container = document.getElementById('anal-year-chart');
    if (!container) return;

    const years = [...new Set(questions.map(q => q.exam_year))].sort();
    let maxCount = 1;
    const yearData = [];

    years.forEach(year => {
      const yearQs = questions.filter(q => q.exam_year === year);
      const solved = yearQs.filter(q => state.solved[q.id]);
      const correct = solved.filter(q => state.solved[q.id].correct).length;
      const wrong = solved.length - correct;
      if (solved.length > maxCount) maxCount = solved.length;
      yearData.push({ year, correct, wrong, total: solved.length });
    });

    let html = '';
    yearData.forEach(d => {
      const correctH = d.total > 0 ? Math.max((d.correct / maxCount) * 100, 4) : 4;
      const wrongH = d.total > 0 ? Math.max((d.wrong / maxCount) * 100, 0) : 0;
      const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;

      html += '<div class="chart-bar-group">';
      html += '<div class="chart-bar-value" style="color:' + (pct >= 60 ? 'var(--success)' : 'var(--danger)') + '">' + (d.total > 0 ? pct + '%' : '-') + '</div>';
      html += '<div style="display:flex;flex-direction:column;align-items:center;width:100%">';
      if (wrongH > 0) {
        html += '<div class="chart-bar wrong" style="height:' + wrongH + 'px;width:100%"></div>';
      }
      html += '<div class="chart-bar correct" style="height:' + correctH + 'px;width:100%"></div>';
      html += '</div>';
      html += '<div class="chart-bar-label">' + d.year + '</div>';
      html += '</div>';
    });

    if (yearData.every(d => d.total === 0)) {
      container.innerHTML = '<div class="empty-state" style="padding:24px;height:auto"><div class="empty-icon">📊</div><p>아직 풀은 문제가 없습니다</p></div>';
    } else {
      container.innerHTML = html;
    }
  }

  function renderWeakPoints() {
    const container = document.getElementById('anal-weak');
    if (!container) return;

    // Group by memory_tip
    const tipGroups = {};
    questions.forEach(q => {
      if (!state.solved[q.id]) return;
      const tip = q.memory_tip || '기타';
      if (!tipGroups[tip]) tipGroups[tip] = { total: 0, wrong: 0 };
      tipGroups[tip].total++;
      if (!state.solved[q.id].correct) tipGroups[tip].wrong++;
    });

    // Sort by wrong rate
    const sorted = Object.entries(tipGroups)
      .filter(([, v]) => v.total >= 1 && v.wrong > 0)
      .map(([tip, v]) => ({ tip, wrongRate: Math.round((v.wrong / v.total) * 100), wrong: v.wrong, total: v.total }))
      .sort((a, b) => b.wrongRate - a.wrongRate)
      .slice(0, 10);

    if (sorted.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:24px"><div class="empty-icon">🎯</div><p>오답 데이터가 쌓이면 약점이 분석됩니다</p></div>';
      return;
    }

    let html = '';
    sorted.forEach(item => {
      const color = item.wrongRate >= 70 ? 'var(--danger)' : item.wrongRate >= 40 ? 'var(--warning)' : 'var(--success)';
      // Truncate tip text for display
      const displayTip = item.tip.length > 20 ? item.tip.substring(0, 20) + '...' : item.tip;
      html += '<div class="weak-item">';
      html += '<div class="weak-label" title="' + escapeHtml(item.tip) + '">' + escapeHtml(displayTip) + '</div>';
      html += '<div class="weak-bar-bg"><div class="weak-bar-fill" style="width:' + item.wrongRate + '%;background:' + color + '"></div></div>';
      html += '<div class="weak-pct" style="color:' + color + '">' + item.wrongRate + '%</div>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderRecentWrong() {
    const container = document.getElementById('anal-recent-wrong');
    if (!container) return;

    const wrongEntries = Object.entries(state.solved)
      .filter(([, v]) => !v.correct && v.lastDate)
      .sort((a, b) => new Date(b[1].lastDate) - new Date(a[1].lastDate))
      .slice(0, 10);

    if (wrongEntries.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:24px"><div class="empty-icon">✅</div><p>최근 오답이 없습니다</p></div>';
      return;
    }

    let html = '';
    wrongEntries.forEach(([qId, data]) => {
      const q = questions.find(qq => qq.id === qId);
      if (!q) return;
      const shortSubject = subjectShortNames[q.subject] || q.subject;
      html += '<div class="wrong-answer-item">';
      html += '<div class="q-meta" style="margin-bottom:6px">';
      html += '<span class="q-badge year">' + q.exam_year + '년</span>';
      html += '<span class="q-badge subject">' + escapeHtml(shortSubject) + '</span>';
      html += '<span class="q-badge number">' + q.number + '번</span>';
      html += '</div>';
      html += '<div class="wa-question">' + escapeHtml(q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question) + '</div>';
      html += '<div class="wa-detail">';
      html += '<span class="wa-wrong">내 답: ' + data.selectedAnswer + '번</span> · ';
      html += '<span class="wa-correct">정답: ' + escapeHtml(q.answer) + '번</span>';
      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  // ── Utility Functions ──
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlightText(text, query) {
    if (!query || !text) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp('(' + escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function extractLawRefs(text) {
    if (!text) return [];
    const refs = [];
    // Match patterns like [상법 제638조], [상법 제638조의2], 제651조 etc.
    const matches = text.match(/(?:상법\s*)?제\d+조(?:의\d+)?/g);
    if (matches) {
      const unique = [...new Set(matches)];
      unique.forEach(m => {
        if (!refs.includes(m)) refs.push(m);
      });
    }
    return refs.slice(0, 3); // Limit to 3 references
  }

  function formatExplanation(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    // Bold article references
    html = html.replace(/(제\d+조(?:의\d+)?(?:\([^)]*\))?)/g, '<strong style="color:var(--primary)">$1</strong>');
    // Bold markers
    html = html.replace(/(【[^】]+】)/g, '<strong>$1</strong>');
    html = html.replace(/(▶[^:\n]+)/g, '<strong style="color:var(--gray-700)">$1</strong>');
    return html;
  }

  // ── Scroll Top Button ──
  window.addEventListener('scroll', function () {
    const btn = document.getElementById('scrollTop');
    if (btn) {
      if (window.scrollY > 300) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    }
  });

  // ── Init ──
  loadState();
  loadData();
  handleRoute();

})();
