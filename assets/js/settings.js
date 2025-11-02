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

    function getSettings() {
      return JSON.parse(localStorage.getItem('settings') || '{}');
    }

    function saveSettings(settings) {
      localStorage.setItem('settings', JSON.stringify(settings));
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
          // If on tasks page, focus on add task input
          if (window.location.pathname.includes('tasks.html') && document.getElementById('taskText')) {
            document.getElementById('taskText').focus();
          } 
          // If on dashboard, focus on quick add
          else if (window.location.pathname.includes('index.html') && document.getElementById('quickTaskText')) {
            document.getElementById('quickTaskText').focus();
          }
          // Otherwise, redirect to tasks page
          else {
            window.location.href = 'tasks.html';
          }
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

    // ==================== SETTINGS FUNCTIONALITY ====================

    function applySettings() {
      const settings = getSettings();
      
      // Color
      document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.color === (settings.accentColor || '#4361ee')) {
          option.classList.add('active');
        }
      });
      
      // Checkboxes
      const checkboxes = [
        'compactMode', 'animations', 'dueDateReminders', 'overdueAlerts', 
        'dailyDigest', 'pushNotifications', 'emailNotifications', 'desktopAlerts',
        'dataCollection', 'autoBackup', 'twoFactorAuth', 'autoLogout',
        'autoArchive', 'smartSuggestions', 'lazyLoading'
      ];
      
      checkboxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.checked = settings[id] !== undefined ? settings[id] : element.checked;
        }
      });
      
      // Selects
      const selects = ['fontSize', 'reminderTime', 'cacheDuration'];
      selects.forEach(id => {
        const element = document.getElementById(id);
        if (element && settings[id]) {
          element.value = settings[id];
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

    // ==================== AUTO-UPDATE FUNCTIONS ====================

    // Function to refresh navbar and sidebar data (call this after any data changes)
    function refreshNavbarAndSidebar() {
      updateNavbarStats();
      updateNotifications();
      updateSidebar();
    }

    // ==================== COMPLETE APP INITIALIZATION ====================

    function initializeApp() {
      // Initialize theme
      initTheme();
      
      // Initialize navbar and sidebar
      initializeNavbarAndSidebar();
      
      // Initialize settings
      applySettings();
      
      // Add theme toggle event listener
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
      }

      // Color options
      document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
          document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
          this.classList.add('active');
          
          const settings = getSettings();
          settings.accentColor = this.dataset.color;
          saveSettings(settings);
          
          // In a real app, you would update CSS variables
          document.documentElement.style.setProperty('--primary', this.dataset.color);
        });
      });

      // Save settings when changed
      document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('change', function() {
          const settings = getSettings();
          if (this.type === 'checkbox') {
            settings[this.id] = this.checked;
          } else {
            settings[this.id] = this.value;
          }
          saveSettings(settings);
          
          Swal.fire({
            icon: 'success',
            title: 'Settings Saved!',
            text: 'Your changes have been applied',
            timer: 1000,
            showConfirmButton: false
          });
        });
      });

      // Export data
      document.getElementById('exportData').addEventListener('click', () => {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const profile = getProfile();
        const settings = getSettings();
        
        const data = {
          tasks,
          profile,
          settings,
          exportDate: new Date().toISOString(),
          version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `todo-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        Swal.fire({
          icon: 'success',
          title: 'Data Exported!',
          text: 'Your data has been downloaded successfully',
          timer: 1500,
          showConfirmButton: false
        });
      });

      // Import data
      document.getElementById('importData').addEventListener('click', () => {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        
        if (!file) {
          Swal.fire({
            icon: 'warning',
            title: 'No File Selected',
            text: 'Please select a backup file to import'
          });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = JSON.parse(e.target.result);
            
            Swal.fire({
              title: 'Import Data?',
              text: 'This will replace your current tasks and settings',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, Import',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.isConfirmed) {
                if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
                if (data.profile) localStorage.setItem('profile', JSON.stringify(data.profile));
                if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
                
                Swal.fire({
                  icon: 'success',
                  title: 'Data Imported!',
                  text: 'Your data has been imported successfully',
                  timer: 1500,
                  showConfirmButton: false
                }).then(() => {
                  window.location.reload();
                });
              }
            });
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Import Failed',
              text: 'The selected file is not a valid backup file'
            });
          }
        };
        reader.readAsText(file);
      });

      // Clear all data
      document.getElementById('clearAllData').addEventListener('click', () => {
        Swal.fire({
          title: 'Clear All Data?',
          text: 'This will permanently delete all your tasks, settings, and profile data. This action cannot be undone!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Clear Everything',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#dc3545'
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.clear();
            Swal.fire({
              icon: 'success',
              title: 'Data Cleared!',
              text: 'All data has been cleared. The page will reload.',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          }
        });
      });

      // Reset settings
      document.getElementById('resetSettings').addEventListener('click', () => {
        Swal.fire({
          title: 'Reset Settings?',
          text: 'This will restore all settings to their default values',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Reset',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('settings');
            applySettings();
            Swal.fire({
              icon: 'success',
              title: 'Settings Reset!',
              text: 'All settings have been restored to defaults',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      });

      // Logout all devices
      document.getElementById('logoutAllDevices').addEventListener('click', () => {
        Swal.fire({
          title: 'Logout from All Devices?',
          text: 'You will need to login again on this device',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Logout Everywhere',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            // In a real app, you would call an API to invalidate all sessions
            window.location.href = 'login.html';
          }
        });
      });
    }

    // ==================== GLOBAL EXPORTS ====================

    // Export functions for external use
    window.navbarSidebar = {
      initialize: initializeNavbarAndSidebar,
      refresh: refreshNavbarAndSidebar,
      getTasks: getTasks,
      saveTasks: saveTasks,
      getProfile: getProfile,
      saveProfile: saveProfile,
      getProjects: getProjects
    };

    window.app = {
      initialize: initializeApp,
      toggleTheme: toggleTheme,
      initTheme: initTheme
    };

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializeApp);