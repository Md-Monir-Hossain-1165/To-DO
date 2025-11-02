// ==================== UTILITY FUNCTIONS ====================

// Get tasks from localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
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
      localStorage.setItem('tasks', JSON.stringify(demoTasks));
  }
  
  // Initialize profile if none exists
  if (!localStorage.getItem('profile')) {
      const demoProfile = {
          name: 'Alex Johnson',
          firstName: 'Alex',
          lastName: 'Johnson',
          email: 'alex.johnson@example.com',
          phone: '+1 (555) 123-4567',
          bio: 'Productivity enthusiast and professional task manager. Passionate about optimizing workflows and achieving goals efficiently.',
          avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=4361ee&color=fff',
          memberSince: new Date().getFullYear().toString()
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

// ==================== PROFILE FUNCTIONALITY ====================

function loadProfileData() {
  const profile = getProfile();
  const tasks = getTasks();
  
  // Update profile information
  document.getElementById('firstName').value = profile.firstName || '';
  document.getElementById('lastName').value = profile.lastName || '';
  document.getElementById('email').value = profile.email || '';
  document.getElementById('phone').value = profile.phone || '';
  document.getElementById('bio').value = profile.bio || '';
  
  // Update display elements
  document.getElementById('displayName').textContent = profile.name || 'User Name';
  document.getElementById('userEmail').textContent = profile.email || 'user@example.com';
  document.getElementById('memberSince').textContent = `Member since ${profile.memberSince || '2024'}`;
  
  // Update avatar
  const avatarPreview = document.getElementById('avatarPreview');
  if (profile.avatar && avatarPreview) {
      avatarPreview.src = profile.avatar;
  }
  
  // Calculate and update statistics
  updateProfileStatistics(tasks);
}

function updateProfileStatistics(tasks) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate on-time rate (simplified for demo)
  const tasksWithDueDates = tasks.filter(t => t.dueDate);
  const onTimeTasks = tasksWithDueDates.filter(t => 
      t.completed && new Date(t.completedAt || t.createdAt) <= new Date(t.dueDate)
  ).length;
  const onTimeRate = tasksWithDueDates.length > 0 ? Math.round((onTimeTasks / tasksWithDueDates.length) * 100) : 0;
  
  // Calculate productivity score (simplified for demo)
  const productivityScore = Math.min(100, Math.round(completionRate * 0.6 + onTimeRate * 0.4));
  
  // Update statistics displays
  document.getElementById('totalTasksCount').textContent = totalTasks;
  document.getElementById('completedTasksCount').textContent = completedTasks;
  document.getElementById('completionRate').textContent = completionRate + '%';
  document.getElementById('onTimeRate').textContent = onTimeRate + '%';
  document.getElementById('productivityScore').textContent = productivityScore;
  
  // Update progress bars
  document.getElementById('completionBar').style.width = completionRate + '%';
  document.getElementById('onTimeBar').style.width = onTimeRate + '%';
  document.getElementById('productivityBar').style.width = productivityScore + '%';
}

function initAvatarUpload() {
  const avatarInput = document.getElementById('avatarInput');
  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarPreview = document.getElementById('avatarPreview');
  
  if (avatarUploadBtn && avatarInput) {
      avatarUploadBtn.addEventListener('click', () => {
          avatarInput.click();
      });
  }
  
  if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('change', function(event) {
          const file = event.target.files[0];
          if (file) {
              if (file.size > 5 * 1024 * 1024) { // 5MB limit
                  Swal.fire({
                      icon: 'error',
                      title: 'File too large',
                      text: 'Please select an image smaller than 5MB'
                  });
                  return;
              }
              
              if (!file.type.startsWith('image/')) {
                  Swal.fire({
                      icon: 'error',
                      title: 'Invalid file type',
                      text: 'Please select an image file'
                  });
                  return;
              }
              
              const reader = new FileReader();
              reader.onload = function(e) {
                  avatarPreview.src = e.target.result;
                  
                  // Save to profile
                  const profile = getProfile();
                  profile.avatar = e.target.result;
                  saveProfile(profile);
                  
                  // Update other avatars
                  updateAllAvatars(e.target.result);
                  
                  Swal.fire({
                      icon: 'success',
                      title: 'Avatar Updated!',
                      text: 'Your profile picture has been updated successfully',
                      timer: 1500,
                      showConfirmButton: false
                  });
              };
              reader.readAsDataURL(file);
          }
      });
  }
}

function updateAllAvatars(avatarUrl) {
  // Update navbar avatar
  const avatarSmall = document.getElementById('avatarSmall');
  if (avatarSmall) avatarSmall.src = avatarUrl;
  
  // Update sidebar avatar
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
}

function initProfileForm() {
  const profileForm = document.getElementById('profileForm');
  const resetFormBtn = document.getElementById('resetForm');
  
  if (profileForm) {
      profileForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const profile = getProfile();
          const updatedProfile = {
              ...profile,
              firstName: document.getElementById('firstName').value.trim(),
              lastName: document.getElementById('lastName').value.trim(),
              name: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`,
              email: document.getElementById('email').value.trim(),
              phone: document.getElementById('phone').value.trim(),
              bio: document.getElementById('bio').value.trim()
          };
          
          saveProfile(updatedProfile);
          loadProfileData();
          applyProfileToNavbar();
          updateSidebar();
          
          Swal.fire({
              icon: 'success',
              title: 'Profile Updated!',
              text: 'Your profile information has been saved successfully',
              timer: 1500,
              showConfirmButton: false
          });
      });
  }
  
  if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
          loadProfileData();
          Swal.fire({
              icon: 'info',
              title: 'Form Reset',
              text: 'All changes have been reverted',
              timer: 1500,
              showConfirmButton: false
          });
      });
  }
}

function initPasswordForm() {
  const passwordForm = document.getElementById('passwordForm');
  const forgotPasswordBtn = document.getElementById('forgotPassword');
  
  if (passwordForm) {
      passwordForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const currentPassword = document.getElementById('currentPassword').value;
          const newPassword = document.getElementById('newPassword').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          
          // Basic validation
          if (newPassword.length < 8) {
              Swal.fire({
                  icon: 'error',
                  title: 'Password too short',
                  text: 'Password must be at least 8 characters long'
              });
              return;
          }
          
          if (newPassword !== confirmPassword) {
              Swal.fire({
                  icon: 'error',
                  title: 'Passwords do not match',
                  text: 'Please make sure both passwords match'
              });
              return;
          }
          
          // In a real app, you would verify the current password with your backend
          // For this demo, we'll just show success
          
          passwordForm.reset();
          
          Swal.fire({
              icon: 'success',
              title: 'Password Updated!',
              text: 'Your password has been changed successfully',
              timer: 1500,
              showConfirmButton: false
          });
      });
  }
  
  if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener('click', () => {
          Swal.fire({
              title: 'Reset Password',
              text: 'A password reset link will be sent to your email address',
              icon: 'info',
              confirmButtonText: 'Send Reset Link'
          });
      });
  }
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
  
  // Initialize profile functionality
  loadProfileData();
  initAvatarUpload();
  initProfileForm();
  initPasswordForm();
  
  // Add theme toggle event listener
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export functions for external use
window.profileManager = {
  loadProfileData: loadProfileData,
  updateProfileStatistics: updateProfileStatistics,
  initializeApp: initializeApp
};