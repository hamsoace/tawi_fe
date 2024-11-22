'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const api = axios.create({
  baseURL: 'https://tawi-xh85.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
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

const BulkRecharge = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    successfulTransactions: any[];
    failedTransactions: any[];
    totalProcessed: number;
  } | null>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setStatus({
        type: 'error',
        message: 'Please select a CSV file'
      });
      return;
    }

    if (pin.length !== 4) {
      setStatus({
        type: 'error',
        message: 'PIN must be 4 digits'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('servicePin', pin);

    try {
      const response = await api.post('/recharge/bulk-recharge', formData);

      if (response.data.success) {
        setResults({
          successfulTransactions: response.data.results,
          failedTransactions: response.data.errors,
          totalProcessed: response.data.totalProcessed
        });

        setStatus({
          type: 'success',
          message: `Processed ${response.data.totalProcessed} transactions`
        });

        // Reset form
        setFile(null);
        setPin('');
        (document.getElementById('csvFile') as HTMLInputElement).value = '';
      } else {
        throw new Error(response.data.error || 'Bulk recharge failed');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           (err.code === 'ERR_NETWORK' ? 'Unable to connect to server' : err.message) ||
                           'An error occurred during bulk recharge';
        setStatus({
          type: 'error',
          message: errorMessage
        });
        
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
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bulk Airtime Recharge</CardTitle>
          <CardDescription>
            Upload a CSV file to send airtime to multiple Safaricom numbers
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
              <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700">
                CSV File
              </label>
              <Input
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV should have columns: receiverMsisdn, amount
              </p>
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
                value={pin}
                onChange={(e) => setPin(e.target.value)}
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
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Recharge
                </>
              )}
            </Button>

            {results && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Recharge Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Successful Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.successfulTransactions.map((transaction, index) => (
                            <TableRow key={index}>
                              <TableCell>{transaction.receiverMsisdn}</TableCell>
                              <TableCell>{transaction.amount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Failed Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.failedTransactions.map((transaction, index) => (
                            <TableRow key={index}>
                              <TableCell>{transaction.receiverMsisdn}</TableCell>
                              <TableCell>{transaction.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkRecharge;