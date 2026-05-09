// 1. إعدادات الاتصال بـ Supabase
const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

// متغيرات عامة للملفات
let tempScreenshots = [];
let iconFileRaw = null;

// --- [ المطالب: نظام الدخول ] ---
function checkLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const savedUser = localStorage.getItem('admin_user') || "admin";
    const savedPass = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if (u === savedUser && p === savedPass) {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData();
        loadStats();
    } else {
        alert("خطأ في اسم المستخدم أو كلمة المرور!");
    }
}

// --- [ المطالب: معاينة الأيقونة وإلغاؤها ] ---
function previewIcon(input) {
    if (input.files && input.files[0]) {
        iconFileRaw = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('icon-preview').innerHTML = `
                <div style="position:relative; display:inline-block; margin-top:10px;">
                    <img src="${e.target.result}" style="width:90px; height:90px; border-radius:12px; border:2px solid #3699ff;">
                    <button type="button" onclick="clearIconPreview()" style="position:absolute; top:-8px; right:-8px; background:#ff4d4d; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">×</button>
                </div>`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearIconPreview() {
    iconFileRaw = null;
    document.getElementById('icon-file').value = "";
    document.getElementById('icon-preview').innerHTML = "";
}

// --- [ المطالب: معاينة السكرين شوتس ] ---
function previewScreenshots(input) {
    const container = document.getElementById('screens-preview');
    container.innerHTML = "";
    tempScreenshots = Array.from(input.files);
    tempScreenshots.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.style.position = "relative";
            div.innerHTML = `
                <img src="${e.target.result}" style="width:80px; height:80px; border-radius:8px; object-fit:cover;">
                <button type="button" onclick="removeScreenshot(${index})" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; cursor:pointer; width:18px; height:18px; font-size:10px;">×</button>`;
            container.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeScreenshot(index) {
    tempScreenshots.splice(index, 1);
    // تحديث الواجهة يدويًا هنا إذا لزم الأمر
}

// --- [ المطالب: إضافة أكثر من رابط (الروابط المتعددة) ] ---
function addNewLinkField() {
    const container = document.getElementById('links-container');
    const div = document.createElement('div');
    div.className = "extra-link-row";
    div.style.display = "flex"; div.style.gap = "10px"; div.style.marginTop = "10px";
    div.innerHTML = `
        <input type="text" class="link-url" placeholder="رابط التحميل/المشروع">
        <input type="text" class="link-text" placeholder="نص الزر (مثلاً: تحميل APK)">
        <button type="button" onclick="this.parentElement.remove()" style="background:#ff4d4d; color:white; border:none; border-radius:8px; padding:0 15px; cursor:pointer;">-</button>
    `;
    container.appendChild(div);
}

// --- [ دالة الرفع الأساسية ] ---
async function uploadToMedia(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(fileName, file);
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(fileName).data.publicUrl;
}

// --- [ المطالب: النشر الكامل والمصحح ] ---
async function publishProject() {
    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.innerText = "جاري النشر... (يرجى الانتظار)";

    try {
        let iconUrl = document.getElementById('icon-url-inp').value;
        if (iconFileRaw) iconUrl = await uploadToMedia(iconFileRaw);
        if (!iconUrl) throw new Error("يجب تحديد أيقونة للمشروع");

        const screenshotUrls = [];
        for (let file of tempScreenshots) {
            screenshotUrls.push(await uploadToMedia(file));
        }

        const urls = Array.from(document.querySelectorAll('.link-url')).map(i => i.value);
        const texts = Array.from(document.querySelectorAll('.link-text')).map(i => i.value);

        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            "desc": document.getElementById('p-desc').value, // مطابق لـ SQL
            icon_url: iconUrl,
            screenshots: screenshotUrls,
            link: fixUrl(urls[0]),
            btn_text: texts[0] || "تحميل",
            extra_links: { urls, texts },
            views: 0,
            downloads: 0
        }]);

        if (error) throw error;
        alert("🚀 تم النشر بنجاح!");
        location.reload();

    } catch (err) {
        alert("فشل النشر: " + err.message);
        btn.disabled = false;
        btn.innerText = "🚀 إعادة محاولة النشر";
    }
}

function fixUrl(url) {
    if (!url || url === "#") return "#";
    return url.startsWith('http') ? url : `https://${url}`;
}

// --- [ المطالب: تحديث البروفايل (الاسم، الباسورد، الصورة) ] ---
async function updateAdminProfile() {
    const newName = document.getElementById('edit-name').value;
    const newPass = document.getElementById('edit-pass').value;
    const newUser = document.getElementById('edit-user').value;
    const profileFile = document.getElementById('new-profile-file').files[0];

    if (newName) localStorage.setItem('md_name', newName);
    if (newPass) localStorage.setItem('admin_pass', newPass);
    if (newUser) localStorage.setItem('admin_user', newUser);
    
    if (profileFile) {
        const url = await uploadToMedia(profileFile);
        localStorage.setItem('md_avatar', url);
    }
    
    alert("تم تحديث بيانات الحساب بنجاح!");
    location.reload();
}

function loadAdminData() {
    document.getElementById('admin-name-sidebar').innerText = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar');
    if (avatar) document.getElementById('admin-avatar-sidebar').src = avatar;
}

// --- [ المطالب: الوضع الليلي والمضيء ] ---
function toggleManagerTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', target);
    localStorage.setItem('manager-theme', target);
}

// تطبيق الثيم المحفوظ عند التحميل
(function() {
    const savedTheme = localStorage.getItem('manager-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
})();

// --- [ التنقل والإحصائيات ] ---
function switchSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
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
