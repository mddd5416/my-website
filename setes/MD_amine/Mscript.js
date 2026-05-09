const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let tempScreenshots = [];
let iconFileRaw = null;

function checkLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if(u === sU && p === sP) {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData(); loadStats();
    } else alert("خطأ في البيانات!");
}

function toggleManagerTheme() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function previewIcon(input) {
    if (input.files && input.files[0]) {
        iconFileRaw = input.files[0];
        const r = new FileReader();
        r.onload = e => renderIconPreview(e.target.result);
        r.readAsDataURL(input.files[0]);
    }
}

function previewIconUrl(url) { if(url) { iconFileRaw = null; renderIconPreview(url); } }

function renderIconPreview(src) {
    document.getElementById('icon-preview').innerHTML = `
        <div style="position:relative;">
            <img src="${src}">
            <button class="btn-remove" onclick="clearIcon()">×</button>
        </div>`;
}

function clearIcon() {
    iconFileRaw = null;
    document.getElementById('icon-file').value = "";
    document.getElementById('icon-url-inp').value = "";
    document.getElementById('icon-preview').innerHTML = "";
}

function previewScreenshots(input) {
    const p = document.getElementById('screens-preview');
    p.innerHTML = "";
    tempScreenshots = Array.from(input.files);
    tempScreenshots.forEach((f, i) => {
        const r = new FileReader();
        r.onload = e => {
            const d = document.createElement('div');
            d.style.position = "relative";
            d.innerHTML = `<img src="${e.target.result}"><button class="btn-remove" onclick="tempScreenshots.splice(${i},1);this.parentElement.remove()">×</button>`;
            p.appendChild(d);
        };
        r.readAsDataURL(f);
    });
}

function addNewLinkField() {
    const c = document.getElementById('links-container');
    const d = document.createElement('div');
    d.style.display = "flex"; d.style.gap = "10px"; d.style.marginTop = "10px";
    d.innerHTML = `<input type="text" class="link-url" placeholder="رابط إضافي"><input type="text" class="link-text" placeholder="نص الزر"><button class="btn-secondary" onclick="this.parentElement.remove()">-</button>`;
    c.appendChild(d);
}

async function uploadToMedia(f) {
    const n = `${Date.now()}_${f.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(n, f);
    if(error) throw error;
    return sb.storage.from('media').getPublicUrl(n).data.publicUrl;
}

async function publishProject() {
    const b = document.getElementById('publish-btn');
    b.disabled = true; b.innerText = "جاري النشر...";
    try {
        let iU = document.getElementById('icon-url-inp').value;
        if(iconFileRaw) iU = await uploadToMedia(iconFileRaw);

        const sU = [];
        for(let f of tempScreenshots) sU.push(await uploadToMedia(f));

        const lU = Array.from(document.querySelectorAll('.link-url')).map(i => i.value);
        const lT = Array.from(document.querySelectorAll('.link-text')).map(i => i.value);

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value,
            icon_url: iU,
            screenshots: sU,
            link: fixUrl(lU[0]),
            bnt_text: lT[0] || "تحميل", // bnt_text مطابق لجدولك
            extra_links: { urls: lU, texts: lT },
            views: 0, downloads: 0
        }]);

        if(error) throw error;
        alert("تم النشر بنجاح!"); location.reload();
    } catch(e) { alert("خطأ: " + e.message); b.disabled = false; b.innerText = "🚀 نشر المشروع الآن"; }
}

function fixUrl(u) { return !u ? "#" : (u.startsWith('http') ? u : `https://${u}`); }

function loadAdminData() {
    document.getElementById('admin-name-sidebar').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('admin-avatar-sidebar').src = localStorage.getItem('md_avatar') || "https://via.placeholder.com/80";
}

async function loadStats() {
    const { data } = await sb.from('projects').select('views, downloads');
    if(data) {
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

async function updateAdminProfile() {
    const n = document.getElementById('edit-name').value;
    const u = document.getElementById('edit-user').value;
    const p = document.getElementById('edit-pass').value;
    const f = document.getElementById('new-profile-file').files[0];

    if(n) localStorage.setItem('md_name', n);
    if(u) localStorage.setItem('admin_user', u);
    if(p) localStorage.setItem('admin_pass', p);
    if(f) localStorage.setItem('md_avatar', await uploadToMedia(f));

    alert("تم التحديث!"); location.reload();
}
