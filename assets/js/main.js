// main.js — general utilities used across pages

// get tasks from localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// get profile
function getProfile() {
  return JSON.parse(localStorage.getItem('profile') || '{}');
}
function saveProfile(profile) {
  localStorage.setItem('profile', JSON.stringify(profile));
}

// greeting & quote
function setGreetingAndQuote() {
  const hours = new Date().getHours();
  let greet = 'Good Evening';
  if (hours < 12) greet = 'Good Morning';
  else if (hours < 18) greet = 'Good Afternoon';
  const profile = getProfile();
  const name = profile.name || 'User';
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) greetingEl.textContent = `${greet}, ${name} 👋`;

  const quotes = [
    "Success is the sum of small efforts repeated daily.",
    "Plan your work and work your plan.",
    "Discipline is the bridge between goals and accomplishment.",
    "Small daily improvements are the key to staggering long-term results."
  ];
  const qEl = document.getElementById('quote');
  if (qEl) qEl.textContent = quotes[Math.floor(Math.random()*quotes.length)];
}

// profile small display
function applyProfileSmall() {
  const profile = getProfile();
  if (profile.name) {
    const pName = document.getElementById('profileName');
    if (pName) pName.textContent = profile.name;
  }
  if (profile.avatar) {
    const avatarSmall = document.getElementById('avatarSmall');
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarSmall) avatarSmall.src = profile.avatar;
    if (avatarPreview) avatarPreview.src = profile.avatar;
  }
}

// progress chart
function renderProgressChart() {
  const tasks = getTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < new Date()).length;

  // stats elements
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText('totalTasks', total);
  setText('completedTasks', completed);
  setText('pendingTasks', pending);
  setText('overdueTasks', overdue);

  const ctx = document.getElementById('progressChart');
  if (!ctx) return;
  // destroy existing chart if present
  if (ctx.chart) ctx.chart.destroy();

  ctx.chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending', 'Overdue'],
      datasets: [{
        data: [completed, pending, overdue],
        backgroundColor: ['#198754', '#0d6efd', '#dc3545']
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// recent tasks list
function renderRecentTasks() {
  const listEl = document.getElementById('recentTasks');
  if (!listEl) return;
  const tasks = getTasks().slice().reverse().slice(0,5);
  listEl.innerHTML = '';
  if (tasks.length === 0) {
    listEl.innerHTML = '<li class="list-group-item text-muted">No recent tasks</li>';
    return;
  }
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <div class="task-title">${escapeHtml(t.text)}</div>
        <div class="small text-muted">${t.category || 'General'} • ${t.dueDate || 'No due date'}</div>
      </div>
      <div class="text-end">
        ${t.completed ? '<span class="badge bg-success">Done</span>' : (t.priority === 'High' ? '<span class="badge badge-priority-high">High</span>' : (t.priority === 'Medium' ? '<span class="badge badge-priority-medium">Med</span>' : '<span class="badge badge-priority-low">Low</span>'))}
      </div>`;
    listEl.appendChild(li);
  });
}

// helper to escape HTML
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setGreetingAndQuote();
  applyProfileSmall();
  renderProgressChart();
  renderRecentTasks();

  // quick add on dashboard
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', () => {
      const text = document.getElementById('quickTaskText').value.trim();
      const category = document.getElementById('quickCategory').value;
      const due = document.getElementById('quickDue').value || null;
      const priority = document.getElementById('quickPriority').value;
      if (!text) { Swal.fire('Enter a task'); return; }
      const tasks = getTasks();
      tasks.push({
        id: Date.now(),
        text, category, dueDate: due, priority, completed: false, createdAt: new Date().toISOString()
      });
      saveTasks(tasks);
      Swal.fire({icon:'success',text:'Task added'});
      document.getElementById('quickTaskText').value='';
      renderProgressChart();
      renderRecentTasks();
    });
  }
});
