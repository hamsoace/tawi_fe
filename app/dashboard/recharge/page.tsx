'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RechargeResponse {
  success: boolean;
  responseDesc?: string;
  error?: string;
  details?: string;
}

const Recharge = () => {
  const [formData, setFormData] = useState({
    receiverMsisdn: '',
    amount: '',
    servicePin: ''
  });
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(?:254|\+254|0)?([7-9]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: 'idle', message: '' });

    // Validation
    if (!validatePhoneNumber(formData.receiverMsisdn)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid Kenyan phone number'
      });
      setIsLoading(false);
      return;
    }

    if (Number(formData.amount) < 5 || Number(formData.amount) > 35000) {
      setStatus({
        type: 'error',
        message: 'Amount must be between KES 5 and KES 35,000'
      });
      setIsLoading(false);
      return;
    }

    if (formData.servicePin.length !== 4) {
      setStatus({
        type: 'error',
        message: 'PIN must be 4 digits'
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://tawi-lea2.onrender.com/api/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverMsisdn: formData.receiverMsisdn,
          amount: Number(formData.amount),
          servicePin: formData.servicePin
        })
      });

      const data: RechargeResponse = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: data.responseDesc || 'Recharge completed successfully!'
        });
        // Clear form
        setFormData({
          receiverMsisdn: '',
          amount: '',
          servicePin: ''
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || data.details || 'Recharge failed. Please try again.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Airtime Recharge</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="receiverMsisdn" className="block text-sm font-medium mb-1">
            Recipient Phone Number
          </label>
          <input
            type="tel"
            id="receiverMsisdn"
            value={formData.receiverMsisdn}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 0712345678"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Amount (KES)
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={handleChange}
            min="5"
            max="35000"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>

        <div>
          <label htmlFor="servicePin" className="block text-sm font-medium mb-1">
            Service PIN
          </label>
          <input
            type="password"
            id="servicePin"
            value={formData.servicePin}
            onChange={handleChange}
            maxLength={4}
            pattern="\d{4}"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 4-digit PIN"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   focus:ring-4 focus:ring-blue-300 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Recharge Now'}
        </button>
      </form>

      {status.type !== 'idle' && (
        <Alert className={`mt-4 ${
          status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={`ml-2 ${
            status.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {status.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Recharge;