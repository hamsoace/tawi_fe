"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const USER_ROLES = {
  ADMIN: "admin",
  BRANCH_MANAGER: "branchManager",
  DSA: "dsa",
  RETAILER: "retailer",
};

const ROLE_HIERARCHY: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: [
    USER_ROLES.ADMIN,
    USER_ROLES.BRANCH_MANAGER,
    USER_ROLES.DSA,
    USER_ROLES.RETAILER,
  ],
  [USER_ROLES.BRANCH_MANAGER]: [USER_ROLES.DSA, USER_ROLES.RETAILER],
  [USER_ROLES.DSA]: [USER_ROLES.RETAILER],
  [USER_ROLES.RETAILER]: [],
};

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    pin: "",
    confirmPin: "",
    userType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;
        setAvailableRoles(ROLE_HIERARCHY[role] || Object.values(USER_ROLES));
      } catch (err) {
        console.error("Error decoding token", err);
        setAvailableRoles(Object.values(USER_ROLES));
      }
    } else {
      setAvailableRoles(Object.values(USER_ROLES));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userType: value,
    }));
  };

  const validateForm = (): boolean => {
    const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;

    if (!formData.username) {
      setError("Username is required");
      return false;
    }

    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid Kenyan phone number");
      return false;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setError("PIN must be a 4-digit number");
      return false;
    }

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match");
      return false;
    }

    if (!formData.userType) {
      setError("User type is required");
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
      const { confirmPin, ...registrationData } = formData;
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://tawi-xh85.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(registrationData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      alert("User registered successfully");
      setFormData({
        username: "",
        phone: "",
        pin: "",
        confirmPin: "",
        userType: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register User</CardTitle>
          <CardDescription>Create a new user account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
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

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Enter your Kenyan phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-gray-700"
              >
                PIN
              </label>
              <Input
                id="pin"
                name="pin"
                type="password"
                required
                maxLength={4}
                placeholder="Create a 4-digit PIN"
                value={formData.pin}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Confirm PIN Input */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPin"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm PIN
              </label>
              <Input
                id="confirmPin"
                name="confirmPin"
                type="password"
                required
                maxLength={4}
                placeholder="Confirm your 4-digit PIN"
                value={formData.confirmPin}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700"
              >
                User Role
              </label>
              <Select
                onValueChange={handleRoleChange}
                value={formData.userType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
