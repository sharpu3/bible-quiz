let step = 0;
let shuffled = [];
let autoMode = false;
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
const questionCard = document.getElementById('question-card');
const cdBarQ       = document.getElementById('countdown-bar-q');
const cdBarA       = document.getElementById('countdown-bar-a');
const modalOverlay = document.getElementById('modal-overlay');

function totalSteps() { return shuffled.length * 2; }

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
    tapHint.style.opacity = autoMode ? '0' : '1';
  } else {
    const match = quiz.answer.match(/^([^(]+?)(\s*\(.*\))?$/);
    if (match && match[2]) {
      answerText.innerHTML = match[1] + '<span class="answer-sub">' + match[2].trim() + '</span>';
    } else {
      answerText.textContent = quiz.answer;
    }
    questionCard.style.display = 'none';
    tapHint.style.opacity = '0';
    answerCard.classList.add('visible');
  }

  if (autoMode) {
    startCountdown(isQuestion ? qSeconds : aSeconds, isQuestion ? cdBarQ : cdBarA);
  }
}

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

function goNext(fromAuto) {
  if (!fromAuto && autoMode) {
    clearAutoTimer();
  }
  if (step < totalSteps() - 1) {
    step++;
    renderStep();
  } else {
    clearAutoTimer();
    quizScreen.style.display = 'none';
    doneScreen.style.display = 'flex';
  }
}

function goPrev() {
  if (autoMode) clearAutoTimer();
  if (step > 0) {
    step--;
    renderStep();
  }
}

function stopAuto() {
  autoMode = false;
  clearAutoTimer();
  btnAuto.classList.remove('active');
  tapHint.style.opacity = '1';
}

// 자동 버튼 토글
btnAuto.addEventListener('click', () => {
  if (autoMode) {
    stopAuto();
  } else {
    modalOverlay.classList.add('visible');
  }
});

// 모달 확인
document.getElementById('modal-confirm').addEventListener('click', () => {
  qSeconds = parseInt(document.getElementById('q-time').value) || 10;
  aSeconds = parseInt(document.getElementById('a-time').value) || 5;
  modalOverlay.classList.remove('visible');
  autoMode = true;
  btnAuto.classList.add('active');
  renderStep();
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
  btnAuto.classList.remove('active');
  shuffled = shuffle(quizData);
  doneScreen.style.display = 'none';
  quizScreen.style.display = 'flex';
  renderStep();
});
