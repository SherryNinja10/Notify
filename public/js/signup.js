const signUpForm = document.getElementById('signUpForm');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        privatecode: formData.get('privatecode')
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const text = await response.text();
        const result = text ? JSON.parse(text) : {};
        
        if (response.ok) {
            alert('success');
            window.location.href = '/login';
        } else {
            alert(result.error);
        }
    } catch (error) {
        alert(error);
    }
});