// ============================================
// Детали проекта - JavaScript
// ============================================

let currentProject = null;
let currentProjectId = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Получаем ID проекта из URL
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = parseInt(urlParams.get('id'));
    
    if (!currentProjectId) {
        window.location.href = 'projects.html';
        return;
    }
    
    loadProjectDetails();
});

// Загрузка деталей проекта
function loadProjectDetails() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    currentProject = projects.find(p => p.id === currentProjectId);
    
    if (!currentProject) {
        alert('Проект не найден');
        window.location.href = 'projects.html';
        return;
    }
    
    // Заполняем информацию
    document.getElementById('projectImage').src = currentProject.image;
    document.getElementById('projectImage').alt = currentProject.name;
    document.getElementById('projectTitle').textContent = currentProject.name;
    document.getElementById('projectDescription').textContent = currentProject.description;
    document.getElementById('projectFullDescription').innerHTML = 
        currentProject.full_description || currentProject.description;
    
    // Даты
    document.getElementById('projectStartDate').textContent = formatDate(currentProject.start_date);
    document.getElementById('projectEndDate').textContent = formatDate(currentProject.end_date);
    
    // Часы
    document.getElementById('projectHours').textContent = `${currentProject.total_hours} ч.`;
    
    // Участники
    const participants = currentProject.participants || { volunteers: 0, donors: 0 };
    const totalParticipants = participants.volunteers + participants.donors;
    document.getElementById('projectParticipants').textContent = totalParticipants;
    
    // Прогресс
    const progress = Math.round((currentProject.collected_amount / currentProject.target_amount) * 100);
    document.getElementById('projectProgress').style.width = `${progress}%`;
    document.getElementById('projectAmounts').textContent = 
        `${currentProject.collected_amount.toLocaleString('ru-RU')} / ${currentProject.target_amount.toLocaleString('ru-RU')} руб.`;
    
    // Статус
    const statusText = {
        'active': 'Текущий',
        'planned': 'Запланирован',
        'completed': 'Завершен'
    }[currentProject.status] || currentProject.status;
    
    const statusBadge = document.getElementById('projectStatus');
    statusBadge.textContent = statusText;
    statusBadge.className = `status-badge status-${currentProject.status}`;
    
    // Обновляем кнопки
    updateActionButtons();
}

// Обновление кнопок действий
function updateActionButtons() {
    const joinBtn = document.getElementById('joinBtn');
    const donateBtn = document.getElementById('donateBtn');
    
    // Если проект завершен - отключаем кнопки
    if (currentProject.status === 'completed') {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Проект завершен';
        donateBtn.disabled = true;
        donateBtn.textContent = 'Проект завершен';
        return;
    }
    
    // Проверяем, присоединился ли пользователь
    if (AppState.currentUser && isUserJoined(currentProjectId)) {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Вы участвуете';
    }
}

// Проверка, присоединился ли пользователь
function isUserJoined(projectId) {
    if (!AppState.currentUser) return false;
    
    const participants = JSON.parse(localStorage.getItem('project_participants')) || [];
    return participants.some(p => 
        p.project_id === projectId && 
        p.user_id === AppState.currentUser.id
    );
}

// Обработка присоединения к проекту
function handleJoinProject() {
    // Проверка авторизации
    if (!AppState.currentUser) {
        sessionStorage.setItem('redirectAfterLogin', `project-detail.html?id=${currentProjectId}`);
        window.location.href = 'login.html';
        return;
    }
    
    // Проверка, не присоединился ли уже
    if (isUserJoined(currentProjectId)) {
        alert('Вы уже участвуете в этом проекте!');
        return;
    }
    
    // Показываем модальное окно подтверждения
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = 
        `Вы уверены, что хотите присоединиться к проекту "${currentProject.name}"?`;
    
    document.getElementById('confirmActionBtn').onclick = function() {
        joinProject();
        modal.hide();
    };
    
    modal.show();
}

// Присоединение к проекту
function joinProject() {
    const participants = JSON.parse(localStorage.getItem('project_participants')) || [];
    
    // Определяем роль пользователя
    let role = 'volunteer';
    if (AppState.currentUser.is_donor && !AppState.currentUser.is_volunteer) {
        role = 'donor';
    }
    
    participants.push({
        project_id: currentProjectId,
        user_id: AppState.currentUser.id,
        role: role,
        hours_contributed: 0,
        amount_donated: 0,
        joined_at: new Date().toISOString()
    });
    
    localStorage.setItem('project_participants', JSON.stringify(participants));
    
    // Обновляем счетчик участников в проекте
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
        if (!project.participants) project.participants = { volunteers: 0, donors: 0 };
        if (role === 'volunteer') {
            project.participants.volunteers++;
        } else {
            project.participants.donors++;
        }
        localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    alert('Вы успешно присоединились к проекту!');
    loadProjectDetails();
}

// Обработка доната
function handleDonateProject() {
    // Проверка авторизации
    if (!AppState.currentUser) {
        sessionStorage.setItem('redirectAfterLogin', `project-detail.html?id=${currentProjectId}`);
        window.location.href = 'login.html';
        return;
    }
    
    // Переходим на страницу донатов с выбранным проектом
    sessionStorage.setItem('selectedProjectId', currentProjectId);
    window.location.href = 'donate.html';
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}
