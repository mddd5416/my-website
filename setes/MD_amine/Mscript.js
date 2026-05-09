let client = null;
const sUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const sKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';

function unlock() {
    const pass = document.getElementById('access-key').value;
    if (pass === "MDaMiNeLD") { // كلمة مرورك المحدثة
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        client = supabase.createClient(sUrl, sKey);
        renderAdminList();
    } else {
        alert("كلمة مرور خاطئة!");
    }
}

async function pushData() {
    const status = document.getElementById('status');
    status.innerText = "جاري النشر...";
    
    const { error } = await client.from('projects').insert([{
        title: document.getElementById('p-title').value,
        type: document.getElementById('p-type').value,
        desc: document.getElementById('p-desc').value,
        link: document.getElementById('p-link').value,
        icon_url: document.getElementById('p-icon').value,
        tech: document.getElementById('p-tech').value,
        views: 0,
        downloads: 0
    }]);

    if (!error) {
        status.style.color = "#00ff41";
        status.innerText = "تم النشر بنجاح!";
        renderAdminList();
    } else {
        status.style.color = "red";
        status.innerText = "خطأ: " + error.message;
    }
}

async function renderAdminList() {
    const { data } = await client.from('projects').select('*').order('id', { ascending: false });
    const container = document.getElementById('admin-list');
    container.innerHTML = data.map(p => `
        <div class="proj-item">
            <span>${p.title} <small>(${p.type})</small></span>
            <button class="del-btn" onclick="deleteProj(${p.id})">حذف</button>
        </div>
    `).join('');
}

async function deleteProj(id) {
    if(confirm("هل تريد حذف هذا المشروع نهائياً؟")) {
        const { error } = await client.from('projects').delete().eq('id', id);
        if(!error) renderAdminList();
    }
}
