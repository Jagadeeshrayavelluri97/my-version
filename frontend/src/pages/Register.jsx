import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaBuilding, FaMapMarkerAlt, FaPhone, FaHome } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register, loading: authLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pgName: "",
    address: "",
    phone: "",
    propertyType: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, password, confirmPassword, pgName, address, phone, propertyType } = formData;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", { type: "error" });
      return;
    }

    try {
    await register(formData);
    } catch (error) {
      console.error('Registration error:', error);
      showToast('An error occurred during registration', { type: 'error' });
    }
  }, [formData, password, confirmPassword, register]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-violet-900 to-purple-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-800 via-violet-900 to-purple-800 opacity-80"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-8 -left-4 w-96 h-96 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -top-4 left-20 w-96 h-96 bg-gradient-to-br from-fuchsia-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-purple-200">
            Register to manage your PG
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-8 space-y-6 border border-white/20 hover:border-white/40 transition-colors duration-500">
          {authError && (
            <div key={authError} className="bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-md animate-fade-in relative" style={{ minHeight: '60px' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">{authError}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="name" className="block text-sm font-medium text-purple-100">
                <FaUser className="inline-block mr-2" />
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="email" className="block text-sm font-medium text-purple-100">
                <FaEnvelope className="inline-block mr-2" />
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="password" className="block text-sm font-medium text-purple-100">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-300 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-100">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-300 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="propertyType" className="block text-sm font-medium text-purple-100">
                <FaHome className="inline-block mr-2" />
                Property Type
              </label>
              <div className="mt-1 relative">
                <select
                  id="propertyType"
                  name="propertyType"
                  required
                  value={propertyType}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                >
                  <option value="PG" className="bg-purple-900 text-white">PG</option>
                  <option value="Dormitory" className="bg-purple-900 text-white">Dormitory</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-purple-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="pgName" className="block text-sm font-medium text-purple-100">
                <FaBuilding className="inline-block mr-2" />
                {propertyType === "Dormitory" ? "Dormitory Name" : "PG Name"}
              </label>
              <div className="mt-1">
                <input
                  id="pgName"
                  name="pgName"
                  type="text"
                  required
                  value={pgName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder={propertyType === "Dormitory" ? "Enter your Dormitory name" : "Enter your PG name"}
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="address" className="block text-sm font-medium text-purple-100">
                <FaMapMarkerAlt className="inline-block mr-2" />
                Address
              </label>
              <div className="mt-1">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder={propertyType === "Dormitory" ? "Enter your Dormitory address" : "Enter your PG address"}
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="phone" className="block text-sm font-medium text-purple-100">
                <FaPhone className="inline-block mr-2" />
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.2] to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center">
                  {authLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform duration-200" />
                      Create Account
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center mt-6">
            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-purple-200 hover:text-white transition-colors duration-200"
              >
                Already have an account? Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Register);
