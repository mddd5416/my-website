// إعدادات الاتصال بـ Supabase
const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

// متغيرات مؤقتة للملفات
let tempScreenshots = [];
let iconFileRaw = null;

// 1. نظام تسجيل الدخول (باستخدام الاسم وكلمة المرور)
function checkLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    
    // القيم الافتراضية إذا لم يتم تغييرها من قبل
    const savedUser = localStorage.getItem('admin_user') || "admin";
    const savedPass = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if(u === savedUser && p === savedPass) {
        document.getElementById('login-screen').classList.add('hidden');
        loadAdminData();
        loadStats();
    } else {
        alert("خطأ في اسم المستخدم أو كلمة المرور!");
    }
}

// 2. معاينة الأيقونة مع زر الحذف (X)
function previewIcon(input) {
    if (input.files && input.files[0]) {
        iconFileRaw = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('icon-preview').innerHTML = `
                <div style="position:relative; display:inline-block; margin-top:10px;">
                    <img src="${e.target.result}" style="width:90px; height:90px; border-radius:12px; border:2px solid #3699ff;">
                    <button onclick="clearIconPreview()" style="position:absolute; top:-8px; right:-8px; background:#ff4d4d; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-weight:bold;">×</button>
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

// 3. معاينة صور المعرض (Screenshots)
function previewScreenshots(input) {
    const previewContainer = document.getElementById('screens-preview');
    previewContainer.innerHTML = "";
    tempScreenshots = Array.from(input.files);

    tempScreenshots.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.style.position = "relative";
            div.innerHTML = `
                <img src="${e.target.result}" style="width:85px; height:85px; border-radius:10px; object-fit:cover;">
                <button onclick="removeScreenshot(${index})" style="position:absolute; top:0; right:0; background:red; color:white; border:none; border-radius:50%; cursor:pointer;">×</button>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeScreenshot(index) {
    tempScreenshots.splice(index, 1);
    // لإعادة تحديث الواجهة يمكن استدعاء دالة العرض مجدداً
}

// 4. إضافة حقول روابط إضافية ديناميكياً
function addNewLinkField() {
    const container = document.getElementById('links-container');
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.gap = "10px";
    div.style.marginTop = "10px";
    div.innerHTML = `
        <input type="text" class="link-url" placeholder="رابط إضافي">
        <input type="text" class="link-text" placeholder="نص الزر">
        <button type="button" class="btn-secondary" onclick="this.parentElement.remove()" style="background:#ff4d4d; color:white; padding:5px 10px;">-</button>
    `;
    container.appendChild(div);
}

// 5. دالة الرفع إلى Storage (الميديا)
async function uploadToMedia(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(fileName, file);
    if(error) throw error;
    
    const { data: urlData } = sb.storage.from('media').getPublicUrl(fileName);
    return urlData.publicUrl;
}

// 6. دالة النشر الأساسية (المصلحة تماماً)
async function publishProject() {
    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.innerText = "جاري النشر... يرجى الانتظار";

    try {
        // أ) رفع الأيقونة
        let finalIcon = document.getElementById('icon-url-inp').value;
        if(iconFileRaw) {
            finalIcon = await uploadToMedia(iconFileRaw);
        }
        if(!finalIcon) throw new Error("يجب اختيار أيقونة للمشروع (ملف أو رابط)");

        // ب) رفع الصور المتعددة
        const screenshotsUrls = [];
        for(let file of tempScreenshots) {
            const url = await uploadToMedia(file);
            screenshotsUrls.push(url);
        }

        // ج) تجميع الروابط
        const urls = Array.from(document.querySelectorAll('.link-url')).map(i => i.value);
        const texts = Array.from(document.querySelectorAll('.link-text')).map(i => i.value);

        // د) الإرسال لقاعدة البيانات (نستخدم "desc" بين علامات ليتوافق مع SQL)
        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value, // مطابق للجدول الجديد
            icon_url: finalIcon,
            screenshots: screenshotsUrls,
            link: fixUrl(urls[0]),
            btn_text: texts[0] || "تحميل",
            extra_links: { urls, texts },
            views: 0,
            downloads: 0
        }]);

        if(error) throw error;

        alert("🚀 تم نشر مشروعك بنجاح!");
        location.reload();

    } catch(err) {
        console.error(err);
        alert("فشل النشر: " + err.message);
        btn.disabled = false;
        btn.innerText = "🚀 نشر المشروع الآن";
    }
}

// دالة لتصحيح الروابط
function fixUrl(url) {
    if(!url || url === "#") return "#";
    return url.startsWith('http') ? url : `https://${url}`;
}

// 7. إدارة الحساب والإحصائيات
function loadAdminData() {
    document.getElementById('admin-name-sidebar').innerText = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar');
    if(avatar) document.getElementById('admin-avatar-sidebar').src = avatar;
}

async function loadStats() {
    try {
        const { data } = await sb.from('projects').select('views, downloads');
        if(data) {
            const v = data.reduce((s, p) => s + (p.views || 0), 0);
            const d = data.reduce((s, p) => s + (p.downloads || 0), 0);
            document.getElementById('total-views').innerText = v;
            document.getElementById('total-downloads').innerText = d;
        }
    } catch(e) { console.log("الإحصائيات غير متوفرة بعد"); }
}

async function updateAdminProfile() {
    const n = document.getElementById('edit-name').value;
    const u = document.getElementById('edit-user').value;
    const p = document.getElementById('edit-pass').value;
    const f = document.getElementById('new-profile-file').files[0];

    if(n) localStorage.setItem('md_name', n);
    if(u) localStorage.setItem('admin_user', u);
    if(p) localStorage.setItem('admin_pass', p);
    if(f) {
        const url = await uploadToMedia(f);
        localStorage.setItem('md_avatar', url);
    }
    alert("تم تحديث البيانات بنجاح!");
    location.reload();
}

// 8. التنقل والوضع الليلي
function toggleManagerTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

function switchSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}
