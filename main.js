document.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.hash);
});

window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash);
});

// Function to navigate between different pages based on the URL hash
function navigateTo(hash) {
    switch (hash) {
        case "#/login":
            loadLoginPage();
            break;
        case "#/register":
            loadRegisterPage();
            break;
        case "#/home":
            loadHomePage();
            break;
        case "#/search":
            loadSearchPage();
            break;
        case "#/friends":
            loadFriendsPage();
            break;
        default:
            loadHomePage(); // Default to home page
            break;
    }
}

// Load Login Page
function loadLoginPage() {
    document.getElementById("app").innerHTML = `
        <div class="text-center">
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" required><br><br>
                <input type="password" id="password" placeholder="Password" required><br><br>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#/register">Register</a></p>
        </div>
    `;

    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        loginUser(username, password);
    });
}

// Login Function
async function loginUser(username, password) {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); // Store JWT token
            navigateTo("#/home");
        } else {
            alert(data.message || 'Login failed.');
        }
    } catch (error) {
        alert('Error connecting to the server. Please try again.');
    }
}

// Load Register Page
function loadRegisterPage() {
    document.getElementById("app").innerHTML = `
        <div class="text-center">
            <h2>Register</h2>
            <form id="registerForm">
                <input type="text" id="newUsername" placeholder="Username" required><br><br>
                <input type="password" id="newPassword" placeholder="Password" required><br><br>
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="#/login">Login</a></p>
        </div>
    `;

    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const username = document.getElementById("newUsername").value;
        const password = document.getElementById("newPassword").value;

        registerUser(username, password);
    });
}

// Register Function
async function registerUser(username, password) {
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            alert('Registration successful');
            navigateTo("#/login");
        } else {
            alert(data.message || 'Registration failed.');
        }
    } catch (error) {
        alert('Error connecting to the server. Please try again.');
    }
}

// Load Home Page (after login)
function loadHomePage() {
    if (!localStorage.getItem('token')) {
        navigateTo("#/login");
        return;
    }

    document.getElementById("app").innerHTML = `
        <div class="text-center">
            <h2>Welcome</h2>
            <button onclick="loadSearchPage()">Search Users</button><br><br>
            <button onclick="loadFriendsPage()">View Friends</button><br><br>
            <button onclick="loadFriendRequestsPage()">Friend Requests</button><br><br>
            <button onclick="logout()">Logout</button>
        </div>
    `;
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    navigateTo("#/login");
}

// Load Search Page
async function loadSearchPage() {
    const query = prompt('Enter username to search for:');
    try {
        const response = await fetch(`/search?query=${query}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();

        if (response.ok) {
            const users = data.users.map(user => `
                <div>
                    <span>${user.username}</span>
                    <button onclick="sendFriendRequest('${user.username}')">Send Friend Request</button>
                </div>
            `).join('');
            document.getElementById("app").innerHTML = `
                <div>
                    <h2>Search Results</h2>
                    ${users}
                </div>
            `;
        } else {
            alert(data.message || 'Error searching for users.');
        }
    } catch (error) {
        alert('Error connecting to the server. Please try again.');
    }
}

// Send Friend Request
async function sendFriendRequest(username) {
    try {
        const response = await fetch('/friend-request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ targetUsername: username })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert('Error sending friend request.');
    }
}

// Load Friends Page
async function loadFriendsPage() {
    try {
        const response = await fetch('/friends', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();

        if (response.ok) {
            const friends = data.friends.map(username => `
                <div>${username}</div>
            `).join('');
            document.getElementById("app").innerHTML = `
                <div>
                    <h2>Your Friends</h2>
                    ${friends || '<p>You have no friends yet.</p>'}
                </div>
            `;
        } else {
            alert(data.message || 'Error loading friends.');
        }
    } catch (error) {
        alert('Error connecting to the server.');
    }
}

// Load Friend Requests Page
async function loadFriendRequestsPage() {
    try {
        const response = await fetch('/friend-requests', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();

        if (response.ok) {
            const requests = data.requests.map(request => `
                <div>
                    <span>${request.from}</span>
                    <button onclick="acceptFriendRequest('${request.from}')">Accept</button>
                    <button onclick="declineFriendRequest('${request.from}')">Decline</button>
                </div>
            `).join('');
            document.getElementById("app").innerHTML = `
                <div>
                    <h2>Pending Friend Requests</h2>
                    ${requests || '<p>No pending requests.</p>'}
                </div>
            `;
        } else {
            alert(data.message || 'Error fetching friend requests.');
        }
    } catch (error) {
        alert('Error connecting to the server.');
    }
}

// Accept Friend Request
async function acceptFriendRequest(fromUsername) {
    try {
        const response = await fetch('/accept-friend', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fromUsername })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            loadFriendRequestsPage(); // Refresh the list
        } else {
            alert(data.message || 'Error accepting friend request.');
        }
    } catch (error) {
        alert('Error connecting to the server.');
    }
}

// Decline Friend Request
async function declineFriendRequest(fromUsername) {
    try {
        const response = await fetch('/decline-friend', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fromUsername })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            loadFriendRequestsPage(); // Refresh the list
        } else {
            alert(data.message || 'Error declining friend request.');
        }
    } catch (error) {
        alert('Error connecting to the server.');
    }
}
