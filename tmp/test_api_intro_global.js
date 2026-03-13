async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/eureka/intro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Test Topic' })
        });
        
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Raw Body:', text);
        try {
            const data = JSON.parse(text);
            console.log('Parsed Data:', JSON.stringify(data, null, 2));
        } catch (pe) {
            console.log('Body is not JSON');
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

testApi();
