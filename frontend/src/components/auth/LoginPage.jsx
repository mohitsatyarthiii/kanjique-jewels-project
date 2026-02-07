import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErr("");
  setLoading(true);

  try {
    const user = await login(form);

    // 👉 IMPORTANT: store user for protection routes
    localStorage.setItem("user", JSON.stringify(user));

    // ROLE BASED REDIRECT ✅
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }

  } catch (error) {
    setErr(error.response?.data?.error || "Login failed");
    setLoading(false);
  }
};


  return (
    <section className="min-h-screen pt-40 pb-16 px-4 sm:px-6 lg:px-10 bg-gradient-to-b from-[#fff7f0] via-white to-[#fff2f7] relative overflow-hidden">
      
      {/* Soft Background Blobs */}
      <div className="absolute -top-24 -left-24 w-[320px] h-[320px] bg-[#ffe6d0] rounded-full blur-[90px] opacity-70" />
      <div className="absolute top-1/2 -right-24 w-[340px] h-[340px] bg-[#f6ddff] rounded-full blur-[110px] opacity-60" />
      <div className="absolute -bottom-24 left-1/3 w-[320px] h-[320px] bg-[#dff7ff] rounded-full blur-[110px] opacity-60" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">

        {/* Left Side Content */}
        <div className="hidden lg:block">
          <p className="uppercase tracking-[0.25em] text-sm text-gray-500 mb-3">
            Welcome Back
          </p>

          <h1 className="text-4xl font-serif text-gray-900 leading-tight">
            Sign in to continue your
            <span className="block text-[#b2965a]">Luxury Jewellery Journey</span>
          </h1>

          <p className="mt-4 text-gray-600 max-w-md">
            Access your wishlist, orders, and exclusive collections made to match
            your style.
          </p>

          {/* Features List */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f4e6c3] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#b2965a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-700">Track your premium jewellery orders</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f4e6c3] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#b2965a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-700">Access members-only collections</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f4e6c3] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#b2965a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-gray-700">Manage your saved wishlist items</span>
            </div>
          </div>
        </div>

        {/* Login Card - Clerk ke size jaisa */}
        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-5 sm:p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif text-gray-900 mb-1">Sign in to your account</h2>
              <p className="text-sm text-gray-600">Welcome back! Please enter your details</p>
            </div>

            {/* Error Message */}
            {err && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{err}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b2965a] focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="you@example.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#b2965a] hover:text-[#8c703f] font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b2965a] focus:border-transparent transition-all duration-200 outline-none pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {showPassword ? (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#b2965a] to-[#d4b97d] hover:from-[#8c703f] hover:to-[#b2965a] text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            

            {/* Sign Up Link */}
            <div className="text-center pt-5 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-[#b2965a] hover:text-[#8c703f] font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}