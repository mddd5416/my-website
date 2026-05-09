const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let tempScreenshots = [];
let iconFileRaw = null;

// تسجيل الدخول
function checkLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const sU = localStorage.getItem('admin_user') || "admin";
    const sP = localStorage.getItem('admin_pass') || "MDaMiNeLD";

    if(u === sU && p === sP) {
        document.getElementById('login-screen').style.display = 'none';
        loadAdminData(); loadStats();
    } else { alert("خطأ في اليوزر أو الباسورد!"); }
}

// معاينة الأيقونة مع زر الإلغاء
function previewIcon(input) {
    if (input.files && input.files[0]) {
        iconFileRaw = input.files[0];
        const r = new FileReader();
        r.onload = e => {
            document.getElementById('icon-preview').innerHTML = `
                <div style="position:relative; display:inline-block;">
                    <img src="${e.target.result}" style="width:80px; height:80px; border-radius:10px; border:2px solid #3699ff;">
                    <button onclick="clearIcon()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">×</button>
                </div>`;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function clearIcon() {
    iconFileRaw = null;
    document.getElementById('icon-file').value = "";
    document.getElementById('icon-preview').innerHTML = "";
}

// معاينة الصور المتعددة
function previewScreenshots(input) {
    const p = document.getElementById('screens-preview');
    p.innerHTML = "";
    tempScreenshots = Array.from(input.files);
    tempScreenshots.forEach((f, i) => {
        const r = new FileReader();
        r.onload = e => {
            const d = document.createElement('div');
            d.style.position = "relative";
            d.innerHTML = `<img src="${e.target.result}" style="width:80px; height:80px; border-radius:8px;"><button onclick="removeImg(${i})" style="position:absolute; top:0; right:0; background:red; color:white; border:none; border-radius:50%; cursor:pointer;">×</button>`;
            p.appendChild(d);
        };
        r.readAsDataURL(f);
    });
}

function removeImg(index) {
    tempScreenshots.splice(index, 1);
    // تحديث بسيط للواجهة
}

// رفع الملفات
async function uploadToMedia(f) {
    const n = `${Date.now()}_${f.name.replace(/\s/g, '_')}`;
    const { data, error } = await sb.storage.from('media').upload(n, f);
    if(error) throw error;
    return sb.storage.from('media').getPublicUrl(n).data.publicUrl;
}

// دالة النشر (المصلحة)
async function publishProject() {
    const b = document.getElementById('publish-btn');
    b.disabled = true;
    b.innerText = "جاري رفع الملفات...";

    try {
        let iconUrl = document.getElementById('icon-url-inp')?.value || "";
        if(iconFileRaw) iconUrl = await uploadToMedia(iconFileRaw);

        if(!iconUrl) { throw new Error("يرجى اختيار أيقونة أولاً"); }

        const screenshotsUrls = [];
        for(let f of tempScreenshots) {
            screenshotsUrls.push(await uploadToMedia(f));
        }

        b.innerText = "جاري حفظ البيانات...";

        // الحقول مطابقة لجدولك في Supabase (bnt_text)
        const { error } = await sb.from('projects').insert([{
            title: document.getElementById('p-title').value,
            type: document.getElementById('p-type').value,
            desc: document.getElementById('p-desc').value,
            icon_url: iconUrl,
            screenshots: screenshotsUrls,
            link: fixUrl(document.getElementById('p-link').value),
            bnt_text: document.getElementById('p-btn-title').value, // مطابق لاسم العمود في جدولك
            views: 0, 
            downloads: 0
        }]);

        if(error) throw error;

        alert("تم النشر بنجاح!");
        location.reload();
    } catch(e) {
        console.error(e);
        alert("فشل النشر: " + e.message);
        b.disabled = false;
        b.innerText = "🚀 نشر المشروع الآن";
    }
}

function fixUrl(u) { return !u ? "#" : (u.startsWith('http') ? u : `https://${u}`); }

// تبديل الوضع الليلي
function toggleManagerTheme() {
    const b = document.body;
    const t = b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    b.setAttribute('data-theme', t);
}

// تحديث الحساب
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
    alert("تم تحديث بياناتك بنجاح!");
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
