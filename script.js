const researchData = [
  {
    name: 'MIT Evolution Gym',
    org: 'Massachusetts Institute of Technology',
    type: 'Soft robot',
    method: 'Design + control co-optimization',
    goal: 'Дене құрылымы мен басқаруды бірге оңтайландыру',
    population: 80,
    generation: 1000,
    fitness: 92,
    source: 'https://cdfg.mit.edu/publications/evogym',
    sourceLabel: 'MIT Evolution Gym'
  },
  {
    name: 'Szabo 2023 Biped Robot',
    org: 'Szabo, 2023',
    type: 'Biped robot',
    method: 'Genetic Algorithm',
    goal: 'Екі аяқты роботтың жүруін және қайта тұруын дамыту',
    population: 150,
    generation: 50,
    fitness: 86,
    source: 'https://www.mdpi.com/2227-7390/11/13/2931',
    sourceLabel: 'MDPI article'
  },
  {
    name: 'M-TRAN Modular Robot',
    org: 'Tokyo Institute of Technology / AIST',
    type: 'Modular robot',
    method: 'Genetic Algorithm',
    goal: 'Модульдік робот қозғалысын синтездеу',
    population: 30,
    generation: 100,
    fitness: 78,
    source: 'https://staff.aist.go.jp/e.yoshida/papers/rm03.pdf',
    sourceLabel: 'M-TRAN PDF'
  }
];

const fitnessHistory = {
  labels: [1, 5, 10, 20, 30, 40, 50],
  mit: [18, 31, 45, 60, 73, 84, 92],
  szabo: [12, 25, 38, 55, 68, 79, 86],
  mtran: [10, 21, 33, 48, 59, 70, 78]
};

const steps = [
  ['1. Initialization', 'Бастапқы роботтар немесе қозғалыс нұсқалары жасалады. Әр индивид роботтың параметрлер жиынын білдіреді.'],
  ['2. Fitness Evaluation', 'Әр роботтың тиімділігі арнайы fitness function арқылы бағаланады.'],
  ['3. Selection', 'Ең жақсы нәтиже көрсеткен роботтар келесі кезеңге таңдалады.'],
  ['4. Crossover', 'Таңдалған роботтардың жақсы қасиеттері біріктіріліп, жаңа шешім пайда болады.'],
  ['5. Mutation', 'Кездейсоқ өзгеріс енгізіліп, алгоритм бір ғана бағытта тұрып қалмайды.'],
  ['6. New Generation', 'Жаңа ұрпақ алынып, процесс қайта жалғасады.'],
  ['7. Termination', 'Белгілі generation санына жеткенде немесе fitness жеткілікті болғанда процесс тоқтайды.']
];

const glossary = [
  ['Fitness', 'Робот сапасын көрсететін сандық баға.'],
  ['Population', 'Бір ұрпақтағы робот нұсқаларының саны.'],
  ['Generation', 'Эволюциялық циклдің бір қайталануы.'],
  ['Selection', 'Үздік индивидтерді таңдау кезеңі.'],
  ['Crossover', 'Екі шешімнің қасиеттерін біріктіру.'],
  ['Mutation', 'Кездейсоқ өзгеріс енгізу.'],
  ['Genotype', 'Роботтың ішкі параметрлік сипаттамасы.'],
  ['Phenotype', 'Роботтың сыртқы көрінісі немесе нақты қозғалысы.'],
  ['Locomotion', 'Роботтың қозғалу тәсілі.']
];

function safeGet(id) {
  return document.getElementById(id);
}

function renderResearchSelect() {
  const select = safeGet('researchSelect');
  if (!select) return;

  select.innerHTML = '';
  researchData.forEach((r, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = r.name;
    select.appendChild(option);
  });

  select.addEventListener('change', renderResearch);
  renderResearch();
}

function renderResearch() {
  const select = safeGet('researchSelect');
  const card = safeGet('selectedResearch');
  if (!select || !card) return;

  const r = researchData[Number(select.value) || 0];
  card.innerHTML = `
    <span class="chip">${r.type}</span>
    <h3>${r.name}</h3>
    <p><b>Ұйым / Автор:</b> ${r.org}</p>
    <p><b>Әдіс:</b> ${r.method}</p>
    <p><b>Мақсат:</b> ${r.goal}</p>
    <div class="formula">${r.fitness}% Fitness</div>
    <a class="btn secondary" href="${r.source}" target="_blank" rel="noopener">Дереккөзді ашу</a>
  `;
}

