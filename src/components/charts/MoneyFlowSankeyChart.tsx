import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { MoneyFlow, MoneyFlowNode } from '@/hooks/useFinancialData';

interface MoneyFlowSankeyChartProps {
  data: MoneyFlow;
  isLoading?: boolean;
}

export function MoneyFlowSankeyChart({ data, isLoading = false }: MoneyFlowSankeyChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg hover:shadow-md transition-shadow border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Fluxo de Dinheiro</CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || !data.nodes || !data.links || data.nodes.length === 0 || data.links.length === 0) {
    return (
      <Card className="p-6 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <CardHeader>
          <CardTitle>Fluxo de Dinheiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Sem dados suficientes para exibir o fluxo.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cores para diferentes categorias e tipos
  const getNodeColor = (category: string, type?: string) => {
    switch (category) {
      case 'income':
        return '#3B82F6'; // Azul para receitas
      case 'balance':
        return '#8B5CF6'; // Roxo para o saldo (destaque)
      case 'expense':
        // Diferentes cores para tipos de despesa
        switch (type) {
          case 'goal':
            return '#10B981'; // Verde para metas
          case 'investment':
            return '#6366F1'; // Índigo para investimentos
          case 'debt':
            return '#EF4444'; // Vermelho para dívidas
          default:
            return '#F59E0B'; // Amarelo para despesas regulares
        }
      default:
        return '#6B7280'; // Cinza padrão
    }
  };

  // Organizar nós por categoria para melhor layout
  const incomeNodes = data.nodes.filter(node => node.category === 'income');
  const balanceNode: MoneyFlowNode = { id: 'balance', name: 'Saldo', category: 'balance' }; // Nó central do saldo
  const expenseNodes = data.nodes.filter(node => node.category === 'expense');

  // Calcular posições dos nós
  const nodeWidth = 120;
  const nodeHeight = 40;
  const columnSpacing = isFullscreen ? 350 : 200; // Mais espaçamento no fullscreen
  const rowSpacing = 50;

  // Dimensões especiais para o nó de saldo no fullscreen
  const balanceNodeWidth = isFullscreen ? 180 : nodeWidth;
  const balanceNodeHeight = isFullscreen ? 60 : nodeHeight;

  // Função para calcular posição Y de um nó
  const getNodeY = (nodeId: string, category: string) => {
    if (category === 'balance') {
      // Nó do saldo fica posicionado mais ao topo
      return 50; // Posição ajustada para a nova altura maior
    }
    
    const nodesInCategory = data.nodes.filter(n => n.category === category);
    const nodeIndex = nodesInCategory.findIndex(n => n.id === nodeId);
    return 50 + nodeIndex * rowSpacing;
  };

  // Função para calcular posição X de um nó
  const getNodeX = (category: string) => {
    switch (category) {
      case 'income': return 50;
      case 'balance': return 50 + columnSpacing;
      case 'expense': return 50 + columnSpacing * 2;
      default: return 50;
    }
  };

  // Calcular largura máxima dos links para normalização
  const maxLinkValue = Math.max(...data.links.map(link => link.value));
  const minLinkWidth = 1;
  const maxLinkWidth = 8; // Reduzido de 15 para 8 para suavizar visualmente

  // Calcular largura total do SVG baseado no número de colunas
  const svgWidth = 50 + columnSpacing * 3 + 50; // 3 colunas + padding (mais largo no fullscreen)
  
  // Calcular altura baseada no número de nós (máximo de nós em qualquer coluna)
  const maxNodesInColumn = Math.max(
    incomeNodes.length,
    expenseNodes.length
  );
  const calculatedHeight = 50 + maxNodesInColumn * rowSpacing + 50;
  const svgHeight = isFullscreen 
    ? Math.max(600, calculatedHeight) // Altura proporcional no fullscreen
    : Math.min(240, calculatedHeight); // Altura limitada no modo minimizado para não cobrir legenda

  const chartContent = (
    <div className={`relative ${isFullscreen ? 'h-full' : 'h-64'}`}>
      {/* Indicador de scroll horizontal - apenas no modo minimizado */}
      {!isFullscreen && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span>Arraste para ver mais</span>
          </div>
        </div>
      )}
      
      <div className={`${isFullscreen ? 'h-full overflow-y-auto overflow-x-auto' : 'overflow-x-auto overflow-y-hidden'}`} style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
        <div style={{ minHeight: isFullscreen ? `${calculatedHeight}px` : 'auto', width: `${svgWidth}px`, padding: isFullscreen ? '1rem' : '0' }}>
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            {/* Definir gradientes para os links */}
            <defs>
              {data.links.map((link, index) => (
                <linearGradient key={index} id={`gradient-${index}`}>
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
                </linearGradient>
              ))}
            </defs>

            {/* Renderizar links de receita para saldo */}
            {incomeNodes.map((incomeNode) => {
              const incomeValue = data.links
                .filter(link => link.source === incomeNode.id)
                .reduce((sum, link) => sum + link.value, 0);
              
              if (incomeValue === 0) return null;

              const sourceX = getNodeX(incomeNode.category) + nodeWidth;
              const sourceY = getNodeY(incomeNode.id, incomeNode.category) + nodeHeight / 2;
              const targetX = getNodeX(balanceNode.category);
              const targetY = getNodeY(balanceNode.id, balanceNode.category) + nodeHeight / 2;

              const linkWidth = Math.max(minLinkWidth, (incomeValue / maxLinkValue) * maxLinkWidth);

              return (
                <path
                  key={`income-${incomeNode.id}`}
                  d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY} ${targetX} ${targetY}`}
                  stroke="#3B82F6"
                  strokeWidth={linkWidth}
                  fill="none"
                  opacity="0.4"
                />
              );
            })}

            {/* Renderizar links de saldo para despesas */}
            {expenseNodes.map((expenseNode) => {
              const expenseValue = data.links
                .filter(link => link.target === expenseNode.id)
                .reduce((sum, link) => sum + link.value, 0);
              
              if (expenseValue === 0) return null;

              const sourceX = getNodeX(balanceNode.category) + nodeWidth;
              const sourceY = getNodeY(balanceNode.id, balanceNode.category) + nodeHeight / 2;
              const targetX = getNodeX(expenseNode.category);
              const targetY = getNodeY(expenseNode.id, expenseNode.category) + nodeHeight / 2;

              const linkWidth = Math.max(minLinkWidth, (expenseValue / maxLinkValue) * maxLinkWidth);

              return (
                <path
                  key={`expense-${expenseNode.id}`}
                  d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY} ${targetX} ${targetY}`}
                  stroke={getNodeColor(expenseNode.category, expenseNode.type)}
                  strokeWidth={linkWidth}
                  fill="none"
                  opacity="0.4"
                />
              );
            })}

            {/* Renderizar nós de receita */}
            {incomeNodes.map((node) => {
              const x = getNodeX(node.category);
              const y = getNodeY(node.id, node.category);
              
              // Calcular valor total das receitas
              const nodeValue = data.links
                .filter(link => link.source === node.id)
                .reduce((sum, link) => sum + link.value, 0);

              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={6}
                    fill={getNodeColor(node.category)}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={x + nodeWidth / 2}
                    y={y + 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {node.name}
                  </text>
                  <text
                    x={x + nodeWidth / 2}
                    y={y + 26}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    opacity="0.9"
                  >
                    R$ {nodeValue.toLocaleString()}
                  </text>
                </g>
              );
            })}

                              {/* Renderizar nó do saldo */}
                  {(() => {
                    const x = getNodeX(balanceNode.category);
                    const y = getNodeY(balanceNode.id, balanceNode.category);
                    
                    // Calcular valor total do saldo (soma de todas as receitas)
                    const balanceValue = data.links
                      .filter(link => data.nodes.find(n => n.id === link.source)?.category === 'income')
                      .reduce((sum, link) => sum + link.value, 0);

                    return (
                      <g key={balanceNode.id}>
                        {/* Fundo principal do repositório */}
                        <rect
                          x={x}
                          y={y}
                          width={balanceNodeWidth}
                          height={balanceNodeHeight}
                          rx={8}
                          fill={getNodeColor(balanceNode.category)}
                          stroke="#1F2937"
                          strokeWidth="3"
                        />
                        
                        {/* Detalhes do repositório - bordas internas */}
                        <rect
                          x={x + 4}
                          y={y + 4}
                          width={balanceNodeWidth - 8}
                          height={12}
                          rx={4}
                          fill="#1F2937"
                          opacity="0.3"
                        />
                        
                        {/* Ícone de repositório */}
                        <circle
                          cx={x + 15}
                          cy={y + 10}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.8"
                        />
                        <circle
                          cx={x + 25}
                          cy={y + 10}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.6"
                        />
                        <circle
                          cx={x + 35}
                          cy={y + 10}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.4"
                        />
                        
                        {/* Texto principal */}
                        <text
                          x={x + balanceNodeWidth / 2}
                          y={y + balanceNodeHeight * 0.45}
                          textAnchor="middle"
                          fill="white"
                          fontSize={isFullscreen ? "16" : "12"}
                          fontWeight="700"
                        >
                          {balanceNode.name}
                        </text>
                        
                        {/* Valor */}
                        <text
                          x={x + balanceNodeWidth / 2}
                          y={y + balanceNodeHeight * 0.65}
                          textAnchor="middle"
                          fill="white"
                          fontSize={isFullscreen ? "14" : "10"}
                          fontWeight="600"
                          opacity="0.95"
                        >
                          R$ {balanceValue.toLocaleString()}
                        </text>
                      </g>
                    );
                  })()}

            {/* Renderizar nós de despesa */}
            {expenseNodes.map((node) => {
              const x = getNodeX(node.category);
              const y = getNodeY(node.id, node.category);
              
              // Calcular valor total das despesas
              const nodeValue = data.links
                .filter(link => link.target === node.id)
                .reduce((sum, link) => sum + link.value, 0);

              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={6}
                    fill={getNodeColor(node.category, node.type)}
                    stroke="#374151"
                    strokeWidth={node.type === 'goal' || node.type === 'investment' ? "2" : "1"}
                  />
                  <text
                    x={x + nodeWidth / 2}
                    y={y + 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {node.name}
                  </text>
                  <text
                    x={x + nodeWidth / 2}
                    y={y + 26}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    opacity="0.9"
                  >
                    R$ {nodeValue.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50 bg-white dark:bg-neutral-900 shadow-2xl mb-20 overflow-hidden' : 'bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg hover:shadow-md transition-shadow border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Fluxo de Dinheiro
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select defaultValue="6m">
            <SelectTrigger className="w-auto text-sm rounded-full px-3 py-1.5 dark:border-white/10">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Últ. 3 meses</SelectItem>
              <SelectItem value="6m">Últ. 6 meses</SelectItem>
              <SelectItem value="12m">Últ. 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isFullscreen ? 'h-full overflow-hidden p-0' : ''}>
        {isFullscreen ? (
          <>
            {/* Container do gráfico com altura limitada e scroll */}
                          <div 
                className="overflow-y-auto overflow-x-auto" 
                style={{ 
                  height: 'calc(60%)',
                  scrollbarWidth: 'thin', 
                  scrollbarColor: '#d1d5db #f3f4f6' 
                }}
              >
              <div style={{ 
                maxHeight: 'min(350px, calc(100vh - 200px))', 
                minHeight: `${calculatedHeight}px`, 
                width: `${svgWidth}px`, 
                padding: '1rem' 
              }}>
                <svg width={svgWidth} height={svgHeight} className="min-w-full">
                  {/* Definir gradientes para os links */}
                  <defs>
                    {data.links.map((link, index) => (
                      <linearGradient key={index} id={`gradient-${index}`}>
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
                      </linearGradient>
                    ))}
                  </defs>

                  {/* Renderizar links de receita para saldo */}
                  {incomeNodes.map((incomeNode) => {
                    const incomeValue = data.links
                      .filter(link => link.source === incomeNode.id)
                      .reduce((sum, link) => sum + link.value, 0);
                    
                    if (incomeValue === 0) return null;

                    const sourceX = getNodeX(incomeNode.category) + nodeWidth;
                    const sourceY = getNodeY(incomeNode.id, incomeNode.category) + nodeHeight / 2;
                    const targetX = getNodeX(balanceNode.category);
                    const targetY = getNodeY(balanceNode.id, balanceNode.category) + balanceNodeHeight / 2;

                    const linkWidth = Math.max(minLinkWidth, (incomeValue / maxLinkValue) * maxLinkWidth);

                    return (
                      <path
                        key={`income-${incomeNode.id}`}
                        d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY} ${targetX} ${targetY}`}
                        stroke="#3B82F6"
                        strokeWidth={linkWidth}
                        fill="none"
                        opacity="0.6"
                      />
                    );
                  })}

                  {/* Renderizar links de saldo para despesas */}
                  {expenseNodes.map((expenseNode) => {
                    const expenseValue = data.links
                      .filter(link => link.target === expenseNode.id)
                      .reduce((sum, link) => sum + link.value, 0);
                    
                    if (expenseValue === 0) return null;

                    const sourceX = getNodeX(balanceNode.category) + balanceNodeWidth;
                    const sourceY = getNodeY(balanceNode.id, balanceNode.category) + balanceNodeHeight / 2;
                    const targetX = getNodeX(expenseNode.category);
                    const targetY = getNodeY(expenseNode.id, expenseNode.category) + nodeHeight / 2;

                    const linkWidth = Math.max(minLinkWidth, (expenseValue / maxLinkValue) * maxLinkWidth);

                    return (
                      <path
                        key={`expense-${expenseNode.id}`}
                        d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY} ${targetX} ${targetY}`}
                        stroke={getNodeColor(expenseNode.category, expenseNode.type)}
                        strokeWidth={linkWidth}
                        fill="none"
                        opacity="0.6"
                      />
                    );
                  })}

                  {/* Renderizar nós de receita */}
                  {incomeNodes.map((node) => {
                    const x = getNodeX(node.category);
                    const y = getNodeY(node.id, node.category);
                    
                    // Calcular valor total das receitas
                    const nodeValue = data.links
                      .filter(link => link.source === node.id)
                      .reduce((sum, link) => sum + link.value, 0);

                    return (
                      <g key={node.id}>
                        <rect
                          x={x}
                          y={y}
                          width={nodeWidth}
                          height={nodeHeight}
                          rx={6}
                          fill={getNodeColor(node.category)}
                          stroke="#374151"
                          strokeWidth="1"
                        />
                        <text
                          x={x + nodeWidth / 2}
                          y={y + 15}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="500"
                        >
                          {node.name}
                        </text>
                        <text
                          x={x + nodeWidth / 2}
                          y={y + 26}
                          textAnchor="middle"
                          fill="white"
                          fontSize="8"
                          opacity="0.9"
                        >
                          R$ {nodeValue.toLocaleString()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Renderizar nó do saldo */}
                  {(() => {
                    const x = getNodeX(balanceNode.category);
                    const y = getNodeY(balanceNode.id, balanceNode.category);
                    
                    // Calcular valor total do saldo (soma de todas as receitas)
                    const balanceValue = data.links
                      .filter(link => data.nodes.find(n => n.id === link.source)?.category === 'income')
                      .reduce((sum, link) => sum + link.value, 0);

                    return (
                      <g key={balanceNode.id}>
                        {/* Fundo principal do repositório */}
                        <rect
                          x={x}
                          y={y}
                          width={balanceNodeWidth}
                          height={balanceNodeHeight}
                          rx={8}
                          fill={getNodeColor(balanceNode.category)}
                          stroke="#1F2937"
                          strokeWidth="3"
                        />
                        
                        {/* Detalhes do repositório - bordas internas */}
                        <rect
                          x={x + 4}
                          y={y + 4}
                          width={balanceNodeWidth - 8}
                          height={12}
                          rx={4}
                          fill="#1F2937"
                          opacity="0.3"
                        />
                        
                        {/* Ícone de repositório */}
                        <circle
                          cx={x + 15}
                          cy={y + 10}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.8"
                        />
                        <circle
                          cx={x + 25}
                          cy={y + 10}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.6"
                        />
                        <circle
                          cx={x + 35}
                          cy={y + 10}
                          r="3"
                          fill="#FFFFFF"
                          opacity="0.4"
                        />
                        
                        {/* Texto principal */}
                        <text
                          x={x + balanceNodeWidth / 2}
                          y={y + 25}
                          textAnchor="middle"
                          fill="white"
                          fontSize={isFullscreen ? "14" : "11"}
                          fontWeight="700"
                        >
                          {balanceNode.name}
                        </text>
                        
                        {/* Valor */}
                        <text
                          x={x + balanceNodeWidth / 2}
                          y={y + (isFullscreen ? 45 : 26)}
                          textAnchor="middle"
                          fill="white"
                          fontSize={isFullscreen ? "12" : "9"}
                          fontWeight="600"
                          opacity="0.95"
                        >
                          R$ {balanceValue.toLocaleString()}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Renderizar nós de despesa */}
                  {expenseNodes.map((node) => {
                    const x = getNodeX(node.category);
                    const y = getNodeY(node.id, node.category);
                    
                    // Calcular valor total das despesas
                    const nodeValue = data.links
                      .filter(link => link.target === node.id)
                      .reduce((sum, link) => sum + link.value, 0);

                    return (
                      <g key={node.id}>
                        <rect
                          x={x}
                          y={y}
                          width={nodeWidth}
                          height={nodeHeight}
                          rx={6}
                          fill={getNodeColor(node.category, node.type)}
                          stroke="#374151"
                          strokeWidth={node.type === 'goal' || node.type === 'investment' ? "2" : "1"}
                        />
                        <text
                          x={x + nodeWidth / 2}
                          y={y + 15}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="500"
                        >
                          {node.name}
                        </text>
                        <text
                          x={x + nodeWidth / 2}
                          y={y + 26}
                          textAnchor="middle"
                          fill="white"
                          fontSize="8"
                          opacity="0.9"
                        >
                          R$ {nodeValue.toLocaleString()}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Legenda sempre visível no fullscreen */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm px-4 pb-4" style={{ minHeight: '60px' }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span>Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span>Saldo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span>Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>Metas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-500"></div>
                <span>Investimentos</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {chartContent}

            {/* Legenda - sempre visível abaixo do gráfico */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span>Saldo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Metas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-500"></div>
                <span>Investimentos</span>
              </div>
            </div>
          </>
        )}

        {/* Estatísticas resumidas */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              R$ {data.links
                .filter(link => data.nodes.find(n => n.id === link.source)?.category === 'income')
                .reduce((sum, link) => sum + link.value, 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-600">Receitas Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              R$ {data.links
                .filter(link => data.nodes.find(n => n.id === link.target)?.category === 'expense')
                .reduce((sum, link) => sum + link.value, 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-600">Despesas Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              R$ {(data.links
                .filter(link => data.nodes.find(n => n.id === link.source)?.category === 'income')
                .reduce((sum, link) => sum + link.value, 0) - 
                data.links
                .filter(link => data.nodes.find(n => n.id === link.target)?.category === 'expense')
                .reduce((sum, link) => sum + link.value, 0))
                .toLocaleString()}
            </div>
            <div className="text-gray-600">Saldo Disponível</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 