import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Pencil, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { goalsStorage } from '@/lib/goals-storage';
import { Goal } from '@/types/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

export default function GoalsPage() {
    const { activeOrgId } = useOrganization();
    const { toast } = useToast();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');

    useEffect(() => {
        if (activeOrgId) {
            loadGoals();
        }
    }, [activeOrgId]);

    const loadGoals = () => {
        if (!activeOrgId) return;
        const loadedGoals = goalsStorage.getAll(activeOrgId);
        setGoals(loadedGoals);
    };

    const resetForm = () => {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate('');
        setEditingGoal(null);
    };

    const handleOpenDialog = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal);
            setName(goal.name);
            setTargetAmount(goal.target_amount.toString());
            setCurrentAmount(goal.current_amount.toString());
            setTargetDate(goal.target_date ? goal.target_date.split('T')[0] : '');
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeOrgId) return;

        try {
            const goalData = {
                organization_id: activeOrgId,
                name,
                target_amount: Number(targetAmount),
                current_amount: Number(currentAmount) || 0,
                target_date: targetDate ? new Date(targetDate).toISOString() : undefined,
            };

            if (editingGoal) {
                goalsStorage.update(activeOrgId, editingGoal.id, goalData);
                toast({ title: "Meta atualizada", description: "Sua meta foi atualizada com sucesso." });
            } else {
                goalsStorage.create(activeOrgId, goalData);
                toast({ title: "Meta criada", description: "Nova meta financeira definida com sucesso!" });
            }

            loadGoals();
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível salvar a meta.", variant: "destructive" });
        }
    };

    const handleDelete = (id: string) => {
        if (!activeOrgId) return;
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            goalsStorage.delete(activeOrgId, id);
            toast({ title: "Meta excluída", description: "A meta foi removida com sucesso." });
            loadGoals();
        }
    };

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 max-w-7xl xl:max-w-[90rem] 2xl:max-w-[96rem] space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Metas Financeiras</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Defina objetivos e acompanhe seu progresso
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-full px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Meta
                </Button>
            </div>

            {goals.length === 0 ? (
                <Card className="p-12 rounded-2xl shadow-flat border-0 bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
                            <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Nenhuma meta definida</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                Comece criando uma meta para economizar para uma viagem, um carro novo ou sua reserva de emergência.
                            </p>
                        </div>
                        <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4">
                            Criar Primeira Meta
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const progress = goalsStorage.calculateProgress(goal);
                        const daysRemaining = goalsStorage.getDaysRemaining(goal);
                        const monthlyRequired = goalsStorage.getMonthlyRequiredAmount(goal);

                        return (
                            <Card key={goal.id} className="shadow-flat border-0 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-xl mb-2">
                                            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(goal)}>
                                                <Pencil className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(goal.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                                    <CardDescription>
                                        Alvo: {formatCurrency(goal.target_amount)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Progresso</span>
                                            <span className="font-semibold text-indigo-600">{progress.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{formatCurrency(goal.current_amount)}</span>
                                            <span>Faltam {formatCurrency(goal.target_amount - goal.current_amount)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                                        {daysRemaining !== null && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Prazo</p>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{daysRemaining} dias</p>
                                                </div>
                                            </div>
                                        )}
                                        {monthlyRequired !== null && monthlyRequired > 0 && (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Mensal</p>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatCurrency(monthlyRequired)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
                        <DialogDescription>
                            Defina os detalhes do seu objetivo financeiro.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Meta</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Viagem para Europa" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="target">Valor Alvo (R$)</Label>
                                <Input id="target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current">Valor Atual (R$)</Label>
                                <Input id="current" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data Alvo (Opcional)</Label>
                            <Input id="date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
