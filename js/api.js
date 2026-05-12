// ============================================================
// FreelancerHub — api.js
// Central API bridge between HTML frontend and Java backend.
// Every backend call goes through this file.
// ============================================================

const API_BASE = 'https://web-production-bc088.up.railway.app/api';

// ── Helpers ──────────────────────────────────────────────────

function getToken()   { return localStorage.getItem('token'); }
function getUserId()  { return localStorage.getItem('userId'); }
function getRole()    { return localStorage.getItem('role'); }
function getUserName(){ return localStorage.getItem('userName'); }
function getName()    { return getUserName(); }
function isLoggedIn() { return !!getToken(); }

function headers(requiresAuth = false) {
    const h = { 'Content-Type': 'application/json' };
    if (requiresAuth) h['Authorization'] = `Bearer ${getToken()}`;
    return h;
}

function logoutUser() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
    return true;
}

// ── AUTH ─────────────────────────────────────────────────────

async function registerUser(name, email, password, role) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ name, email, password, role })
    });
    return res.json();
}

async function loginUser(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token',    data.token);
        localStorage.setItem('role',     data.role);
        localStorage.setItem('userId',   data.userId);
        localStorage.setItem('userName', data.name);
    }
    return data;
}

// ── PROJECTS ─────────────────────────────────────────────────

async function fetchProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
}

async function searchProjects(keyword) {
    const url = `${API_BASE}/projects/search?keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (res.ok) return res.json();

    const allProjects = await fetchProjects();
    const q = (keyword || '').toLowerCase();
    return allProjects.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.client?.name || '').toLowerCase().includes(q)
    );
}

async function getClientProjects(clientId) {
    const res = await fetch(`${API_BASE}/projects/client/${clientId}`, { headers: headers(true) });
    return res.json();
}

async function createProject(title, description, budget, deadline) {
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST', headers: headers(true),
        body: JSON.stringify({ clientId: parseInt(getUserId()), title, description, budget: parseFloat(budget), deadline })
    });
    return res.json();
}

async function deleteProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE', headers: headers(true) });
    return res.json();
}

// ── BIDS ─────────────────────────────────────────────────────

async function placeBid(projectId, bidAmount, proposal) {
    const res = await fetch(`${API_BASE}/bids`, {
        method: 'POST', headers: headers(true),
        body: JSON.stringify({ projectId: parseInt(projectId), freelancerId: parseInt(getUserId()), bidAmount: parseFloat(bidAmount), proposal })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.error) data.error = `Failed to place bid (${res.status})`;
    return data;
}

async function getProjectBids(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/bids`, { headers: headers(true) });
    return res.json();
}

async function getFreelancerBids(freelancerId) {
    const res = await fetch(`${API_BASE}/bids/freelancer/${freelancerId}`, { headers: headers(true) });
    return res.json();
}

async function updateBidStatus(bidId, status) {
    const res = await fetch(`${API_BASE}/bids/${bidId}/status`, {
        method: 'PUT', headers: headers(true),
        body: JSON.stringify({ status })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.error) data.error = `Failed to update bid (${res.status})`;
    return data;
}

async function createContract(projectId, freelancerId, startDate, endDate) {
    const res = await fetch(`${API_BASE}/contracts`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({
            projectId: parseInt(projectId),
            freelancerId: parseInt(freelancerId),
            startDate,
            endDate
        })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.error) data.error = `Failed to create contract (${res.status})`;
    return data;
}

// ── REVIEWS ──────────────────────────────────────────────────

async function getReviews(userId) {
    const res = await fetch(`${API_BASE}/reviews/${userId}`, { headers: headers(true) });
    return res.json();
}

async function getAllReviews() {
    const res = await fetch(`${API_BASE}/reviews/all`);
    return res.json();
}

async function getReviewsForUser(userId) {
    return getReviews(userId);
}

async function getReviewsGiven(userId) {
    const res = await fetch(`${API_BASE}/reviews/given/${userId}`, { headers: headers(true) });
    return res.json();
}

async function getAverageRating(userId) {
    const res = await fetch(`${API_BASE}/reviews/rating/${userId}`, { headers: headers(true) });
    return res.json();
}

async function postReview(projectId, revieweeId, rating, comment) {
    const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST', headers: headers(true),
        body: JSON.stringify({ projectId: parseInt(projectId), reviewerId: parseInt(getUserId()), revieweeId: parseInt(revieweeId), rating: parseInt(rating), comment })
    });
    return res.json();
}

// ── MESSAGES ─────────────────────────────────────────────────

async function getInbox(userId) {
    const res = await fetch(`${API_BASE}/messages/inbox/${userId}`, { headers: headers(true) });
    return res.json();
}

async function getConversation(senderId, receiverId) {
    const res = await fetch(`${API_BASE}/messages/${senderId}/${receiverId}`, { headers: headers(true) });
    return res.json();
}

async function sendMessage(receiverId, message) {
    const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST', headers: headers(true),
        body: JSON.stringify({ senderId: parseInt(getUserId()), receiverId: parseInt(receiverId), message })
    });
    return res.json();
}

// ── CONTRACTS ───────────────────────────────────────────────────────────────

async function getFreelancerContracts(freelancerId) {
    const res = await fetch(`${API_BASE}/contracts/freelancer/${freelancerId}`, { headers: headers(true) });
    return res.json();
}

async function getClientContracts(clientId) {
    const res = await fetch(`${API_BASE}/contracts/client/${clientId}`, { headers: headers(true) });
    return res.json();
}

async function completeContract(contractId) {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/complete`, {
        method: 'PUT',
        headers: headers(true)
    });
    return res.json();
}

// ── UI HELPERS ────────────────────────────────────────────────

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.75rem;';
        document.body.appendChild(container);
    }
    const icons   = { success: '✅', error: '❌', info: 'ℹ️' };
    const colors  = { success: '#065F46', error: '#B91C1C', info: '#1E40AF' };
    const toast   = document.createElement('div');
    toast.style.cssText = `display:flex;align-items:center;gap:.75rem;padding:.9rem 1.25rem;border-radius:10px;background:${colors[type]||colors.info};color:#fff;font-size:.9rem;font-weight:500;box-shadow:0 10px 40px rgba(0,0,0,.25);min-width:280px;`;
    toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function starRating(rating) {
    return Array.from({length:5},(_,i)=>`<span style="color:${i<rating?'#F59E0B':'#D1D5DB'};font-size:1.1rem;">★</span>`).join('');
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
}

function formatCurrency(n) {
    return '$'+parseFloat(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function timeAgo(d) {
    const diff = Date.now()-new Date(d).getTime();
    const m = Math.floor(diff/60000);
    if (m<1) return 'just now';
    if (m<60) return m+'m ago';
    if (m<1440) return Math.floor(m/60)+'h ago';
    return Math.floor(m/1440)+'d ago';
}

function statusBadge(status) {
    const map = {
        open:        ['#065F46','#ECFDF5','Open'],
        in_progress: ['#1E40AF','#EFF6FF','In Progress'],
        completed:   ['#6B21A8','#F5F3FF','Completed'],
        pending:     ['#92400E','#FFFBEB','Pending'],
        accepted:    ['#065F46','#ECFDF5','Accepted'],
        rejected:    ['#B91C1C','#FEF2F2','Rejected'],
        active:      ['#1E40AF','#EFF6FF','Active'],
        paid:        ['#065F46','#ECFDF5','Paid'],
    };
    const [c,bg,label] = map[status]||['#475569','#F1F5F9',status];
    return `<span style="background:${bg};color:${c};padding:.2rem .75rem;border-radius:999px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${label}</span>`;
}
