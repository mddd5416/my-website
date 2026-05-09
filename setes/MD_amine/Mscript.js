const _SB_URL = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_SB_URL, _SB_KEY);

window.onload = () => {
    document.getElementById('do-login').onclick = authLogin;
    document.getElementById('do-publish').onclick = handlePublish;
    document.getElementById('do-update-set').onclick = updateProfile;
    document.getElementById('change-avatar-trigger').onclick = () => document.getElementById('f-avatar').click();
    document.getElementById('f-avatar').onchange = (e) => uploadAvatar(e.target);
};

function authLogin() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if (u === (localStorage.getItem('admin_user') || "admin") && p === (localStorage.getItem('admin_pass') || "MDaMiNeLD")) {
        document.getElementById('auth-layer').style.display = 'none';
        document.getElementById('main-app').style.display = 'grid';
        loadDashboard();
    } else alert("خطأ في بيانات الدخول");
}

async function loadDashboard() {
    document.getElementById('display-name').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('admin-img').src = localStorage.getItem('md_avatar') || "https://via.placeholder.com/90";
    
    const { data } = await sb.from('projects').select('*').order('created_at', { ascending: false });
    renderManageList(data || []);
    
    const views = data?.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const downloads = data?.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    document.getElementById('v-count').innerText = views || 0;
    document.getElementById('d-count').innerText = downloads || 0;
}

async function uploadAvatar(input) {
    if (!input.files[0]) return;
    const file = input.files[0];
    const path = `avatars/${Date.now()}_${file.name}`;
    await sb.storage.from('media').upload(path, file);
    const url = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    localStorage.setItem('md_avatar', url);
    document.getElementById('admin-img').src = url;
}

async function handlePublish() {
    const btn = document.getElementById('do-publish');
    const editId = document.getElementById('edit-target-id').value;
    btn.disabled = true;

    let iconUrl = "";
    if (document.getElementById('f-icon').files[0]) {
        const file = document.getElementById('f-icon').files[0];
        const path = `icons/${Date.now()}_${file.name}`;
        await sb.storage.from('media').upload(path, file);
        iconUrl = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    }

    const payload = {
        title: document.getElementById('p-title').value,
        type: document.getElementById('p-type').value,
        desc: document.getElementById('p-desc').value,
        link: document.querySelector('.l-url').value,
        btn_text: document.querySelector('.l-txt').value
    };
    if (iconUrl) payload.icon_url = iconUrl;

    if (editId) await sb.from('projects').update(payload).eq('id', editId);
    else await sb.from('projects').insert([payload]);

    alert("تم التنفيذ بنجاح"); location.reload();
}

function renderManageList(items) {
    const box = document.getElementById('list-holder');
    box.innerHTML = items.map(i => `
        <div class="project-row">
            <div><strong>${i.title}</strong> <span style="font-size:12px; color:#64748b">(${i.type})</span></div>
            <div>
                <button onclick="prepareEdit('${i.id}')" style="color:var(--accent); border:none; background:none; cursor:pointer;">تعديل</button>
                <button onclick="deleteProject('${i.id}')" style="color:#ef4444; border:none; background:none; cursor:pointer; margin-right:15px;">حذف</button>
            </div>
        </div>
    `).join('');
}

window.prepareEdit = async (id) => {
    const { data } = await sb.from('projects').select('*').eq('id', id).single();
    document.getElementById('edit-target-id').value = data.id;
    document.getElementById('p-title').value = data.title;
    document.getElementById('p-type').value = data.type;
    document.getElementById('p-desc').value = data.desc;
    document.getElementById('form-mode-title').innerText = "تعديل: " + data.title;
    uiNav('p-add', document.querySelector('.nav-btn'));
};

async function deleteProject(id) {
    if (confirm("هل تريد حذف هذا المشروع نهائياً؟")) {
        await sb.from('projects').delete().eq('id', id);
        loadDashboard();
    }
}

function uiNav(id, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function updateProfile() {
    const n = document.getElementById('set-name').value;
    const u = document.getElementById('set-user').value;
    const p = document.getElementById('set-pass').value;
    if (n) localStorage.setItem('md_name', n);
    if (u) localStorage.setItem('admin_user', u);
    if (p) localStorage.setItem('admin_pass', p);
    alert("تم تحديث إعدادات الأمان"); location.reload();
}

function uiAddLink() {
    const div = document.createElement('div');
    div.style.display="flex"; div.style.gap="10px"; div.style.marginBottom="10px";
    div.innerHTML = `<input type="text" class="l-url" placeholder="الرابط"><input type="text" class="l-txt" placeholder="نص الزر"><button onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; border-radius:8px; width:50px">-</button>`;
    document.getElementById('links-container').appendChild(div);
}
