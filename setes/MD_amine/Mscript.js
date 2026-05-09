// [1] الإعدادات الأساسية
const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let selectedIconFile = null;
let selectedScreensFiles = [];

// [2] نظام الدخول
function handleAuth() {
    const u = document.getElementById('auth-user').value;
    const p = document.getElementById('auth-pass').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if (u === sU && p === sP) {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('main-wrapper').style.display = 'grid';
        logicLoadData();
    } else {
        alert("بيانات الدخول غير صحيحة!");
    }
}

// [3] إدارة الصور والمعاينة
function uiPreviewIcon(input) {
    if (input.files[0]) {
        selectedIconFile = input.files[0];
        const r = new FileReader();
        r.onload = e => {
            document.getElementById('zone-icon-preview').innerHTML = `
                <div class="thumb-box">
                    <img src="${e.target.result}">
                    <button class="x-del" onclick="selectedIconFile=null; document.getElementById('zone-icon-preview').innerHTML=''">×</button>
                </div>`;
        };
        r.readAsDataURL(selectedIconFile);
    }
}

function uiPreviewScreens(input) {
    const files = Array.from(input.files);
    selectedScreensFiles = selectedScreensFiles.concat(files);
    uiRenderScreens();
}

function uiRenderScreens() {
    const zone = document.getElementById('zone-screens-preview');
    zone.innerHTML = "";
    selectedScreensFiles.forEach((file, index) => {
        const r = new FileReader();
        r.onload = e => {
            zone.innerHTML += `
                <div class="thumb-box">
                    <img src="${e.target.result}">
                    <button class="x-del" onclick="selectedScreensFiles.splice(${index},1); uiRenderScreens()">×</button>
                </div>`;
        };
        r.readAsDataURL(file);
    });
}

function uiAddLinkRow() {
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginBottom = "10px";
    div.innerHTML = `<input type="text" class="url-input" placeholder="رابط التحميل"><input type="text" class="txt-input" placeholder="نص الزر"><button onclick="this.parentElement.remove()" style="background:red; border:none; border-radius:10px; color:white; width:50px;">-</button>`;
    document.getElementById('container-links').appendChild(div);
}

// [4] عملية الرفع والنشر المضمونة
async function logicPublish() {
    const btn = document.getElementById('btn-publish-final');
    btn.disabled = true; btn.innerText = "جاري رفع الملفات...";

    try {
        let finalIconUrl = document.getElementById('in-project-icon-url').value;
        if (selectedIconFile) finalIconUrl = await logicUpload(selectedIconFile);
        
        const finalScreensUrls = [];
        for (let f of selectedScreensFiles) {
            finalScreensUrls.push(await logicUpload(f));
        }

        const urls = Array.from(document.querySelectorAll('.url-input')).map(i => i.value);
        const txts = Array.from(document.querySelectorAll('.txt-input')).map(i => i.value);

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('in-project-title').value,
            type: document.getElementById('in-project-type').value,
            "desc": document.getElementById('in-project-desc').value,
            icon_url: finalIconUrl,
            screenshots: finalScreensUrls,
            link: urls[0] || "#",
            btn_text: txts[0] || "تحميل",
            extra_links: { urls, texts: txts }
        }]);

        if (error) throw error;
        alert("أخيراً! تم النشر بنجاح");
        location.reload();

    } catch (e) {
        alert("خطأ أثناء النشر: " + e.message);
        btn.disabled = false; btn.innerText = "🚀 إعادة المحاولة";
    }
}

async function logicUpload(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(fileName, file);
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(fileName).data.publicUrl;
}

// [5] البروفايل والإحصائيات
async function logicUpdateProfile() {
    const n = document.getElementById('up-display-name').value;
    const u = document.getElementById('up-username').value;
    const p = document.getElementById('up-password').value;
    const f = document.getElementById('up-avatar-file').files[0];

    if (n) localStorage.setItem('md_name', n);
    if (u) localStorage.setItem('admin_user', u);
    if (p) localStorage.setItem('admin_pass', p);
    if (f) localStorage.setItem('md_avatar', await logicUpload(f));
    
    alert("تم تحديث البيانات بنجاح!");
    location.reload();
}

function logicLoadData() {
    document.getElementById('display-name').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('display-avatar').src = localStorage.getItem('md_avatar') || "https://via.placeholder.com/90";
    
    sb.from('projects').select('views, downloads').then(({data}) => {
        if (data) {
            document.getElementById('stat-views').innerText = data.reduce((s, p) => s + (p.views || 0), 0);
            document.getElementById('stat-downloads').innerText = data.reduce((s, p) => s + (p.downloads || 0), 0);
        }
    });
}

function switchTab(id, btn) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function uiToggleTheme() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}
