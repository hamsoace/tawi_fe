'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
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

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://tawi-xh85.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Set up axios interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Recharge = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    receiverMsisdn: '',
    amount: '',
    pin: '' // Changed from servicePin to pin to match login
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(?:254|\+254|0)?([7-9]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    // Validation
    if (!validatePhoneNumber(formData.receiverMsisdn)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid Kenyan phone number'
      });
      setLoading(false);
      return;
    }

    if (Number(formData.amount) < 5 || Number(formData.amount) > 35000) {
      setStatus({
        type: 'error',
        message: 'Amount must be between KES 5 and KES 35,000'
      });
      setLoading(false);
      return;
    }

    if (formData.pin.length !== 4) {
      setStatus({
        type: 'error',
        message: 'PIN must be 4 digits'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/recharge', {
        receiverMsisdn: formData.receiverMsisdn,
        amount: Number(formData.amount) * 100,
        servicePin: formData.pin 
      });

      if (response.data.success || response.data.responseStatus === 'SUCCESS') {
        setStatus({
          type: 'success',
          message: response.data.responseDesc || 'Recharge completed successfully!'
        });
        // Clear form
        setFormData({
          receiverMsisdn: '',
          amount: '',
          pin: ''
        });
      } else {
        throw new Error(response.data.error || response.data.details || 'Recharge failed');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           (err.code === 'ERR_NETWORK' ? 'Unable to connect to server' : err.message) ||
                           'An error occurred during recharge';
        setStatus({
          type: 'error',
          message: errorMessage
        });
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } else {
        setStatus({
          type: 'error',
          message: 'An unexpected error occurred'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Airtime Recharge</CardTitle>
          <CardDescription>
            Send airtime to any Safaricom number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {status.type !== 'idle' && (
              <Alert variant={status.type === 'success' ? 'default' : 'destructive'}>
                {status.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="receiverMsisdn" className="block text-sm font-medium text-gray-700">
                Recipient Phone Number
              </label>
              <Input
                id="receiverMsisdn"
                name="receiverMsisdn"
                type="tel"
                required
                placeholder="e.g., 0712345678"
                value={formData.receiverMsisdn}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (KES)
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
                min="5"
                max="35000"
                placeholder="Enter amount"
                value={formData.amount}
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
                pattern="\d{4}"
                placeholder="Enter your 4-digit PIN"
                value={formData.pin}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Recharge Now'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recharge;