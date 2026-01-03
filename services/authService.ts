
// Simulating a backend database using localStorage

export interface UserData {
  username: string;
  password?: string; // stored for simulation checks
  name: string;
  role: 'ADMINISTRATOR' | 'ANALYST';
  level: string;
  hasFaceId: boolean;
  faceImage?: string; // Base64 string of the face
  lastLogin?: number;
}

const DB_KEY = 'cforce_users_db';

// Seed initial users if empty
const seedDatabase = () => {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    const defaultUsers: UserData[] = [
      {
        username: 'admin',
        password: 'password', // Default password
        name: 'CyberForce280', // Default Admin Name
        role: 'ADMINISTRATOR',
        level: 'OP-LEVEL-9 (HIGHEST CLEARANCE)',
        hasFaceId: false
      },
      {
        username: 'user',
        password: 'password',
        name: 'Field Operator',
        role: 'ANALYST',
        level: 'OP-LEVEL-5',
        hasFaceId: false
      }
    ];
    localStorage.setItem(DB_KEY, JSON.stringify(defaultUsers));
  }
};

export const authService = {
  init: () => seedDatabase(),

  login: async (username: string, password: string): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    seedDatabase();
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: UserData[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          // Update last login
          user.lastLogin = Date.now();
          const updatedUsers = users.map(u => u.username === user.username ? user : u);
          localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
          
          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'Invalid Credentials' });
        }
      }, 1000);
    });
  },

  // Simulates comparing the new captured image with the stored one
  loginViaFace: async (capturedImage: string): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    seedDatabase();
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: UserData[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
        
        // In a real app, we would use a library like face-api.js to compare 'capturedImage' vs 'u.faceImage' embeddings.
        // For this simulation: We look for ANY user that has Face ID enabled and a stored image.
        // If found, we assume the biometrics matched successfully.
        
        const faceUser = users.find(u => u.hasFaceId === true && u.faceImage);

        if (faceUser) {
           // Update last login
           faceUser.lastLogin = Date.now();
           const updatedUsers = users.map(u => u.username === faceUser.username ? faceUser : u);
           localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));

          resolve({ success: true, user: faceUser });
        } else {
          resolve({ success: false, error: 'Biometric Mismatch: Face not recognized in database.' });
        }
      }, 2500); // Analysis delay
    });
  },

  register: async (newUser: UserData, password: string): Promise<{ success: boolean; error?: string }> => {
    seedDatabase();
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: UserData[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
        
        if (users.find(u => u.username === newUser.username)) {
          resolve({ success: false, error: 'Identity already registered' });
          return;
        }

        const userToSave = { ...newUser, password };
        users.push(userToSave);
        localStorage.setItem(DB_KEY, JSON.stringify(users));
        resolve({ success: true });
      }, 1500);
    });
  },

  // --- ADMIN FUNCTIONS ---
  getUsers: (): UserData[] => {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  },

  deleteUser: (username: string) => {
    const users: UserData[] = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const filtered = users.filter(u => u.username !== username);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  }
};
