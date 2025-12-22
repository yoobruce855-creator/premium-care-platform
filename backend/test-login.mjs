// Simple test script to verify login API
const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'demo@example.com',
                password: 'demo123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.token) {
            console.log('✅ LOGIN SUCCESS! Token received.');
        } else {
            console.log('❌ LOGIN FAILED:', data.error);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testLogin();
