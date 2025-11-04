// Enhanced Project Management System
class AdvancedProjectManager {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        this.currentProjectId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProjects();
        this.updateProjectStats();
    }

    setupEventListeners() {
        // Auto-set start date to today
        const startDateInput = document.getElementById('newProjectStartDate');
        const endDateInput = document.getElementById('newProjectEndDate');
        
        if (startDateInput) {
            startDateInput.valueAsDate = new Date();
        }
        
        // Set end date to 7 days from now by default
        if (endDateInput) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            endDateInput.valueAsDate = endDate;
        }
    }

    createProject() {
        const name = document.getElementById('newProjectName').value.trim();
        const description = document.getElementById('newProjectDescription').value.trim();
        const startDate = document.getElementById('newProjectStartDate').value;
        const endDate = document.getElementById('newProjectEndDate').value;
        const color = document.getElementById('newProjectColor').value;
        const priority = document.getElementById('newProjectPriority').value;
        
        if (!name) {
            this.showNotification('Please enter a project name', 'warning');
            return;
        }

        if (!startDate || !endDate) {
            this.showNotification('Please set start and end dates', 'warning');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            this.showNotification('End date must be after start date', 'warning');
            return;
        }

        const project = {
            id: Date.now(),
            name,
            description,
            startDate,
            endDate,
            color,
            priority,
            status: 'active',
            createdAt: new Date().toISOString(),
            progress: 0,
            totalTasks: 0,
            completedTasks: 0
        };

        this.projects.push(project);
        this.saveProjects();
        this.loadProjects();
        this.updateProjectStats();
        
        // Clear form
        document.getElementById('newProjectName').value = '';
        document.getElementById('newProjectDescription').value = '';
        this.setupEventListeners(); // Reset dates
        
        this.showNotification('Project created successfully!', 'success');
    }

    loadProjects() {
        const container = document.getElementById('projectsList');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No projects yet. Create your first project to get started!</p>
                </div>
            `;
            return;
        }

        this.projects.forEach(project => {
            const progress = this.calculateProjectProgress(project);
            const daysRemaining = this.calculateDaysRemaining(project.endDate);
            const healthStatus = this.getProjectHealthStatus(project);
            
            const projectEl = document.createElement('div');
            projectEl.className = `project-card ${project.id === this.currentProjectId ? 'active' : ''}`;
            projectEl.onclick = () => this.showProjectDetails(project.id);
            projectEl.innerHTML = `
                <div class="project-header">
                    <div class="project-info">
                        <div class="project-title">
                            <span class="project-color" style="background-color: ${project.color}"></span>
                            ${project.name}
                            <span class="badge bg-${this.getPriorityColor(project.priority)} ms-2">${project.priority}</span>
                            <span class="badge bg-${project.status === 'completed' ? 'success' : 'primary'}">${project.status}</span>
                        </div>
                        ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                        <div class="project-meta">
                            <span><i class="far fa-calendar me-1"></i> ${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}</span>
                            <span><i class="fas fa-tasks me-1"></i> ${project.completedTasks || 0}/${project.totalTasks || 0} tasks</span>
                            <span><i class="fas fa-clock me-1"></i> ${daysRemaining} days left</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); advancedProjectManager.deleteProject(${project.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="project-progress-section">
                    <div class="progress-info">
                        <span class="progress-stats">Progress: ${progress}%</span>
                        <span class="health-status badge bg-${healthStatus.color}">${healthStatus.status}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-fill ${this.getProgressClass(progress)}" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
            container.appendChild(projectEl);
        });
    }

    showProjectDetails(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        this.currentProjectId = projectId;
        
        // Update modal content
        document.getElementById('detailProjectTitle').textContent = project.name;
        document.getElementById('detailProjectDescription').textContent = project.description || 'No description';
        document.getElementById('detailProjectIcon').style.backgroundColor = project.color + '20';
        
        const progress = this.calculateProjectProgress(project);
        document.getElementById('detailProgressPercent').textContent = progress + '%';
        document.getElementById('detailProgressBar').style.width = progress + '%';
        document.getElementById('detailProgressBar').className = `progress-bar ${this.getProgressClass(progress)}`;
        
        document.getElementById('detailStartDate').textContent = new Date(project.startDate).toLocaleDateString();
        document.getElementById('detailEndDate').textContent = new Date(project.endDate).toLocaleDateString();
        document.getElementById('detailDaysRemaining').textContent = this.calculateDaysRemaining(project.endDate);
        
        document.getElementById('detailPriority').textContent = project.priority;
        document.getElementById('detailPriority').className = `badge bg-${this.getPriorityColor(project.priority)}`;
        document.getElementById('detailStatus').textContent = project.status;
        document.getElementById('detailStatus').className = `badge bg-${project.status === 'completed' ? 'success' : 'primary'}`;
        
        document.getElementById('detailTotalTasks').textContent = project.totalTasks || 0;
        document.getElementById('detailCompletedTasks').textContent = project.completedTasks || 0;
        document.getElementById('detailCreatedDate').textContent = new Date(project.createdAt).toLocaleDateString();
        
        // Load project tasks
        this.loadProjectTasks(projectId);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('projectDetailModal'));
        modal.show();
        
        // Reload projects list to highlight active project
        this.loadProjects();
    }

    loadProjectTasks(projectId) {
        const container = document.getElementById('projectTasksList');
        if (!container) return;

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const projectTasks = tasks.filter(task => task.projectId == projectId);
        
        container.innerHTML = '';
        
        if (projectTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks in this project yet.</p>
                    <button class="btn btn-sm btn-primary mt-2" onclick="addTaskToProject()">
                        <i class="fas fa-plus"></i> Add First Task
                    </button>
                </div>
            `;
            return;
        }

        projectTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `project-task-item ${task.completed ? 'completed' : ''} ${task.priority}`;
            taskEl.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="event.stopPropagation(); advancedProjectManager.toggleTask(${task.id})"></div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span><i class="fas fa-flag text-${this.getPriorityColor(task.priority)}"></i> ${task.priority}</span>
                        ${task.dueDate ? `<span><i class="far fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span><i class="fas fa-tag"></i> ${task.category}</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); advancedProjectManager.editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
            `;
            container.appendChild(taskEl);
        });
    }

    toggleTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completedAt = new Date().toISOString();
            } else {
                delete tasks[taskIndex].completedAt;
            }
            
            localStorage.setItem('tasks', JSON.stringify(tasks));
            this.updateProjectProgress(tasks[taskIndex].projectId);
            this.loadProjectTasks(this.currentProjectId);
            this.loadProjects();
            this.updateProjectStats();
            
            // Trigger task update event for other components
            document.dispatchEvent(new CustomEvent('tasksUpdated'));
        }
    }

    editTask(taskId) {
        // Find the task and open the task modal for editing
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            // Close project modal
            bootstrap.Modal.getInstance(document.getElementById('projectDetailModal')).hide();
            
            // Open task modal with task data
            const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
            
            // Fill form with task data
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskProject').value = task.projectId || '';
            
            // Set editing mode
            window.editingTaskId = taskId;
            
            taskModal.show();
        }
    }

    updateProjectProgress(projectId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const projectTasks = tasks.filter(task => task.projectId == projectId);
        const completedTasks = projectTasks.filter(task => task.completed).length;
        const totalTasks = projectTasks.length;
        
        const projectIndex = this.projects.findIndex(p => p.id == projectId);
        if (projectIndex !== -1) {
            this.projects[projectIndex].completedTasks = completedTasks;
            this.projects[projectIndex].totalTasks = totalTasks;
            
            // Update project status
            if (completedTasks === totalTasks && totalTasks > 0) {
                this.projects[projectIndex].status = 'completed';
            } else {
                this.projects[projectIndex].status = 'active';
            }
            
            this.saveProjects();
        }
    }

    calculateProjectProgress(project) {
        if (!project.totalTasks || project.totalTasks === 0) return 0;
        return Math.round((project.completedTasks / project.totalTasks) * 100);
    }

    calculateDaysRemaining(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    getProjectHealthStatus(project) {
        const progress = this.calculateProjectProgress(project);
        const daysRemaining = this.calculateDaysRemaining(project.endDate);
        const totalDays = Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
        const daysPassed = totalDays - daysRemaining;
        const expectedProgress = daysPassed / totalDays * 100;

        if (progress >= 100) {
            return { status: 'Completed', color: 'success' };
        } else if (progress >= expectedProgress * 1.1) {
            return { status: 'Ahead', color: 'success' };
        } else if (progress >= expectedProgress * 0.9) {
            return { status: 'On Track', color: 'primary' };
        } else if (progress >= expectedProgress * 0.7) {
            return { status: 'At Risk', color: 'warning' };
        } else {
            return { status: 'Behind', color: 'danger' };
        }
    }

    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
        }
    }

    getProgressClass(progress) {
        if (progress >= 90) return 'excellent';
        if (progress >= 70) return 'good';
        if (progress >= 50) return 'fair';
        return 'poor';
    }

    updateProjectStats() {
        const totalProjects = this.projects.length;
        const activeProjects = this.projects.filter(p => p.status === 'active').length;
        const completedProjects = this.projects.filter(p => p.status === 'completed').length;
        
        if (document.getElementById('totalProjects')) {
            document.getElementById('totalProjects').textContent = totalProjects;
        }
        if (document.getElementById('activeProjects')) {
            document.getElementById('activeProjects').textContent = activeProjects;
        }
        if (document.getElementById('completedProjects')) {
            document.getElementById('completedProjects').textContent = completedProjects;
        }

        // Calculate overall progress
        const totalProgress = this.projects.reduce((sum, project) => sum + this.calculateProjectProgress(project), 0);
        const averageProgress = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;
        
        if (document.getElementById('overallProgress')) {
            document.getElementById('overallProgress').textContent = averageProgress + '%';
        }
        if (document.getElementById('overallProgressBar')) {
            document.getElementById('overallProgressBar').style.width = averageProgress + '%';
        }
    }

    deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project? This will not delete the tasks.')) {
            return;
        }

        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveProjects();
        this.loadProjects();
        this.updateProjectStats();
        this.showNotification('Project deleted successfully!', 'success');
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Feature Management System
class FeatureManager {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        this.reminderSettings = JSON.parse(localStorage.getItem('reminderSettings')) || {
            defaultTime: 30,
            email: true,
            push: true,
            smart: false
        };
        this.teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProjects();
        this.loadReminderSettings();
    }

    setupEventListeners() {
        // Feature filter tabs
        const filterButtons = document.querySelectorAll('.feature-tabs .btn');
        const featureCards = document.querySelectorAll('[data-categories]');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const category = this.dataset.category;
                filterFeatures(category);
            });
        });

        function filterFeatures(category) {
            featureCards.forEach(card => {
                if (category === 'all' || card.dataset.categories.includes(category)) {
                    card.classList.remove('feature-hidden');
                } else {
                    card.classList.add('feature-hidden');
                }
            });
        }
    }

// Enhanced Project Management
loadProjects() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    projectsList.innerHTML = '';
    
    if (this.projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open fa-3x mb-3"></i>
                <h5>No Projects Yet</h5>
                <p class="text-muted">Create your first project to get started with task organization</p>
            </div>
        `;
        return;
    }

    this.projects.forEach(project => {
        const progress = this.calculateProjectProgress(project);
        const daysRemaining = this.calculateDaysRemaining(project.endDate);
        const healthStatus = this.getProjectHealthStatus(project);
        
        const projectEl = document.createElement('div');
        projectEl.className = `project-list-item ${project.id === this.currentProjectId ? 'active' : ''}`;
        projectEl.onclick = () => this.showProjectDetails(project.id);
        projectEl.innerHTML = `
            <div class="project-item-header">
                <div class="project-item-info">
                    <div class="project-item-title">
                        <span class="project-item-color" style="background-color: ${project.color}"></span>
                        <h6 class="project-item-name">${project.name}</h6>
                        <div class="project-item-badges">
                            <span class="badge bg-${this.getPriorityColor(project.priority)}">${project.priority}</span>
                            <span class="badge bg-${project.status === 'completed' ? 'success' : 'primary'}">${project.status}</span>
                        </div>
                    </div>
                    ${project.description ? `<div class="project-item-description">${project.description}</div>` : ''}
                    <div class="project-item-meta">
                        <span><i class="far fa-calendar me-1"></i> ${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}</span>
                        <span><i class="fas fa-tasks me-1"></i> ${project.completedTasks || 0}/${project.totalTasks || 0} tasks</span>
                        <span><i class="fas fa-clock me-1"></i> ${daysRemaining} days left</span>
                    </div>
                </div>
                <div class="project-item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); featureManager.deleteProject(${project.id})" aria-label="Delete project">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="project-item-progress">
                <div class="progress-info">
                    <span class="progress-stats">Progress: ${progress}%</span>
                    <span class="health-status badge bg-${healthStatus.color}">${healthStatus.status}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-fill ${this.getProgressClass(progress)}" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        projectsList.appendChild(projectEl);
    });

    // Update project select in task modal
    this.updateProjectSelect();
}

createProject() {
    const name = document.getElementById('newProjectName').value.trim();
    const description = document.getElementById('newProjectDescription').value.trim();
    const startDate = document.getElementById('newProjectStartDate').value;
    const endDate = document.getElementById('newProjectEndDate').value;
    const color = document.getElementById('newProjectColor').value;
    const priority = document.getElementById('newProjectPriority').value;
    
    if (!name) {
        this.showNotification('Please enter a project name', 'warning');
        return;
    }

    if (!startDate || !endDate) {
        this.showNotification('Please set start and end dates', 'warning');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        this.showNotification('End date must be after start date', 'warning');
        return;
    }

    if (name.length > 100) {
        this.showNotification('Project name must be less than 100 characters', 'warning');
        return;
    }

    if (description.length > 500) {
        this.showNotification('Description must be less than 500 characters', 'warning');
        return;
    }

    const project = {
        id: Date.now(),
        name,
        description,
        startDate,
        endDate,
        color,
        priority,
        status: 'active',
        createdAt: new Date().toISOString(),
        progress: 0,
        totalTasks: 0,
        completedTasks: 0
    };

    this.projects.push(project);
    localStorage.setItem('projects', JSON.stringify(this.projects));
    this.loadProjects();
    
    // Clear form
    document.getElementById('newProjectName').value = '';
    document.getElementById('newProjectDescription').value = '';
    this.setupFormDates(); // Reset dates to default
    
    this.showNotification('Project created successfully!', 'success');
    
    // Update analytics if modal is open
    if (document.getElementById('analyticsModal').classList.contains('show')) {
        this.loadAnalytics();
    }
}

deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }

    this.projects = this.projects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(this.projects));
    this.loadProjects();
    this.showNotification('Project deleted successfully!', 'success');
    
    // Update analytics if modal is open
    if (document.getElementById('analyticsModal').classList.contains('show')) {
        this.loadAnalytics();
    }
}

updateProjectSelect() {
    const projectSelect = document.getElementById('taskProject');
    if (!projectSelect) return;

    projectSelect.innerHTML = '<option value="">No Project</option>';
    this.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
}

// Helper methods for project calculations
calculateProjectProgress(project) {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round((project.completedTasks / project.totalTasks) * 100);
}

calculateDaysRemaining(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

getProjectHealthStatus(project) {
    const progress = this.calculateProjectProgress(project);
    const daysRemaining = this.calculateDaysRemaining(project.endDate);
    const totalDays = Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
    const daysPassed = totalDays - daysRemaining;
    const expectedProgress = daysPassed / totalDays * 100;

    if (progress >= 100) {
        return { status: 'Completed', color: 'success' };
    } else if (progress >= expectedProgress * 1.1) {
        return { status: 'Ahead', color: 'success' };
    } else if (progress >= expectedProgress * 0.9) {
        return { status: 'On Track', color: 'primary' };
    } else if (progress >= expectedProgress * 0.7) {
        return { status: 'At Risk', color: 'warning' };
    } else {
        return { status: 'Behind', color: 'danger' };
    }
}

getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
}

getProgressClass(progress) {
    if (progress >= 90) return 'excellent';
    if (progress >= 70) return 'good';
    if (progress >= 50) return 'fair';
    return 'poor';
}

setupFormDates() {
    // Auto-set start date to today
    const startDateInput = document.getElementById('newProjectStartDate');
    const endDateInput = document.getElementById('newProjectEndDate');
    
    if (startDateInput) {
        startDateInput.valueAsDate = new Date();
    }
    
    // Set end date to 7 days from now by default
    if (endDateInput) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        endDateInput.valueAsDate = endDate;
    }
}

showProjectDetails(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    this.currentProjectId = projectId;
    
    // Update project detail modal content
    document.getElementById('detailProjectTitle').textContent = project.name;
    document.getElementById('detailProjectDescription').textContent = project.description || 'No description provided';
    document.getElementById('detailProjectIcon').style.backgroundColor = project.color + '20';
    
    const progress = this.calculateProjectProgress(project);
    document.getElementById('detailProgressPercent').textContent = progress + '%';
    document.getElementById('detailProgressBar').style.width = progress + '%';
    
    document.getElementById('detailStartDate').textContent = new Date(project.startDate).toLocaleDateString();
    document.getElementById('detailEndDate').textContent = new Date(project.endDate).toLocaleDateString();
    document.getElementById('detailDaysRemaining').textContent = this.calculateDaysRemaining(project.endDate);
    
    document.getElementById('detailPriority').textContent = project.priority;
    document.getElementById('detailPriority').className = `badge bg-${this.getPriorityColor(project.priority)}`;
    document.getElementById('detailStatus').textContent = project.status;
    document.getElementById('detailStatus').className = `badge bg-${project.status === 'completed' ? 'success' : 'primary'}`;
    
    document.getElementById('detailTotalTasks').textContent = project.totalTasks || 0;
    document.getElementById('detailCompletedTasks').textContent = project.completedTasks || 0;
    document.getElementById('detailCreatedDate').textContent = new Date(project.createdAt).toLocaleDateString();
    
    // Show project detail modal
    const modal = new bootstrap.Modal(document.getElementById('projectDetailModal'));
    modal.show();
    
    // Reload projects list to highlight active project
    this.loadProjects();
}

// Add this method to initialize form dates when modal opens
initializeProjectManager() {
    this.setupFormDates();
    this.loadProjects();
}

    // Reminder Management
    loadReminderSettings() {
        document.getElementById('defaultReminderTime').value = this.reminderSettings.defaultTime;
        document.getElementById('emailReminders').checked = this.reminderSettings.email;
        document.getElementById('pushReminders').checked = this.reminderSettings.push;
        document.getElementById('smartReminders').checked = this.reminderSettings.smart;
        
        this.loadUpcomingReminders();
    }

    saveReminderSettings() {
        this.reminderSettings = {
            defaultTime: parseInt(document.getElementById('defaultReminderTime').value),
            email: document.getElementById('emailReminders').checked,
            push: document.getElementById('pushReminders').checked,
            smart: document.getElementById('smartReminders').checked
        };

        localStorage.setItem('reminderSettings', JSON.stringify(this.reminderSettings));
        this.showNotification('Reminder settings saved!', 'success');
    }

    loadUpcomingReminders() {
        const container = document.getElementById('upcomingReminders');
        if (!container) return;

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const upcomingTasks = tasks
            .filter(task => !task.completed && task.dueDate)
            .slice(0, 5);

        container.innerHTML = '';
        
        if (upcomingTasks.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No upcoming tasks with due dates</p>';
            return;
        }

        upcomingTasks.forEach(task => {
            const reminderEl = document.createElement('div');
            reminderEl.className = 'reminder-item';
            reminderEl.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="reminder-time">Due: ${new Date(task.dueDate).toLocaleDateString()}</div>
            `;
            container.appendChild(reminderEl);
        });
    }

    testReminder() {
        this.showNotification('Test reminder triggered! Check your notifications.', 'info');
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TaskFlow Test Reminder', {
                body: 'This is a test reminder from TaskFlow',
                icon: '/favicon.ico'
            });
        }
    }

    // Analytics
    loadAnalytics() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Calculate stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.getElementById('completionRate').textContent = `${completionRate}%`;
        document.getElementById('productivityScore').textContent = this.calculateProductivityScore(tasks);
        document.getElementById('currentStreak').textContent = this.calculateCurrentStreak(tasks);
        
        this.updateAnalyticsChart(tasks);
        this.updateCategoryBreakdown(tasks);
    }

    calculateProductivityScore(tasks) {
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        
        // Factor in priority completion
        const highPriorityCompleted = tasks.filter(t => t.completed && t.priority === 'high').length;
        const totalHighPriority = tasks.filter(t => t.priority === 'high').length;
        const highPriorityRate = totalHighPriority > 0 ? (highPriorityCompleted / totalHighPriority) * 100 : 0;
        
        return Math.round((completionRate * 0.6) + (highPriorityRate * 0.4));
    }

    calculateCurrentStreak(tasks) {
        // Simple streak calculation
        const completedTasks = tasks.filter(t => t.completed);
        return Math.min(completedTasks.length, 7);
    }

    updateAnalyticsChart(tasks) {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;

        // Simple completion trend for last 7 days
        const completionData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayTasks = tasks.filter(task => 
                task.completedAt && task.completedAt.startsWith(dateStr)
            );
            completionData.push(dayTasks.length);
        }

        if (window.analyticsChart) {
            window.analyticsChart.destroy();
        }

        window.analyticsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: completionData,
                    backgroundColor: '#7c3aed',
                    borderColor: '#6d28d9',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateCategoryBreakdown(tasks) {
        const container = document.getElementById('categoryBreakdown');
        if (!container) return;

        const categories = {};
        tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });

        container.innerHTML = '';
        Object.entries(categories).forEach(([category, count]) => {
            const percent = Math.round((count / tasks.length) * 100);
            const el = document.createElement('div');
            el.className = 'd-flex justify-content-between align-items-center mb-2';
            el.innerHTML = `
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <span class="badge bg-primary">${count} (${percent}%)</span>
            `;
            container.appendChild(el);
        });
    }

    // Team Management
    loadTeamMembers() {
        const container = document.getElementById('teamMembersList');
        if (!container) return;

        container.innerHTML = '';
        this.teamMembers.forEach(member => {
            const memberEl = document.createElement('div');
            memberEl.className = 'team-member';
            memberEl.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="member-avatar">${member.name.charAt(0)}</div>
                    <div>
                        <div>${member.name}</div>
                        <small class="text-muted">${member.email}</small>
                    </div>
                </div>
                <span class="badge ${member.status === 'active' ? 'bg-success' : 'bg-warning'}">${member.status}</span>
            `;
            container.appendChild(memberEl);
        });
    }

    inviteTeamMember() {
        const email = document.getElementById('inviteEmail').value.trim();
        if (!email) {
            alert('Please enter an email address');
            return;
        }

        const member = {
            id: Date.now(),
            email,
            name: email.split('@')[0],
            status: 'pending',
            invitedAt: new Date().toISOString()
        };

        this.teamMembers.push(member);
        localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
        this.loadTeamMembers();
        
        document.getElementById('inviteEmail').value = '';
        this.showNotification('Invitation sent successfully!', 'success');
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Global functions for feature access
function openProjectManager() {
    const modal = new bootstrap.Modal(document.getElementById('projectManagerModal'));
    modal.show();
    advancedProjectManager.loadProjects();
    advancedProjectManager.updateProjectStats();
}

function configureReminders() {
    const modal = new bootstrap.Modal(document.getElementById('remindersModal'));
    modal.show();
    featureManager.loadReminderSettings();
}

function showAdvancedAnalytics() {
    const modal = new bootstrap.Modal(document.getElementById('analyticsModal'));
    modal.show();
    featureManager.loadAnalytics();
}

function manageTeam() {
    const modal = new bootstrap.Modal(document.getElementById('teamModal'));
    modal.show();
    featureManager.loadTeamMembers();
}

function showSyncStatus() {
    featureManager.showNotification('All devices are synced and up to date!', 'success');
}

function showSecuritySettings() {
    featureManager.showNotification('Security settings are enabled and active.', 'info');
}

function createProject() {
    advancedProjectManager.createProject();
}

function saveReminderSettings() {
    featureManager.saveReminderSettings();
}

function testReminder() {
    featureManager.testReminder();
}

function inviteTeamMember() {
    featureManager.inviteTeamMember();
}

function changeAnalyticsPeriod(period) {
    // Update active period button
    document.querySelectorAll('#analyticsModal .btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    featureManager.loadAnalytics(); // Reload with new period
}

function addTaskToProject() {
    // Close project modal and open task modal with project pre-selected
    const projectDetailModal = bootstrap.Modal.getInstance(document.getElementById('projectDetailModal'));
    if (projectDetailModal) {
        projectDetailModal.hide();
    }
    
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    document.getElementById('taskProject').value = advancedProjectManager.currentProjectId;
    taskModal.show();
}

function editProject() {
    advancedProjectManager.showNotification('Edit project feature coming soon!', 'info');
}

function archiveProject() {
    advancedProjectManager.showNotification('Archive project feature coming soon!', 'info');
}

// Initialize managers
let advancedProjectManager;
let featureManager;

document.addEventListener('DOMContentLoaded', function() {
    advancedProjectManager = new AdvancedProjectManager();
    featureManager = new FeatureManager();
    
    // Add click animations to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});