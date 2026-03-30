// ============================================
// Управление новостями (Админ) - JavaScript
// ============================================

let editingNewsId = null;

// Загрузка новостей для администратора
function loadManageNews() {
    const news = JSON.parse(localStorage.getItem('news')) || [];
    const container = document.getElementById('manageList');
    
    if (news.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Нет новостей</p>';
        return;
    }
    
    container.innerHTML = news.map(item => {
        const categoryText = {
            'news': 'Новость',
            'work': 'Проделанная работа',
            'help': 'Помощь'
        }[item.category] || item.category;
        
        return `
            <div class="manage-card">
                <div class="manage-card-info">
                    <h4>${item.title}</h4>
                    <p>${item.description} | ${categoryText}</p>
                </div>
                <div class="manage-card-actions">
                    <button class="btn-edit" onclick="editNews(${item.id})">Редактировать</button>
                    <button class="btn-delete" onclick="deleteNewsById(${item.id})">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

// Загрузка проектов в выпадающий список
function loadProjectsSelect() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const select = document.getElementById('newsProject');
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Без проекта</option>' + 
        projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    select.value = currentValue;
}

// Открыть модальное окно для добавления
function openNewsModal() {
    editingNewsId = null;
    document.getElementById('modalTitle').textContent = 'Добавить новость';
    document.getElementById('newsForm').reset();
    document.getElementById('newsId').value = '';
    document.getElementById('deleteNewsBtn').style.display = 'none';
    
    loadProjectsSelect();
    
    const modal = new bootstrap.Modal(document.getElementById('newsModal'));
    modal.show();
}

// Редактирование новости
function editNews(newsId) {
    const news = JSON.parse(localStorage.getItem('news')) || [];
    const item = news.find(n => n.id === newsId);
    
    if (!item) return;
    
    editingNewsId = newsId;
    document.getElementById('modalTitle').textContent = 'Редактировать новость';
    document.getElementById('deleteNewsBtn').style.display = 'inline-block';
    
    loadProjectsSelect();
    
    // Заполняем форму
    document.getElementById('newsId').value = item.id;
    document.getElementById('newsTitle').value = item.title;
    document.getElementById('newsDesc').value = item.description;
    document.getElementById('newsContent').value = item.content;
    document.getElementById('newsCategory').value = item.category;
    document.getElementById('newsProject').value = item.project_id || '';
    document.getElementById('newsImage').value = item.image || '';
    
    const modal = new bootstrap.Modal(document.getElementById('newsModal'));
    modal.show();
}

// Сохранение новости
function saveNews() {
    const form = document.getElementById('newsForm');
    
    // Валидация
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const news = JSON.parse(localStorage.getItem('news')) || [];
    
    const newsData = {
        title: document.getElementById('newsTitle').value,
        description: document.getElementById('newsDesc').value,
        content: document.getElementById('newsContent').value,
        category: document.getElementById('newsCategory').value,
        project_id: document.getElementById('newsProject').value || null,
        image: document.getElementById('newsImage').value || 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400'
    };
    
    if (editingNewsId) {
        // Редактирование
        const index = news.findIndex(n => n.id === editingNewsId);
        if (index !== -1) {
            news[index] = { 
                ...news[index], 
                ...newsData,
                updated_at: new Date().toISOString()
            };
        }
    } else {
        // Добавление новой
        const newNews = {
            id: Date.now(),
            ...newsData,
            created_at: new Date().toISOString()
        };
        news.push(newNews);
    }
    
    localStorage.setItem('news', JSON.stringify(news));
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('newsModal'));
    modal.hide();
    
    // Перезагружаем список
    loadManageNews();
    
    alert(editingNewsId ? 'Новость обновлена!' : 'Новость добавлена!');
}

// Удаление новости (из формы редактирования)
function deleteNews() {
    if (!editingNewsId) return;
    deleteNewsById(editingNewsId);
}

// Удаление новости по ID
function deleteNewsById(newsId) {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    let news = JSON.parse(localStorage.getItem('news')) || [];
    news = news.filter(n => n.id !== newsId);
    
    localStorage.setItem('news', JSON.stringify(news));
    
    // Закрываем модальное окно если открыто
    const modalElement = document.getElementById('newsModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
    
    // Перезагружаем список
    loadManageNews();
    
    alert('Новость удалена!');
}
