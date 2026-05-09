const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let tempScreenshots = [];

function checkLogin() {
    if(document.getElementById('access-key').value === "MDaMiNeLD") {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData();
        loadStats();
    } else { alert("كلمة المرور خاطئة!"); }
}

function switchSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if(id === 'stats') loadStats();
}

function previewFile(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById(previewId).innerHTML = `<img src="${e.target.result}">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewScreenshots(input) {
    const preview = document.getElementById('screens-preview');
    preview.innerHTML = "";
    tempScreenshots = Array.from(input.files);
    tempScreenshots.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

async function uploadToMedia(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(fileName, file);
    if(error) throw error;
    return sb.storage.from('media').getPublicUrl(fileName).data.publicUrl;
}

async function publishProject() {
    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.innerText = "جاري الرفع...";

    try {
        let iconUrl = document.getElementById('icon-url-inp').value;
        const iconFile = document.getElementById('icon-file').files[0];
        if(iconFile) iconUrl = await uploadToMedia(iconFile);

        const screenshotUrls = [];
        for(let file of tempScreenshots) {
            screenshotUrls.push(await uploadToMedia(file));
        }

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value,
            icon_url: iconUrl,
            screenshots: screenshotUrls,
            link: fixUrl(document.getElementById('p-link').value),
            btn_text: document.getElementById('p-btn-title').value || "تحميل",
            views: 0, downloads: 0
        }]);

        if(error) throw error;
        alert("تم النشر بنجاح يا محمد!");
        location.reload();
    } catch(e) {
        alert("خطأ: " + e.message);
        btn.disabled = false;
        btn.innerText = "🚀 نشر المشروع الآن";
    }
}

async function loadStats() {
    const { data } = await sb.from('projects').select('views, downloads');
    if(data) {
        const v = data.reduce((sum, p) => sum + (p.views || 0), 0);
        const d = data.reduce((sum, p) => sum + (p.downloads || 0), 0);
        document.getElementById('total-views').innerText = v;
        document.getElementById('total-downloads').innerText = d;
    }
}

function fixUrl(url) {
    if(!url) return "#";
    return url.startsWith('http') ? url : `https://${url}`;
}

function loadAdminData() {
    const name = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar') || "https://via.placeholder.com/80";
    document.getElementById('admin-name-sidebar').innerText = name;
    document.getElementById('admin-avatar-sidebar').src = avatar;
}

function updateAdminProfile() {
    const name = document.getElementById('edit-name').value;
    const avatar = document.getElementById('edit-avatar').value;
    if(name) localStorage.setItem('md_name', name);
    if(avatar) localStorage.setItem('md_avatar', avatar);
    alert("تم تحديث البيانات");
    loadAdminData();
}
