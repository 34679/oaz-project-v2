// ============================================
// Океанский Альянс Защиты (ОАЗ)
// Основной JavaScript файл
// ============================================

// Глобальное состояние приложения
const AppState = {
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    currentSlide: 0,
    selectedProjects: [],
    currentCategory: 'news'
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSlider();
    updateAuthUI();
    
    // Инициализация данных если их нет
    initDefaultData();
});

// Инициализация данных по умолчанию
function initDefaultData() {
    // Проекты
    if (!localStorage.getItem('projects')) {
        const defaultProjects = [
            {
                id: 1,
                name: 'Очистка побережья Балтики',
                description: 'Масштабная акция по очистке берегов Балтийского моря от пластика',
                full_description: 'Полное описание проекта по очистке побережья...',
                image: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?w=800',
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
                full_description: 'Полное описание программы спасения тюленей...',
                image: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=800',
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
                full_description: 'Полное описание проекта по восстановлению кораллов...',
                image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800',
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
                full_description: 'Полное описание образовательных программ...',
                image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
                start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'completed',
                target_amount: 200000,
                collected_amount: 200000,
                donation_amount: 2000,
                total_hours: 50,
                participants: { volunteers: 25, donors: 12 }
            }
        ];
        localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }
    
    // Новости
    if (!localStorage.getItem('news')) {
        const defaultNews = [
            {
                id: 1,
                project_id: 1,
                title: 'Очистка побережья началась!',
                description: 'Стартовала масштабная акция по очистке берегов',
                content: 'Сегодня началась масштабная акция по очистке побережья Балтийского моря. Волонтеры со всей области собрались, чтобы убрать мусор и пластик с пляжей.',
                image: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?w=400',
                category: 'news'
            },
            {
                id: 2,
                project_id: 2,
                title: 'Спасены первые тюлени',
                description: 'Волонтеры спасли 5 тюленей за неделю',
                content: 'Наша команда спасателей успешно реабилитировала 5 тюленей за прошедшую неделю. Все животные уже чувствуют себя хорошо.',
                image: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=400',
                category: 'work'
            },
            {
                id: 3,
                project_id: 1,
                title: 'Нужны волонтеры!',
                description: 'Приглашаем всех желающих присоединиться к проекту',
                content: 'Для успешного проведения акции по очистке побережья нам нужны волонтеры. Присоединяйтесь!',
                image: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?w=400',
                category: 'help'
            },
            {
                id: 4,
                project_id: 4,
                title: 'Образовательная программа завершена',
                description: 'Успешно завершен проект обучения',
                content: 'Программа обучения детей и взрослых основам экологии океана успешно завершена. Более 500 человек прошли обучение.',
                image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
                category: 'work'
            }
        ];
        localStorage.setItem('news', JSON.stringify(defaultNews));
    }
    
    // Пользователи
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                first_name: 'Админ',
                last_name: 'Администратор',
                email: 'admin@oaz-ocean.ru',
                password: 'admin123',
                role: 'admin',
                is_volunteer: 0,
                is_donor: 0
            },
            {
                id: 2,
                first_name: 'Иван',
                last_name: 'Иванов',
                email: 'ivan@mail.ru',
                password: 'password123',
                role: 'volunteer',
                is_volunteer: 1,
                is_donor: 0
            },
            {
                id: 3,
                first_name: 'Мария',
                last_name: 'Петрова',
                email: 'maria@mail.ru',
                password: 'password123',
                role: 'donor',
                is_volunteer: 0,
                is_donor: 1
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// ============================================
// НАВИГАЦИЯ
// ============================================
function initNavigation() {
    // Обновляем активный пункт меню
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });
}

function updateAuthUI() {
    const authNav = document.getElementById('authNav');
    if (!authNav) return;
    
    if (AppState.currentUser) {
        const isAdmin = AppState.currentUser.role === 'admin';
        const profileLink = isAdmin ? 'admin.html' : 'profile.html';
        authNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="${profileLink}">
                    <i class="fas fa-user"></i> ${AppState.currentUser.first_name}
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="logout(); return false;">
                    <i class="fas fa-sign-out-alt"></i> Выход
                </a>
            </li>
        `;
    } else {
        authNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">
                    <i class="fas fa-sign-in-alt"></i> Вход/Регистрация
                </a>
            </li>
        `;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    window.location.href = 'index.html';
}

// ============================================
// СЛАЙДЕР
// ============================================
function initSlider() {
    const slider = document.querySelector('.news-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    
    if (!slides.length) return;
    
    function showSlide(index) {
        AppState.currentSlide = index;
        slider.style.transform = `translateX(-${index * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        showSlide((AppState.currentSlide + 1) % slides.length);
    }
    
    function prevSlide() {
        showSlide((AppState.currentSlide - 1 + slides.length) % slides.length);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // Автоматическое перелистывание
    setInterval(nextSlide, 5000);
}

// ============================================
// АУТЕНТИФИКАЦИЯ
// ============================================
function register(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isVolunteer = document.getElementById('isVolunteer').checked;
    const isDonor = document.getElementById('isDonor').checked;
    
    if (!firstName || !lastName || !email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Определяем роль
    let role = 'user';
    if (isVolunteer && isDonor) {
        role = 'volunteer_donor';
    } else if (isVolunteer) {
        role = 'volunteer';
    } else if (isDonor) {
        role = 'donor';
    }
    
    // Проверяем, не существует ли пользователь
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    // Создаем пользователя
    const user = {
        id: Date.now(),
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        role: role,
        is_volunteer: isVolunteer ? 1 : 0,
        is_donor: isDonor ? 1 : 0
    };
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Авторизуем пользователя
    AppState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    alert('Регистрация успешна!');
    
    // Перенаправление
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    } else {
        window.location.href = 'profile.html';
    }
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Проверка администратора
    if (email === 'admin@oaz-ocean.ru' && password === 'admin123') {
        const admin = {
            id: 1,
            first_name: 'Админ',
            last_name: 'Администратор',
            email: email,
            role: 'admin',
            is_volunteer: 0,
            is_donor: 0
        };
        AppState.currentUser = admin;
        localStorage.setItem('currentUser', JSON.stringify(admin));
        window.location.href = 'admin.html';
        return;
    }
    
    // Проверка обычного пользователя
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('Неверный email или пароль');
        return;
    }
    
    AppState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Перенаправление
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    } else {
        window.location.href = 'profile.html';
    }
}
