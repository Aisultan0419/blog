(() => {
  const API_BASE = window.API_BASE || (window.CONFIG && window.CONFIG.API_BASE) || '/api';
  console.log('API base (frontend):', API_BASE);

  let currentUser = null;
  let currentPostId = null;
  let comments = [];

  const pages = {
    '/': 'page-home',
    '/register': 'page-register',
    '/login': 'page-login',
    '/admin': 'page-admin'
  };

  function el(id) { return document.getElementById(id); }

  function showAlert(containerId, message, type = 'info') {
    const elc = el(containerId);
    if (!elc) return console.warn('Missing alert container', containerId, message);
    elc.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    setTimeout(() => { if (elc) elc.innerHTML = ''; }, 5000);
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || (() => {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1050';
      document.body.appendChild(container);
      return container;
    })();

    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  function getAuthHeaders() {
    const token = localStorage.getItem('api_token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }

  async function req(method, path, body = null, opts = {}) {
    const url = `${API_BASE}${path}`;
    const headers = opts.raw ? {} : getAuthHeaders();
    try {
      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: body && !opts.raw ? JSON.stringify(body) : body
      });
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = text; }
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error('Network error:', err);
      return { ok: false, status: 0, data: { message: 'Network error' } };
    }
  }

  function showPage(path) {
    Object.values(pages).forEach(id => {
      const elp = el(id);
      if (elp) elp.classList.remove('active');
    });
    const target = pages[path] || pages['/'];
    const targetEl = el(target);
    if (targetEl) targetEl.classList.add('active');

    if (target === 'page-home') {
      renderSidebarCategories();
      loadPosts();
    }
    if (target === 'page-admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        showAlert('adminAlert', 'Admin access required', 'warning');
        setTimeout(()=> { location.hash = '#/'; }, 700);
        return;
      }
      loadAdminData();
    }
  }

  window.addEventListener('hashchange', () => showPage(location.hash.replace(/^#/, '') || '/'));
  window.addEventListener('load', () => {
    initAuth().then(() => showPage(location.hash.replace(/^#/, '') || '/'));
  });

  async function initAuth() {
    const r = await req('GET', '/auth/me');
    if (!r.ok) {
      currentUser = null;
    } else {
      currentUser = r.data.user || r.data;
    }
    return currentUser;
  }


  async function getUsername(userId) {
  if (!userId) return '—';
  try {
    const r = await req('GET', `/users/${userId}`);
    if (r.ok && r.data && r.data.user) {
      return r.data.user.username || '—';
    }
  } catch (error) {
    console.error('Error fetching username:', error);
  }
  return '—';
}

  const registerForm = el('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = el('regUsername').value.trim();
      const email = el('regEmail').value.trim();
      const password = el('regPassword').value;
      const confirm = el('regConfirm').value;
      if (!username || !email || !password) return showAlert('registerAlert', 'Fill required fields', 'warning');
      if (password !== confirm) return showAlert('registerAlert', 'Passwords do not match', 'warning');

      const r = await req('POST', '/auth/register', { username, email, password });
      if (!r.ok) return showAlert('registerAlert', (r.data && r.data.message) || (r.data && r.data.error) || `Failed (${r.status})`, 'danger');
      showAlert('registerAlert', 'Registered successfully', 'success');

      setTimeout(() => { location.hash = '#/login'; }, 600);
    });
  }

  const loginForm = el('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = el('loginEmail').value.trim();
      const password = el('loginPassword').value;
      if (!email || !password) return showAlert('loginAlert', 'Fill required fields', 'warning');

      const r = await req('POST', '/auth/login', { email, password });
      if (!r.ok) return showAlert('loginAlert', (r.data && r.data.message) || (r.data && r.data.error) || `Failed (${r.status})`, 'danger');

      if (r.data && r.data.token) localStorage.setItem('api_token', r.data.token);

      await initAuth();
      showAlert('loginAlert', 'Logged in', 'success');

      setTimeout(() => {
        if (currentUser && currentUser.role === 'admin') location.hash = '#/admin';
        else location.hash = '#/';
      }, 600);
    });
  }

  const btnLogout = el('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try { await req('POST', '/auth/logout'); } catch(e){}
      localStorage.removeItem('api_token');
      currentUser = null;
      updateNavForAuth();
      showAlert('postsAlert', 'Logged out', 'info');
    });
  }


  async function loadComments(postId) {
    const commentsList = el('commentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = '<div class="text-center text-muted py-3"><div class="spinner-border spinner-border-sm" role="status"></div><span class="ms-2">Loading comments...</span></div>';
    
    const r = await req('GET', `/posts/${postId}/comments`);
    
    if (!r.ok) {
      commentsList.innerHTML = '<div class="text-danger">Failed to load comments</div>';
      return;
    }
    
    comments = Array.isArray(r.data) ? r.data : (r.data.comments || []);
    renderComments(comments);
  }

  function renderComments(commentsArray) {
    const commentsList = el('commentsList');
    if (!commentsList) return;
    
    if (!commentsArray || commentsArray.length === 0) {
      commentsList.innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-chat"></i><br>No comments yet. Be the first to comment!</div>';
      el('commentsCountBadge').textContent = '0';
      return;
    }
    
    el('commentsCountBadge').textContent = commentsArray.length.toString();
    
    commentsList.innerHTML = '';
    commentsArray.forEach(comment => {
      const commentEl = createCommentElement(comment);
      commentsList.appendChild(commentEl);
    });
  }

 function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.dataset.id = comment.id || comment._id;
    
    const author = 'Anonymous';
    const date = new Date(comment.createdAt || comment.date || Date.now()).toLocaleString();
    const isEdited = comment.isEdited ? ' (edited)' : '';
    
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <div class="comment-author">${author}</div>
          <div class="comment-text mt-1 mb-2">${comment.content || ''}</div>
          <div class="comment-date">
            <small>${date}${isEdited}</small>
          </div>
        </div>
        <div class="comment-actions">
          <button class="btn btn-xs btn-outline-danger btn-delete-comment" data-id="${comment.id || comment._id}">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
    
    return div;
}

  async function createComment(content, postId) {
    if (!content.trim()) {
      showToast('Comment cannot be empty', 'warning');
      return;
    }
    
    const r = await req('POST', '/comments', {
      content: content.trim(),
      postId: postId
    });
    
    if (!r.ok) {
      const errorMsg = r.data?.message || r.data?.error || 'Failed to create comment';
      showToast(errorMsg, 'danger');
      return null;
    }
    
    showToast('Comment added successfully', 'success');
    return r.data.comment;
  }

  async function updateComment(commentId, content) {
    if (!content.trim()) {
      showToast('Comment cannot be empty', 'warning');
      return null;
    }
    
    const r = await req('PUT', `/comments/${commentId}`, { content: content.trim() });
    
    if (!r.ok) {
      const errorMsg = r.data?.message || r.data?.error || 'Failed to update comment';
      showToast(errorMsg, 'danger');
      return null;
    }
    
    showToast('Comment updated successfully', 'success');
    return r.data.comment;
  }

  async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return false;
    }
    
    const r = await req('DELETE', `/comments/${commentId}`);
    
    if (!r.ok) {
      const errorMsg = r.data?.message || r.data?.error || 'Failed to delete comment';
      showToast(errorMsg, 'danger');
      return false;
    }
    
    showToast('Comment deleted successfully', 'success');
    return true;
  }

  const postsListEl = el('postsList');
  let currentFilterCategory = null;

  async function loadPosts() {
  if (!postsListEl) return;
  postsListEl.innerHTML = '<div class="text-muted">Loading posts...</div>';
  
  const r = await req('GET', '/blogs');
  if (!r.ok) {
    postsListEl.innerHTML = '<div class="text-danger">Failed to load posts.</div>';
    return;
  }

  let posts = Array.isArray(r.data) ? r.data : (r.data.blogPosts || []);
  if (!posts.length && r.data.posts) posts = r.data.posts;

  if (currentFilterCategory) {
    posts = posts.filter(p => Array.isArray(p.categories) && p.categories.some(c => (c.slug === currentFilterCategory) || (c.name === currentFilterCategory) || (c === currentFilterCategory) || (c.id === currentFilterCategory) || (c._id === currentFilterCategory)));
  }

  if (!posts || posts.length === 0) {
    postsListEl.innerHTML = '<div class="text-muted">No posts yet.</div>';
    return;
  }

  postsListEl.innerHTML = '';
  
  for (const p of posts) {
    const id = p.id || p._id || '';
    const excerpt = (p.body || p.content || '').replace(/(<([^>]+)>)/gi, "").slice(0, 300);
    
    let authorDisplay = '—';
    if (p.author) {
      if (p.author.username) {
        authorDisplay = p.author.username;
      } else if (typeof p.author === 'string') {
        authorDisplay = await getUsername(p.author);
      }
    }
    
    const cats = (p.categories || []).map(c => (c.name || c)).join(', ');
    
    const col = document.createElement('div');
    col.className = 'col-12';
    col.innerHTML = `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between">
          <div style="flex:1">
            <h5 class="card-title cursor-pointer" data-id="${id}">${p.title}</h5>
            <p class="card-excerpt text-muted">${excerpt}</p>
            <div class="d-flex justify-content-between align-items-center">
              <p class="mb-0"><small>By ${authorDisplay} • ${cats}</small></p>
              <div>
                <button class="btn btn-sm btn-outline-primary btn-like" data-id="${id}">
                  <i class="bi bi-heart"></i> <span class="like-count">...</span>
                </button>
                <button class="btn btn-sm btn-outline-secondary btn-comments ms-1" data-id="${id}">
                  <i class="bi bi-chat"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="text-end ms-3">
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-warning btn-edit" data-id="${id}">Edit</button>
              <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${id}">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
    postsListEl.appendChild(col);
    updateLikeCount(id, col.querySelector('.like-count'));
  }

  postsListEl.querySelectorAll('.card-title').forEach(h => h.addEventListener('click', (e)=> openPostModal(e.currentTarget.dataset.id)));
  postsListEl.querySelectorAll('.btn-like').forEach(btn => btn.addEventListener('click', (e)=> toggleLike(e.currentTarget.dataset.id)));
  postsListEl.querySelectorAll('.btn-comments').forEach(btn => btn.addEventListener('click', (e)=> openPostModal(e.currentTarget.dataset.id)));
  postsListEl.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', (e)=> openEditPost(e.currentTarget.dataset.id)));
  postsListEl.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', (e)=> deletePost(e.currentTarget.dataset.id)));
}

  async function updateLikeCount(postId, el) {
    if (!postId || !el) return;
    const r = await req('GET', `/posts/${postId}/likes`);
    if (!r.ok) { el.textContent = '—'; return; }
    if (r.data && typeof r.data.likesCount !== 'undefined') {
      el.textContent = r.data.likesCount;
      return;
    }
    if (Array.isArray(r.data)) el.textContent = r.data.length;
    else if (r.data && r.data.count !== undefined) el.textContent = r.data.count;
    else el.textContent = '0';
  }

  async function toggleLike(postId) {
    if (!currentUser) return showAlert('postsAlert', 'You must be logged in to like posts', 'warning');
    const r = await req('POST', `/posts/${postId}/likes`);
    if (!r.ok) return showAlert('postsAlert', (r.data && (r.data.message || r.data.error)) || 'Like failed', 'danger');
    loadPosts();
  }

  async function openPostModal(postId) {
    if (!postId) return showAlert('postsAlert', 'Invalid post id', 'warning');
    
    currentPostId = postId;
    const r = await req('GET', `/blogs/${postId}`);
    if (!r.ok) return showAlert('postsAlert', 'Failed to load post', 'danger');
    
    const p = r.data.blogPost || r.data.post || r.data;
    el('postModalTitle').textContent = p.title;
    const authorDisplay = (p.author && p.author.username) ? p.author.username : (p.author || '—');
    const cats = (p.categories || []).map(c => (c.name || c)).join(', ');
    
    el('postModalContent').innerHTML = `
      <p class="text-muted">By ${authorDisplay}</p>
      <div class="post-content">${p.body || p.content || ''}</div>
      <hr>
      <p><small>Categories: ${cats}</small></p>
    `;
    

    el('deletePostBtn').onclick = () => deletePost(postId);
    
    const addCommentBtn = el('addCommentBtn');
    const commentFormContainer = el('commentFormContainer');
    const cancelCommentBtn = el('cancelCommentBtn');
    const newCommentForm = el('newCommentForm');
    
    if (currentUser) {
      addCommentBtn.style.display = 'block';
      addCommentBtn.onclick = () => {
        commentFormContainer.style.display = 'block';
        addCommentBtn.style.display = 'none';
        el('commentContent').focus();
      };
      
      cancelCommentBtn.onclick = () => {
        commentFormContainer.style.display = 'none';
        addCommentBtn.style.display = 'block';
        newCommentForm.reset();
      };
      
      newCommentForm.onsubmit = async (e) => {
        e.preventDefault();
        const content = el('commentContent').value;
        const newComment = await createComment(content, currentPostId);
        if (newComment) {
          loadComments(currentPostId);
          commentFormContainer.style.display = 'none';
          addCommentBtn.style.display = 'block';
          newCommentForm.reset();
        }
      };
    } else {
      addCommentBtn.style.display = 'none';
      addCommentBtn.onclick = null;
    }

    loadComments(postId);
    

    const commentsList = el('commentsList');
    commentsList.onclick = async (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const commentId = target.dataset.id;
      
      if (target.classList.contains('btn-edit-comment')) {
        const commentDiv = target.closest('.comment-item');
        const commentText = commentDiv.querySelector('.comment-text');
        const originalText = commentText.textContent;
        
        commentText.innerHTML = `
          <textarea class="comment-edit-textarea form-control">${originalText}</textarea>
          <div class="mt-2">
            <button class="btn btn-sm btn-primary btn-save-edit" data-id="${commentId}">Save</button>
            <button class="btn btn-sm btn-secondary btn-cancel-edit" data-id="${commentId}">Cancel</button>
          </div>
        `;
      }
      
      if (target.classList.contains('btn-save-edit')) {
        const commentDiv = target.closest('.comment-item');
        const textarea = commentDiv.querySelector('textarea');
        const updatedComment = await updateComment(commentId, textarea.value);
        if (updatedComment) {
          loadComments(currentPostId);
        }
      }
      
      if (target.classList.contains('btn-cancel-edit')) {
        loadComments(currentPostId);
      }
      
      if (target.classList.contains('btn-delete-comment')) {
        const success = await deleteComment(commentId);
        if (success) {
          loadComments(currentPostId);
        }
      }
    };
    
    const modal = new bootstrap.Modal(document.getElementById('postModal'));
    modal.show();

    document.getElementById('postModal').addEventListener('hidden.bs.modal', () => {
      currentPostId = null;
      comments = [];
      const commentsList = el('commentsList');
      if (commentsList) commentsList.innerHTML = '';
      const form = el('newCommentForm');
      if (form) form.reset();
      const formContainer = el('commentFormContainer');
      if (formContainer) formContainer.style.display = 'none';
      const addBtn = el('addCommentBtn');
      if (addBtn && currentUser) addBtn.style.display = 'block';
    });
  }

  const btnCreatePost = el('btnCreatePost');
  if (btnCreatePost) {
    btnCreatePost.addEventListener('click', async () => {
      await populateCategorySelect();
      el('createEditTitle').textContent = 'Create Post';
      el('postId').value = '';
      el('postTitle').value = '';
      el('postBody').value = '';
      el('postTags').value = '';
      const modal = new bootstrap.Modal(document.getElementById('createEditModal'));
      modal.show();
    });
  }

  async function openEditPost(postId) {
    const r = await req('GET', `/blogs/${postId}`);
    if (!r.ok) return showAlert('postsAlert', 'Failed to load post', 'danger');
    const p = r.data.blogPost || r.data.post
        await populateCategorySelect();
    el('createEditTitle').textContent = 'Edit Post';
    el('postId').value = postId;
    el('postTitle').value = p.title || '';
    el('postBody').value = p.body || p.content || '';
    el('postTags').value = (p.tags || []).join(', ');
    const sel = el('postCategories');
    Array.from(sel.options).forEach(opt => {
      opt.selected = (p.categories || []).some(c => (c.id === opt.value) || (c._id === opt.value) || (c.slug === opt.value) || (c.name === opt.value) || (c === opt.value));
    });
    const modal = new bootstrap.Modal(document.getElementById('createEditModal'));
    modal.show();
  }

  const postForm = el('postForm');
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = el('postId').value;
      const title = el('postTitle').value.trim();
      const body = el('postBody').value.trim();
      const tags = (el('postTags').value || '').split(',').map(s=>s.trim()).filter(Boolean);
      const categories = Array.from(el('postCategories').selectedOptions).map(o => o.value);
      if (!title || !body) return showAlert('postFormAlert', 'Title and body required', 'warning');

      if (id) {
        const r = await req('PUT', `/blogs/${id}`, { title, body, categories, tags });
        if (!r.ok) return showAlert('postFormAlert', (r.data && (r.data.message || r.data.error)) || 'Update failed', 'danger');
        showAlert('postsAlert', 'Post updated', 'success');
      } else {
        const r = await req('POST', `/blogs`, { title, body, categories, tags });
        if (!r.ok) return showAlert('postFormAlert', (r.data && (r.data.message || r.data.error)) || 'Create failed', 'danger');
        showAlert('postsAlert', 'Post created', 'success');
      }
      bootstrap.Modal.getInstance(document.getElementById('createEditModal')).hide();
      loadPosts();
    });
  }

  async function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    const r = await req('DELETE', `/blogs/${postId}`);
    if (!r.ok) return showAlert('postsAlert', (r.data && (r.data.message || r.data.error)) || 'Delete failed', 'danger');
    showAlert('postsAlert', 'Post deleted', 'success');
    loadPosts();
  }
  async function populateCategorySelect() {
    const r = await req('GET', '/categories');
    const sel = el('postCategories');
    if (!sel) return;
    sel.innerHTML = '';
    if (!r.ok) return;
    const cats = Array.isArray(r.data) ? r.data : (r.data.categories || []);
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id || c._id || c.slug || c.name;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  async function renderSidebarCategories() {
    const r = await req('GET', '/categories');
    const ul = el('sidebarCategories');
    if (!ul) return;
    ul.innerHTML = '';
    if (!r.ok) return;
    const cats = Array.isArray(r.data) ? r.data : (r.data.categories || []);
    const all = document.createElement('li');
    all.className = 'list-group-item cursor-pointer';
    all.textContent = 'All';
    all.onclick = () => { currentFilterCategory = null; loadPosts(); };
    ul.appendChild(all);
    cats.forEach(c => {
      const li = document.createElement('li');
      li.className = 'list-group-item cursor-pointer';
      li.textContent = c.name;
      li.onclick = () => { currentFilterCategory = c.slug || c.name; loadPosts(); };
      ul.appendChild(li);
    });
  }

  async function loadAdminData() {
    if (!currentUser || currentUser.role !== 'admin') return showAlert('adminAlert', 'Admin access required', 'warning');

    const ru = await req('GET', '/admin/users');
    const usersContainer = el('adminUsers') || createAdminUsersSection();
    usersContainer.innerHTML = '';
    if (ru.ok) {
      const users = Array.isArray(ru.data) ? ru.data : (ru.data.users || []);
      if (users.length === 0) usersContainer.innerHTML = '<div class="text-muted">No users</div>';
      users.forEach(u => {
        const id = u.id || u._id || '';
        const li = document.createElement('div');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <div>
            <strong>${u.username || '—'}</strong>
            <div class="small text-muted">${u.email || '—'}</div>
            <div class="small">Role: <span class="badge bg-secondary">${u.role || 'user'}</span>
             • Active: ${u.isActive ? 'yes' : 'no'}</div>
          </div>
          <div>
            <select class="form-select form-select-sm d-inline-block admin-role-select" style="width:120px" data-id="${id}">
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
            <button class="btn btn-sm btn-outline-success admin-activate ms-1" data-id="${id}">${u.isActive ? 'Deactivate' : 'Activate'}</button>
            <button class="btn btn-sm btn-outline-danger admin-delete ms-1" data-id="${id}">Delete</button>
          </div>
        `;
        usersContainer.appendChild(li);
        const sel = li.querySelector('.admin-role-select');
        if (sel) sel.value = u.role || 'user';
      });


      usersContainer.querySelectorAll('.admin-role-select').forEach(s => {
        s.addEventListener('change', async (e) => {
          const userId = e.currentTarget.dataset.id;
          const newRole = e.currentTarget.value;
          if (!confirm(`Set role ${newRole} for user?`)) return e.currentTarget.value = e.currentTarget.getAttribute('data-current') || newRole;
          const res = await req('PUT', `/admin/users/${userId}/role`, { role: newRole });
          if (!res.ok) return showAlert('adminAlert', (res.data && (res.data.message || res.data.error)) || 'Role update failed', 'danger');
          showAlert('adminAlert', 'Role updated', 'success');
          loadAdminData();
        });
      });

      usersContainer.querySelectorAll('.admin-activate').forEach(b => {
        b.addEventListener('click', async (e) => {
          const userId = e.currentTarget.dataset.id;
          const isActive = !(e.currentTarget.textContent.trim().toLowerCase() === 'deactivate');
          const res = await req('PUT', `/admin/users/${userId}/status`, { isActive });
          if (!res.ok) return showAlert('adminAlert', (res.data && (res.data.message || res.data.error)) || 'Status update failed', 'danger');
          showAlert('adminAlert', `User ${isActive ? 'activated' : 'deactivated'}`, 'success');
          loadAdminData();
        });
      });

      usersContainer.querySelectorAll('.admin-delete').forEach(b => {
        b.addEventListener('click', async (e) => {
          const userId = e.currentTarget.dataset.id;
          if (!confirm('Delete user? This cannot be undone.')) return;
          const res = await req('DELETE', `/admin/users/${userId}`);
          if (!res.ok) return showAlert('adminAlert', (res.data && (res.data.message || res.data.error)) || 'Delete failed', 'danger');
          showAlert('adminAlert', 'User deleted', 'success');
          loadAdminData();
        });
      });
    } else {
      usersContainer.innerHTML = '<div class="text-muted">Failed to load users</div>';
    }


    const rs = await req('GET', '/admin/stats');
    const statsContainer = el('adminStats') || createAdminStatsSection();
    statsContainer.innerHTML = '';
    if (rs.ok) {
      const s = rs.data.stats || rs.data;
      statsContainer.innerHTML = `
        <div>Total users: ${s.totalUsers}</div>
        <div>Total posts: ${s.totalPosts}</div>
        <div>Active users: ${s.activeUsers}</div>
      `;
    } else {
      statsContainer.innerHTML = '<div class="text-muted">Failed to load stats</div>';
    }

 
    renderSidebarCategories();

 
    const rposts = await req('GET', '/admin/posts');
    const adminPosts = el('adminPosts');
    if (adminPosts) {
      adminPosts.innerHTML = '';
      if (rposts.ok) {
        const posts = Array.isArray(rposts.data) ? rposts.data : (rposts.data.posts || []);
        if (posts.length === 0) adminPosts.innerHTML = '<div class="text-muted">No posts</div>';
        posts.forEach(p => {
          const id = p.id || p._id || '';
          const div = document.createElement('div');
          div.className = 'list-group-item d-flex justify-content-between align-items-center';
          div.innerHTML = `<div>${p.title}</div>
            <div>
              <button class="btn btn-sm btn-outline-danger admin-post-delete" data-id="${id}">Delete</button>
            </div>`;
          adminPosts.appendChild(div);
        });
        adminPosts.querySelectorAll('.admin-post-delete').forEach(b => {
          b.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (!confirm('Delete post (admin)?')) return;
            const res = await req('DELETE', `/admin/posts/${id}`);
            if (!res.ok) return showAlert('adminAlert', (res.data && (res.data.message || res.data.error)) || 'Delete failed', 'danger');
            showAlert('adminAlert', 'Post deleted', 'success');
            loadAdminData();
          });
        });
      } else {
        adminPosts.innerHTML = '<div class="text-muted">Failed to load admin posts</div>';
      }
    }
  }

  function createAdminUsersSection() {
    const admin = el('page-admin');
    if (!admin) throw new Error('Admin page missing');
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-3';
    wrapper.innerHTML = `<h5>Users</h5><div id="adminUsers" class="list-group mb-3"></div>`;
    admin.prepend(wrapper);
    return el('adminUsers');
  }

  function createAdminStatsSection() {
    const admin = el('page-admin');
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-3';
    wrapper.innerHTML = `<h5>System Stats</h5><div id="adminStats" class="p-2 border rounded mb-3"></div>`;
    admin.prepend(wrapper);
    return el('adminStats');
  }

  const btnCreateCategory = el('btnCreateCategory');
  if (btnCreateCategory) {
    btnCreateCategory.addEventListener('click', async () => {
      const name = el('newCategoryName').value.trim();
      const desc = el('newCategoryDesc').value.trim();
      if (!name) return showAlert('adminAlert', 'Name required', 'warning');
      const res = await req('POST', '/categories', { name, description: desc, slug: name.toLowerCase().replace(/\s+/g, '-') });
      if (!res.ok) return showAlert('adminAlert', (res.data && (res.data.message || res.data.error)) || 'Create failed', 'danger');
      showAlert('adminAlert', 'Category created', 'success');
      el('newCategoryName').value = '';
      el('newCategoryDesc').value = '';
      loadAdminData();
    });
  }

  const btnRefresh = el('btnRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadPosts();
      showAlert('postsAlert', 'Posts refreshed', 'success');
    });
  }

  const adminLink = document.querySelector('a[href="#/admin"]');
  if (adminLink) adminLink.style.display = 'none';

  renderSidebarCategories();
  loadPosts();

  window.__APP = {
    getCurrentUser: () => currentUser,
    refreshAuth: initAuth,
    reloadPosts: loadPosts,
    loadAdmin: loadAdminData,
    loadComments: loadComments,
    createComment: createComment,
    updateComment: updateComment,
    deleteComment: deleteComment
  };

  console.log('Blog app initialized with comment system');
})();