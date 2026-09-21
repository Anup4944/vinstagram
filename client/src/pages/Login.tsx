import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast/headless";
import { Link } from "react-router-dom";

export default function Login() {
  const [isLoginState, setIsLoginState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "jamess",
    email: "jamess@example.com",
    password: "secret123",
    bio: "New here",
    avatar: "",
  });

  const { login, register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleOnImgChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const Reader = new FileReader();
    Reader.readAsDataURL(file);

    Reader.onload = () => {
      if (Reader.readyState === 2) {
        setFormData((prev) => ({ ...prev, avatar: Reader.result as string }));
      }
    };
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isLoginState && !formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    if (!isLoginState && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (isLoginState) {
        await login(formData.email, formData.password);
      } else {
        console.log(formData);
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.bio,
          formData.avatar,
        );
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginState((prev) => !prev);
    setError("");
    setFormData({ name: "", email: "", password: "", bio: "", avatar: "" });
  };

  return (
    <div className="min-h-screen flex">
      {/* left */}
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center ">
        <img
          src={
            "https://images.unsplash.com/vector-1738504244597-24b1c270750e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt=""
          className="absolute inset-0 object-cover w-full h-full bg-center opacity-10"
        />
        <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
          <img
            src={
              "https://images.unsplash.com/vector-1738504244597-24b1c270750e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt=""
            className="absolute inset-0 object-cover w-full h-full bg-center opacity-10"
          />
          <div className="relative text-center px-12">
            <h2 className="text-4xl font-semibold text-gray-800 mb-4">
              {isLoginState ? "Welcome to Vinstagram" : "Join us today"}
            </h2>

            <p className="text-lg text-gray-500">
              {isLoginState
                ? "Where you can scroll for hours and still find nothing worth liking."
                : "Sign up to see what everyone's been up to, except you."}
            </p>
          </div>
        </div>
      </div>

      {/* right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            {isLoginState ? "Login" : "Sign Up"}
          </h1>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleOnSubmit} className="space-y-4">
            {!isLoginState && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-app-green focus:border-transparent"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-app-green focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-app-green focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {/* Bio - only for signup, no password toggle here */}
            {!isLoginState && (
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <input
                  id="bio"
                  name="bio"
                  type="text"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-app-green focus:border-transparent"
                  disabled={loading}
                />
              </div>
            )}

            {/* Avatar - only for signup */}
            {!isLoginState && (
              <div>
                <label
                  htmlFor="avatar"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Avatar
                </label>

                <div className="flex items-center justify-center">
                  <label
                    htmlFor="avatar"
                    className={`flex items-center cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Choose Image
                    <input
                      id="avatar"
                      name="avatar"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleOnImgChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.avatar && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Processing..." : isLoginState ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {isLoginState
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-app-green font-medium hover:underline"
            >
              {isLoginState ? "Sign Up" : "Login"}
            </button>
          </p>
          {isLoginState && (
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-brand  cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
