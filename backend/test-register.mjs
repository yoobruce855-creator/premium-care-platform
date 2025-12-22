// Test registration API (expected to fail without Firebase)
const testRegister = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'newuser@test.com',
                password: 'test123456',
                name: '새 사용자',
                phone: '010-9999-9999'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.status === 503) {
            console.log('📝 Expected: Registration requires Firebase (demo mode)');
        } else if (data.token) {
            console.log('✅ REGISTRATION SUCCESS! Token received.');
        } else {
            console.log('❌ REGISTRATION FAILED:', data.error);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testRegister();
