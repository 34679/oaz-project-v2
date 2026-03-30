// ============================================
// Детали новости/карточки - JavaScript
// ============================================

// Загрузка деталей новости
function loadCardDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    
    if (!cardId) return;
    
    const news = JSON.parse(localStorage.getItem('news')) || [];
    const cardData = news.find(n => n.id === parseInt(cardId));
    
    if (!cardData) {
        // Если не нашли в новостях, ищем в проектах
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const project = projects.find(p => p.id === parseInt(cardId));
        
        if (project) {
            // Перенаправляем на страницу проекта
            window.location.href = `project-detail.html?id=${cardId}`;
            return;
        }
        
        document.getElementById('cardTitle').textContent = 'Не найдено';
        document.getElementById('cardContent').textContent = 'Запрашиваемая новость не найдена.';
        return;
    }
    
    // Заполняем данные
    const imageEl = document.getElementById('cardImage');
    const titleEl = document.getElementById('cardTitle');
    const contentEl = document.getElementById('cardContent');
    
    if (imageEl) imageEl.src = cardData.image;
    if (titleEl) titleEl.textContent = cardData.title;
    if (contentEl) contentEl.textContent = cardData.content;
    
    // Загружаем комментарии
    loadComments(parseInt(cardId));
}

// Загрузка комментариев
function loadComments(newsId) {
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (!commentsList) return;
    
    // Показываем форму или приглашение войти
    if (AppState.currentUser) {
        if (commentForm) commentForm.classList.remove('hidden');
        if (loginPrompt) loginPrompt.classList.add('hidden');
    } else {
        if (commentForm) commentForm.classList.add('hidden');
        if (loginPrompt) loginPrompt.classList.remove('hidden');
    }
    
    // Загружаем комментарии из localStorage
    const allComments = JSON.parse(localStorage.getItem('comments')) || {};
    const comments = allComments[newsId] || [];
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-center">Пока нет комментариев. Будьте первым!</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-author">${comment.author}</div>
            <div class="comment-date">${formatDate(comment.date)}</div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

// Добавление комментария
function addComment(event) {
    event.preventDefault();
    
    if (!AppState.currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы оставить комментарий');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    
    const textarea = document.getElementById('commentText');
    const text = textarea.value.trim();
    
    if (!text) return;
    
    // Получаем существующие комментарии
    const allComments = JSON.parse(localStorage.getItem('comments')) || {};
    if (!allComments[newsId]) {
        allComments[newsId] = [];
    }
    
    // Добавляем новый комментарий
    allComments[newsId].push({
        author: `${AppState.currentUser.first_name} ${AppState.currentUser.last_name}`,
        text: text,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('comments', JSON.stringify(allComments));
    textarea.value = '';
    loadComments(parseInt(newsId));
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
