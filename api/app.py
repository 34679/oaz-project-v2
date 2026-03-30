#!/usr/bin/env python3
"""
API для Океанского Альянса Защиты (ОАЗ)
Простой REST API на Flask для работы с базой данных SQLite
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import hashlib
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db_connection():
    """Получение соединения с базой данных"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Инициализация базы данных"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Таблица новостей
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        category TEXT DEFAULT 'news',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Таблица комментариев
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        news_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (news_id) REFERENCES news(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Таблица проектов для донатов
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS donation_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT,
        amount INTEGER DEFAULT 2500,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Таблица донатов пользователей
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES donation_projects(id)
    )
    ''')
    
    # Таблица волонтерских часов
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS volunteer_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        hours INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES news(id)
    )
    ''')
    
    conn.commit()
    conn.close()

# ============================================
# API Endpoints для пользователей
# ============================================

@app.route('/api/users', methods=['GET'])
def get_users():
    """Получение списка пользователей"""
    conn = get_db_connection()
    users = conn.execute('SELECT id, first_name, last_name, email, role, created_at FROM users').fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Получение пользователя по ID"""
    conn = get_db_connection()
    user = conn.execute('SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(dict(user))

@app.route('/api/users', methods=['POST'])
def create_user():
    """Создание нового пользователя"""
    data = request.get_json()
    
    if not all(k in data for k in ('first_name', 'last_name', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (first_name, last_name, email, password, role)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['first_name'], data['last_name'], data['email'], data['password'], data.get('role', 'user')))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': user_id, 'message': 'User created successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Email already exists'}), 409

@app.route('/api/login', methods=['POST'])
def login():
    """Авторизация пользователя"""
    data = request.get_json()
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT id, first_name, last_name, email, role FROM users WHERE email = ? AND password = ?',
        (data['email'], data['password'])
    ).fetchone()
    conn.close()
    
    if user is None:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify(dict(user))

# ============================================
# API Endpoints для новостей
# ============================================

@app.route('/api/news', methods=['GET'])
def get_news():
    """Получение списка новостей"""
    category = request.args.get('category')
    
    conn = get_db_connection()
    if category:
        news = conn.execute('SELECT * FROM news WHERE category = ? ORDER BY created_at DESC', (category,)).fetchall()
    else:
        news = conn.execute('SELECT * FROM news ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(item) for item in news])

@app.route('/api/news/<int:news_id>', methods=['GET'])
def get_news_item(news_id):
    """Получение новости по ID"""
    conn = get_db_connection()
    news = conn.execute('SELECT * FROM news WHERE id = ?', (news_id,)).fetchone()
    conn.close()
    if news is None:
        return jsonify({'error': 'News not found'}), 404
    return jsonify(dict(news))

@app.route('/api/news', methods=['POST'])
def create_news():
    """Создание новой новости"""
    data = request.get_json()
    
    if not all(k in data for k in ('title', 'description', 'content')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO news (title, description, content, image, category)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['title'], data['description'], data['content'], data.get('image', ''), data.get('category', 'news')))
    conn.commit()
    news_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': news_id, 'message': 'News created successfully'}), 201

@app.route('/api/news/<int:news_id>', methods=['PUT'])
def update_news(news_id):
    """Обновление новости"""
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE news SET title = ?, description = ?, content = ?, image = ?, category = ?, updated_at = ?
        WHERE id = ?
    ''', (data.get('title'), data.get('description'), data.get('content'), data.get('image'), 
          data.get('category'), datetime.now(), news_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'News updated successfully'})

@app.route('/api/news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    """Удаление новости"""
    conn = get_db_connection()
    conn.execute('DELETE FROM news WHERE id = ?', (news_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'News deleted successfully'})

# ============================================
# API Endpoints для комментариев
# ============================================

@app.route('/api/news/<int:news_id>/comments', methods=['GET'])
def get_comments(news_id):
    """Получение комментариев к новости"""
    conn = get_db_connection()
    comments = conn.execute('''
        SELECT c.*, u.first_name, u.last_name 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.news_id = ? 
        ORDER BY c.created_at DESC
    ''', (news_id,)).fetchall()
    conn.close()
    return jsonify([dict(comment) for comment in comments])

@app.route('/api/news/<int:news_id>/comments', methods=['POST'])
def create_comment(news_id):
    """Создание комментария"""
    data = request.get_json()
    
    if 'user_id' not in data or 'content' not in data:
        return jsonify({'error': 'Missing user_id or content'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO comments (news_id, user_id, content)
        VALUES (?, ?, ?)
    ''', (news_id, data['user_id'], data['content']))
    conn.commit()
    comment_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': comment_id, 'message': 'Comment created successfully'}), 201

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """Удаление комментария"""
    conn = get_db_connection()
    conn.execute('DELETE FROM comments WHERE id = ?', (comment_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Comment deleted successfully'})

# ============================================
# API Endpoints для проектов донатов
# ============================================

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Получение списка проектов для донатов"""
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM donation_projects WHERE is_active = 1 ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(project) for project in projects])

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Получение проекта по ID"""
    conn = get_db_connection()
    project = conn.execute('SELECT * FROM donation_projects WHERE id = ?', (project_id,)).fetchone()
    conn.close()
    if project is None:
        return jsonify({'error': 'Project not found'}), 404
    return jsonify(dict(project))

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Создание нового проекта"""
    data = request.get_json()
    
    if not all(k in data for k in ('name', 'description')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO donation_projects (name, description, image, amount)
        VALUES (?, ?, ?, ?)
    ''', (data['name'], data['description'], data.get('image', ''), data.get('amount', 2500)))
    conn.commit()
    project_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': project_id, 'message': 'Project created successfully'}), 201

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Обновление проекта"""
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE donation_projects SET name = ?, description = ?, image = ?, amount = ?
        WHERE id = ?
    ''', (data.get('name'), data.get('description'), data.get('image'), data.get('amount'), project_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Project updated successfully'})

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Удаление проекта"""
    conn = get_db_connection()
    conn.execute('DELETE FROM donation_projects WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Project deleted successfully'})

# ============================================
# API Endpoints для донатов
# ============================================

@app.route('/api/users/<int:user_id>/donations', methods=['GET'])
def get_user_donations(user_id):
    """Получение донатов пользователя"""
    conn = get_db_connection()
    donations = conn.execute('''
        SELECT d.*, p.name as project_name 
        FROM user_donations d 
        JOIN donation_projects p ON d.project_id = p.id 
        WHERE d.user_id = ? 
        ORDER BY d.created_at DESC
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(donation) for donation in donations])

@app.route('/api/donations', methods=['POST'])
def create_donation():
    """Создание доната"""
    data = request.get_json()
    
    if not all(k in data for k in ('user_id', 'project_id', 'amount')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO user_donations (user_id, project_id, amount)
        VALUES (?, ?, ?)
    ''', (data['user_id'], data['project_id'], data['amount']))
    conn.commit()
    donation_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': donation_id, 'message': 'Donation created successfully'}), 201

# ============================================
# API Endpoints для волонтерских часов
# ============================================

@app.route('/api/users/<int:user_id>/volunteer-hours', methods=['GET'])
def get_volunteer_hours(user_id):
    """Получение волонтерских часов пользователя"""
    conn = get_db_connection()
    hours = conn.execute('''
        SELECT v.*, n.title as project_title 
        FROM volunteer_hours v 
        JOIN news n ON v.project_id = n.id 
        WHERE v.user_id = ? 
        ORDER BY v.created_at DESC
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(h) for h in hours])

@app.route('/api/volunteer-hours', methods=['POST'])
def add_volunteer_hours():
    """Добавление волонтерских часов"""
    data = request.get_json()
    
    if not all(k in data for k in ('user_id', 'project_id', 'hours')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO volunteer_hours (user_id, project_id, hours)
        VALUES (?, ?, ?)
    ''', (data['user_id'], data['project_id'], data['hours']))
    conn.commit()
    hours_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': hours_id, 'message': 'Volunteer hours added successfully'}), 201

# ============================================
# Статистика
# ============================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Получение общей статистики"""
    conn = get_db_connection()
    
    total_donations = conn.execute('SELECT COALESCE(SUM(amount), 0) as total FROM user_donations').fetchone()['total']
    total_volunteer_hours = conn.execute('SELECT COALESCE(SUM(hours), 0) as total FROM volunteer_hours').fetchone()['total']
    total_users = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    total_news = conn.execute('SELECT COUNT(*) as count FROM news').fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'total_donations': total_donations,
        'total_volunteer_hours': total_volunteer_hours,
        'total_users': total_users,
        'total_news': total_news
    })

# ============================================
# Главная страница API
# ============================================

@app.route('/api/', methods=['GET'])
def api_index():
    """Информация об API"""
    return jsonify({
        'name': 'ОАЗ API',
        'version': '1.0',
        'endpoints': {
            'users': '/api/users',
            'news': '/api/news',
            'projects': '/api/projects',
            'donations': '/api/donations',
            'stats': '/api/stats'
        }
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
