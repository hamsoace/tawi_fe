import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from 'react';


interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    chart?: boolean;
  }
  
  export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, chart = false }) => (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {chart && <div className="h-4 w-12 bg-blue-100 rounded-full" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="text-2xl font-bold">{value}</div>
          </div>
          {Icon && (
            <div className="p-2 bg-blue-100 rounded-full">
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );