let current = 0;
let answered = false;

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

function showCard(index) {
  const quiz = quizData[index];
  answered = false;

  questionEl.textContent = quiz.question;
  answerText.textContent = quiz.answer;
  answerCard.classList.remove('visible');
  tapHint.style.opacity = '1';

  const pct = ((index) / quizData.length) * 100;
  progressBar.style.width = pct + '%';
  progressText.textContent = (index + 1) + ' / ' + quizData.length;

  btnPrev.disabled = index === 0;
  btnNext.textContent = index === quizData.length - 1 ? '완료 ✓' : '다음 ▶';
}

function revealAnswer() {
  if (answered) return;
  answered = true;
  answerCard.classList.add('visible');
  tapHint.style.opacity = '0';
}

questionCard.addEventListener('click', revealAnswer);

document.getElementById('btn-start').addEventListener('click', () => {
  current = 0;
  startScreen.style.display = 'none';
  doneScreen.style.display = 'none';
  quizScreen.style.display = 'flex';
  showCard(current);
});

btnPrev.addEventListener('click', () => {
  if (current > 0) {
    current--;
    showCard(current);
  }
});

btnNext.addEventListener('click', () => {
  if (current < quizData.length - 1) {
    current++;
    showCard(current);
  } else {
    quizScreen.style.display = 'none';
    doneScreen.style.display = 'flex';
  }
});

document.getElementById('btn-restart').addEventListener('click', () => {
  current = 0;
  doneScreen.style.display = 'none';
  quizScreen.style.display = 'flex';
  showCard(current);
});
