// ── This file is the bridge between your HTML and Java backend ──

const API_BASE = 'https://web-production-bc088.up.railway.app/api';  // ← your Java server

// Helper: get JWT token from storage
function getToken() {
    return localStorage.getItem('token');
}

// Helper: build headers (with or without auth)
function headers(requiresAuth = false) {
    const h = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
        h['Authorization'] = `Bearer ${getToken()}`;
    }
    return h;
}

// ── AUTH ─────────────────────────────────────────────────────

async function registerUser(name, email, password, role) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, email, password, role })
    });
    return response.json();
}

async function loginUser(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    // Save token + user info to localStorage
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.name);
    }
    return data;
}

function logoutUser() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// ── PROJECTS ─────────────────────────────────────────────────

async function fetchProjects() {
    const response = await fetch(`${API_BASE}/projects`, {
        headers: headers()
    });
    return response.json();
}

async function searchProjects(keyword) {
    const response = await fetch(`${API_BASE}/projects/search?keyword=${keyword}`, {
        headers: headers()
    });
    return response.json();
}

async function createProject(title, description, budget, deadline) {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: headers(true),   // ← requires login
        body: JSON.stringify({ title, description, budget, deadline })
    });
    return response.json();
}

async function deleteProject(projectId) {
    const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: headers(true)
    });
    return response.json();
}

// ── BIDS ─────────────────────────────────────────────────────

async function placeBid(projectId, bidAmount, proposal) {
    const response = await fetch(`${API_BASE}/bids`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ projectId, bidAmount, proposal })
    });
    return response.json();
}

async function getProjectBids(projectId) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/bids`, {
        headers: headers(true)
    });
    return response.json();
}

// ── MESSAGES ─────────────────────────────────────────────────

async function sendMessage(receiverId, message) {
    const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ receiverId, message })
    });
    return response.json();
}

async function getMessages(senderId, receiverId) {
    const response = await fetch(`${API_BASE}/messages/${senderId}/${receiverId}`, {
        headers: headers(true)
    });
    return response.json();
}

// ── REVIEWS ─────────────────────────────────────────────────

async function postReview(projectId, revieweeId, rating, comment) {
    const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ projectId, revieweeId, rating, comment })
    });
    return response.json();
}
