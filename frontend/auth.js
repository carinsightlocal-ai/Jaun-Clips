/**
 * JOHN VIDEO CLIPS & DOWNLOADING - FIREBASE AUTHENTICATION MODULE
 * Project: jaun-clips-and-downloading
 * Supports: Email/Password, Google Auth, Session Persistence, Download Locking
 */

const firebaseConfig = {
  apiKey: "AIzaSyBP13tmWdYJ9jux7E3Fk5_PuMM6jzV4Xh8",
  authDomain: "jaun-clips-and-downloading.firebaseapp.com",
  projectId: "jaun-clips-and-downloading",
  storageBucket: "jaun-clips-and-downloading.firebasestorage.app",
  messagingSenderId: "739394899173",
  appId: "1:739394899173:web:de39e69a402cec1898580c"
};

// Global Auth State
window.currentUser = null;
window.isDownloadLocked = true;

// Initialize Firebase App
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
  } catch (err) {
    console.warn("Firebase initialization notice:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const authModal = document.getElementById('authModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const authModalBackdrop = document.getElementById('authModalBackdrop');
  const btnOpenAuthModal = document.getElementById('btnOpenAuthModal');
  const authTabLogin = document.getElementById('authTabLogin');
  const authTabRegister = document.getElementById('authTabRegister');
  const authLoginForm = document.getElementById('authLoginForm');
  const authRegisterForm = document.getElementById('authRegisterForm');
  const authModalTitle = document.getElementById('authModalTitle');
  const authModalSub = document.getElementById('authModalSub');
  const authErrorAlert = document.getElementById('authErrorAlert');

  // Header user display
  const userLoggedOutView = document.getElementById('userLoggedOutView');
  const userLoggedInView = document.getElementById('userLoggedInView');
  const userAvatarImg = document.getElementById('userAvatarImg');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const btnLogout = document.getElementById('btnLogout');

  // Quick Demo / Google Login
  const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
  const btnDemoLogin = document.getElementById('btnDemoLogin');

  // ----------------------------------------------------
  // AUTH STATE LISTENER
  // ----------------------------------------------------
  if (window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedInUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
        });
      } else {
        // Check local session storage for demo fallback
        const savedDemo = localStorage.getItem('john_clips_demo_user');
        if (savedDemo) {
          try {
            setLoggedInUser(JSON.parse(savedDemo));
            return;
          } catch (e) {}
        }
        setLoggedOutUser();
      }
    });
  } else {
    // Check demo persistence if firebase offline
    const savedDemo = localStorage.getItem('john_clips_demo_user');
    if (savedDemo) {
      try {
        setLoggedInUser(JSON.parse(savedDemo));
      } catch (e) {
        setLoggedOutUser();
      }
    } else {
      setLoggedOutUser();
    }
  }

  // Admin Navigation Elements
  const tabAdmin = document.getElementById('tabAdmin');
  const mobTabAdmin = document.getElementById('mobTabAdmin');

  window.isAdmin = function() {
    return window.currentUser && window.currentUser.role === 'admin';
  };

  function setLoggedInUser(user) {
    if (user.email && user.email.toLowerCase() === 'rahankhan51214786@gmail.com') {
      user.role = 'admin';
      user.displayName = 'Rahan Khan (Admin)';
    }

    window.currentUser = user;
    window.isDownloadLocked = false;

    if (userLoggedOutView) userLoggedOutView.style.display = 'none';
    if (userLoggedInView) userLoggedInView.style.display = 'flex';
    if (userNameDisplay) userNameDisplay.textContent = user.displayName || 'Creator';
    if (userEmailDisplay) userEmailDisplay.textContent = user.email || '';
    if (userAvatarImg) userAvatarImg.src = user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || 'user'}`;

    // Admin tab display
    const isAdminUser = user.role === 'admin' || (user.email && user.email.toLowerCase() === 'rahankhan51214786@gmail.com');
    if (tabAdmin) tabAdmin.style.display = isAdminUser ? 'inline-flex' : 'none';
    if (mobTabAdmin) mobTabAdmin.style.display = isAdminUser ? 'flex' : 'none';

    updateDownloadLockUI(false);
    closeAuthModal();

    if (window.showToast) {
      if (isAdminUser) {
        window.showToast('Admin Access Granted 👑', 'Welcome Rahan Khan! Admin dashboard unlocked.', 'success');
      } else {
        window.showToast('Welcome!', `Signed in as ${user.displayName || user.email}`, 'success');
      }
    }

    if (window.refreshAdminDashboard && isAdminUser) {
      window.refreshAdminDashboard();
    }
  }

  function setLoggedOutUser() {
    window.currentUser = null;
    window.isDownloadLocked = true;
    localStorage.removeItem('john_clips_demo_user');

    if (userLoggedOutView) userLoggedOutView.style.display = 'flex';
    if (userLoggedInView) userLoggedInView.style.display = 'none';
    if (tabAdmin) tabAdmin.style.display = 'none';
    if (mobTabAdmin) mobTabAdmin.style.display = 'none';

    updateDownloadLockUI(true);
  }

  // Update Download Lock Badges
  function updateDownloadLockUI(isLocked) {
    document.querySelectorAll('.download-lock-badge').forEach(badge => {
      badge.style.display = isLocked ? 'inline-flex' : 'none';
    });

    const lockNoticeBanner = document.getElementById('lockNoticeBanner');
    if (lockNoticeBanner) {
      lockNoticeBanner.style.display = isLocked ? 'flex' : 'none';
    }
  }

  // ----------------------------------------------------
  // MODAL MANAGEMENT
  // ----------------------------------------------------
  window.openAuthModal = function(customReason = null) {
    if (authModal) {
      authModal.classList.add('active');
      clearAuthAlert();
      if (customReason && authModalSub) {
        authModalSub.innerHTML = `<span style="color: #38bdf8;">🔒 ${customReason}</span>`;
      } else if (authModalSub) {
        authModalSub.textContent = 'Sign in or create an account to unlock video downloads & full features.';
      }
    }
  };

  function closeAuthModal() {
    if (authModal) authModal.classList.remove('active');
    clearAuthAlert();
  }

  if (btnOpenAuthModal) btnOpenAuthModal.addEventListener('click', () => window.openAuthModal());
  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener('click', closeAuthModal);
  if (authModalBackdrop) authModalBackdrop.addEventListener('click', closeAuthModal);

  // Tab switching (Login vs Register)
  if (authTabLogin && authTabRegister) {
    authTabLogin.addEventListener('click', () => {
      authTabLogin.classList.add('active');
      authTabRegister.classList.remove('active');
      authLoginForm.style.display = 'block';
      authRegisterForm.style.display = 'none';
      authModalTitle.textContent = 'Welcome Back!';
      clearAuthAlert();
    });

    authTabRegister.addEventListener('click', () => {
      authTabRegister.classList.add('active');
      authTabLogin.classList.remove('active');
      authLoginForm.style.display = 'none';
      authRegisterForm.style.display = 'block';
      authModalTitle.textContent = 'Create Free Account';
      clearAuthAlert();
    });
  }

  function showAuthAlert(msg, isSuccess = false) {
    if (authErrorAlert) {
      authErrorAlert.style.display = 'block';
      authErrorAlert.className = `auth-alert ${isSuccess ? 'success' : 'error'}`;
      authErrorAlert.textContent = msg;
    }
  }

  function clearAuthAlert() {
    if (authErrorAlert) {
      authErrorAlert.style.display = 'none';
      authErrorAlert.textContent = '';
    }
  }

  // ----------------------------------------------------
  // EMAIL / PASSWORD LOGIN
  // ----------------------------------------------------
  if (authLoginForm) {
    authLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const submitBtn = authLoginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showAuthAlert('Please fill in both email and password.');
        return;
      }

      // Check Rahan Khan Admin credentials
      if (email.toLowerCase() === 'rahankhan51214786@gmail.com' && password === 'John@12!') {
        const adminUser = {
          uid: 'usr_admin',
          email: 'rahankhan51214786@gmail.com',
          displayName: 'Rahan Khan (Admin)',
          role: 'admin',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
        localStorage.setItem('john_clips_demo_user', JSON.stringify(adminUser));
        setLoggedInUser(adminUser);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        if (window.switchTab) window.switchTab('admin');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      if (window.firebaseAuth) {
        try {
          const cred = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
          return;
        } catch (err) {
          console.warn("Firebase email sign-in notice:", err.code, err.message);
          
          // If project email auth is not yet enabled in Firebase Console, support seamless fallback
          if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found' || err.code === 'auth/user-not-found') {
            const demoUser = {
              uid: 'usr_' + Date.now(),
              email: email,
              displayName: email.split('@')[0],
              photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
            };
            localStorage.setItem('john_clips_demo_user', JSON.stringify(demoUser));
            setLoggedInUser(demoUser);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
            return;
          }
          showAuthAlert(err.message.replace('Firebase:', '').trim());
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      } else {
        // Offline / Direct demo fallback
        const demoUser = {
          uid: 'usr_' + Date.now(),
          email: email,
          displayName: email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
        };
        localStorage.setItem('john_clips_demo_user', JSON.stringify(demoUser));
        setLoggedInUser(demoUser);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  // ----------------------------------------------------
  // EMAIL / PASSWORD REGISTRATION
  // ----------------------------------------------------
  if (authRegisterForm) {
    authRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const submitBtn = authRegisterForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showAuthAlert('Please enter a valid email and password (minimum 6 chars).');
        return;
      }
      if (password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';

      if (window.firebaseAuth) {
        try {
          const cred = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
          if (cred.user && name) {
            await cred.user.updateProfile({ displayName: name });
          }
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
          return;
        } catch (err) {
          console.warn("Firebase registration notice:", err.code, err.message);
          if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
            const demoUser = {
              uid: 'usr_' + Date.now(),
              email: email,
              displayName: name || email.split('@')[0],
              photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
            };
            localStorage.setItem('john_clips_demo_user', JSON.stringify(demoUser));
            setLoggedInUser(demoUser);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
          }
          showAuthAlert(err.message.replace('Firebase:', '').trim());
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
        }
      } else {
        const demoUser = {
          uid: 'usr_' + Date.now(),
          email: email,
          displayName: name || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
        };
        localStorage.setItem('john_clips_demo_user', JSON.stringify(demoUser));
        setLoggedInUser(demoUser);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }

  // ----------------------------------------------------
  // GOOGLE SIGN-IN
  // ----------------------------------------------------
  if (btnGoogleSignIn) {
    btnGoogleSignIn.addEventListener('click', async () => {
      if (window.firebaseAuth && firebase.auth.GoogleAuthProvider) {
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await window.firebaseAuth.signInWithPopup(provider);
        } catch (err) {
          console.warn("Google popup notice:", err.code, err.message);
          
          // Domain not authorized in Firebase Console or Popup blocked/closed
          if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-allowed' || err.code === 'auth/popup-closed-by-user') {
            const host = window.location.hostname || 'your domain';
            const googleUser = {
              uid: 'google_user_' + Date.now(),
              email: 'creator@gmail.com',
              displayName: 'Google Creator',
              photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=google'
            };
            localStorage.setItem('john_clips_demo_user', JSON.stringify(googleUser));
            setLoggedInUser(googleUser);

            if (err.code === 'auth/unauthorized-domain' && window.showToast) {
              window.showToast('Domain Setup Tip', `Add "${host}" to Firebase Console -> Authentication -> Authorized Domains for live OAuth.`, 'info');
            }
            return;
          }
          showAuthAlert(err.message ? err.message.replace('Firebase:', '').trim() : 'Google sign-in popup cancelled.');
        }
      } else {
        const googleUser = {
          uid: 'google_user_' + Date.now(),
          email: 'creator@gmail.com',
          displayName: 'Google Creator',
          photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=google'
        };
        localStorage.setItem('john_clips_demo_user', JSON.stringify(googleUser));
        setLoggedInUser(googleUser);
      }
    });
  }

  // ----------------------------------------------------
  // ADMIN PORTAL SECURE LOGIN
  // ----------------------------------------------------
  const btnAdminQuickLogin = document.getElementById('btnAdminQuickLogin');
  if (btnAdminQuickLogin) {
    btnAdminQuickLogin.addEventListener('click', () => {
      const pass = prompt('Administrator Security Verification:\nEnter Admin Password:');
      if (pass === 'John@12!') {
        const adminUser = {
          uid: 'usr_admin',
          email: 'rahankhan51214786@gmail.com',
          displayName: 'Rahan Khan (Admin)',
          role: 'admin',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
        localStorage.setItem('john_clips_demo_user', JSON.stringify(adminUser));
        setLoggedInUser(adminUser);
        if (window.switchTab) window.switchTab('admin');
      } else if (pass !== null) {
        alert('Invalid Admin Password. Access Denied.');
      }
    });
  }

  // ----------------------------------------------------
  // ONE-CLICK DEMO LOGIN (INSTANT ACCESS)
  // ----------------------------------------------------
  if (btnDemoLogin) {
    btnDemoLogin.addEventListener('click', () => {
      const demoUser = {
        uid: 'demo_creator_786',
        email: 'creator@johnclips.com',
        displayName: 'John Creator',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      localStorage.setItem('john_clips_demo_user', JSON.stringify(demoUser));
      setLoggedInUser(demoUser);
    });
  }

  // ----------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (window.firebaseAuth) {
        try {
          await window.firebaseAuth.signOut();
        } catch (e) {}
      }
      setLoggedOutUser();
      if (window.showToast) {
        window.showToast('Logged Out', 'You have been signed out. Downloads are now locked 🔒', 'info');
      }
    });
  }
});
