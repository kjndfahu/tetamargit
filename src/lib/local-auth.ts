import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes, pbkdf2Sync } from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const PROFILES_FILE = join(DATA_DIR, 'profiles.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!existsSync(USERS_FILE)) {
  writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

if (!existsSync(PROFILES_FILE)) {
  writeFileSync(PROFILES_FILE, JSON.stringify([], null, 2));
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateId(): string {
  return randomBytes(16).toString('hex');
}

function generateSalt(): string {
  return randomBytes(32).toString('hex');
}

function readUsers(): User[] {
  try {
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readProfiles(): Profile[] {
  try {
    const data = readFileSync(PROFILES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeProfiles(profiles: Profile[]): void {
  writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

export class LocalAuthService {
  static async signUp(data: SignUpData) {
    const users = readUsers();
    const profiles = readProfiles();
    
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    const userId = generateId();
    const salt = generateSalt();
    const passwordHash = hashPassword(data.password, salt);

    const user: User = {
      id: userId,
      email: data.email,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    const profile: Profile = {
      id: generateId(),
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(user);
    profiles.push(profile);

    writeUsers(users);
    writeProfiles(profiles);

    return { user: { id: user.id, email: user.email }, profile };
  }

  static async signIn(data: SignInData) {
    const users = readUsers();
    const user = users.find(u => u.email === data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordHash = hashPassword(data.password, user.salt);
    if (passwordHash !== user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    return { user: { id: user.id, email: user.email } };
  }

  static async getUserProfile(userId: string): Promise<Profile | null> {
    const profiles = readProfiles();
    return profiles.find(p => p.userId === userId) || null;
  }

  static async updateUserProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    const profiles = readProfiles();
    const profileIndex = profiles.findIndex(p => p.userId === userId);

    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    profiles[profileIndex] = {
      ...profiles[profileIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeProfiles(profiles);
    return profiles[profileIndex];
  }
}