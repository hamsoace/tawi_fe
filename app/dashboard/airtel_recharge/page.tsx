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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface FormData {
  receiverMsisdn: string;
  amount: string;
  currencyCode: string;
}

interface Status {
  type: 'success' | 'error' | 'idle';
  message: string;
}

interface ApiResponse {
  success: boolean;
  responseId?: string;
  responseStatus?: string;
  responseDesc?: string;
  error?: string;
  details?: string;
}

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

const AirtimeRecharge: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    receiverMsisdn: '',
    amount: '',
    currencyCode: 'KES'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>({
    type: 'idle',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      currencyCode: value
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
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
        message: 'Please enter a valid phone number'
      });
      setLoading(false);
      return;
    }

    if (Number(formData.amount) <= 0) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid amount'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post<ApiResponse>('/recharge/airtime', {
        receiverMsisdn: formData.receiverMsisdn,
        amount: Number(formData.amount),
        currencyCode: formData.currencyCode
      });

      console.log(response.data);
      if (response.data.success) {
        setStatus({
          type: 'success',
          message: response.data.responseDesc || 'Airtime sent successfully!'
        });
        // Clear form
        setFormData({
          receiverMsisdn: '',
          amount: '',
          currencyCode: 'KES'
        });
      } else {
        throw new Error(response.data.error || response.data.details || 'Airtime transfer failed');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           (err.code === 'ERR_NETWORK' ? 'Unable to connect to server' : err.message) ||
                           'An error occurred during airtime transfer';
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
          <CardTitle className="text-2xl font-bold">Send Airtime</CardTitle>
          <CardDescription>
            Send airtime to any mobile number
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
                Amount
              </label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-2/3"
                />
                <Select
                  value={formData.currencyCode}
                  onValueChange={handleCurrencyChange}
                  defaultValue="KES"
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                'Send Airtime'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirtimeRecharge;