// ============================================
// Каталог новостей - JavaScript
// ============================================

let currentCategory = 'news';
let newsData = [];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    initTabs();
    initSwipe();
});

// Загрузка новостей
function loadNews() {
    // В реальном приложении: fetch('/api/news')
    newsData = JSON.parse(localStorage.getItem('news')) || getDefaultNews();
    
    // Сохраняем если это первый запуск
    if (!localStorage.getItem('news')) {
        localStorage.setItem('news', JSON.stringify(newsData));
    }
    
    renderNews();
}

// Новости по умолчанию
function getDefaultNews() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    return [
        {
            id: 1,
            project_id: projects[0]?.id || null,
            title: 'Очистка побережья началась!',
            description: 'Стартовала масштабная акция по очистке берегов Балтийского моря',
            content: 'Сегодня началась масштабная акция по очистке побережья Балтийского моря. Волонтеры со всей области собрались, чтобы убрать мусор и пластик с пляжей.',
            image: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?w=400',
            category: 'news'
        },
        {
            id: 2,
            project_id: projects[1]?.id || null,
            title: 'Спасены первые тюлени',
            description: 'Волонтеры спасли 5 тюленей за неделю',
            content: 'Наша команда спасателей успешно реабилитировала 5 тюленей за прошедшую неделю. Все животные уже чувствуют себя хорошо.',
            image: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=400',
            category: 'work'
        },
        {
            id: 3,
            project_id: projects[0]?.id || null,
            title: 'Нужны волонтеры!',
            description: 'Приглашаем всех желающих присоединиться к проекту',
            content: 'Для успешного проведения акции по очистке побережья нам нужны волонтеры. Присоединяйтесь!',
            image: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?w=400',
            category: 'help'
        },
        {
            id: 4,
            project_id: projects[3]?.id || null,
            title: 'Образовательная программа завершена',
            description: 'Успешно завершен проект обучения детей экологии',
            content: 'Программа обучения детей и взрослых основам экологии океана успешно завершена. Более 500 человек прошли обучение.',
            image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
            category: 'work'
        },
        {
            id: 5,
            project_id: projects[2]?.id || null,
            title: 'Подготовка к восстановлению кораллов',
            description: 'Начинаем подготовку крупного проекта',
            content: 'Ведется подготовка к масштабному проекту по восстановлению коралловых рифов. Нужны спонсоры и волонтеры.',
            image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400',
            category: 'help'
        },
        {
            id: 6,
            project_id: null,
            title: 'Новый год - новые проекты',
            description: 'Анонс планов на следующий год',
            content: 'В новом году мы планируем запустить несколько новых проектов по защите океана. Следите за новостями!',
            image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
            category: 'news'
        }
    ];
}

// Инициализация вкладок
function initTabs() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderNews();
        });
    });
}

// Инициализация свайпа
function initSwipe() {
    const catalogSection = document.querySelector('.catalog-section');
    if (!catalogSection) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const categories = ['news', 'work', 'help'];
    let currentIndex = 0;
    
    catalogSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    catalogSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        currentIndex = categories.indexOf(currentCategory);
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentIndex < categories.length - 1) {
                // Свайп влево - следующая категория
                switchCategory(categories[currentIndex + 1]);
            } else if (diff < 0 && currentIndex > 0) {
                // Свайп вправо - предыдущая категория
                switchCategory(categories[currentIndex - 1]);
            }
        }
    }
}

// Переключение категории
function switchCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    renderNews();
}

// Отрисовка новостей
function renderNews() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    
    const filteredNews = newsData.filter(n => n.category === currentCategory);
    
    if (filteredNews.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Нет новостей в этой категории</p>';
        return;
    }
    
    grid.innerHTML = filteredNews.map(news => `
        <div class="news-card">
            <img src="${news.image}" alt="${news.title}" class="news-card-image">
            <div class="news-card-content">
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-card-desc">${news.description}</p>
                <a href="card.html?id=${news.id}" class="news-card-btn">Подробнее</a>
            </div>
        </div>
    `).join('');
}
