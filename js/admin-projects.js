// ============================================
// Управление проектами (Админ) - JavaScript
// ============================================

let editingProjectId = null;

// Загрузка проектов для администратора
function loadAdminProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const grid = document.getElementById('adminProjectsGrid');
    
    // Оставляем только кнопку добавления
    let html = `
        <div class="col-md-6 col-lg-4">
            <div class="add-project-card" onclick="openProjectModal()">
                <i class="fas fa-plus"></i>
                <p>Добавить новый проект</p>
            </div>
        </div>
    `;
    
    // Добавляем карточки проектов
    html += projects.map(project => {
        const progress = Math.round((project.collected_amount / project.target_amount) * 100);
        const statusText = {
            'active': 'Текущий',
            'planned': 'Запланирован',
            'completed': 'Завершен'
        }[project.status];
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="admin-project-card">
                    <h3 class="admin-project-title">${project.name}</h3>
                    
                    <div class="admin-project-info">
                        <div class="admin-project-info-row">
                            <span class="project-info-label">Участники</span>
                        </div>
                        <div class="admin-project-info-row">
                            <span class="project-info-label"><i class="fas fa-hands-helping"></i> Волонтер</span>
                            <span class="project-info-value">${project.participants?.volunteers || 0}</span>
                        </div>
                        <div class="admin-project-info-row">
                            <span class="project-info-label"><i class="fas fa-heart"></i> Благотворитель</span>
                            <span class="project-info-value">${project.participants?.donors || 0}</span>
                        </div>
                        
                        <div class="progress-bar-container">
                            <div class="progress">
                                <div class="progress-bar" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-text">
                                ${project.collected_amount.toLocaleString('ru-RU')} / ${project.target_amount.toLocaleString('ru-RU')} руб.
                            </div>
                        </div>
                        
                        <div class="admin-project-info-row">
                            <span class="project-info-label"><i class="fas fa-clock"></i> Часы</span>
                            <span class="project-info-value">${project.total_hours} ч.</span>
                        </div>
                        
                        <div class="admin-project-info-row">
                            <span class="project-info-label"><i class="fas fa-info-circle"></i> Статус</span>
                            <span class="project-status status-${project.status}">
                                <i class="fas fa-circle" style="font-size: 8px;"></i> ${statusText}
                            </span>
                        </div>
                    </div>
                    
                    <div class="admin-project-dates">
                        <i class="fas fa-calendar-alt"></i> 
                        ${formatDate(project.start_date)} - ${formatDate(project.end_date)}
                    </div>
                    
                    <button class="btn-edit-project" onclick="editProject(${project.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    grid.innerHTML = html;
}

// Открыть модальное окно для добавления
function openProjectModal() {
    editingProjectId = null;
    document.getElementById('modalTitle').textContent = 'Добавить проект';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
    
    // Устанавливаем даты по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('projectStartDate').value = today;
    document.getElementById('projectEndDate').value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
}

// Редактирование проекта
function editProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;
    
    editingProjectId = projectId;
    document.getElementById('modalTitle').textContent = 'Редактировать проект';
    document.getElementById('deleteBtn').style.display = 'inline-block';
    
    // Заполняем форму
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectFullDescription').value = project.full_description || '';
    document.getElementById('projectStartDate').value = project.start_date;
    document.getElementById('projectEndDate').value = project.end_date;
    document.getElementById('projectTargetAmount').value = project.target_amount;
    document.getElementById('projectDonationAmount').value = project.donation_amount;
    document.getElementById('projectHours').value = project.total_hours;
    document.getElementById('projectStatus').value = project.status;
    document.getElementById('projectImage').value = project.image || '';
    
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
}

// Сохранение проекта
function saveProject() {
    const form = document.getElementById('projectForm');
    
    // Валидация
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    const projectData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        full_description: document.getElementById('projectFullDescription').value,
        start_date: document.getElementById('projectStartDate').value,
        end_date: document.getElementById('projectEndDate').value,
        target_amount: parseInt(document.getElementById('projectTargetAmount').value),
        donation_amount: parseInt(document.getElementById('projectDonationAmount').value),
        total_hours: parseInt(document.getElementById('projectHours').value),
        status: document.getElementById('projectStatus').value,
        image: document.getElementById('projectImage').value || 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400'
    };
    
    if (editingProjectId) {
        // Редактирование
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = { 
                ...projects[index], 
                ...projectData,
                updated_at: new Date().toISOString()
            };
        }
    } else {
        // Добавление нового
        const newProject = {
            id: Date.now(),
            ...projectData,
            collected_amount: 0,
            participants: { volunteers: 0, donors: 0 },
            created_at: new Date().toISOString()
        };
        projects.push(newProject);
    }
    
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
    modal.hide();
    
    // Перезагружаем список
    loadAdminProjects();
    
    alert(editingProjectId ? 'Проект обновлен!' : 'Проект добавлен!');
}

// Удаление проекта
function deleteProject() {
    if (!editingProjectId) return;
    
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;
    
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects = projects.filter(p => p.id !== editingProjectId);
    
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
    modal.hide();
    
    // Перезагружаем список
    loadAdminProjects();
    
    alert('Проект удален!');
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Автоматическое определение статуса от дат
function autoUpdateProjectStatus() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    projects.forEach(project => {
        if (project.status === 'completed') return; // Не меняем завершенные
        
        if (today < project.start_date) {
            project.status = 'planned';
        } else if (today >= project.start_date && today <= project.end_date) {
            project.status = 'active';
        } else if (today > project.end_date) {
            project.status = 'completed';
        }
    });
    
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Запускаем автообновление статусов при загрузке
document.addEventListener('DOMContentLoaded', autoUpdateProjectStatus);
