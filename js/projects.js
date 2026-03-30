// ============================================
// Страница Проекты - JavaScript
// ============================================

// Данные проектов (в реальном приложении загружаются с сервера)
let projectsData = [];
let currentFilter = 'all';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    initFilters();
});

// Загрузка проектов
function loadProjects() {
    // В реальном приложении: fetch('/api/projects')
    // Здесь используем localStorage для демонстрации
    projectsData = JSON.parse(localStorage.getItem('projects')) || getDefaultProjects();
    
    // Сохраняем если это первый запуск
    if (!localStorage.getItem('projects')) {
        localStorage.setItem('projects', JSON.stringify(projectsData));
    }
    
    renderProjects();
}

// Проекты по умолчанию
function getDefaultProjects() {
    return [
        {
            id: 1,
            name: 'Очистка побережья Балтики',
            description: 'Масштабная акция по очистке берегов Балтийского моря от пластика',
            image: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?w=400',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active',
            target_amount: 500000,
            collected_amount: 125000,
            donation_amount: 2500,
            total_hours: 120,
            participants: { volunteers: 15, donors: 8 }
        },
        {
            id: 2,
            name: 'Спасение тюленей',
            description: 'Программа реабилитации и спасения пострадавших тюленей',
            image: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=400',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active',
            target_amount: 300000,
            collected_amount: 75000,
            donation_amount: 3000,
            total_hours: 80,
            participants: { volunteers: 10, donors: 5 }
        },
        {
            id: 3,
            name: 'Восстановление коралловых рифов',
            description: 'Проект по восстановлению и выращиванию кораллов',
            image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400',
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'planned',
            target_amount: 800000,
            collected_amount: 0,
            donation_amount: 5000,
            total_hours: 200,
            participants: { volunteers: 0, donors: 0 }
        },
        {
            id: 4,
            name: 'Образовательные программы',
            description: 'Обучение детей и взрослых экологии океана',
            image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
            start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'completed',
            target_amount: 200000,
            collected_amount: 200000,
            donation_amount: 2000,
            total_hours: 50,
            participants: { volunteers: 25, donors: 12 }
        },
        {
            id: 5,
            name: 'Исследование морской фауны',
            description: 'Научная экспедиция по изучению морских обитателей',
            image: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=400',
            start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'planned',
            target_amount: 600000,
            collected_amount: 0,
            donation_amount: 4000,
            total_hours: 150,
            participants: { volunteers: 0, donors: 0 }
        }
    ];
}

// Инициализация фильтров
function initFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderProjects();
        });
    });
}

// Отрисовка проектов
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    // Фильтрация проектов
    let filteredProjects = projectsData;
    if (currentFilter !== 'all') {
        filteredProjects = projectsData.filter(p => p.status === currentFilter);
    }
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <p style="padding: 40px; color: #666;">Нет проектов в этой категории</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredProjects.map(project => {
        const progress = Math.round((project.collected_amount / project.target_amount) * 100);
        const statusClass = `status-${project.status}`;
        const statusText = {
            'active': 'Текущий',
            'planned': 'Запланирован',
            'completed': 'Завершен'
        }[project.status];
        
        const isJoined = isUserJoined(project.id);
        const joinBtnText = isJoined ? 'Вы участвуете' : 'Присоединиться';
        const joinBtnDisabled = isJoined || project.status === 'completed' ? 'disabled' : '';
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="project-card">
                    <h3 class="project-title">${project.name}</h3>
                    
                    <div class="project-info-row">
                        <span class="project-info-label">Участники</span>
                    </div>
                    <div class="project-info-row">
                        <span class="project-info-label"><i class="fas fa-hands-helping"></i> Волонтер</span>
                        <span class="project-info-value">${project.participants?.volunteers || 0}</span>
                    </div>
                    <div class="project-info-row">
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
                    
                    <div class="project-info-row">
                        <span class="project-info-label"><i class="fas fa-clock"></i> Часы работы</span>
                        <span class="project-info-value">${project.total_hours} ч.</span>
                    </div>
                    
                    <div class="project-info-row">
                        <span class="project-info-label"><i class="fas fa-info-circle"></i> Статус</span>
                        <span class="project-status ${statusClass}">
                            <i class="fas fa-circle" style="font-size: 8px;"></i> ${statusText}
                        </span>
                    </div>
                    
                    <div class="project-dates">
                        <i class="fas fa-calendar-alt"></i> 
                        ${formatDate(project.start_date)} - ${formatDate(project.end_date)}
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn-project btn-join" ${joinBtnDisabled} onclick="handleJoin(${project.id})">
                            ${joinBtnText}
                        </button>
                        <a href="project-detail.html?id=${project.id}" class="btn-project btn-details">
                            Подробнее
                        </a>
                    </div>
                    
                    ${project.status !== 'completed' ? `
                        <button class="btn-project btn-donate mt-2" onclick="handleDonate(${project.id})">
                            <i class="fas fa-donate"></i> Задонатить
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Проверка, присоединился ли пользователь к проекту
function isUserJoined(projectId) {
    if (!AppState.currentUser) return false;
    
    const participants = JSON.parse(localStorage.getItem('project_participants')) || [];
    return participants.some(p => 
        p.project_id === projectId && 
        p.user_id === AppState.currentUser.id
    );
}

// Обработка присоединения к проекту
function handleJoin(projectId) {
    // Проверка авторизации
    if (!AppState.currentUser) {
        // Сохраняем URL для возврата
        sessionStorage.setItem('redirectAfterLogin', 'projects.html');
        window.location.href = 'login.html';
        return;
    }
    
    // Показываем модальное окно подтверждения
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = 
        'Вы уверены, что хотите присоединиться к проекту?';
    
    document.getElementById('confirmBtn').onclick = function() {
        joinProject(projectId);
        modal.hide();
    };
    
    modal.show();
}

// Присоединение к проекту
function joinProject(projectId) {
    const participants = JSON.parse(localStorage.getItem('project_participants')) || [];
    
    // Определяем роль пользователя
    let role = 'volunteer';
    if (AppState.currentUser.is_donor && !AppState.currentUser.is_volunteer) {
        role = 'donor';
    }
    
    participants.push({
        project_id: projectId,
        user_id: AppState.currentUser.id,
        role: role,
        hours_contributed: 0,
        amount_donated: 0,
        joined_at: new Date().toISOString()
    });
    
    localStorage.setItem('project_participants', JSON.stringify(participants));
    
    // Обновляем счетчик участников в проекте
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
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
    loadProjects();
}

// Обработка доната
function handleDonate(projectId) {
    // Проверка авторизации
    if (!AppState.currentUser) {
        sessionStorage.setItem('redirectAfterLogin', 'projects.html');
        window.location.href = 'login.html';
        return;
    }
    
    // Переходим на страницу донатов с выбранным проектом
    sessionStorage.setItem('selectedProjectId', projectId);
    window.location.href = 'donate.html';
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}
