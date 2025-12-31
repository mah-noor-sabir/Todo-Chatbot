# 🔐 Localhost Authentication Guide - FastAPI + React

## ✅ Backend is Now Fixed!

Your FastAPI backend at `http://localhost:8000` is now correctly configured for cookie-based authentication with React frontend at `http://localhost:3000`.

---

## 🔑 Key Changes Made

### 1. **CORS Configuration** (`src/main.py`)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,  # ✅ CRITICAL for cookies
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

**Why this works:**
- `allow_credentials=True` enables cookie support
- `allow_origins` explicitly allows your React frontend
- `expose_headers=["*"]` lets frontend read response headers

### 2. **Cookie Settings** (`src/api/routes/auth.py`)

```python
response.set_cookie(
    key="session",
    value=token,
    httponly=True,  # XSS protection
    secure=False,  # ✅ False for localhost HTTP
    samesite="lax",  # ✅ Works with localhost
    max_age=86400,  # 24 hours
    path="/",  # Available for all paths
    domain=None,  # Let browser set domain
)
```

**Critical Points:**
- ✅ `secure=False` - Required for localhost HTTP
- ✅ `samesite="lax"` - Works for localhost (same-origin)
- ❌ `samesite="none"` - Requires `secure=True` (HTTPS), won't work on localhost HTTP
- ✅ `path="/"` - Cookie sent with all requests
- ✅ `domain=None` - Browser automatically sets to `localhost`

---

## 🎯 React Frontend Configuration

### Option 1: Using Axios (Recommended)

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,  // ✅ CRITICAL: Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

**Usage in Components:**

```javascript
// Signup
import api from './api/axios';

async function handleSignup(email, password) {
  try {
    const response = await api.post('/auth/signup', { email, password });
    console.log('Signed up:', response.data);
    // Cookie is automatically set by browser
  } catch (error) {
    console.error('Signup failed:', error.response.data);
  }
}

// Signin
async function handleSignin(email, password) {
  try {
    const response = await api.post('/auth/signin', { email, password });
    console.log('Signed in:', response.data);
    // Cookie is automatically set by browser
  } catch (error) {
    console.error('Signin failed:', error.response.data);
  }
}

// Check Session
async function checkSession() {
  try {
    const response = await api.get('/auth/session');
    console.log('Current user:', response.data);
    return response.data;
  } catch (error) {
    console.error('Not authenticated:', error.response.data);
    return null;
  }
}

// Create Todo
async function createTodo(title, description) {
  try {
    const response = await api.post('/todos', { title, description });
    console.log('Todo created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create todo:', error.response.data);
  }
}

// Signout
async function handleSignout() {
  try {
    await api.post('/auth/signout');
    console.log('Signed out successfully');
    // Cookie is automatically cleared by browser
  } catch (error) {
    console.error('Signout failed:', error.response.data);
  }
}
```

### Option 2: Using Fetch API

```javascript
// Signup
async function handleSignup(email, password) {
  try {
    const response = await fetch('http://localhost:8000/auth/signup', {
      method: 'POST',
      credentials: 'include',  // ✅ CRITICAL: Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Signed up:', data);
  } catch (error) {
    console.error('Signup failed:', error);
  }
}

// Signin
async function handleSignin(email, password) {
  try {
    const response = await fetch('http://localhost:8000/auth/signin', {
      method: 'POST',
      credentials: 'include',  // ✅ CRITICAL: Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Signed in:', data);
  } catch (error) {
    console.error('Signin failed:', error);
  }
}

// Check Session
async function checkSession() {
  try {
    const response = await fetch('http://localhost:8000/auth/session', {
      credentials: 'include',  // ✅ CRITICAL: Send cookies
    });

    const data = await response.json();
    console.log('Current user:', data);
    return data;
  } catch (error) {
    console.error('Not authenticated:', error);
    return null;
  }
}

// Create Todo
async function createTodo(title, description) {
  try {
    const response = await fetch('http://localhost:8000/todos', {
      method: 'POST',
      credentials: 'include',  // ✅ CRITICAL: Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await response.json();
    console.log('Todo created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create todo:', error);
  }
}
```

---

## 🧪 Testing the Complete Flow

### 1. Test with Browser DevTools

1. Open your React app at `http://localhost:3000`
2. Open DevTools (F12)
3. Go to **Application** tab → **Cookies** → `http://localhost:8000`

### 2. Expected Flow:

**Step 1: Signup**
```javascript
POST http://localhost:8000/auth/signup
Body: { "email": "test@example.com", "password": "password123" }

✅ Response: { "id": 1, "email": "test@example.com", "created_at": "..." }
✅ Cookie Set: session=eyJ0eXAiOiJKV1Q...
```

Check DevTools:
- Go to Application → Cookies → `http://localhost:8000`
- You should see `session` cookie with JWT value

**Step 2: Check Session**
```javascript
GET http://localhost:8000/auth/session

✅ Response: { "id": 1, "email": "test@example.com", "created_at": "..." }
```

If you get 401:
- ❌ Check if cookie exists in DevTools
- ❌ Verify you're using `credentials: 'include'` or `withCredentials: true`
- ❌ Check CORS_ORIGINS in backend `.env`

**Step 3: Create Todo**
```javascript
POST http://localhost:8000/todos
Body: { "title": "Test todo", "description": "Testing" }

✅ Response: { "id": 1, "title": "Test todo", ... }
```

