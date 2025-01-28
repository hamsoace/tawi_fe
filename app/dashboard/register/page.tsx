"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = 'admin' | 'branchManager' | 'dsa' | 'retailer';

const ROLE_PERMISSIONS: Record<UserRole, UserRole[]> = {
  admin: ['branchManager', 'dsa', 'retailer'],
  branchManager: ['dsa', 'retailer'],
  dsa: ['retailer'],
  retailer: []
};

interface FormData {
  username: string;
  phone: string;
  pin: string;
  userType: string;
}

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    phone: '',
    pin: '',
    userType: ''
  });
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    const initializeUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token); // Debug log

        if (!token) {
          setError('Please log in to register users');
          setLoading(false);
          return;
        }

        // Split the token and get the payload
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }

        // Decode the payload
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode the payload
        console.log('Decoded payload:', payload); // Debug log

        if (!payload.role) {
          throw new Error('No role found in token');
        }

        const userRole = payload.role as UserRole;
        console.log('User role:', userRole); // Debug log

        setCurrentUserRole(userRole);
        
        // Set available roles based on user's role
        if (userRole in ROLE_PERMISSIONS) {
          const allowedRoles = ROLE_PERMISSIONS[userRole];
          console.log('Available roles:', allowedRoles); // Debug log
          
          setAvailableRoles(allowedRoles);
          
          // If user can only register one type of role, set it automatically
          if (allowedRoles.length === 1) {
            setFormData(prev => ({
              ...prev,
              userType: allowedRoles[0]
            }));
          }
        }
      } catch (err) {
        console.error('Error initializing user role:', err);
        setError('Error loading user permissions. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    initializeUserRole();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      userType: value
    }));
  };

  const validateForm = (): boolean => {
    const phoneRegex = /^[17]\d{8}$/;
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    const cleanPhone = formData.phone.replace(/^(\+254|254|0)/, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid Kenyan phone number');
      return false;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setError('PIN must be a 4-digit number');
      return false;
    }

    if (!formData.userType) {
      setError('User type is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const cleanPhone = formData.phone.replace(/^(\+254|254|0)/, '');
      
      const requestData = {
        ...formData,
        phone: cleanPhone
      };

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://tawi-xh85.onrender.com/api/auth/register', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      alert('User registered successfully');
      setFormData({
        username: '',
        phone: '',
        pin: '',
        userType: currentUserRole === 'dsa' ? 'retailer' : ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error if no token or role couldn't be determined
  if (!currentUserRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Access Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Please log in to access the registration form'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message for retailers
  if (currentUserRole === 'retailer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">User Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                As a retailer, you do not have permission to register new users.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register User</CardTitle>
          <CardDescription>
            Create a new user account
            {currentUserRole && (
              <div className="mt-2 text-sm text-gray-500">
                You can register: {availableRoles.map(role => 
                  role === 'dsa' ? 'DSA' : 
                  role === 'branchManager' ? 'Branch Manager' : 
                  role.charAt(0).toUpperCase() + role.slice(1)
                ).join(', ')}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Enter Full Name"
                value={formData.username}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g., 0712345678"
                value={formData.phone}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN
              </label>
              <Input
                id="pin"
                name="pin"
                type="password"
                required
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={formData.pin}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  User Type
                </label>
                <Select 
                  onValueChange={handleRoleChange} 
                  value={formData.userType}
                  disabled={availableRoles.length === 1}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role === 'dsa' ? 'DSA' : 
                         role === 'branchManager' ? 'Branch Manager' : 
                         role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;