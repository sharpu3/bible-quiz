let step = 0;
let shuffled = [];
let autoMode = false;
let ttsMode = false;
let autoTimer = null;
let qSeconds = 10;
let aSeconds = 5;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const startScreen  = document.getElementById('start-screen');
const quizScreen   = document.getElementById('quiz-screen');
const doneScreen   = document.getElementById('done-screen');
const progressBar  = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const questionEl   = document.getElementById('question');
const answerCard   = document.getElementById('answer-card');
const answerText   = document.getElementById('answer-text');
const tapHint      = document.getElementById('tap-hint');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnAuto      = document.getElementById('btn-auto');
const btnTts       = document.getElementById('btn-tts');
const questionCard = document.getElementById('question-card');
const cdBarQ       = document.getElementById('countdown-bar-q');
const cdBarA       = document.getElementById('countdown-bar-a');
const modalOverlay = document.getElementById('modal-overlay');

function totalSteps() { return shuffled.length * 2; }

// TTS
function speak(text, onDone) {
  if (!ttsMode) { if (onDone) onDone(); return; }
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ko-KR';
  utter.rate = 0.9;
  if (onDone) utter.onend = onDone;
  speechSynthesis.speak(utter);
}

function stopTts() {
  speechSynthesis.cancel();
}

// 카운트다운 바
function startCountdown(seconds, barEl) {
  clearAutoTimer();
  barEl.style.transition = 'none';
  barEl.style.width = '100%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      barEl.style.transition = `width ${seconds}s linear`;
      barEl.style.width = '0%';
    });
  });
  autoTimer = setTimeout(() => goNext(true), seconds * 1000);
}

function clearAutoTimer() {
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  cdBarQ.style.transition = 'none';
  cdBarQ.style.width = '0%';
  cdBarA.style.transition = 'none';
  cdBarA.style.width = '0%';
}

function renderStep() {
  const quizIndex = Math.floor(step / 2);
  const isQuestion = step % 2 === 0;
  const quiz = shuffled[quizIndex];

  progressBar.style.width = (quizIndex / shuffled.length * 100) + '%';
  progressText.textContent = (quizIndex + 1) + ' / ' + shuffled.length;
  btnPrev.disabled = step === 0;
  btnNext.textContent = step === totalSteps() - 1 ? '완료 ✓' : '다음 ▶';

  if (isQuestion) {
    document.getElementById('card-label').textContent = '📖 Q' + quiz.number;
    questionEl.textContent = quiz.question;
    questionCard.style.display = 'flex';
    answerCard.classList.remove('visible');
    tapHint.style.opacity = (autoMode || ttsMode) ? '0' : '1';

    if (autoMode && !ttsMode) {
      // 자동만: 타이머
      startCountdown(qSeconds, cdBarQ);
    } else if (ttsMode) {
      // 읽기(단독 or 자동+읽기): 읽고 나서...
      speak(quiz.question, autoMode ? () => { autoTimer = setTimeout(() => goNext(true), 2000); } : null);
    }
  } else {
    const plainAnswer = quiz.answer.replace(/\s*\(.*\)/, '');
    const match = quiz.answer.match(/^([^(]+?)(\s*\(.*\))?$/);
    if (match && match[2]) {
      answerText.innerHTML = match[1] + '<span class="answer-sub">' + match[2].trim() + '</span>';
    } else {
      answerText.textContent = quiz.answer;
    }
    questionCard.style.display = 'none';
    tapHint.style.opacity = '0';
    answerCard.classList.add('visible');

    if (autoMode && !ttsMode) {
      // 자동만: 타이머
      startCountdown(aSeconds, cdBarA);
    } else if (ttsMode) {
      // 읽기(단독 or 자동+읽기): 읽고 나서...
      speak(plainAnswer, autoMode ? () => { autoTimer = setTimeout(() => goNext(true), 2000); } : null);
    }
  }
}

function goNext(fromAuto) {
  if (!fromAuto) {
    clearAutoTimer();
    stopTts();
  }
  if (step < totalSteps() - 1) {
    step++;
    renderStep();
  } else {
    clearAutoTimer();
    stopTts();
    quizScreen.style.display = 'none';
    doneScreen.style.display = 'flex';
  }
}

function goPrev() {
  clearAutoTimer();
  stopTts();
  if (step > 0) {
    step--;
    renderStep();
  }
}

// 자동 버튼 토글
btnAuto.addEventListener('click', () => {
  if (autoMode) {
    autoMode = false;
    clearAutoTimer();
    btnAuto.classList.remove('active');
    tapHint.style.opacity = ttsMode ? '0' : '1';
  } else {
    modalOverlay.classList.add('visible');
  }
});

// TTS 버튼 토글
btnTts.addEventListener('click', () => {
  ttsMode = !ttsMode;
  btnTts.classList.toggle('active', ttsMode);
  if (!ttsMode) {
    stopTts();
    tapHint.style.opacity = autoMode ? '0' : '1';
  } else {
    tapHint.style.opacity = '0';
    // 현재 카드 바로 읽기 시작
    const quizIndex = Math.floor(step / 2);
    const isQuestion = step % 2 === 0;
    const quiz = shuffled[quizIndex];
    if (quizIndex < shuffled.length) {
      const text = isQuestion ? quiz.question : quiz.answer.replace(/\s*\(.*\)/, '');
      speak(text, autoMode ? () => { autoTimer = setTimeout(() => goNext(true), 2000); } : null);
    }
  }
});

// 모달 확인
document.getElementById('modal-confirm').addEventListener('click', () => {
  qSeconds = parseInt(document.getElementById('q-time').value) || 10;
  aSeconds = parseInt(document.getElementById('a-time').value) || 5;
  modalOverlay.classList.remove('visible');
  autoMode = true;
  btnAuto.classList.add('active');
  // 자동만 모드일 때 현재 카드부터 타이머 시작
  if (!ttsMode) {
    const isQuestion = step % 2 === 0;
    startCountdown(isQuestion ? qSeconds : aSeconds, isQuestion ? cdBarQ : cdBarA);
  }
});

// 모달 취소
document.getElementById('modal-cancel').addEventListener('click', () => {
  modalOverlay.classList.remove('visible');
});

questionCard.addEventListener('click', () => goNext(false));
answerCard.addEventListener('click',   () => goNext(false));
btnNext.addEventListener('click',      () => goNext(false));
btnPrev.addEventListener('click', goPrev);

document.getElementById('btn-start').addEventListener('click', () => {
  step = 0;
  shuffled = shuffle(quizData);
  startScreen.style.display = 'none';
  quizScreen.style.display = 'flex';
  renderStep();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  step = 0;
  autoMode = false;
  ttsMode = false;
  btnAuto.classList.remove('active');
  btnTts.classList.remove('active');
  shuffled = shuffle(quizData);
  doneScreen.style.display = 'none';
  quizScreen.style.display = 'flex';
  renderStep();
});
