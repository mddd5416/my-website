const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

async function loadProjects() {
    const { data, error } = await sb.from('projects').select('*').order('id', { ascending: false });
    const list = document.getElementById('projects-list');
    
    if (data) {
        list.innerHTML = data.map(p => `
            <div class="card">
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
                <div>${p.tech ? p.tech.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : ''}</div>
                <a href="${p.link}" class="btn" target="_blank">Download Source</a>
            </div>
        `).join('');
    } else if (error) {
        console.error("Error loading projects:", error.message);
    }
}

// تشغيل الدالة عند تحميل الصفحة
window.onload = loadProjects;
