// 바이오 플랫폼 백오피스 - 공통 유틸리티

const API_BASE = '/api';

// API 호출 유틸리티
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API 요청 실패');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showAlert(error.message, 'error');
        throw error;
    }
}

// GET 요청
async function apiGet(endpoint) {
    return apiCall(endpoint, { method: 'GET' });
}

// POST 요청
async function apiPost(endpoint, data) {
    return apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// PUT 요청
async function apiPut(endpoint, data) {
    return apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// PATCH 요청
async function apiPatch(endpoint, data) {
    return apiCall(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

// DELETE 요청
async function apiDelete(endpoint) {
    return apiCall(endpoint, { method: 'DELETE' });
}

// 알림 표시
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.main-content') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => alertDiv.remove(), 5000);
}

// 모달 열기
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// 모달 닫기
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

// 날짜시간 포맷팅
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
}

// 상대 시간 (예: "2시간 전")
function relativeTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return formatDate(dateString);
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 선택된 탭 활성화
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`tab-${tabName}`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

// 페이지네이션 렌더링
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="pagination">';

    // 이전 버튼
    if (currentPage > 1) {
        html += `<button class="pagination-item" onclick="${onPageChange}(${currentPage - 1})">이전</button>`;
    }

    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="pagination-item ${activeClass}" onclick="${onPageChange}(${i})">${i}</button>`;
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<button class="pagination-item" onclick="${onPageChange}(${currentPage + 1})">다음</button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

// 로딩 표시
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading">로딩 중...</div>';
    }
}

// 상태 뱃지
function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'badge-pending', text: '검수대기' },
        'published': { class: 'badge-success', text: '게시됨' },
        'hold': { class: 'badge-warning', text: '보류' },
        'deleted': { class: 'badge-error', text: '삭제됨' },
        'success': { class: 'badge-success', text: '성공' },
        'error': { class: 'badge-error', text: '실패' }
    };

    const badge = statusMap[status] || { class: 'badge', text: status };
    return `<span class="badge ${badge.class}">${badge.text}</span>`;
}

// 소스 아이콘
function getSourceIcon(source) {
    const icons = {
        'JBTP': '🏢',
        'NTIS': '🔬',
        'BizInfo': '💼'
    };
    return icons[source] || '📄';
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 모달 닫기 버튼 이벤트
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // 모달 배경 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // 현재 페이지 네비게이션 활성화
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href)) {
            item.classList.add('active');
        }
    });
});
