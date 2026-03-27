import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "motion/react";
import { LogIn, GraduationCap, ShieldCheck } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async (role: "admin" | "student") => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-neutral-200"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">VIIT Coaching</h1>
          <p className="text-neutral-500 mt-2">Welcome back! Please sign in to continue.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleGoogleSignIn("student")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-neutral-200 text-neutral-700 font-semibold py-3 px-6 rounded-xl hover:bg-neutral-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            Sign in as Student
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-400">Admin Access</span>
            </div>
          </div>

          <button
            onClick={() => handleGoogleSignIn("admin")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-neutral-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            Sign in as Admin
          </button>
        </div>

        <p className="text-center text-neutral-400 text-xs mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
