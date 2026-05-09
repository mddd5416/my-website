// إعدادات Supabase
const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let tempScreenshots = [];
let iconFileRaw = null;

// --- [ نظام الدخول ] ---
function checkLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if (u === sU && p === sP) {
        const loginScreen = document.getElementById('login-screen');
        loginScreen.style.opacity = '0';
        setTimeout(() => loginScreen.style.display = 'none', 500); // إخفاء بعد الأنيميشن
        
        loadAdminData();
        loadStats();
    } else {
        alert("بيانات الدخول خاطئة!");
    }
}

// --- [ معاينة الأيقونة وإلغاؤها ] ---
function previewIcon(input) {
    if (input.files && input.files[0]) {
        iconFileRaw = input.files[0];
        const r = new FileReader();
        r.onload = e => {
            document.getElementById('icon-preview').innerHTML = `
                <img src="${e.target.result}" class="preview-img">
                <button type="button" class="btn-remove" onclick="clearIcon()">×</button>`;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function clearIcon() {
    iconFileRaw = null;
    document.getElementById('icon-file').value = "";
    document.getElementById('icon-preview').innerHTML = "";
}

// --- [ معاينة صور المعرض ] ---
function previewScreenshots(input) {
    const container = document.getElementById('screens-preview');
    container.innerHTML = "";
    tempScreenshots = Array.from(input.files);
    tempScreenshots.forEach((file, index) => {
        const r = new FileReader();
        r.onload = e => {
            const div = document.createElement('div');
            div.style.position = "relative";
            div.innerHTML = `
                <img src="${e.target.result}" class="preview-img">
                <button type="button" class="btn-remove" onclick="removeScreenshot(${index}, this)">×</button>`;
            container.appendChild(div);
        };
        r.readAsDataURL(file);
    });
}

function removeScreenshot(index, btn) {
    tempScreenshots.splice(index, 1);
    btn.parentElement.remove();
}

// --- [ الروابط المتعددة ] ---
function addNewLinkField() {
    const container = document.getElementById('links-container');
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginTop = "10px";
    div.innerHTML = `
        <input type="text" class="link-url" placeholder="رابط التحميل">
        <input type="text" class="link-text" placeholder="نص الزر">
        <button type="button" class="btn-secondary" onclick="this.parentElement.remove()">-</button>`;
    container.appendChild(div);
}

// --- [ دالة الرفع ] ---
async function uploadToMedia(file) {
    const name = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(name, file);
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(name).data.publicUrl;
}

// --- [ النشر النهائي ] ---
async function publishProject() {
    const btn = document.getElementById('publish-btn');
    btn.disabled = true; btn.innerText = "جاري النشر...";
    
    try {
        let iUrl = document.getElementById('icon-url-inp').value;
        if (iconFileRaw) iUrl = await uploadToMedia(iconFileRaw);
        if (!iUrl) throw new Error("يرجى تحديد أيقونة");

        const screens = [];
        for (let f of tempScreenshots) {
            screens.push(await uploadToMedia(f));
        }

        const urls = Array.from(document.querySelectorAll('.link-url')).map(i => i.value);
        const texts = Array.from(document.querySelectorAll('.link-text')).map(i => i.value);

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            "desc": document.getElementById('p-desc').value,
            icon_url: iUrl,
            screenshots: screens,
            link: urls[0] || "#",
            btn_text: texts[0] || "تحميل",
            extra_links: { urls, texts },
            views: 0, downloads: 0
        }]);

        if (error) throw error;
        alert("🎉 تم نشر المشروع بنجاح!");
        location.reload();
    } catch (e) {
        alert("فشل النشر: " + e.message);
        btn.disabled = false; btn.innerText = "🚀 نشر المشروع الآن";
    }
}

// --- [ إدارة الحساب ] ---
async function updateAdminProfile() {
    const n = document.getElementById('edit-name').value;
    const u = document.getElementById('edit-user').value;
    const p = document.getElementById('edit-pass').value;
    const f = document.getElementById('new-profile-file').files[0];

    if (n) localStorage.setItem('md_name', n);
    if (u) localStorage.setItem('admin_user', u);
    if (p) localStorage.setItem('admin_pass', p);
    if (f) {
        const url = await uploadToMedia(f);
        localStorage.setItem('md_avatar', url);
    }
    alert("تم تحديث البيانات!");
    location.reload();
}

function loadAdminData() {
    const name = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar') || "https://via.placeholder.com/90";
    document.getElementById('admin-name-sidebar').innerText = name;
    document.getElementById('admin-avatar-sidebar').src = avatar;
    document.getElementById('edit-avatar-preview').src = avatar;
}

// --- [ الوضع الليلي والإحصائيات ] ---
function toggleManagerTheme() {
    const b = document.body;
    const isDark = b.getAttribute('data-theme') !== 'light';
    b.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

async function loadStats() {
    const { data } = await sb.from('projects').select('views, downloads');
    if (data) {
        const v = data.reduce((s, p) => s + (p.views || 0), 0);
        const d = data.reduce((s, p) => s + (p.downloads || 0), 0);
        document.getElementById('total-views').innerText = v;
        document.getElementById('total-downloads').innerText = d;
    }
}

function switchSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}
