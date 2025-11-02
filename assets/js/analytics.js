 // ==================== UTILITY FUNCTIONS ====================

    // Get tasks from localStorage
    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
      }
  
      function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
  
      // Get profile from localStorage
      function getProfile() {
        return JSON.parse(localStorage.getItem('profile') || '{}');
      }
  
      function saveProfile(profile) {
        localStorage.setItem('profile', JSON.stringify(profile));
      }
  
      // Get projects from localStorage
      function getProjects() {
        return JSON.parse(localStorage.getItem('projects') || '[]');
      }
  
      // Helper to escape HTML
      function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      }
  
      // ==================== THEME MANAGEMENT ====================
  
      function initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') {
          document.body.classList.add('dark-mode');
          document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
          document.body.classList.remove('dark-mode');
          document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
      }
  
      function toggleTheme() {
        if (document.body.classList.contains('dark-mode')) {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
          document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        } else {
          document.body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
          document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
      }
  
      // ==================== NAVBAR FUNCTIONALITY ====================
  
      // Update navbar stats
      function updateNavbarStats() {
        const tasks = getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        const navTotal = document.getElementById('navTotalTasks');
        const navCompleted = document.getElementById('navCompletedTasks');
        const navPending = document.getElementById('navPendingTasks');
        
        if (navTotal) navTotal.textContent = `${total} Tasks`;
        if (navCompleted) navCompleted.textContent = `${completed} Done`;
        if (navPending) navPending.textContent = `${pending} Pending`;
      }
  
      // Update notifications
      function updateNotifications() {
        const tasks = getTasks();
        const overdueTasks = tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < new Date());
        const notificationBadge = document.getElementById('notificationBadge');
        const notificationList = document.getElementById('notificationList');
        
        if (!notificationBadge || !notificationList) return;
        
        if (overdueTasks.length > 0) {
          notificationBadge.style.display = 'block';
          notificationBadge.textContent = overdueTasks.length;
          
          // Update notification list
          notificationList.innerHTML = '';
          overdueTasks.slice(0, 5).forEach(task => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'dropdown-item';
            notificationItem.innerHTML = `
              <div class="d-flex align-items-start">
                <i class="fas fa-exclamation-circle text-danger mt-1 me-2"></i>
                <div>
                  <div class="small fw-medium">${escapeHtml(task.text)}</div>
                  <small class="text-muted">Overdue since ${new Date(task.dueDate).toLocaleDateString()}</small>
                </div>
              </div>
            `;
            notificationList.appendChild(notificationItem);
          });
          
          // Add view all link if there are more than 5
          if (overdueTasks.length > 5) {
            const viewAllLink = document.createElement('div');
            viewAllLink.className = 'dropdown-item text-center';
            viewAllLink.innerHTML = `<small><a href="tasks.html?filter=overdue" class="text-primary">View all ${overdueTasks.length} notifications</a></small>`;
            notificationList.appendChild(viewAllLink);
          }
        } else {
          notificationBadge.style.display = 'none';
          notificationList.innerHTML = `
            <div class="px-3 py-2 text-center text-muted">
              <i class="fas fa-bell-slash fa-2x mb-2"></i>
              <p class="small mb-0">No new notifications</p>
            </div>
          `;
        }
      }
  
      // Apply profile to navbar
      function applyProfileToNavbar() {
        const profile = getProfile();
        const profileName = document.getElementById('profileName');
        const avatarSmall = document.getElementById('avatarSmall');
        
        if (profile.name && profileName) {
          profileName.textContent = profile.name;
        }
        if (profile.avatar && avatarSmall) {
          avatarSmall.src = profile.avatar;
        }
      }
  
      // Quick add task from navbar
      function initQuickNavAdd() {
        const quickNavAdd = document.getElementById('quickNavAdd');
        if (quickNavAdd) {
          quickNavAdd.addEventListener('click', function() {
            window.location.href = 'tasks.html';
          });
        }
      }
  
      // ==================== SIDEBAR FUNCTIONALITY ====================
  
      // Initialize sidebar toggle
      function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        if (!sidebar || !overlay || !toggleBtn) return;
        
        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            document.body.classList.add('sidebar-open');
          });
        }
        
        if (overlay) {
          overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.classList.remove('sidebar-open');
          });
        }
        
        // Close sidebar when clicking on a link (mobile)
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
          link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
              sidebar.classList.remove('show');
              overlay.classList.remove('show');
              document.body.classList.remove('sidebar-open');
            }
          });
        });
      }
  
      // Update sidebar counts and active state
      function updateSidebar() {
        const tasks = getTasks();
        const projects = getProjects();
        
        // Update counts
        const sidebarTaskCount = document.getElementById('sidebarTaskCount');
        const sidebarProjectCount = document.getElementById('sidebarProjectCount');
        
        if (sidebarTaskCount) sidebarTaskCount.textContent = tasks.length;
        if (sidebarProjectCount) sidebarProjectCount.textContent = projects.length;
        
        // Update profile in sidebar
        const profile = getProfile();
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        
        if (profile.name && sidebarUserName) {
          sidebarUserName.textContent = profile.name;
        }
        if (profile.avatar && sidebarAvatar) {
          sidebarAvatar.src = profile.avatar;
        }
        
        // Set active state based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
          link.classList.remove('active');
        });
        
        const navIds = {
          'index.html': 'navDashboard',
          'tasks.html': 'navTasks',
          'calendar.html': 'navCalendar',
          'projects.html': 'navProjects',
          'analytics.html': 'navAnalytics',
          'profile.html': 'navProfile',
          'settings.html': 'navSettings',
          'about.html': 'navAbout'
        };
        
        const activeNavId = navIds[currentPage];
        if (activeNavId) {
          const activeNav = document.getElementById(activeNavId);
          if (activeNav) activeNav.classList.add('active');
        }
      }
  
      // ==================== LOGOUT FUNCTIONALITY ====================
  
      function initLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
              title: 'Logout?',
              text: 'Are you sure you want to logout?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Yes, Logout',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.href = 'login.html';
              }
            });
          });
        }
      }
  
      // ==================== DEMO DATA INITIALIZATION ====================
  
      function initializeDemoData() {
        // Initialize tasks if none exist
        if (!localStorage.getItem('tasks')) {
          const demoTasks = [
            {
              id: 1,
              text: 'Welcome to To-Do Manager Pro+!',
              category: 'General',
              priority: 'Low',
              completed: false,
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              text: 'Explore the dashboard features',
              category: 'General',
              priority: 'Medium',
              completed: false,
              createdAt: new Date().toISOString()
            },
            {
              id: 3,
              text: 'Create your first task',
              category: 'General',
              priority: 'High',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 4,
              text: 'Review project planning',
              category: 'Work',
              priority: 'Medium',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              completed: false,
              createdAt: new Date().toISOString()
            }
          ];
          saveTasks(demoTasks);
        }
        
        // Initialize profile if none exists
        if (!localStorage.getItem('profile')) {
          const demoProfile = {
            name: 'User',
            email: 'user@example.com',
            avatar: 'https://ui-avatars.com/api/?name=User&background=4361ee&color=fff',
            memberSince: new Date().getFullYear().toString(),
            firstName: 'User',
            lastName: 'Account'
          };
          saveProfile(demoProfile);
        }
        
        // Initialize projects if none exist
        if (!localStorage.getItem('projects')) {
          const demoProjects = [
            {
              id: 1,
              name: 'Personal Tasks',
              description: 'Daily personal tasks and errands',
              color: '#4361ee',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Work Projects',
              description: 'Professional work and career development',
              color: '#4cc9a7',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          localStorage.setItem('projects', JSON.stringify(demoProjects));
        }
      }
  
      // ==================== ANALYTICS FUNCTIONALITY ====================
  
      let currentPeriod = 'week';
      let charts = {};
  
      function calculateMetrics() {
        const tasks = getTasks();
        const now = new Date();
        
        // Calculate date ranges based on current period
        let startDate, endDate;
        switch(currentPeriod) {
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
        }
        
        // Filter tasks for current period
        const periodTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= startDate && taskDate <= (endDate || now);
        });
        
        const completedTasks = periodTasks.filter(task => task.completed);
        const totalTasks = periodTasks.length;
        
        // Calculate metrics
        const productivityScore = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
        const onTimeTasks = completedTasks.filter(task => 
          task.dueDate && new Date(task.completedAt || task.createdAt) <= new Date(task.dueDate)
        ).length;
        const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeTasks / completedTasks.length) * 100) : 0;
        
        // Update metric displays
        document.getElementById('productivityScore').textContent = productivityScore + '%';
        document.getElementById('tasksCompleted').textContent = completedTasks.length;
        document.getElementById('onTimeRate').textContent = onTimeRate + '%';
        document.getElementById('avgCompletionTime').textContent = '2.5h'; // Simplified for demo
        
        // Generate random trends for demo
        document.getElementById('productivityTrend').textContent = `+${Math.floor(Math.random() * 10)}%`;
        document.getElementById('completionTrend').textContent = `+${Math.floor(Math.random() * 5)}`;
        document.getElementById('timeTrend').textContent = `-${Math.floor(Math.random() * 2)}h`;
        document.getElementById('onTimeTrend').textContent = `+${Math.floor(Math.random() * 8)}%`;
      }
  
      function renderCharts() {
        const tasks = getTasks();
        
        // Destroy existing charts
        Object.values(charts).forEach(chart => {
          if (chart) chart.destroy();
        });
        
        // Completion Trend Chart
        const completionCtx = document.getElementById('completionTrendChart');
        if (completionCtx) {
          charts.completionTrend = new Chart(completionCtx, {
            type: 'line',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                label: 'Tasks Completed',
                data: [12, 19, 8, 15, 12, 5, 9],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true
              }, {
                label: 'Tasks Created',
                data: [8, 12, 6, 14, 10, 7, 11],
                borderColor: '#f72585',
                backgroundColor: 'rgba(247, 37, 133, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
        
        // Task Distribution Chart
        const distributionCtx = document.getElementById('taskDistributionChart');
        if (distributionCtx) {
          charts.taskDistribution = new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
              labels: ['Completed', 'Pending', 'Overdue'],
              datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#4cc9a7', '#ff9e00', '#f72585'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              },
              cutout: '70%'
            }
          });
        }
        
        // Category Productivity Chart
        const categoryCtx = document.getElementById('categoryProductivityChart');
        if (categoryCtx) {
          charts.categoryProductivity = new Chart(categoryCtx, {
            type: 'bar',
            data: {
              labels: ['Work', 'Personal', 'Study', 'Health', 'Shopping'],
              datasets: [{
                label: 'Completion Rate %',
                data: [75, 60, 85, 90, 45],
                backgroundColor: '#4361ee',
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }
          });
        }
        
        // Priority Analysis Chart
        const priorityCtx = document.getElementById('priorityAnalysisChart');
        if (priorityCtx) {
          charts.priorityAnalysis = new Chart(priorityCtx, {
            type: 'polarArea',
            data: {
              labels: ['High', 'Medium', 'Low'],
              datasets: [{
                data: [15, 35, 50],
                backgroundColor: ['#f72585', '#ff9e00', '#4cc9a7']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
        }
      }
  
      function generateInsights() {
        const insights = [
          {
            icon: 'fa-clock',
            color: 'primary',
            title: 'Peak Productivity Hours',
            description: 'You are most productive between 9 AM - 12 PM. Schedule important tasks during this time.'
          },
          {
            icon: 'fa-calendar',
            color: 'success',
            title: 'Weekly Consistency',
            description: 'Your completion rate is 15% higher on weekdays compared to weekends.'
          },
          {
            icon: 'fa-tasks',
            color: 'warning',
            title: 'Task Complexity',
            description: 'Tasks marked as High Priority take 2.3x longer to complete on average.'
          },
          {
            icon: 'fa-chart-pie',
            color: 'info',
            title: 'Category Focus',
            description: 'You complete 85% of Health-related tasks, your most consistent category.'
          }
        ];
        
        const container = document.getElementById('insightsContainer');
        container.innerHTML = '';
        
        insights.forEach(insight => {
          const col = document.createElement('div');
          col.className = 'col-md-6 mb-3';
          col.innerHTML = `
            <div class="card h-100 border-0 bg-${insight.color}-subtle">
              <div class="card-body">
                <div class="d-flex align-items-start">
                  <div class="bg-${insight.color} bg-opacity-10 p-2 rounded me-3">
                    <i class="fas ${insight.icon} text-${insight.color}"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-1">${insight.title}</h6>
                    <p class="card-text small text-muted mb-0">${insight.description}</p>
                  </div>
                </div>
              </div>
            </div>
          `;
          container.appendChild(col);
        });
      }
  
      // ==================== MAIN INITIALIZATION FUNCTION ====================
  
      function initializeNavbarAndSidebar() {
        // Initialize demo data if needed
        initializeDemoData();
        
        // Initialize all components
        applyProfileToNavbar();
        updateNavbarStats();
        updateNotifications();
        updateSidebar();
        initSidebar();
        initQuickNavAdd();
        initLogout();
        
        console.log('Navbar and Sidebar initialized successfully');
      }
  
      // ==================== COMPLETE APP INITIALIZATION ====================
  
      function initializeApp() {
        // Initialize theme
        initTheme();
        
        // Initialize navbar and sidebar
        initializeNavbarAndSidebar();
        
        // Initialize analytics
        calculateMetrics();
        renderCharts();
        generateInsights();
        
        // Add theme toggle event listener
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', toggleTheme);
        }
  
        // Period switching
        document.querySelectorAll('[data-period]').forEach(btn => {
          btn.addEventListener('click', function() {
            document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPeriod = this.dataset.period;
            calculateMetrics();
            renderCharts();
          });
        });
      }
  
      // Initialize when DOM is loaded
      document.addEventListener('DOMContentLoaded', initializeApp);