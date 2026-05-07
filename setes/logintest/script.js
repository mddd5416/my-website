// تشغيل نظام جوجل عند تحميل الصفحة
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "890705487477-a1iigietqjtfdtkt8l3b70r8g78rres8.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "filled_blue", size: "large", width: "100%", text: "continue_with" }
    );
};

// معالجة البيانات القادمة من جوجل
function handleCredentialResponse(response) {
    const userObject = parseJwt(response.credential);
    console.log("تم تسجيل الدخول بنجاح عبر جوجل");
    
    showUserSpace({
        name: userObject.name,
        email: userObject.email,
        img: userObject.picture
    });
}

// دالة فك تشفير بيانات جوجل
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

// عرض الفضاء الخاص وإخفاء شاشة الدخول
function showUserSpace(userData) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('userSpace').classList.remove('hidden');
    
    document.getElementById('welcomeMsg').innerText = "مرحباً بك، " + userData.name;
    document.getElementById('userEmail').innerText = userData.email || "";
    if (userData.img) {
        document.getElementById('userImg').src = userData.img;
    }
}

// التبديل بين نماذج الدخول والإنشاء
function toggleForm() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

// تسجيل الخروج (إعادة تحميل الصفحة ببساطة)
function logout() {
    if(confirm("هل تريد تسجيل الخروج؟")) {
        location.reload();
    }
}

// نظام الدخول التقليدي (للتجربة المحلية)
function login() {
    const user = document.getElementById('loginUser').value;
    if(user) {
        showUserSpace({ name: user, email: "حساب محلي", img: "" });
    } else {
        alert("يرجى إدخال اسم المستخدم");
    }
}

// ميزة تجريبية لنشر منشور
function addPost() {
    const text = document.getElementById('postText').value;
    if(text) {
        alert("تم النشر في فضائك الخاص بنجاح!");
        document.getElementById('postText').value = "";
    }
}
