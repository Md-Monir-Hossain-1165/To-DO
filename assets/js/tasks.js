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
          const modal = new bootstrap.Modal(document.getElementById('taskModal'));
          modal.show();
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

    // ==================== TASK MANAGEMENT FUNCTIONS ====================

    let currentFilter = 'all';
    let currentPriority = 'all';
    let currentCategory = 'all';
    let currentSort = 'newest';

    function renderTasks() {
      const tasks = getTasks();
      let filteredTasks = [...tasks];

      // Apply filters
      if (currentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => {
          if (currentFilter === 'completed') return task.completed;
          if (currentFilter === 'pending') return !task.completed;
          if (currentFilter === 'overdue') {
            return task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
          }
          return true;
        });
      }

      if (currentPriority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === currentPriority);
      }

      if (currentCategory !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
      }

      // Apply sorting
      filteredTasks.sort((a, b) => {
        if (currentSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (currentSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (currentSort === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (currentSort === 'priority') {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return 0;
      });

      const tasksList = document.getElementById('tasksList');
      const emptyState = document.getElementById('emptyState');
      const tasksCount = document.getElementById('tasksCount');

      tasksCount.textContent = `All Tasks (${filteredTasks.length})`;

      if (filteredTasks.length === 0) {
        tasksList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      tasksList.style.display = 'block';
      emptyState.style.display = 'none';
      tasksList.innerHTML = '';

      filteredTasks.forEach(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
        
        const taskItem = document.createElement('div');
        taskItem.className = `list-group-item ${task.completed ? 'completed' : ''}`;
        taskItem.innerHTML = `
          <div class="d-flex align-items-center flex-grow-1">
            <input type="checkbox" class="form-check-input me-3" ${task.completed ? 'checked' : ''} data-id="${task.id}">
            <div class="flex-grow-1">
              <div class="task-title">${escapeHtml(task.text)}</div>
              <div class="small text-muted">
                ${task.category || 'General'} • ${dueDate}
                ${isOverdue ? '<span class="badge bg-danger ms-1">Overdue</span>' : ''}
                ${task.notes ? '<span class="ms-1"><i class="fas fa-sticky-note text-muted"></i></span>' : ''}
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            ${task.completed ? 
              '<span class="badge bg-success">Done</span>' : 
              (task.priority === 'High' ? 
                '<span class="badge badge-priority-high">High</span>' : 
                (task.priority === 'Medium' ? 
                  '<span class="badge badge-priority-medium">Med</span>' : 
                  '<span class="badge badge-priority-low">Low</span>'))}
            <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        tasksList.appendChild(taskItem);
      });

      // Add event listeners
      document.querySelectorAll('#tasksList input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const taskId = parseInt(this.getAttribute('data-id'));
          const tasks = getTasks();
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            task.completed = this.checked;
            saveTasks(tasks);
            renderTasks();
            updateNavbarStats();
            updateNotifications();
            updateSidebar();
          }
        });
      });

      document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', function() {
          const taskId = parseInt(this.getAttribute('data-id'));
          editTask(taskId);
        });
      });

      document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', function() {
          const taskId = parseInt(this.getAttribute('data-id'));
          deleteTask(taskId);
        });
      });
    }

    function editTask(taskId) {
      const tasks = getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = taskId;
        document.getElementById('taskText').value = task.text;
        document.getElementById('taskCategory').value = task.category || 'General';
        document.getElementById('taskPriority').value = task.priority || 'Medium';
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskNotes').value = task.notes || '';
        
        const modal = new bootstrap.Modal(document.getElementById('taskModal'));
        modal.show();
      }
    }

    function deleteTask(taskId) {
      Swal.fire({
        title: 'Delete Task?',
        text: 'This action cannot be undone',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const tasks = getTasks();
          const updatedTasks = tasks.filter(t => t.id !== taskId);
          saveTasks(updatedTasks);
          renderTasks();
          updateNavbarStats();
          updateNotifications();
          updateSidebar();
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Task has been deleted',
            timer: 1500,
            showConfirmButton: false
          });
        }
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
      
      // Initialize tasks
      renderTasks();
      
      // Add theme toggle event listener
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
      }

      // Filter events
      document.getElementById('statusFilter').addEventListener('change', function() {
        currentFilter = this.value;
        renderTasks();
      });

      document.getElementById('priorityFilter').addEventListener('change', function() {
        currentPriority = this.value;
        renderTasks();
      });

      document.getElementById('categoryFilter').addEventListener('change', function() {
        currentCategory = this.value;
        renderTasks();
      });

      document.getElementById('sortBy').addEventListener('change', function() {
        currentSort = this.value;
        renderTasks();
      });

      // Save task
      document.getElementById('saveTaskBtn').addEventListener('click', () => {
        const taskId = document.getElementById('taskId').value;
        const text = document.getElementById('taskText').value.trim();
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value || null;
        const notes = document.getElementById('taskNotes').value.trim();

        if (!text) {
          Swal.fire({
            icon: 'warning',
            title: 'Task Required',
            text: 'Please enter a task description'
          });
          return;
        }

        const tasks = getTasks();

        if (taskId) {
          // Edit existing task
          const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));
          if (taskIndex !== -1) {
            tasks[taskIndex] = {
              ...tasks[taskIndex],
              text,
              category,
              priority,
              dueDate,
              notes
            };
          }
        } else {
          // Add new task
          tasks.push({
            id: Date.now(),
            text,
            category,
            priority,
            dueDate,
            notes,
            completed: false,
            createdAt: new Date().toISOString()
          });
        }

        saveTasks(tasks);
        renderTasks();
        updateNavbarStats();
        updateNotifications();
        updateSidebar();

        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';

        Swal.fire({
          icon: 'success',
          title: taskId ? 'Task Updated' : 'Task Added',
          text: taskId ? 'Your task has been updated' : 'Your task has been added successfully',
          timer: 1500,
          showConfirmButton: false
        });
      });

      // Reset form when modal is hidden
      document.getElementById('taskModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('modalTitle').textContent = 'Add New Task';
      });
    }
    // ==================== PDF EXPORT FUNCTIONALITY ====================

function exportTasksToPDF() {
  const tasks = getTasks();
  const profile = getProfile();
  
  if (tasks.length === 0) {
      Swal.fire({
          icon: 'warning',
          title: 'No Tasks',
          text: 'There are no tasks to export'
      });
      return;
  }

  // Show loading state
  const exportBtn = document.getElementById('exportPdfBtn');
  const originalHtml = exportBtn.innerHTML;
  exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
  exportBtn.disabled = true;

  try {
      // Create PDF content
      const pdfContent = generatePDFContent(tasks, profile);
      
      // Create PDF using jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
          title: 'Task List Export',
          subject: 'Tasks from To-Do Manager Pro+',
          author: profile.name || 'User',
          creator: 'To-Do Manager Pro+'
      });

      // Add content to PDF
      addContentToPDF(doc, pdfContent, tasks);
      
      // Save the PDF
      const fileName = `tasks-export-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      Swal.fire({
          icon: 'success',
          title: 'PDF Exported!',
          text: 'Your task list has been exported successfully',
          timer: 2000,
          showConfirmButton: false
      });
  } catch (error) {
      console.error('PDF export error:', error);
      Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: 'There was an error generating the PDF. Please try again.'
      });
  } finally {
      // Restore button state
      exportBtn.innerHTML = originalHtml;
      exportBtn.disabled = false;
  }
}

function generatePDFContent(tasks, profile) {
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = tasks.filter(task => task.dueDate && !task.completed && new Date(task.dueDate) < new Date());
  
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  return {
      header: {
          title: 'Task List Report',
          subtitle: 'Generated from To-Do Manager Pro+',
          date: new Date().toLocaleDateString(),
          user: profile.name || 'User'
      },
      summary: {
          total: tasks.length,
          completed: completedTasks.length,
          pending: pendingTasks.length,
          overdue: overdueTasks.length,
          completionRate: completionRate
      },
      tasks: tasks.map(task => ({
          text: task.text,
          category: task.category || 'General',
          priority: task.priority || 'Medium',
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
          status: task.completed ? 'Completed' : 'Pending',
          notes: task.notes || '',
          createdAt: new Date(task.createdAt).toLocaleDateString(),
          isOverdue: task.dueDate && !task.completed && new Date(task.dueDate) < new Date()
      }))
  };
}

function addContentToPDF(doc, content, tasks) {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;
  
  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(content.header.title, margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for: ${content.header.user} | Date: ${content.header.date}`, margin, yPosition);
  
  yPosition += 15;
  
  // Add summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryLines = [
      `Total Tasks: ${content.summary.total}`,
      `Completed: ${content.summary.completed}`,
      `Pending: ${content.summary.pending}`,
      `Overdue: ${content.summary.overdue}`,
      `Completion Rate: ${content.summary.completionRate}%`
  ];
  
  summaryLines.forEach(line => {
      if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
  });
  
  yPosition += 10;
  
  // Add tasks section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Task Details', margin, yPosition);
  
  yPosition += 10;
  
  // Add table headers
  doc.setFillColor(67, 97, 238);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
  
  doc.setFontSize(8);
  doc.text('Task', margin + 2, yPosition + 5);
  doc.text('Category', 70, yPosition + 5);
  doc.text('Priority', 100, yPosition + 5);
  doc.text('Due Date', 125, yPosition + 5);
  doc.text('Status', 150, yPosition + 5);
  
  yPosition += 12;
  doc.setTextColor(0, 0, 0);
  
  // Add task rows
  content.tasks.forEach((task, index) => {
      if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
          
          // Add table headers on new page
          doc.setFillColor(67, 97, 238);
          doc.setTextColor(255, 255, 255);
          doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
          doc.text('Task', margin + 2, yPosition + 5);
          doc.text('Category', 70, yPosition + 5);
          doc.text('Priority', 100, yPosition + 5);
          doc.text('Due Date', 125, yPosition + 5);
          doc.text('Status', 150, yPosition + 5);
          yPosition += 12;
          doc.setTextColor(0, 0, 0);
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 6, 'F');
      }
      
      // Set color based on status
      if (task.status === 'Completed') {
          doc.setTextColor(0, 128, 0);
      } else if (task.isOverdue) {
          doc.setTextColor(255, 0, 0);
      } else {
          doc.setTextColor(0, 0, 0);
      }
      
      // Truncate long task text
      const taskText = doc.splitTextToSize(task.text, 40);
      const categoryText = task.category.length > 12 ? task.category.substring(0, 12) + '...' : task.category;
      
      doc.text(taskText, margin + 2, yPosition);
      doc.text(categoryText, 70, yPosition);
      doc.text(task.priority, 100, yPosition);
      doc.text(task.dueDate, 125, yPosition);
      doc.text(task.status, 150, yPosition);
      
      yPosition += Math.max(8, taskText.length * 3);
  });
  
  // Add footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
      doc.text('Generated by To-Do Manager Pro+', margin, doc.internal.pageSize.height - 10);
  }
}

function initPDFExport() {
  const exportBtn = document.getElementById('exportPdfBtn');
  if (exportBtn) {
      exportBtn.addEventListener('click', exportTasksToPDF);
  }
}

// ==================== ENHANCED TASK MANAGEMENT ====================

// Add this function to filter tasks for PDF export
function getFilteredTasksForExport() {
  const tasks = getTasks();
  let filteredTasks = [...tasks];

  // Apply the same filters as the current view
  if (currentFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
          if (currentFilter === 'completed') return task.completed;
          if (currentFilter === 'pending') return !task.completed;
          if (currentFilter === 'overdue') {
              return task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
          }
          return true;
      });
  }

  if (currentPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === currentPriority);
  }

  if (currentCategory !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
  }

  // Apply the same sorting as the current view
  filteredTasks.sort((a, b) => {
      if (currentSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (currentSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (currentSort === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (currentSort === 'priority') {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
  });

  return filteredTasks;
}

// Update the export function to use filtered tasks
function exportTasksToPDF() {
  const tasks = getFilteredTasksForExport(); // Use filtered tasks instead of all tasks
  const profile = getProfile();
  
  if (tasks.length === 0) {
      Swal.fire({
          icon: 'warning',
          title: 'No Tasks',
          text: 'There are no tasks to export with the current filters'
      });
      return;
  }

  // Show loading state
  const exportBtn = document.getElementById('exportPdfBtn');
  const originalHtml = exportBtn.innerHTML;
  exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
  exportBtn.disabled = true;

  try {
      // Create PDF content
      const pdfContent = generatePDFContent(tasks, profile);
      
      // Create PDF using jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
          title: 'Task List Export',
          subject: 'Tasks from To-Do Manager Pro+',
          author: profile.name || 'User',
          creator: 'To-Do Manager Pro+'
      });

      // Add content to PDF
      addContentToPDF(doc, pdfContent, tasks);
      
      // Save the PDF
      const filterInfo = getCurrentFilterInfo();
      const fileName = `tasks-${filterInfo}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      Swal.fire({
          icon: 'success',
          title: 'PDF Exported!',
          text: `Your ${filterInfo} task list has been exported successfully`,
          timer: 2000,
          showConfirmButton: false
      });
  } catch (error) {
      console.error('PDF export error:', error);
      Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: 'There was an error generating the PDF. Please try again.'
      });
  } finally {
      // Restore button state
      exportBtn.innerHTML = originalHtml;
      exportBtn.disabled = false;
  }
}

