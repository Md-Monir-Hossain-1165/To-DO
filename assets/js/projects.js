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

  function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
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
      saveProjects(demoProjects);
    }
  }

  // ==================== PROJECTS FUNCTIONALITY ====================

  function renderProjects() {
    const projects = getProjects();
    const tasks = getTasks();
    
    // Update stats
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('activeProjects').textContent = projects.filter(p => p.status === 'active').length;
    document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'completed').length;
    document.getElementById('onHoldProjects').textContent = projects.filter(p => p.status === 'on-hold').length;
    
    const grid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyProjects');
    
    if (projects.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    
    grid.style.display = 'flex';
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    projects.forEach(project => {
      // Calculate project progress
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => task.completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card project-card h-100">
          <div class="project-color" style="background-color: ${project.color || '#4361ee'}"></div>
          <div class="card-body position-relative">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title">${escapeHtml(project.name)}</h5>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary border-0" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item edit-project" href="#" data-id="${project.id}"><i class="fas fa-edit me-2"></i>Edit</a></li>
                  <li><a class="dropdown-item view-tasks" href="#" data-id="${project.id}"><i class="fas fa-tasks me-2"></i>View Tasks</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger delete-project" href="#" data-id="${project.id}"><i class="fas fa-trash me-2"></i>Delete</a></li>
                </ul>
              </div>
            </div>
            <p class="card-text text-muted small">${project.description || 'No description'}</p>
            
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted">Progress</small>
                <small class="text-muted">${progress}%</small>
              </div>
              <div class="progress project-progress">
                <div class="progress-bar" style="width: ${progress}%; background-color: ${project.color || '#4361ee'}"></div>
              </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="badge bg-${project.status === 'active' ? 'success' : project.status === 'completed' ? 'info' : 'warning'}">
                  ${project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : 'On Hold'}
                </span>
              </div>
              <div class="text-muted small">
                <i class="fas fa-tasks me-1"></i>${totalTasks} tasks
              </div>
            </div>
            
            ${project.startDate || project.endDate ? `
              <div class="mt-2 pt-2 border-top">
                <small class="text-muted">
                  ${project.startDate ? `Start: ${new Date(project.startDate).toLocaleDateString()}` : ''}
                  ${project.endDate ? ` • Due: ${new Date(project.endDate).toLocaleDateString()}` : ''}
                </small>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      grid.appendChild(col);
    });
    
    // Add event listeners
    document.querySelectorAll('.edit-project').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const projectId = parseInt(this.dataset.id);
        editProject(projectId);
      });
    });
    
    document.querySelectorAll('.delete-project').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const projectId = parseInt(this.dataset.id);
        deleteProject(projectId);
      });
    });
    
    document.querySelectorAll('.view-tasks').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const projectId = parseInt(this.dataset.id);
        viewProjectTasks(projectId);
      });
    });
  }

  function editProject(projectId) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      document.getElementById('modalTitle').textContent = 'Edit Project';
      document.getElementById('projectId').value = projectId;
      document.getElementById('projectName').value = project.name;
      document.getElementById('projectDescription').value = project.description || '';
      document.getElementById('projectColor').value = project.color || '#4361ee';
      document.getElementById('projectStatus').value = project.status || 'active';
      document.getElementById('projectStartDate').value = project.startDate || '';
      document.getElementById('projectEndDate').value = project.endDate || '';
      
      const modal = new bootstrap.Modal(document.getElementById('projectModal'));
      modal.show();
    }
  }

  function deleteProject(projectId) {
    Swal.fire({
      title: 'Delete Project?',
      text: 'This will also remove all tasks associated with this project',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const projects = getProjects();
        const updatedProjects = projects.filter(p => p.id !== projectId);
        saveProjects(updatedProjects);
        
        // Remove project ID from tasks
        const tasks = getTasks();
        const updatedTasks = tasks.map(task => {
          if (task.projectId === projectId) {
            const { projectId, ...rest } = task;
            return rest;
          }
          return task;
        });
        saveTasks(updatedTasks);
        
        renderProjects();
        updateNavbarStats();
        updateNotifications();
        updateSidebar();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Project has been deleted',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  function viewProjectTasks(projectId) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    const tasks = getTasks().filter(task => task.projectId === projectId);
    
    const taskList = tasks.map(task => 
      `• ${task.text} ${task.completed ? '✓' : ''}`
    ).join('<br>') || 'No tasks in this project';
    
    Swal.fire({
      title: `Tasks in "${project.name}"`,
      html: taskList,
      icon: 'info',
      confirmButtonText: 'OK'
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
    
    // Initialize projects
    renderProjects();
    
    // Add theme toggle event listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Save project
    document.getElementById('saveProjectBtn').addEventListener('click', () => {
      const projectId = document.getElementById('projectId').value;
      const name = document.getElementById('projectName').value.trim();
      const description = document.getElementById('projectDescription').value.trim();
      const color = document.getElementById('projectColor').value;
      const status = document.getElementById('projectStatus').value;
      const startDate = document.getElementById('projectStartDate').value || null;
      const endDate = document.getElementById('projectEndDate').value || null;

      if (!name) {
        Swal.fire({
          icon: 'warning',
          title: 'Project Name Required',
          text: 'Please enter a project name'
        });
        return;
      }

      const projects = getProjects();

      if (projectId) {
        // Edit existing project
        const projectIndex = projects.findIndex(p => p.id === parseInt(projectId));
        if (projectIndex !== -1) {
          projects[projectIndex] = {
            ...projects[projectIndex],
            name,
            description,
            color,
            status,
            startDate,
            endDate,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        // Add new project
        projects.push({
          id: Date.now(),
          name,
          description,
          color,
          status,
          startDate,
          endDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      saveProjects(projects);
      renderProjects();
      updateSidebar();

      // Close modal and reset form
      bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
      document.getElementById('projectForm').reset();
      document.getElementById('projectId').value = '';

      Swal.fire({
        icon: 'success',
        title: projectId ? 'Project Updated' : 'Project Created',
        text: projectId ? 'Your project has been updated' : 'Your project has been created successfully',
        timer: 1500,
        showConfirmButton: false
      });
    });

    // Reset form when modal is hidden
    document.getElementById('projectModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('projectForm').reset();
      document.getElementById('projectId').value = '';
      document.getElementById('modalTitle').textContent = 'Create New Project';
      document.getElementById('projectColor').value = '#4361ee';
    });
  }

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeApp);