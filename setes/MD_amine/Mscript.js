// التكوين الرئيسي
const config = {
    url: 'https://ibqvftckjsyfnyembggc.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4'
};
const sb = supabase.createClient(config.url, config.key);

let fileStore = { icon: null, screens: [] };

// --- [ منطق الدخول ] ---
function engineLogin() {
    const u = document.getElementById('input-user').value;
    const p = document.getElementById('input-pass').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if (u === sU && p === sP) {
        document.getElementById('auth-layer').style.display = 'none';
        const app = document.getElementById('main-app');
        app.style.visibility = 'visible';
        app.style.opacity = '1';
        engineLoadData();
    } else {
        alert("فشل في المصادقة: البيانات غير صحيحة");
    }
}

// --- [ منطق المعاينة الذكي ] ---
function uiPreview(input, boxId, isMulti) {
    const box = document.getElementById(boxId);
    if (!isMulti) {
        fileStore.icon = input.files[0];
        box.innerHTML = renderImg(URL.createObjectURL(fileStore.icon), `fileStore.icon=null; document.getElementById('${boxId}').innerHTML=''`);
    } else {
        const files = Array.from(input.files);
        files.forEach(f => {
            const id = Math.random().toString(36).substr(2, 9);
            fileStore.screens.push({ id, file: f });
            const url = URL.createObjectURL(f);
            box.innerHTML += `<div class="img-item" id="${id}">${renderImg(url, `engineKillScreen('${id}')`)}</div>`;
        });
    }
}

function renderImg(url, delAction) {
    return `<img src="${url}"><button class="btn-kill" onclick="${delAction}">×</button>`;
}

function engineKillScreen(id) {
    fileStore.screens = fileStore.screens.filter(s => s.id !== id);
    document.getElementById(id).remove();
}

function uiAddLink() {
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginBottom = "10px";
    div.innerHTML = `<input type="text" class="link-src" placeholder="الرابط"><input type="text" class="link-label" placeholder="نص الزر"><button onclick="this.parentElement.remove()" style="background:red; color:white; width:50px;">-</button>`;
    document.getElementById('dynamic-links').appendChild(div);
}

// --- [ محرك الرفع والنشر ] ---
async function enginePublish() {
    const btn = document.getElementById('submit-project');
    btn.disabled = true; btn.innerText = "جاري معالجة البيانات...";

    try {
        let iconUrl = document.getElementById('post-icon-url').value;
        if (fileStore.icon) iconUrl = await engineUpload(fileStore.icon);
        
        const screenUrls = [];
        for (let s of fileStore.screens) screenUrls.push(await engineUpload(s.file));

        const links = Array.from(document.querySelectorAll('.link-src')).map(i => i.value);
        const labels = Array.from(document.querySelectorAll('.link-label')).map(i => i.value);

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('post-title').value,
            type: document.getElementById('post-type').value,
            "desc": document.getElementById('post-desc').value,
            icon_url: iconUrl,
            screenshots: screenUrls,
            link: links[0] || "#",
            btn_text: labels[0] || "تحميل",
            extra_links: { urls: links, texts: labels }
        }]);

        if (error) throw error;
        alert("تم النشر بنجاح!");
        location.reload();
    } catch (e) {
        alert("خطأ تقني: " + e.message);
        btn.disabled = false; btn.innerText = "إعادة المحاولة";
    }
}

async function engineUpload(file) {
    const path = `media/${Date.now()}_${file.name}`;
    const { error } = await sb.storage.from('media').upload(path, file);
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

// --- [ منطق البيانات والواجهة ] ---
function engineLoadData() {
    document.getElementById('admin-nick').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('admin-img').src = localStorage.getItem('md_avatar') || "https://via.placeholder.com/90";
    
    sb.from('projects').select('views, downloads').then(({data}) => {
        if (data) {
            document.getElementById('stat-v').innerText = data.reduce((a, b) => a + (b.views || 0), 0);
            document.getElementById('stat-d').innerText = data.reduce((a, b) => a + (b.downloads || 0), 0);
        }
    });
}

function uiNavigate(id, btn) {
    document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function uiToggleTheme() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}

function engineUpdateProfile() {
    const n = document.getElementById('new-nick').value;
    const u = document.getElementById('new-user').value;
    const p = document.getElementById('new-pass').value;
    if (n) localStorage.setItem('md_nick', n);
    if (u) localStorage.setItem('admin_user', u);
    if (p) localStorage.setItem('admin_pass', p);
    alert("تم التحديث بنجاح!");
    location.reload();
}
