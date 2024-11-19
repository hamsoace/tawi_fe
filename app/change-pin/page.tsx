'use client';

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const ChangePinPage: React.FC = () => {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const api = axios.create({
        baseURL: 'https://tawi-xh85.onrender.com/api/auth',
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  
    const handleChangePinSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
  
      // Basic client-side validation
      if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
        setError('All PINs must be 4 digits');
        return;
      }
  
      if (newPin !== confirmPin) {
        setError('New PIN and Confirm PIN must match');
        return;
      }
  
      try {
        const response = await api.post('/change-pin', { 
          currentPin, 
          newPin 
        });
      
        if (response.data.success) {

          setSuccess('PIN updated successfully');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(response.data.error || 'Failed to update PIN');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(err.response.data.error || 'Failed to update PIN');
          } else if (err.request) {
            setError('No response received from server');
          } else {
            setError('Error setting up the request');
          }
        } else {
          setError('An unexpected error occurred');
        }
        console.error('Change PIN error:', err);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Change PIN</h2>
          
          <form onSubmit={handleChangePinSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                {success}
              </div>
            )}
            
            <div>
              <label htmlFor="currentPin" className="block text-sm font-medium text-gray-700">
                Current PIN
              </label>
              <input
                type="password"
                id="currentPin"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                maxLength={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current PIN"
              />
            </div>
            
            <div>
              <label htmlFor="newPin" className="block text-sm font-medium text-gray-700">
                New PIN
              </label>
              <input
                type="password"
                id="newPin"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new PIN"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700">
                Confirm New PIN
              </label>
              <input
                type="password"
                id="confirmPin"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                maxLength={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new PIN"
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change PIN
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };