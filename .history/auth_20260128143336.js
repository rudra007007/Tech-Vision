// Authentication API Base URL
const AUTH_API_BASE = 'http://localhost:5000/api/auth';

// Helper function to get stored user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Register new user
async function register(userData) {
    try {
        const response = await fetch(`${AUTH_API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            return { success: true, message: 'Registration successful' };
        } else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        // Fallback to local storage if backend is not available
        return registerLocally(userData);
    }
}

// Local registration fallback
function registerLocally(userData) {
    try {
        // Get existing users
        const usersStr = localStorage.getItem('users');
        const users = usersStr ? JSON.parse(usersStr) : [];

        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            age: userData.age,
            gender: userData.gender,
            state: userData.state,
            password: userData.password, // In production, this should be hashed
            createdAt: new Date().toISOString()
        };

        // Add to users array
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, message: 'Registration successful' };
    } catch (error) {
        console.error('Local registration error:', error);
        return { success: false, message: 'Registration failed' };
    }
}

// Login user
async function login(email, password) {
    try {
        const response = await fetch(`${AUTH_API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store user data
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        // Fallback to local storage if backend is not available
        return loginLocally(email, password);
    }
}

// Local login fallback
function loginLocally(email, password) {
    try {
        const usersStr = localStorage.getItem('users');
        const users = usersStr ? JSON.parse(usersStr) : [];

        // Find user
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Remove password before storing
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    } catch (error) {
        console.error('Local login error:', error);
        return { success: false, message: 'Login failed' };
    }
}

// Logout user
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
}

// Update user profile
async function updateProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, message: 'Not logged in' };
    }

    try {
        const response = await fetch(`${AUTH_API_BASE}/update-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                email: currentUser.email,
                ...updatedData
            })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            // Update local storage
            const updatedUser = { ...currentUser, ...updatedData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return { success: true, user: updatedUser };
        } else {
            return { success: false, message: data.message || 'Update failed' };
        }
    } catch (error) {
        console.error('Update profile error:', error);
        // Fallback to local storage
        return updateProfileLocally(updatedData);
    }
}

// Local profile update fallback
function updateProfileLocally(updatedData) {
    try {
        const currentUser = getCurrentUser();
        const usersStr = localStorage.getItem('users');
        const users = usersStr ? JSON.parse(usersStr) : [];

        // Find and update user
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));

            // Update current user
            const updatedUser = { ...currentUser, ...updatedData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            return { success: true, user: updatedUser };
        } else {
            return { success: false, message: 'User not found' };
        }
    } catch (error) {
        console.error('Local update error:', error);
        return { success: false, message: 'Update failed' };
    }
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const protectedPages = ['profile.html'];
    const authPages = ['login.html', 'register.html'];
    
    const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
    const isAuthPage = authPages.some(page => currentPath.includes(page));
    
    if (isProtectedPage && !isLoggedIn()) {
        window.location.href = 'login.html';
    } else if (isAuthPage && isLoggedIn()) {
        window.location.href = 'profile.html';
    }
});
