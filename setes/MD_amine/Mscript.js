const _URL = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_URL, _KEY);

let iconFile = null;
let screenFiles = [];

window.onload = () => {
    document.getElementById('btn-login').addEventListener('click', engineLogin);
    document.getElementById('pub-btn').addEventListener('click', enginePublish);
    document.getElementById('f-icon').addEventListener('change', (e) => uiPreviewIcon(e.target));
    document.getElementById('f-screens').addEventListener('change', (e) => uiPreviewScreens(e.target));
    document.getElementById('f-avatar').addEventListener('change', (e) => engineChangeAvatar(e.target));
};

// الدخول
function engineLogin() {
    const u = document.getElementById('login-u').value;
    const p = document.getElementById('login-p').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if (u === sU && p === sP) {
        document.getElementById('auth-layer').style.display = 'none';
        document.getElementById('main-app').style.display = 'grid';
        engineLoadData();
    } else { alert("عذراً، لم نتمكن من العثور على حسابك"); }
}

// تغيير صورة البروفايل ورفعها
async function engineChangeAvatar(input) {
    if (input.files[0]) {
        const file = input.files[0];
        try {
            const url = await uploadToStorage(file);
            localStorage.setItem('md_avatar', url);
            document.getElementById('admin-avatar').src = url;
            alert("تم تحديث صورة البروفايل بنجاح");
        } catch (e) { alert("فشل رفع الصورة"); }
    }
}

// معاينة الصور (بدون سكرول)
function uiPreviewIcon(input) {
    if (input.files[0]) {
        iconFile = input.files[0];
        document.getElementById('prev-icon').innerHTML = `<div class="img-thumb"><img src="${URL.createObjectURL(iconFile)}"><button class="remove-btn" onclick="iconFile=null;document.getElementById('prev-icon').innerHTML=''">×</button></div>`;
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
        box.innerHTML += `<div class="img-thumb"><img src="${URL.createObjectURL(f)}"><button class="remove-btn" onclick="screenFiles.splice(${i},1);uiRenderScreens()">×</button></div>`;
    });
}

function uiAddLink() {
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginTop = "10px";
    div.innerHTML = `<input type="text" class="l-url" placeholder="URL"><input type="text" class="l-txt" placeholder="Label"><button class="btn-google" onclick="this.parentElement.remove()" style="background:#ea4335">-</button>`;
    document.getElementById('links-area').appendChild(div);
}

// النشر
async function enginePublish() {
    const btn = document.getElementById('pub-btn');
    btn.disabled = true; btn.innerText = "جاري النشر...";
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
        alert("تم حفظ المشروع بنجاح"); location.reload();
    } catch (e) { alert(e.message); btn.disabled = false; btn.innerText = "نشر المشروع"; }
}

async function uploadToStorage(file) {
    const name = Date.now() + "_" + file.name.replace(/\s/g, '_');
    const { error } = await sb.storage.from('media').upload(name, file);
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(name).data.publicUrl;
}

// التنقل وتحميل البيانات
function uiNav(id, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function engineLoadData() {
    document.getElementById('admin-display-name').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('admin-avatar').src = localStorage.getItem('md_avatar') || "https://via.placeholder.com/80";
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
    alert("تم تحديث معلومات الأمان"); location.reload();
}
