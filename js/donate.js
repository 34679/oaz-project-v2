// ============================================
// Страница донатов - JavaScript
// ============================================

let selectedProjects = [];
let useCustomAmount = false;
let projectsData = [];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadProjectsForDonate();
    
    // Проверяем, есть ли выбранный проект из projects.html
    const selectedProjectId = sessionStorage.getItem('selectedProjectId');
    if (selectedProjectId) {
        setTimeout(() => {
            const projectElement = document.querySelector(`.project-item[data-id="${selectedProjectId}"]`);
            if (projectElement) {
                toggleProject(projectElement);
            }
            sessionStorage.removeItem('selectedProjectId');
        }, 100);
    }
});

// Загрузка проектов
function loadProjectsForDonate() {
    projectsData = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Фильтруем только активные и запланированные проекты
    const availableProjects = projectsData.filter(p => p.status !== 'completed');
    
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    if (availableProjects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Нет доступных проектов для пожертвований</p>';
        return;
    }
    
    // Показываем первые 4 проекта
    const displayProjects = availableProjects.slice(0, 4);
    
    container.innerHTML = displayProjects.map(project => `
        <div class="project-item" data-id="${project.id}" data-amount="${project.donation_amount}" onclick="toggleProject(this)">
            <img src="${project.image}" alt="${project.name}">
            <div class="project-item-overlay">${project.name}</div>
            <div class="project-checkbox">✓</div>
        </div>
    `).join('');
}

// Переключение выбора проекта
function toggleProject(element) {
    if (useCustomAmount) {
        // Сбрасываем произвольную сумму
        useCustomAmount = false;
        document.getElementById('customAmountSection').classList.remove('active');
        document.getElementById('customAmount').value = '';
    }
    
    const id = parseInt(element.dataset.id);
    const amount = parseInt(element.dataset.amount);
    
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        selectedProjects.push({ id, amount });
    } else {
        selectedProjects = selectedProjects.filter(p => p.id !== id);
    }
    
    updateDonateSummary();
}

// Включение произвольной суммы
function enableCustomAmount() {
    useCustomAmount = true;
    
    // Сбрасываем выбранные проекты
    selectedProjects = [];
    document.querySelectorAll('.project-item').forEach(p => p.classList.remove('selected'));
    
    document.getElementById('customAmountSection').classList.add('active');
    document.getElementById('customAmount').focus();
    
    updateDonateSummary();
}

// Обновление итоговой суммы
function updateDonateSummary() {
    let total = 0;
    
    if (useCustomAmount) {
        const customAmount = parseInt(document.getElementById('customAmount').value) || 0;
        total = customAmount;
    } else {
        total = selectedProjects.reduce((sum, p) => sum + p.amount, 0);
    }
    
    document.getElementById('donateAmount').textContent = total.toLocaleString('ru-RU');
}

// Показать модальное окно со всеми проектами
function showAllProjectsModal() {
    const modal = new bootstrap.Modal(document.getElementById('allProjectsModal'));
    const grid = document.getElementById('allProjectsGrid');
    
    const availableProjects = projectsData.filter(p => p.status !== 'completed');
    
    grid.innerHTML = availableProjects.map(project => {
        const isSelected = selectedProjects.some(p => p.id === project.id);
        return `
            <div class="col-md-6 mb-3">
                <div class="project-item ${isSelected ? 'selected' : ''}" 
                     data-id="${project.id}" 
                     data-amount="${project.donation_amount}"
                     onclick="toggleProjectInModal(this)"
                     style="position: relative;">
                    <img src="${project.image}" alt="${project.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;">
                    <div class="project-item-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 15px; color: white; border-radius: 0 0 10px 10px;">
                        ${project.name}
                    </div>
                    <div class="project-checkbox" style="opacity: ${isSelected ? '1' : '0'};">✓</div>
                </div>
            </div>
        `;
    }).join('');
    
    modal.show();
}

