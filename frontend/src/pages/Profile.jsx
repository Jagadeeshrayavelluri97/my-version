import React, { useState, useEffect } from 'react'
import { FaUser, FaKey, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaEye, FaEyeSlash, FaSave, FaLock } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { showToast } from "../utils/toast"
import { useLocation } from "react-router-dom";

const Profile = () => {
  const { admin, updateProfile, updatePassword } = useAuth()
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    pgName: '',
    address: '',
    phone: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const location = useLocation();

  useEffect(() => {
    if (admin) {
      setProfileData({
        name: admin.name || '',
        email: admin.email || '',
        pgName: admin.pgName || '',
        address: admin.address || '',
        phone: admin.phone || ''
      })
    }
  }, [admin])
  
  const { name, email, pgName, address, phone } = profileData
  const { currentPassword, newPassword, confirmPassword } = passwordData
  
  const onProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }
  
  const onPasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }
  
  const onProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const success = await updateProfile(profileData)
      if (!success) {
        throw new Error('Profile update failed')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile', location)
    }
    setProfileLoading(false)
  }
  
  const onPasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setPasswordLoading(true)
    try {
      const success = await updatePassword({ currentPassword, newPassword })
      if (success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Error updating password:', error)
      showToast('Failed to update password', location)
    }
    setPasswordLoading(false)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-violet-900 to-purple-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-800 via-violet-900 to-purple-800 opacity-80"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-8 -left-4 w-96 h-96 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -top-4 left-20 w-96 h-96 bg-gradient-to-br from-fuchsia-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Profile Settings
          </h2>
          <p className="mt-2 text-sm text-purple-200">
            Manage your account information and password
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Update Form */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden border border-white/20 hover:border-white/40 transition-colors duration-500">
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 text-white">
                <FaUser className="text-xl text-purple-300" />
                <h3 className="text-xl font-semibold">Profile Information</h3>
              </div>
              
              <form onSubmit={onProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-purple-100">
                    <FaUser className="inline-block mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onProfileChange}
                    className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-purple-100">
                    <FaEnvelope className="inline-block mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onProfileChange}
                    className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="pgName" className="block text-sm font-medium text-purple-100">
                    <FaBuilding className="inline-block mr-2" />
                    PG Name
                  </label>
                  <input
                    type="text"
                    id="pgName"
                    name="pgName"
                    value={pgName}
                    onChange={onProfileChange}
                    className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-purple-100">
                    <FaMapMarkerAlt className="inline-block mr-2" />
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={address}
                    onChange={onProfileChange}
                    className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-purple-100">
                    <FaPhone className="inline-block mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={onProfileChange}
                    className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.2] to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative flex items-center">
                      {profileLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform duration-200" />
                          Save Changes
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Password Update Form */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden border border-white/20 hover:border-white/40 transition-colors duration-500">
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 text-white">
                <FaKey className="text-xl text-purple-300" />
                <h3 className="text-xl font-semibold">Change Password</h3>
              </div>
              
              <form onSubmit={onPasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-200">{passwordError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-purple-100">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={onPasswordChange}
                      className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-300 hover:text-white transition-colors duration-200"
                    >
                      {showCurrentPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-purple-100">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={onPasswordChange}
                      className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-300 hover:text-white transition-colors duration-200"
                    >
                      {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-100">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onPasswordChange}
                      className="appearance-none block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-300 hover:text-white transition-colors duration-200"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.2] to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative flex items-center">
                      {passwordLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <FaLock className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform duration-200" />
                          Update Password
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
