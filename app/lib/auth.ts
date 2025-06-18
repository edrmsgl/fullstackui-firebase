import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from "@/app/firebaseConfig";

export const checkAuth = (callback: (isLoggedIn: boolean) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(!!user);
  });
};

export const logout = async () => {
  await signOut(auth);
};