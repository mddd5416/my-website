// إعداد تسجيل دخول جوجل
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // استبدل هذا الكود
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%" }
    );
};

// معالجة الرد من جوجل
function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    const userData = {
        user: responsePayload.name,
        img: responsePayload.picture
    };
    showUserSpace(userData);
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

// التبديل للفضاء الخاص
function showUserSpace(data) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('userSpace').classList.remove('hidden');
    document.getElementById('welcomeMsg').innerText = "مرحباً، " + data.user;
    if(data.img) document.getElementById('userImg').src = data.img;
}

function logout() {
    location.reload(); // أبسط طريقة لتسجيل الخروج في المواقع الثابتة
}

// وظائف تسجيل الدخول العادي (نفس السابقة مع استدعاء showUserSpace)
function login() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const stored = JSON.parse(localStorage.getItem('userData'));

    if (stored && user === stored.user && pass === stored.pass) {
        showUserSpace({ user: user });
    } else {
        alert("خطأ في البيانات");
    }
}

function toggleForm() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

function register() {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    if(user && pass) {
        localStorage.setItem('userData', JSON.stringify({user, pass}));
        alert("تم! سجل دخولك الآن");
        toggleForm();
    }
}