function getCurrentFilterInfo() {
  let filterName = 'all';
  if (currentFilter !== 'all') filterName = currentFilter;
  if (currentPriority !== 'all') filterName += `-${currentPriority}`;
  if (currentCategory !== 'all') filterName += `-${currentCategory}`;
  return filterName;
}

// ==================== UPDATED INITIALIZATION ====================

// Update the complete app initialization function
function initializeApp() {
  // Initialize theme
  initTheme();
  
  // Initialize navbar and sidebar
  initializeNavbarAndSidebar();
  
  // Initialize tasks
  renderTasks();
  
  // Initialize PDF export
  initPDFExport();
  
  // Add theme toggle event listener
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
  }

  // Filter events
  document.getElementById('statusFilter').addEventListener('change', function() {
      currentFilter = this.value;
      renderTasks();
  });

  document.getElementById('priorityFilter').addEventListener('change', function() {
      currentPriority = this.value;
      renderTasks();
  });

  document.getElementById('categoryFilter').addEventListener('change', function() {
      currentCategory = this.value;
      renderTasks();
  });

  document.getElementById('sortBy').addEventListener('change', function() {
      currentSort = this.value;
      renderTasks();
  });

  // Save task
  document.getElementById('saveTaskBtn').addEventListener('click', () => {
      const taskId = document.getElementById('taskId').value;
      const text = document.getElementById('taskText').value.trim();
      const category = document.getElementById('taskCategory').value;
      const priority = document.getElementById('taskPriority').value;
      const dueDate = document.getElementById('taskDueDate').value || null;
      const notes = document.getElementById('taskNotes').value.trim();

      if (!text) {
          Swal.fire({
              icon: 'warning',
              title: 'Task Required',
              text: 'Please enter a task description'
          });
          return;
      }

      const tasks = getTasks();

      if (taskId) {
          // Edit existing task
          const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));
          if (taskIndex !== -1) {
              tasks[taskIndex] = {
                  ...tasks[taskIndex],
                  text,
                  category,
                  priority,
                  dueDate,
                  notes
              };
          }
      } else {
          // Add new task
          tasks.push({
              id: Date.now(),
              text,
              category,
              priority,
              dueDate,
              notes,
              completed: false,
              createdAt: new Date().toISOString()
          });
      }

      saveTasks(tasks);
      renderTasks();
      updateNavbarStats();
      updateNotifications();
      updateSidebar();

      // Close modal and reset form
      bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
      document.getElementById('taskForm').reset();
      document.getElementById('taskId').value = '';

      Swal.fire({
          icon: 'success',
          title: taskId ? 'Task Updated' : 'Task Added',
          text: taskId ? 'Your task has been updated' : 'Your task has been added successfully',
          timer: 1500,
          showConfirmButton: false
      });
  });

  // Reset form when modal is hidden
  document.getElementById('taskModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('taskForm').reset();
      document.getElementById('taskId').value = '';
      document.getElementById('modalTitle').textContent = 'Add New Task';
  });
}

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializeApp);