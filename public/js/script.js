// JavaScript for changing the navigation bar's transparency on scroll
window.addEventListener('scroll', function() {
    const header = document.getElementById('top-header');
    if (window.scrollY > 50) {
        header.classList.remove('header-transparent');
        header.classList.add('header-opaque');
    } else {
        header.classList.remove('header-opaque');
        header.classList.add('header-transparent');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signup-form');
    const signupButton = document.getElementById('signup-button');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validate password and confirm password match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        // Simulate sending a confirmation email (in a real app, you'd send an email)
        // This is where you would typically send a confirmation email.
        
        // Show a confirmation popup
        alert('A confirmation email has been sent to ' + email);

        // Clear the form
        signupForm.reset();
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('login-form');
    const signupButton = document.getElementById('login-button');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simulate sending a confirmation email (in a real app, you'd send an email)
        // This is where you would typically send a confirmation email.
        
        // Show a confirmation popup
        alert('Unable To Log-In at this time! Please Try Again At a Later Date');

        // Clear the form
        signupForm.reset();
    });
});