// Переключение проекта в модальном окне
function toggleProjectInModal(element) {
    const id = parseInt(element.dataset.id);
    const amount = parseInt(element.dataset.amount);
    
    element.classList.toggle('selected');
    const checkbox = element.querySelector('.project-checkbox');
    checkbox.style.opacity = element.classList.contains('selected') ? '1' : '0';
    
    if (element.classList.contains('selected')) {
        // Удаляем если уже есть и добавляем заново (чтобы избежать дубликатов)
        selectedProjects = selectedProjects.filter(p => p.id !== id);
        selectedProjects.push({ id, amount });
    } else {
        selectedProjects = selectedProjects.filter(p => p.id !== id);
    }
    
    // Обновляем основной список
    const mainElement = document.querySelector(`#projectsContainer .project-item[data-id="${id}"]`);
    if (mainElement) {
        if (element.classList.contains('selected')) {
            mainElement.classList.add('selected');
        } else {
            mainElement.classList.remove('selected');
        }
    }
    
    updateDonateSummary();
}

// Обработка оплаты
function processPayment() {
    const amount = parseInt(document.getElementById('donateAmount').textContent.replace(/\s/g, ''));
    
    if (amount <= 0) {
        alert('Пожалуйста, выберите проект или введите сумму');
        return;
    }
    
    if (useCustomAmount && amount < 100) {
        alert('Минимальная сумма пожертвования - 100 руб.');
        return;
    }
    
    // Проверка авторизации
    if (!AppState.currentUser) {
        sessionStorage.setItem('redirectAfterLogin', 'donate.html');
        window.location.href = 'login.html';
        return;
    }
    
    // Показываем симуляцию оплаты
    showPaymentSimulation(amount);
}

// Показать симуляцию оплаты
function showPaymentSimulation(amount) {
    const simulation = document.getElementById('paymentSimulation');
    const processing = document.getElementById('paymentProcessing');
    const success = document.getElementById('paymentSuccess');
    
    document.getElementById('paymentAmount').textContent = amount.toLocaleString('ru-RU');
    
    simulation.classList.add('active');
    processing.style.display = 'block';
    success.style.display = 'none';
    
    // Симуляция обработки платежа
    setTimeout(() => {
        processing.style.display = 'none';
        success.style.display = 'block';
        
        // Сохраняем донат
        saveDonation(amount);
    }, 2000);
}

// Закрыть симуляцию оплаты
function closePaymentSimulation() {
    document.getElementById('paymentSimulation').classList.remove('active');
    
    // Сбрасываем выбор
    selectedProjects = [];
    useCustomAmount = false;
    document.querySelectorAll('.project-item').forEach(p => p.classList.remove('selected'));
    document.getElementById('customAmountSection').classList.remove('active');
    document.getElementById('customAmount').value = '';
    updateDonateSummary();
}

// Сохранение доната
function saveDonation(amount) {
    // Сохраняем в историю донатов
    const donations = JSON.parse(localStorage.getItem('donations')) || [];
    
    if (useCustomAmount) {
        // Произвольная сумма - распределяем по проектам
        donations.push({
            id: Date.now(),
            user_id: AppState.currentUser.id,
            project_id: null, // Общий фонд
            amount: amount,
            status: 'completed',
            created_at: new Date().toISOString()
        });
    } else {
        // Конкретные проекты
        selectedProjects.forEach(project => {
            donations.push({
                id: Date.now() + Math.random(),
                user_id: AppState.currentUser.id,
                project_id: project.id,
                amount: project.amount,
                status: 'completed',
                created_at: new Date().toISOString()
            });
            
            // Обновляем сумму в проекте
            updateProjectCollectedAmount(project.id, project.amount);
        });
    }
    
    localStorage.setItem('donations', JSON.stringify(donations));
    
    // Обновляем участие пользователя как донора
    updateUserAsDonor();
}

// Обновление накопленной суммы проекта
function updateProjectCollectedAmount(projectId, amount) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        project.collected_amount = (project.collected_amount || 0) + amount;
        localStorage.setItem('projects', JSON.stringify(projects));
    }
}

// Обновление пользователя как донора
function updateUserAsDonor() {
    if (!AppState.currentUser) return;
    
    // Обновляем в localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === AppState.currentUser.id);
    
    if (user) {
        user.is_donor = 1;
        if (user.role === 'user') user.role = 'donor';
        if (user.role === 'volunteer') user.role = 'volunteer_donor';
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Обновляем текущего пользователя
    AppState.currentUser.is_donor = 1;
    if (AppState.currentUser.role === 'user') AppState.currentUser.role = 'donor';
    if (AppState.currentUser.role === 'volunteer') AppState.currentUser.role = 'volunteer_donor';
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
}

// Слушатель изменения произвольной суммы
document.addEventListener('input', function(e) {
    if (e.target.id === 'customAmount') {
        updateDonateSummary();
    }
});
