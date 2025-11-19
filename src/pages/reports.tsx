import { useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#00C6B8', '#4A56E2', '#FF5733', '#FFC300', '#C70039', '#900C3F', '#581845'];

export default function ReportsPage() {
    const {
        monthlyData,
        expenseCategories,
        weeklyExpenseHeatmap,
        loading,
        error
    } = useFinancialData();

    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <p className="text-red-500">Erro ao carregar dados: {error}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 max-w-7xl xl:max-w-[90rem] 2xl:max-w-[96rem] space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Relatórios Financeiros</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Análise detalhada das suas finanças e hábitos de consumo
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Categorias</TabsTrigger>
                    <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Tendências</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fluxo de Caixa Mensal */}
                        <Card className="shadow-flat border-0 rounded-2xl overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    Fluxo de Caixa Mensal
                                </CardTitle>
                                <CardDescription>Comparativo de Receitas vs Despesas</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(value) => `R$${value / 1000}k`} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="income" name="Receitas" fill="#00C6B8" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        <Bar dataKey="expenses" name="Despesas" fill="#FF5733" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Distribuição de Despesas */}
                        <Card className="shadow-flat border-0 rounded-2xl overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-rose-500" />
                                    Distribuição de Despesas
                                </CardTitle>
                                <CardDescription>Top 5 categorias de gastos</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseCategories.slice(0, 5)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="amount"
                                            nameKey="name"
                                        >
                                            {expenseCategories.slice(0, 5).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-6">
                    <Card className="shadow-flat border-0 rounded-2xl">
                        <CardHeader>
                            <CardTitle>Detalhamento por Categoria</CardTitle>
                            <CardDescription>Análise completa de onde seu dinheiro está indo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {expenseCategories.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-12 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</p>
                                                <p className="text-sm text-gray-500">{((category.amount / expenseCategories.reduce((acc, curr) => acc + curr.amount, 0)) * 100).toFixed(1)}% do total</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(category.amount)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    <Card className="shadow-flat border-0 rounded-2xl">
                        <CardHeader>
                            <CardTitle>Evolução do Patrimônio</CardTitle>
                            <CardDescription>Crescimento acumulado ao longo do tempo</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00C6B8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#00C6B8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Area type="monotone" dataKey="income" stroke="#00C6B8" fillOpacity={1} fill="url(#colorIncome)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
