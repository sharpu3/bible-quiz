let step = 0;
let shuffled = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const doneScreen = document.getElementById('done-screen');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const questionEl = document.getElementById('question');
const answerCard = document.getElementById('answer-card');
const answerText = document.getElementById('answer-text');
const tapHint = document.getElementById('tap-hint');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const questionCard = document.getElementById('question-card');
const totalSteps = () => shuffled.length * 2;

function renderStep() {
  const quizIndex = Math.floor(step / 2);
  const isQuestion = step % 2 === 0;
  const quiz = shuffled[quizIndex];

  const pct = (quizIndex / shuffled.length) * 100;
  progressBar.style.width = pct + '%';
  progressText.textContent = (quizIndex + 1) + ' / ' + shuffled.length;

  btnPrev.disabled = step === 0;
  btnNext.textContent = step === totalSteps() - 1 ? '완료 ✓' : '다음 ▶';

  if (isQuestion) {
    document.getElementById('card-label').textContent = '📖 Q' + quiz.number;
    questionEl.textContent = quiz.question;
    questionCard.style.display = 'flex';
    answerCard.classList.remove('visible');
    tapHint.style.opacity = '1';
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
}

function goNext() {
  if (step < totalSteps() - 1) {
    step++;
    renderStep();
  } else {
    quizScreen.style.display = 'none';
    doneScreen.style.display = 'flex';
  }
}

function goPrev() {
  if (step > 0) {
    step--;
    renderStep();
  }
}

function startQuiz() {
  step = 0;
  shuffled = shuffle(quizData);
  startScreen.style.display = 'none';
  doneScreen.style.display = 'none';
  quizScreen.style.display = 'flex';
  renderStep();
}

questionCard.addEventListener('click', goNext);
answerCard.addEventListener('click', goNext);
btnNext.addEventListener('click', goNext);
btnPrev.addEventListener('click', goPrev);

document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-restart').addEventListener('click', startQuiz);