**Step 4: Signout**
```javascript
POST http://localhost:8000/auth/signout

✅ Response: 204 No Content
✅ Cookie Cleared
```

Check DevTools:
- Cookie should be removed from Application → Cookies

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error - No 'Access-Control-Allow-Origin' header

**Symptoms:**
```
Access to fetch at 'http://localhost:8000/auth/signin' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Solution:**
1. Verify `.env` has: `CORS_ORIGINS=http://localhost:3000`
2. Restart backend after changing `.env`
3. Check main.py has `allow_credentials=True`

### Issue 2: 401 Unauthorized on `/auth/session`

**Symptoms:**
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Authentication required"
  }
}
```

**Solution:**
1. ✅ Ensure you called `/auth/signin` or `/auth/signup` first
2. ✅ Check browser DevTools → Application → Cookies for `session` cookie
3. ✅ Verify frontend uses `credentials: 'include'` or `withCredentials: true`
4. ✅ Check cookie path is `/` in DevTools
5. ✅ Verify both frontend and backend are on `localhost` (not `127.0.0.1`)

### Issue 3: Cookie Not Set After Signin

**Symptoms:**
- Signin returns 200 OK with user data
- But no cookie in DevTools

**Solution:**
1. ✅ Ensure frontend uses `credentials: 'include'` or `withCredentials: true`
2. ✅ Check backend cookie settings:
   - `secure=False` for localhost
   - `samesite="lax"` (NOT "none" for localhost)
   - `path="/"`
3. ✅ Verify CORS allows credentials: `allow_credentials=True`

### Issue 4: Cookie Set But Not Sent with Requests

**Symptoms:**
- Cookie visible in DevTools
- But 401 error on protected endpoints

**Solution:**
1. ✅ Every request must include `credentials: 'include'` or `withCredentials: true`
2. ✅ Check cookie domain in DevTools matches request domain
3. ✅ Verify cookie path is `/`

---

## 🔍 Debugging Checklist

### Backend Checklist:
- [ ] `.env` has `CORS_ORIGINS=http://localhost:3000`
- [ ] `main.py` has `allow_credentials=True`
- [ ] `auth.py` cookies have:
  - [ ] `secure=False`
  - [ ] `samesite="lax"`
  - [ ] `path="/"`
  - [ ] `domain=None`
- [ ] Backend running on `http://localhost:8000` (not `127.0.0.1`)

### Frontend Checklist:
- [ ] Every request includes `credentials: 'include'` (fetch) or `withCredentials: true` (axios)
- [ ] Frontend running on `http://localhost:3000`
- [ ] Using same domain format as backend (`localhost`, not `127.0.0.1`)

### Browser Checklist:
- [ ] Check DevTools → Application → Cookies for `session` cookie after signin
- [ ] Cookie should have:
  - [ ] Name: `session`
  - [ ] Value: JWT token (starts with `eyJ`)
  - [ ] Path: `/`
  - [ ] Domain: `localhost`
  - [ ] SameSite: `Lax`
  - [ ] HttpOnly: ✓ (checked)
  - [ ] Secure: (empty/unchecked)

---

## 📊 Cookie Comparison: Development vs Production

| Setting | Localhost (Development) | Production (HTTPS) |
|---------|------------------------|-------------------|
| `secure` | `False` | `True` (required) |
| `samesite` | `"lax"` | `"none"` or `"lax"` |
| Domain | `localhost` (auto) | `.yourdomain.com` |
| CORS Origins | `http://localhost:3000` | `https://app.yourdomain.com` |

---

## 🎯 Complete Working Example

### React Component Example:

```jsx
// src/App.jsx
import { useState, useEffect } from 'react';
import api from './api/axios';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await api.get('/auth/session');
      setUser(response.data);
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { email, password });
      await checkSession();
    } catch (error) {
      alert('Signup failed: ' + error.response.data.error.message);
    }
  }

  async function handleSignin(e) {
    e.preventDefault();
    try {
      await api.post('/auth/signin', { email, password });
      await checkSession();
    } catch (error) {
      alert('Signin failed: ' + error.response.data.error.message);
    }
  }

  async function handleSignout() {
    try {
      await api.post('/auth/signout');
      setUser(null);
    } catch (error) {
      alert('Signout failed');
    }
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.email}!</h1>
          <button onClick={handleSignout}>Sign Out</button>
        </div>
      ) : (
        <form onSubmit={handleSignin}>
          <h1>Sign In</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign In</button>
          <button type="button" onClick={handleSignup}>
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
```

---

## 🚀 Quick Start Commands

### Backend:
```bash
cd backend
./venv/Scripts/uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend:
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ No CORS errors in browser console
2. ✅ Cookie appears in DevTools after signin
3. ✅ `/auth/session` returns user data (not 401)
4. ✅ Protected endpoints work without additional auth headers
5. ✅ Signout clears the cookie

---

## 🎉 Summary

Your backend is now correctly configured for localhost development with:

✅ **CORS** - React frontend can make requests without errors
✅ **Cookies** - Session cookies work on localhost HTTP
✅ **Authentication** - JWT session management fully functional
✅ **Security** - HttpOnly cookies prevent XSS attacks

**Remember:**
- Always use `credentials: 'include'` or `withCredentials: true` in frontend
- Cookie settings use `secure=False` and `samesite="lax"` for localhost
- Both backend and frontend must use `localhost` (not `127.0.0.1`)

Happy coding! 🚀
