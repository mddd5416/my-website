const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    updateHeaderInfo();
});

function updateHeaderInfo() {
    const name = localStorage.getItem('md_name') || "محمد أمين";
    const avatar = localStorage.getItem('md_avatar') || "";
    document.getElementById('admin-name-display').innerText = name;
    if(avatar) document.getElementById('header-avatar').src = avatar;
}

async function fetchProjects() {
    const { data, error } = await sb.from('projects').select('*').order('created_at', { ascending: false });
    if (error) return console.error("Error fetching projects:", error);
    renderProjects(data);
}

function renderProjects(projects) {
    const list = document.getElementById('projects-list');
    list.innerHTML = projects.map(p => `
        <div class="card" onclick='showDetail(${JSON.stringify(p)})'>
            <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px;">
                <img src="${p.icon_url}" style="width:55px; height:55px; border-radius:14px; object-fit:cover;">
                <div>
                    <span style="font-size:11px; color:var(--accent); font-weight:bold;">${p.type}</span>
                    <h3 style="margin:0; font-size:17px;">${p.title}</h3>
                </div>
            </div>
            <p>${p.desc}</p>
        </div>
    `).join('');
}

function showDetail(p) {
    const detailView = document.getElementById('detail-view');
    const projectsGrid = document.getElementById('projects-list');
    
    // تفعيل نظام النصفين
    detailView.style.display = 'block';
    projectsGrid.style.flex = '0 0 60%';

    const screenshotsHTML = p.screenshots?.map(img => `<img src="${img}" onclick="window.open('${img}', '_blank')">`).join('') || "";

    document.getElementById('detail-content').innerHTML = `
        <img src="${p.icon_url}" style="width:85px; height:85px; border-radius:20px; margin-bottom:20px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
        <h2 style="margin:0;">${p.title}</h2>
        <span style="background:var(--accent); color:white; padding:4px 12px; border-radius:20px; font-size:12px;">${p.type}</span>
        
        <div style="margin:25px 0; line-height:1.8; white-space: pre-wrap; font-size:15px;">
            ${p.desc}
        </div>

        <h4>لقطات الشاشة:</h4>
        <div class="screenshot-gallery">${screenshotsHTML}</div>

        <div style="margin-top:30px; display:flex; gap:15px; align-items:center;">
            <a href="${p.link}" target="_blank" class="btn-main" onclick="trackStats('${p.id}', 'downloads')">
                ${p.btn_text || 'تحميل الآن'}
            </a>
            <div style="color:#888; font-size:13px;">
                <span>👁️ ${p.views} زيارة</span> | <span>📥 ${p.downloads} تحميل</span>
            </div>
        </div>
    `;
    trackStats(p.id, 'views');
}

function closeDetail() {
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('projects-list').style.flex = '1';
}

async function trackStats(projectId, type) {
    const { data: current } = await sb.from('projects').select(type).eq('id', projectId).single();
    if(current) {
        const newVal = (current[type] || 0) + 1;
        await sb.from('projects').update({ [type]: newVal }).eq('id', projectId);
    }
}
