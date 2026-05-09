const _U = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_U, _K);

window.onload = () => {
    document.getElementById('btn-login-exec').onclick = engineLogin;
    document.getElementById('btn-pub-exec').onclick = enginePublish;
    document.getElementById('btn-up-exec').onclick = engineUpdateProfile;
    document.getElementById('avatar-trigger').onclick = () => document.getElementById('f-avatar').click();
    document.getElementById('f-avatar').onchange = (e) => engineChangeAvatar(e.target);
};

function engineLogin() {
    const u = document.getElementById('login-u').value;
    const p = document.getElementById('login-p').value;
    if (u === (localStorage.getItem('admin_user') || "admin") && p === (localStorage.getItem('admin_pass') || "MDaMiNeLD")) {
        document.getElementById('auth-layer').style.display = 'none';
        document.getElementById('main-app').style.display = 'grid';
        engineInit();
    } else alert("خطأ في البيانات");
}

async function engineInit() {
    document.getElementById('admin-name-display').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('admin-avatar').src = localStorage.getItem('md_avatar') || "https://via.placeholder.com/85";
    const { data } = await sb.from('projects').select('*').order('created_at', { ascending: false });
    renderManagerList(data || []);
}

async function engineChangeAvatar(input) {
    if (!input.files[0]) return;
    const file = input.files[0];
    const path = `avatars/${Date.now()}_${file.name}`;
    await sb.storage.from('media').upload(path, file);
    const url = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    localStorage.setItem('md_avatar', url);
    document.getElementById('admin-avatar').src = url;
}

async function enginePublish() {
    const editId = document.getElementById('edit-id').value;
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
    
    alert("تم الحفظ بنجاح"); location.reload();
}

function renderManagerList(items) {
    const box = document.getElementById('manager-list');
    box.innerHTML = items.map(i => `
        <div class="project-item">
            <span>${i.title}</span>
            <div>
                <button onclick="editProject('${i.id}')" style="color:blue">تعديل</button>
                <button onclick="deleteProject('${i.id}')" style="color:red">حذف</button>
            </div>
        </div>
    `).join('');
}

async function deleteProject(id) {
    if (confirm("حذف نهائي؟")) {
        await sb.from('projects').delete().eq('id', id);
        engineInit();
    }
}

window.editProject = async (id) => {
    const { data } = await sb.from('projects').select('*').eq('id', id).single();
    document.getElementById('edit-id').value = data.id;
    document.getElementById('p-title').value = data.title;
    document.getElementById('p-desc').value = data.desc;
    document.getElementById('form-title').innerText = "تعديل المنشور";
    uiTab('view-add', document.querySelector('.nav-item'));
};

function uiTab(id, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function engineUpdateProfile() {
    const n = document.getElementById('up-name').value;
    const p = document.getElementById('up-pass').value;
    if (n) localStorage.setItem('md_name', n);
    if (p) localStorage.setItem('admin_pass', p);
    alert("تم التحديث"); location.reload();
}
