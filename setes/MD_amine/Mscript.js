// الإعدادات
const _URL = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_URL, _KEY);

let iconFile = null;
let screenFiles = [];

// الانتظار حتى تحميل الصفحة لربط الأزرار
window.onload = () => {
    document.getElementById('btn-login').addEventListener('click', engineLogin);
    document.getElementById('pub-btn').addEventListener('click', enginePublish);
    document.getElementById('f-icon').addEventListener('change', (e) => uiPreviewIcon(e.target));
    document.getElementById('f-screens').addEventListener('change', (e) => uiPreviewScreens(e.target));
};

function engineLogin() {
    const u = document.getElementById('login-u').value;
    const p = document.getElementById('login-p').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if (u === sU && p === sP) {
        document.getElementById('auth-layer').style.display = 'none';
        document.getElementById('main-app').style.display = 'grid';
        engineLoadData();
    } else { alert("البيانات خاطئة!"); }
}

function uiPreviewIcon(input) {
    if (input.files[0]) {
        iconFile = input.files[0];
        document.getElementById('prev-icon').innerHTML = `
            <div class="thumb"><img src="${URL.createObjectURL(iconFile)}"><button class="del-x" onclick="iconFile=null;document.getElementById('prev-icon').innerHTML=''">×</button></div>`;
    }
}

function uiPreviewScreens(input) {
    const files = Array.from(input.files);
    screenFiles = screenFiles.concat(files);
    uiRenderScreens();
}

function uiRenderScreens() {
    const box = document.getElementById('prev-screens');
    box.innerHTML = "";
    screenFiles.forEach((f, i) => {
        box.innerHTML += `<div class="thumb"><img src="${URL.createObjectURL(f)}"><button class="del-x" onclick="screenFiles.splice(${i},1);uiRenderScreens()">×</button></div>`;
    });
}

function uiAddLink() {
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginBottom = "10px";
    div.innerHTML = `<input type="text" class="l-url" placeholder="الرابط"><input type="text" class="l-txt" placeholder="نص الزر"><button onclick="this.parentElement.remove()" style="background:red; color:white; border-radius:10px; width:45px; border:none;">-</button>`;
    document.getElementById('links-area').appendChild(div);
}

async function enginePublish() {
    const btn = document.getElementById('pub-btn');
    btn.disabled = true; btn.innerText = "جاري الرفع...";

    try {
        let iUrl = "";
        if (iconFile) iUrl = await uploadToStorage(iconFile);
        
        const sUrls = [];
        for (let f of screenFiles) sUrls.push(await uploadToStorage(f));

        const urls = Array.from(document.querySelectorAll('.l-url')).map(i => i.value);
        const txts = Array.from(document.querySelectorAll('.l-txt')).map(i => i.value);

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            "desc": document.getElementById('p-desc').value,
            icon_url: iUrl,
            screenshots: sUrls,
            link: urls[0] || "#",
            btn_text: txts[0] || "تحميل",
            extra_links: { urls, texts: txts }
        }]);

        if (error) throw error;
        alert("✅ تم النشر!"); location.reload();
    } catch (e) { alert(e.message); btn.disabled = false; btn.innerText = "إعادة المحاولة"; }
}

async function uploadToStorage(file) {
    const name = Date.now() + "_" + file.name.replace(/\s/g, '_');
    const { error } = await sb.storage.from('media').upload(name, file);
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(name).data.publicUrl;
}

function uiNav(id, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function engineLoadData() {
    document.getElementById('admin-display-name').innerText = localStorage.getItem('md_name') || "محمد أمين";
    sb.from('projects').select('views, downloads').then(({data}) => {
        if (data) {
            document.getElementById('stat-v').innerText = data.reduce((a, b) => a + (b.views || 0), 0);
            document.getElementById('stat-d').innerText = data.reduce((a, b) => a + (b.downloads || 0), 0);
        }
    });
}

function engineUpdateProfile() {
    const n = document.getElementById('up-name').value;
    const u = document.getElementById('up-user').value;
    const p = document.getElementById('up-pass').value;
    if(n) localStorage.setItem('md_name', n);
    if(u) localStorage.setItem('admin_user', u);
    if(p) localStorage.setItem('admin_pass', p);
    alert("تم التحديث!"); location.reload();
}

function uiTheme() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}
