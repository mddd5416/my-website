let client = null;
const sUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const sKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';

function unlock() {
    const pass = document.getElementById('access-key').value;
    if (pass === "MDaMiNeLD") { // كلمة المرور الجديدة الخاصة بك
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        client = supabase.createClient(sUrl, sKey);
    } else {
        alert("ACCESS DENIED!");
    }
}

async function pushData() {
    const status = document.getElementById('status');
    status.innerText = "جاري الاتصال بقاعدة البيانات...";
    
    const { error } = await client.from('projects').insert([{
        title: document.getElementById('p-title').value,
        desc: document.getElementById('p-desc').value,
        link: document.getElementById('p-link').value,
        tech: document.getElementById('p-tech').value
    }]);

    if (!error) {
        status.style.color = "#00ff41";
        status.innerText = "تم النشر بنجاح!";
        // مسح الحقول بعد النجاح
        document.getElementById('p-title').value = '';
        document.getElementById('p-desc').value = '';
        document.getElementById('p-link').value = '';
        document.getElementById('p-tech').value = '';
    } else {
        status.style.color = "red";
        status.innerText = "خطأ في النشر: " + error.message;
    }
}
