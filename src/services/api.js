const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function post(endpoint, body) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const responseBody = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) throw { status: res.status, body: responseBody };

    return responseBody;
}

export async function get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`);
    const json = await res.json();

    if (!res.ok) throw json;

    return json;
}
