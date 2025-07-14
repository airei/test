import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: number;
    percentageChange?: number;
    isIncrease?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export function MetricCard({ 
    title, 
    value, 
    percentageChange, 
    isIncrease = true, 
    icon,
    className 
}: MetricCardProps) {
    const formatValue = (val: number) => {
        return val.toLocaleString('id-ID');
    };

    const getPercentageColor = () => {
        if (percentageChange === undefined) return 'text-gray-500';
        return isIncrease ? 'text-green-600' : 'text-red-600';
    };

    const getPercentageIcon = () => {
        if (percentageChange === undefined) return <Minus className="w-4 h-4" />;
        return isIncrease ? (
            <TrendingUp className="w-4 h-4" />
        ) : (
            <TrendingDown className="w-4 h-4" />
        );
    };

    return (
        <Card className={cn("border-0 shadow-sm", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatValue(value)}
                        </p>
                        {percentageChange !== undefined && (
                            <div className={cn("flex items-center mt-2 text-sm font-medium", getPercentageColor())}>
                                {getPercentageIcon()}
                                <span className="ml-1">
                                    {isIncrease ? '+' : ''}{percentageChange}%
                                </span>
                                <span className="ml-1 text-gray-500">
                                    dari periode sebelumnya
                                </span>
                            </div>
                        )}
                    </div>
                    {icon && (
                        <div className="flex-shrink-0 ml-4">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 