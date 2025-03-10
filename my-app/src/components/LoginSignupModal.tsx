"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginSignupModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  const [error, setError] = useState<{ email?: string; password?: string; general?: string }>({});
  const [forgotPassword, setForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError({});
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (!validateEmail(email)) {
        setError((prev) => ({ ...prev, email: "Invalid email" }));
        return;
      }

      if (forgotPassword) {
        // 这里是请求后端发送重置密码邮件的地方
        console.log(`Requesting password reset for ${email}`);

        // 这里应该调用后端 API，暂时模拟
        setSuccessMessage("A password reset email has been sent.");
        return;
      }

      if (isLogin) {
        const mockUsers = [
          { email: "test@example.com", password: "password123", username: "TestUser", points: 60 },
        ];
        const user = mockUsers.find((u) => u.email === email);

        if (!user) {
          setError((prev) => ({ ...prev, email: "Account does not exist" }));
          return;
        }

        if (user.password !== password) {
          setError((prev) => ({ ...prev, password: "Incorrect password" }));
          return;
        }

        localStorage.setItem("user", JSON.stringify({ username: user.username, points: user.points }));
        window.location.reload();
      } else {
        if (!name) {
          setError((prev) => ({ ...prev, general: "Name is required" }));
          return;
        }

        localStorage.setItem("user", JSON.stringify({ username: name, points: 60 }));
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to your backend's Google auth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      // Alternatively, if using a library like next-auth:
      // await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error("Google login error:", error);
      setError({ general: "Failed to authenticate with Google" });
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to your backend's Facebook auth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
      // Alternatively, if using a library like next-auth:
      // await signIn('facebook', { callbackUrl: '/' });
    } catch (error) {
      console.error("Facebook login error:", error);
      setError({ general: "Failed to authenticate with Facebook" });
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Login / Signup</Button>
      </DialogTrigger>
      <DialogContent className="p-6 w-[400px]">
        <DialogHeader>
          <DialogTitle>{forgotPassword ? "Reset Password" : isLogin ? "Log in" : "Sign up"}</DialogTitle>
          {!forgotPassword && (
            <div className="flex justify-center gap-6 border-b pb-3">
              <button
                className={`text-lg font-bold ${isLogin ? "border-b-2 border-blue-500" : "text-gray-500"}`}
                onClick={() => { setIsLogin(true); setError({}); }}
              >
                Log in
              </button>
              <button
                className={`text-lg font-bold ${!isLogin ? "border-b-2 border-blue-500" : "text-gray-500"}`}
                onClick={() => { setIsLogin(false); setError({}); }}
              >
                Sign up
              </button>
            </div>
          )}
        </DialogHeader>

        {error.general && <p className="text-red-500 text-center">{error.general}</p>}
        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

        {/* Standard Email/Password Form */}
        <div className="flex flex-col gap-4 mt-4">
          {!isLogin && !forgotPassword && (
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <div className="flex flex-col">
            <input
              className={`border p-2 rounded ${error.email ? "border-red-500" : ""}`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
          </div>
          {!forgotPassword && (
            <div className="flex flex-col">
              <input
                className={`border p-2 rounded ${error.password ? "border-red-500" : ""}`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>
          )}
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : forgotPassword ? "Reset Password" : isLogin ? "Log in" : "Sign up"}
          </Button>
        </div>

        {!forgotPassword && isLogin && (
          <button className="text-blue-500 text-sm mt-2" onClick={() => setForgotPassword(true)}>
            Forgot password?
          </button>
        )}
        {forgotPassword && (
          <button className="text-blue-500 text-sm mt-2" onClick={() => setForgotPassword(false)}>
            Back to login
          </button>
        )}

        {/* Social Login Buttons (Below email/password) */}
        {!forgotPassword && (
          <div className="mt-4">
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-white px-2 text-sm text-gray-500 absolute">or</span>
            </div>
            
            <div className="text-center text-sm text-gray-500 mb-2">
              {isLogin ? "Log in" : "Sign up"} with
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <GoogleIcon />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 w-full"
                onClick={handleFacebookLogin}
                disabled={isLoading}
              >
                <FacebookIcon />
                Facebook
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// SVG Icons for social buttons
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
    <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
    <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
    <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" />
  </svg>
);