const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let tempScreenshots = [];
let iconFileRaw = null;

// 1. نظام تسجيل الدخول المطور
function checkLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    
    const savedUser = localStorage.getItem('admin_user') || "admin";
    const savedPass = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if(user === savedUser && pass === savedPass) {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData();
        loadStats();
    } else {
        alert("خطأ في اليوزر أو الباسورد!");
    }
}

// 2. تبديل الوضع (Dark/Light)
function toggleManagerTheme() {
    const body = document.body;
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
}

// 3. معاينة الأيقونة مع زر الإلغاء
function previewIcon(input) {
    if (input.files && input.files[0]) {
        iconFileRaw = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            renderIconPreview(e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewIconUrl(url) {
    if(url) {
        iconFileRaw = null; // نلغي الملف المرفوع إذا وضع رابط
        renderIconPreview(url);
    }
}

function renderIconPreview(src) {
    const container = document.getElementById('icon-preview');
    container.innerHTML = `
        <div style="position:relative; display:inline-block;">
            <img src="${src}">
            <button class="btn-remove" onclick="clearIcon()">×</button>
        </div>
    `;
}

function clearIcon() {
    iconFileRaw = null;
    document.getElementById('icon-file').value = "";
    document.getElementById('icon-url-inp').value = "";
    document.getElementById('icon-preview').innerHTML = "";
}

function toggleUrlInput() {
    const inp = document.getElementById('icon-url-inp');
    inp.classList.toggle('hidden');
}

// 4. معاينة لقطات الشاشة
function previewScreenshots(input) {
    const preview = document.getElementById('screens-preview');
    preview.innerHTML = "";
    tempScreenshots = Array.from(input.files);
    tempScreenshots.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.style.position = "relative";
            div.innerHTML = `<img src="${e.target.result}"><button class="btn-remove" onclick="removeScreenshot(${index})">×</button>`;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeScreenshot(index) {
    tempScreenshots.splice(index, 1);
    // تحديث المعاينة (بسيط لإعادة الرسم)
    const preview = document.getElementById('screens-preview');
    preview.innerHTML = "يرجى إعادة اختيار الصور بعد الحذف للتأكيد"; 
}

// 5. أزرار الروابط المتعددة
function addNewLinkField() {
    const container = document.getElementById('links-container');
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginTop = "10px";
    div.innerHTML = `
        <input type="text" class="link-url" placeholder="رابط إضافي">
        <input type="text" class="link-text" placeholder="نص الزر">
        <button class="btn-secondary" onclick="this.parentElement.remove()">-</button>
    `;
    container.appendChild(div);
}

// 6. رفع الملفات لـ Supabase Storage
async function uploadToMedia(file) {
    const name = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(name, file);
    if(error) throw error;
    return sb.storage.from('media').getPublicUrl(name).data.publicUrl;
}

// 7. دالة النشر المصلحة
async function publishProject() {
    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.innerText = "جاري النشر...";

    try {
        // أيقونة
        let finalIcon = document.getElementById('icon-url-inp').value;
        if(iconFileRaw) finalIcon = await uploadToMedia(iconFileRaw);

        if(!finalIcon) throw new Error("يجب اختيار أيقونة للمشروع");

        // صور المعرض
        const screenshotUrls = [];
        for(let file of tempScreenshots) {
            screenshotUrls.push(await uploadToMedia(file));
        }

        // تجميع الروابط
        const linkUrls = Array.from(document.querySelectorAll('.link-url')).map(i => i.value);
        const linkTexts = Array.from(document.querySelectorAll('.link-text')).map(i => i.value);
        
        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value,
            icon_url: finalIcon,
            screenshots: screenshotUrls,
            link: fixUrl(linkUrls[0]), // الرابط الأول هو الأساسي
            btn_text: linkTexts[0] || "تحميل",
            extra_links: { urls: linkUrls, texts: linkTexts }, // تخزين الروابط الإضافية
            views: 0, downloads: 0
        }]);

        if(error) throw error;
        alert("تم النشر بنجاح!");
        location.reload();
    } catch(e) {
        alert("خطأ: " + e.message);
        btn.disabled = false;
        btn.innerText = "🚀 نشر المشروع الآن";
    }
}

function fixUrl(url) { 
    if(!url) return "#";
    return url.startsWith('http') ? url : `https://${url}`; 
}

// 8. تحديث الحساب المطور
let profileFileRaw = null;
function previewProfileUpload(input) {
    if (input.files && input.files[0]) {
        profileFileRaw = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-upload-preview').innerHTML = `<img src="${e.target.result}">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function updateAdminProfile() {
    const name = document.getElementById('edit-name').value;
    const user = document.getElementById('edit-user').value;
    const pass = document.getElementById('edit-pass').value;

    if(name) localStorage.setItem('md_name', name);
    if(user) localStorage.setItem('admin_user', user);
    if(pass) localStorage.setItem('admin_pass', pass);

    if(profileFileRaw) {
        const url = await uploadToMedia(profileFileRaw);
        localStorage.setItem('md_avatar', url);
    }

    alert("تم تحديث البيانات، سيتم إعادة التحميل..");
    location.reload();
}

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
