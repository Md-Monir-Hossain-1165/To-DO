// calendar.js — simple month calendar rendering and marking tasks by date

function renderCalendar(year, month) {
    const container = document.getElementById('calendar');
    if (!container) return;
    container.innerHTML = '';
    const date = new Date(year, month, 1);
    const monthLabel = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    document.getElementById('monthLabel').textContent = monthLabel;
  
    // create table
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    const thead = document.createElement('thead');
    const row = document.createElement('tr');
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
      const th = document.createElement('th'); th.textContent = d; th.className='text-center';
      row.appendChild(th);
    });
    thead.appendChild(row);
    table.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    // first day index
    let startDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month+1, 0).getDate();
  
    let week = document.createElement('tr');
    // empty cells
    for (let i=0;i<startDay;i++) {
      week.appendChild(document.createElement('td'));
    }
  
    const tasks = getTasks();
    for (let day=1; day<=daysInMonth; day++) {
      if (week.children.length === 7) {
        tbody.appendChild(week);
        week = document.createElement('tr');
      }
      const cell = document.createElement('td');
      cell.style.verticalAlign = 'top';
      cell.innerHTML = `<div class="fw-bold">${day}</div>`;
  
      // find tasks for this date
      const dayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const tasksForDay = tasks.filter(t => t.dueDate === dayStr);
      tasksForDay.slice(0,3).forEach(t => {
        const span = document.createElement('div');
        span.className = 'small text-truncate';
        span.title = t.text;
        span.innerHTML = `${t.completed ? '<i class="fas fa-check text-success"></i> ' : ''}${escapeHtml(t.text)} <span class="badge bg-secondary ms-1">${escapeHtml(t.category||'')}</span>`;
        cell.appendChild(span);
      });
      if (tasksForDay.length > 3) {
        const more = document.createElement('div');
        more.className = 'small text-muted';
        more.textContent = `+ ${tasksForDay.length - 3} more`;
        cell.appendChild(more);
      }
  
      week.appendChild(cell);
    }
    // append remaining week
    while (week.children.length < 7) week.appendChild(document.createElement('td'));
    tbody.appendChild(week);
    table.appendChild(tbody);
    container.appendChild(table);
  }
  
  // month navigation
  document.addEventListener('DOMContentLoaded', () => {
    let current = new Date();
    let year = current.getFullYear();
    let month = current.getMonth();
    renderCalendar(year, month);
  
    document.getElementById('prevMonth').addEventListener('click', () => {
      month--; if (month < 0) { month = 11; year--; }
      renderCalendar(year, month);
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
      month++; if (month > 11) { month = 0; year++; }
      renderCalendar(year, month);
    });
  });
  