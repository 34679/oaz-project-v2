// ============================================
// Управление проектами для донатов (Админ) - JavaScript
// ============================================

let editingProjectId = null;

// Загрузка проектов для администратора
function loadManageProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const container = document.getElementById('manageList');
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Нет проектов</p>';
        return;
    }
    
    container.innerHTML = projects.map(item => {
        const progress = Math.round((item.collected_amount / item.target_amount) * 100);
        return `
            <div class="manage-card">
                <div class="manage-card-info">
                    <h4>${item.name}</h4>
                    <p>${item.description} | ${item.donation_amount} руб. | Прогресс: ${progress}%</p>
                </div>
                <div class="manage-card-actions">
                    <button class="btn-edit" onclick="editProject(${item.id})">Редактировать</button>
                    <button class="btn-delete" onclick="deleteProjectById(${item.id})">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

// Открыть модальное окно для добавления
function openProjectModal() {
    editingProjectId = null;
    document.getElementById('modalTitle').textContent = 'Добавить проект';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('deleteProjectBtn').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
}

// Редактирование проекта
function editProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const item = projects.find(p => p.id === projectId);
    
    if (!item) return;
    
    editingProjectId = projectId;
    document.getElementById('modalTitle').textContent = 'Редактировать проект';
    document.getElementById('deleteProjectBtn').style.display = 'inline-block';
    
    // Заполняем форму
    document.getElementById('projectId').value = item.id;
    document.getElementById('projectName').value = item.name;
    document.getElementById('projectDesc').value = item.description;
    document.getElementById('projectAmount').value = item.donation_amount;
    document.getElementById('projectImage').value = item.image || '';
    
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
        description: document.getElementById('projectDesc').value,
        donation_amount: parseInt(document.getElementById('projectAmount').value),
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
            target_amount: 100000,
            collected_amount: 0,
            total_hours: 0,
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    loadManageProjects();
    
    alert(editingProjectId ? 'Проект обновлен!' : 'Проект добавлен!');
}

// Удаление проекта (из формы редактирования)
function deleteProject() {
    if (!editingProjectId) return;
    deleteProjectById(editingProjectId);
}

// Удаление проекта по ID
function deleteProjectById(projectId) {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;
    
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects = projects.filter(p => p.id !== projectId);
    
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Закрываем модальное окно если открыто
    const modalElement = document.getElementById('projectModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
    
    // Перезагружаем список
    loadManageProjects();
    
    alert('Проект удален!');
}
