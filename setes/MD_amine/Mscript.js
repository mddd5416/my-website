const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let uploadedScreenshots = [];

function checkLogin() {
    if(document.getElementById('access-key').value === "MDaMiNeLD") {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData();
    } else { alert("خطأ في الدخول!"); }
}

function switchSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}

// معاينة الصور
function previewMedia(type, input) {
    const preview = document.getElementById('icon-preview');
    if(type === 'icon-url') {
        preview.innerHTML = `<img src="${input.value}">`;
    } else {
        const reader = new FileReader();
        reader.onload = (e) => preview.innerHTML = `<img src="${e.target.result}">`;
        reader.readAsDataURL(input.files[0]);
    }
}

function previewScreenshots(input) {
    const preview = document.getElementById('screens-preview');
    preview.innerHTML = "";
    uploadedScreenshots = Array.from(input.files);
    uploadedScreenshots.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => preview.innerHTML += `<img src="${e.target.result}">`;
        reader.readAsDataURL(file);
    });
}

// الرفع الفعلي
async function uploadToStorage(file) {
    const name = `${Date.now()}_${file.name}`;
    const { data, error } = await sb.storage.from('media').upload(name, file);
    if(error) throw error;
    return sb.storage.from('media').getPublicUrl(name).data.publicUrl;
}

async function publishProject() {
    try {
        let iconUrl = document.getElementById('icon-url-input').value;
        const iconFile = document.getElementById('icon-file').files[0];
        if(iconFile) iconUrl = await uploadToStorage(iconFile);

        const screenshotUrls = [];
        for(let file of uploadedScreenshots) {
            screenshotUrls.push(await uploadToStorage(file));
        }

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value,
            icon_url: iconUrl,
            screenshots: screenshotUrls,
            link: fixUrl(document.getElementById('p-link').value),
            btn_text: document.getElementById('p-btn-text').value,
            views: 0, downloads: 0
        }]);

        if(error) throw error;
        alert("تم النشر بنجاح!");
        location.reload();
    } catch(e) { alert("خطأ: " + e.message); }
}

function fixUrl(url) { return url.startsWith('http') ? url : `https://${url}`; }

function loadAdminData() {
    document.getElementById('admin-name-sidebar').innerText = localStorage.getItem('md_name') || "محمد أمين";
    document.getElementById('admin-avatar-sidebar').src = localStorage.getItem('md_avatar') || "";
}

function saveProfile() {
    localStorage.setItem('md_name', document.getElementById('new-name').value);
    localStorage.setItem('md_avatar', document.getElementById('new-avatar').value);
    alert("تم الحفظ!");
}
