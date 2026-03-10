import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// ─── Redirect Flag ──────────────────────────────────────────────────────────
const REDIRECT_FLAG_KEY = "ops-auth-redirect-pending";

export function setRedirectFlag() {
  try { sessionStorage.setItem(REDIRECT_FLAG_KEY, "1"); } catch {}
}

export function isRedirectPending(): boolean {
  try { return sessionStorage.getItem(REDIRECT_FLAG_KEY) === "1"; } catch { return false; }
}

export function clearRedirectFlag() {
  try { sessionStorage.removeItem(REDIRECT_FLAG_KEY); } catch {}
}

/**
 * Sign in with Google — tries popup first, falls back to redirect.
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      throw err;
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/network-request-failed" ||
      code === "auth/internal-error"
    ) {
      console.warn("[auth] Popup failed, falling back to redirect:", code);
      setRedirectFlag();
      await signInWithRedirect(auth, googleProvider);
      return new Promise(() => {});
    }
    throw err;
  }
}

/**
 * Sign in with Apple — tries popup first, falls back to redirect.
 */
export async function signInWithApple(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      throw err;
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/network-request-failed" ||
      code === "auth/internal-error"
    ) {
      console.warn("[auth] Popup failed, falling back to redirect:", code);
      setRedirectFlag();
      await signInWithRedirect(auth, appleProvider);
      return new Promise(() => {});
    }
    throw err;
  }
}

/**
 * Check for redirect result on page load.
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.warn("[auth] Redirect result check failed:", err);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function updateUserProfile(user: User, data: { displayName?: string }) {
  await updateProfile(user, data);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
