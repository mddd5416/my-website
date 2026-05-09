// إعدادات Supabase لربط واجهة المستخدم بقاعدة البيانات
const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

// عند تحميل الصفحة، ابدأ بجلب البيانات وتحديث واجهة المدير
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    updateHeaderInfo();
});

// 1. تحديث معلومات الهيدر (الاسم والصورة) من البيانات المحفوظة
function updateHeaderInfo() {
    const name = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar') || "";
    
    const nameDisplay = document.getElementById('admin-name-display');
    const avatarDisplay = document.getElementById('header-avatar');
    
    if(nameDisplay) nameDisplay.innerText = name;
    if(avatarDisplay && avatar) avatarDisplay.src = avatar;
}

// 2. جلب المشاريع من Supabase وعرضها في الشبكة
async function fetchProjects() {
    const { data, error } = await sb
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("خطأ في جلب المشاريع:", error);
        return;
    }

    renderProjects(data);
}

// 3. بناء الكروت مع حل مشكلة خروج النص (Text Overflow)
function renderProjects(projects) {
    const list = document.getElementById('projects-list');
    list.innerHTML = projects.map(p => `
        <div class="card" onclick="showDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px;">
                <img src="${p.icon_url}" style="width:50px; height:50px; border-radius:12px; object-fit:cover;">
                <div>
                    <span style="font-size:12px; color:var(--accent); font-weight:bold;">${p.type}</span>
                    <h3 style="margin:0; font-size:18px;">${p.title}</h3>
                </div>
            </div>
            <p>${p.desc}</p>
        </div>
    `).join('');
}

// 4. عرض تفاصيل المشروع (نظام تقسيم الشاشة بالحرف)
function showDetail(p) {
    const detailView = document.getElementById('detail-view');
    const content = document.getElementById('detail-content');
    
    // إنشاء معرض الصور من داخل التطبيق (Screenshots)
    let screenshotsHTML = "";
    if (p.screenshots && Array.isArray(p.screenshots)) {
        screenshotsHTML = `
            <div class="screenshot-gallery">
                ${p.screenshots.map(img => `<img src="${img}" onclick="window.open('${img}', '_blank')">`).join('')}
            </div>
        `;
    }

    content.innerHTML = `
        <img src="${p.icon_url}" style="width:80px; height:80px; border-radius:18px; margin-bottom:20px;">
        <h2 style="margin:0 0 10px 0;">${p.title}</h2>
        <span style="background:var(--accent); color:white; padding:4px 12px; border-radius:20px; font-size:12px;">${p.type}</span>
        
        <div style="margin-top:25px; line-height:1.8; color:var(--text); white-space: pre-wrap;">
            ${p.desc}
        </div>

        <h4 style="margin-top:30px;">صور من داخل التطبيق:</h4>
        ${screenshotsHTML}

        <div style="margin-top:30px; display:flex; gap:15px;">
            <a href="${p.link}" target="_blank" class="btn-main" onclick="trackStats('${p.id}', 'downloads')">
                ${p.btn_text || 'تحميل الآن'}
            </a>
            <div style="font-size:13px; color:#888; display:flex; align-items:center; gap:10px;">
                <span>👁️ ${p.views || 0} زيارة</span>
                <span>📥 ${p.downloads || 0} تحميل</span>
            </div>
        </div>
    `;

    detailView.style.display = 'block';
    trackStats(p.id, 'views'); // تتبع الزيارة عند الفتح
}

// 5. إغلاق واجهة التفاصيل
function closeDetail() {
    document.getElementById('detail-view').style.display = 'none';
}

// 6. نظام تتبع الإحصائيات (زيارات وتحميلات)
async function trackStats(projectId, type) {
    try {
        const { data } = await sb.from('projects').select(type).eq('id', projectId).single();
        const updateData = {};
        updateData[type] = (data[type] || 0) + 1;
        
        await sb.from('projects').update(updateData).eq('id', projectId);
    } catch (e) {
        console.error("Error tracking stats:", e);
    }
}
