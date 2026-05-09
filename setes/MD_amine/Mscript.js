const _URL = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_URL, _KEY);

let selectedScreenshots = []; // لتخزين الصور المختارة محلياً دون حذف القديم

const app = {
    // 1. إدارة الدخول (حل مشكلة التحديث)
    init: function() {
        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('app-wrapper').style.display = 'grid';
            this.loadUserData();
            this.fetchProjects();
        }
    },

    login: function() {
        const u = document.getElementById('user-in').value;
        const p = document.getElementById('pass-in').value;
        if (u === (localStorage.getItem('admin_user') || "admin") && p === (localStorage.getItem('admin_pass') || "MDaMiNeLD")) {
            sessionStorage.setItem('isLoggedIn', 'true');
            location.reload();
        } else alert("بيانات غير صحيحة");
    },

    // 2. إدارة الواجهات
    setTab: function(tabId) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-' + tabId).classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        event.currentTarget.classList.add('active');
    },

    showProfile: function() {
        document.getElementById('main-sidebar').style.display = 'none';
        document.getElementById('content-area').style.display = 'none';
        document.getElementById('profile-view').style.display = 'flex';
    },

    hideProfile: function() {
        document.getElementById('profile-view').style.display = 'none';
        document.getElementById('main-sidebar').style.display = 'flex';
        document.getElementById('content-area').style.display = 'block';
    },

    // 3. إدارة الملفات والصور (حل مشكلة الصور المتعددة)
    previewScreens: function(input) {
        const box = document.getElementById('screens-preview-box');
        const files = Array.from(input.files);
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const id = Date.now() + index;
                selectedScreenshots.push({ id: id, file: file, url: e.target.result });
                this.renderScreensPreview();
            };
            reader.readAsDataURL(file);
        });
    },

    renderScreensPreview: function() {
        const box = document.getElementById('screens-preview-box');
        box.innerHTML = selectedScreenshots.map(img => `
            <div class="screen-item">
                <img src="${img.url}">
                <button onclick="app.removePreview(${img.id})">×</button>
            </div>
        `).join('');
    },

    removePreview: function(id) {
        selectedScreenshots = selectedScreenshots.filter(item => item.id !== id);
        this.renderScreensPreview();
    },

    // 4. الحفظ والنشر
    saveProject: async function() {
        const btn = event.currentTarget;
        btn.disabled = true; btn.innerText = "جاري المعالجة...";
        
        try {
            // منطق الرفع هنا (أيقونة + سكرينشوتات)
            const iconFile = document.getElementById('p-icon').files[0];
            let iconUrl = "";
            if (iconFile) {
                const path = `icons/${Date.now()}_${iconFile.name}`;
                await sb.storage.from('media').upload(path, iconFile);
                iconUrl = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
            }

            // رفع السكرينشوتات
            const screenUrls = [];
            for (let item of selectedScreenshots) {
                const path = `screens/${Date.now()}_${item.id}`;
                await sb.storage.from('media').upload(path, item.file);
                screenUrls.push(sb.storage.from('media').getPublicUrl(path).data.publicUrl);
            }

            const data = {
                title: document.getElementById('p-title').value,
                type: document.getElementById('p-type').value,
                desc: document.getElementById('p-desc').value,
                icon_url: iconUrl,
                screenshots: screenUrls,
                link: document.querySelector('.l-url').value,
                btn_text: document.querySelector('.l-txt').value
            };

            const editId = document.getElementById('edit-id').value;
            if (editId) await sb.from('projects').update(data).eq('id', editId);
            else await sb.from('projects').insert([data]);

            alert("تم الحفظ بنجاح");
            location.reload();
        } catch (e) { alert(e.message); btn.disabled = false; }
    },

    // 5. تعديل البروفايل
    toggleEdit: function(id) {
        const el = document.getElementById(id);
        if (el.readOnly) {
            el.readOnly = false; el.focus();
            event.currentTarget.innerText = "💾";
        } else {
            el.readOnly = true;
            localStorage.setItem('md_' + id, el.value);
            event.currentTarget.innerText = "✎";
            alert("تم حفظ التعديل محلياً");
        }
    },

    loadUserData: function() {
        document.getElementById('prof-name').value = localStorage.getItem('md_prof-name') || "محمد أمين";
        document.getElementById('prof-user').value = localStorage.getItem('admin_user') || "admin";
        document.getElementById('prof-bio').value = localStorage.getItem('md_prof-bio') || "مطور برمجيات وأنظمة";
        const av = localStorage.getItem('md_avatar');
        if(av) {
            document.getElementById('side-avatar').src = av;
            document.getElementById('large-avatar').src = av;
        }
    },

    updateAvatar: async function(input) {
        const file = input.files[0];
        const path = `avatars/${Date.now()}_admin`;
        await sb.storage.from('media').upload(path, file);
        const url = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
        localStorage.setItem('md_avatar', url);
        location.reload();
    },

    addLinkRow: function() {
        const row = document.createElement('div');
        row.className = "link-row";
        row.innerHTML = `<input type="text" class="l-url" placeholder="الرابط"><input type="text" class="l-txt" placeholder="الاسم"><button onclick="this.parentElement.remove()">×</button>`;
        document.getElementById('links-wrapper').appendChild(row);
    }
};

app.init();
