const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
        username: formData.get('username'),
        email: formData.get('email')
    };

    try {
        const response = await fetch('/loginUser', {
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
        } else {
            alert('User not found' + result.error);
        }
    } catch (error) {
        alert(error);
    }
});