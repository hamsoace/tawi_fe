"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, DollarSign, User, Loader2, RefreshCcw, Search, Calendar, Filter } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardCard } from './(components)/DashboardCard';
import { formatCurrency } from './util/formatCurrency';
import { Sidebar } from './(components)/DashboardSidebar';

interface Transaction {
  senderMsisdn: string;
  receiverMsisdn: string;
  amount: number;
  transactionId: string;
  status: string;
  createdAt: string;
}

interface ChartData {
  name: string;
  amount: number;
}

interface FilterState {
  range: 'day' | 'week' | 'month' | 'quarter' | 'year';
  search: string;
  pageSize: number;
  page: number;
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    monthlyTotal: 0,
    newClients: 0,
    monthlyData: []
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    range: 'month',
    search: '',
    pageSize: 5,
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        fetch('https://tawi-xh85.onrender.com/api/recharge/statistics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`https://tawi-xh85.onrender.com/api/recharge/transactions?${new URLSearchParams({
          page: filters.page.toString(),
          pageSize: filters.pageSize.toString(),
          range: filters.range,
          search: filters.search
        })}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (!statsResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, transactionsData] = await Promise.all([
        statsResponse.json(),
        transactionsResponse.json()
      ]);

      if (statsData.success) {
        setStats(statsData.statistics);
        const transformedData = statsData.statistics.monthlyData.map((item: any) => ({
          name: getMonthName(item._id.month),
          amount: item.total
        }));
        setChartData(transformedData);
      }

      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
        setTotalPages(transactionsData.pages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => {
      const newState = { ...prev };
      if (key === 'page') {
        newState.page = typeof value === 'string' ? parseInt(value, 10) : value;
      } else {
        // newState[key] = value as FilterState[typeof key];
        newState.page = 1;
      }
      return newState;
    });
  };

  const getMonthName = (month: number): string => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'short' });
  };

  const formatPhoneNumber = (phone: string): string => {
    return `+254${phone.slice(-9)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Spent this month"
          value={formatCurrency(stats.monthlyTotal)}
          icon={DollarSign}
          chart
        />
        <DashboardCard
          title="New clients"
          value={stats.newClients}
          icon={User}
        />
        <DashboardCard
          title="Activity"
          value={formatCurrency(stats.monthlyTotal * 0.8)}
          icon={Activity}
          chart
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Transaction volume over time</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `KES ${value/1000}K`} />
                  <Tooltip 
                    formatter={(value: any) => [`KES ${formatCurrency(value)}`, 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities with Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1"
                // prefix={<Search className="h-4 w-4 text-gray-400" />}
              />
              <Select
                value={filters.range}
                onValueChange={(value) => handleFilterChange('range', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <>
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.transactionId}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {formatPhoneNumber(transaction.receiverMsisdn)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {transaction.transactionId.slice(-6)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={filters.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reusable Transaction Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Transaction Distribution</CardTitle>
              <CardDescription>Monthly transaction breakdown</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `KES ${value/1000}K`} />
                  <Tooltip 
                    formatter={(value: any) => [`KES ${formatCurrency(value)}`, 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#2563eb" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;