function renderResearchTable() {
  const tbody = document.querySelector('#researchTable tbody');
  if (!tbody) return;

  tbody.innerHTML = researchData.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.org}</td>
      <td>${r.type}</td>
      <td>${r.method}</td>
      <td>${r.population}</td>
      <td>${r.generation}</td>
      <td>${r.fitness}%</td>
    </tr>
  `).join('');
}

function renderTimeline() {
  const timeline = safeGet('algorithmTimeline');
  if (!timeline) return;
  timeline.innerHTML = steps.map(s => `<article class="timelineItem"><span>${s[0]}</span><p>${s[1]}</p></article>`).join('');
}

function renderGlossary() {
  const list = safeGet('glossaryList');
  if (!list) return;
  list.innerHTML = glossary.map(g => `<article><b>${g[0]}</b><p>${g[1]}</p></article>`).join('');
}

let chart;

function makeChart(type = 'fitness') {
  const canvas = safeGet('mainChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (chart) chart.destroy();

  const textColor = getComputedStyle(document.body).getPropertyValue('--muted') || '#9fb0c7';
  const common = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: 'rgba(159,176,199,.15)' } },
      y: { ticks: { color: textColor }, grid: { color: 'rgba(159,176,199,.15)' } }
    }
  };

  if (type === 'fitness') {
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: fitnessHistory.labels,
        datasets: [
          { label: 'MIT Evolution Gym', data: fitnessHistory.mit, tension: 0.35 },
          { label: 'Szabo Biped Robot', data: fitnessHistory.szabo, tension: 0.35 },
          { label: 'M-TRAN Modular Robot', data: fitnessHistory.mtran, tension: 0.35 }
        ]
      },
      options: common
    });
  }

  if (type === 'population') {
    chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: researchData.map(r => r.name), datasets: [{ label: 'Population', data: researchData.map(r => r.population) }] },
      options: common
    });
  }

  if (type === 'generation') {
    chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: researchData.map(r => r.name), datasets: [{ label: 'Generation', data: researchData.map(r => r.generation) }] },
      options: common
    });
  }

  if (type === 'robots') {
    chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels: researchData.map(r => r.type), datasets: [{ label: 'Robot түрлері', data: [1, 1, 1] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor } } } }
    });
  }
}

function initChartTabs() {
  document.querySelectorAll('#chartTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#chartTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      makeChart(btn.dataset.chart);
    });
  });
  makeChart();
}

function calcFitness() {
  const distanceInput = safeGet('distance');
  const stabilityInput = safeGet('stability');
  const collisionInput = safeGet('collision');
  if (!distanceInput || !stabilityInput || !collisionInput) return;

  const distanceValue = Number(distanceInput.value);
  const stabilityValue = Number(stabilityInput.value);
  const collisionValue = Number(collisionInput.value);

  safeGet('distanceVal').textContent = distanceValue;
  safeGet('stabilityVal').textContent = stabilityValue;
  safeGet('collisionVal').textContent = collisionValue;

  const result = Math.max(0, Math.round(0.45 * distanceValue + 0.45 * stabilityValue - 0.25 * collisionValue));
  safeGet('fitnessResult').textContent = result + '%';
  safeGet('fitnessComment').textContent = result >= 80
    ? 'Өте жақсы нәтиже: робот тұрақты және тиімді қозғалады.'
    : result >= 50
      ? 'Орташа нәтиже: алгоритмді әрі қарай жақсарту керек.'
      : 'Төмен нәтиже: collision көп немесе қозғалыс әлсіз.';
}

function initFitnessSliders() {
  ['distance', 'stability', 'collision'].forEach(id => {
    const input = safeGet(id);
    if (input) input.addEventListener('input', calcFitness);
  });
  calcFitness();
}

let generation = 1;
let robotDistanceValue = 12;
let robotStabilityValue = 45;
let robotFitnessValue = 28;

function trainRobot() {
  generation++;
  robotDistanceValue += Math.floor(Math.random() * 8) + 3;
  robotStabilityValue += Math.floor(Math.random() * 6) + 2;

  if (robotStabilityValue > 100) robotStabilityValue = 100;

  robotFitnessValue = Math.round(
    robotDistanceValue * 0.45 + robotStabilityValue * 0.45 + generation * 1.2
  );

  updateRobotStats();
}

function updateRobotStats() {
  safeGet('generation').innerText = generation;
  safeGet('robotDistance').innerText = robotDistanceValue;
  safeGet('robotStability').innerText = robotStabilityValue + '%';
  safeGet('robotFitness').innerText = robotFitnessValue;
}

window.trainRobot = trainRobot;

function initUi() {
  const themeBtn = safeGet('themeBtn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      document.body.classList.toggle('light');
      setTimeout(() => makeChart(document.querySelector('#chartTabs .active')?.dataset.chart || 'fitness'), 50);
    };
  }

  const menuBtn = safeGet('menuBtn');
  if (menuBtn) {
    menuBtn.onclick = () => safeGet('sidebar')?.classList.toggle('open');
  }

  const searchInput = safeGet('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.searchable').forEach(sec => {
        const haystack = (sec.innerText + ' ' + (sec.dataset.keywords || '')).toLowerCase();
        sec.classList.toggle('hiddenBySearch', Boolean(q) && !haystack.includes(q));
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderResearchSelect();
  renderResearchTable();
  renderTimeline();
  renderGlossary();
  initChartTabs();
  initFitnessSliders();
  updateRobotStats();
  initUi();
});
