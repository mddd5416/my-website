const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let tempScreenshots = [];

function checkLogin() {
    const key = document.getElementById('access-key').value;
    if(key === "MDaMiNeLD") {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData();
    } else { alert("خطأ في المفتاح!"); }
}

function switchSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}

// تبديل بين رابط أو رفع
function toggleInput(target, type) {
    const inp = document.getElementById(`${target}-url-inp`);
    inp.classList.toggle('hidden');
}

// معاينة الصور
function previewUrl(target, val) {
    document.getElementById(`${target}-preview`).innerHTML = `<img src="${val}">`;
}

function previewFile(target, input) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById(`${target}-preview`).innerHTML = `<img src="${e.target.result}">`;
    };
    reader.readAsDataURL(input.files[0]);
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

// دالة الرفع لـ Supabase Storage
async function uploadToMedia(file) {
    const name = `${Date.now()}_${file.name}`;
    const { data, error } = await sb.storage.from('media').upload(name, file);
    if(error) throw error;
    return sb.storage.from('media').getPublicUrl(name).data.publicUrl;
}

// النشر النهائي
async function publishProject() {
    try {
        let finalIcon = document.getElementById('icon-url-inp').value;
        const iconFile = document.getElementById('icon-file').files[0];
        if(iconFile) finalIcon = await uploadToMedia(iconFile);

        const screenshotUrls = [];
        for(let file of tempScreenshots) {
            screenshotUrls.push(await uploadToMedia(file));
        }

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value,
            icon_url: finalIcon,
            screenshots: screenshotUrls,
            link: fixUrl(document.getElementById('p-link').value),
            btn_text: document.getElementById('p-btn-title').value,
            views: 0, downloads: 0
        }]);

        if(error) throw error;
        alert("تم النشر بنجاح يا محمد!");
        location.reload();
    } catch(e) { alert("حدث خطأ: " + e.message); }
}

function fixUrl(url) { return url.startsWith('http') ? url : `https://${url}`; }

// إدارة الحساب
function loadAdminData() {
    const name = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar') || "https://via.placeholder.com/80";
    document.getElementById('admin-name-sidebar').innerText = name;
    document.getElementById('admin-avatar-sidebar').src = avatar;
}

async function updateAdminProfile() {
    const name = document.getElementById('edit-name').value;
    const avatar = document.getElementById('edit-avatar').value;
    if(name) localStorage.setItem('md_name', name);
    if(avatar) localStorage.setItem('md_avatar', avatar);
    alert("تم تحديث بياناتك بنجاح");
    loadAdminData();
}
