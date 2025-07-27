import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { MoneyFlow } from '@/hooks/useFinancialData';

interface MoneyFlowSankeyChartProps {
  data: MoneyFlow;
  isLoading?: boolean;
}

export function MoneyFlowSankeyChart({ data, isLoading = false }: MoneyFlowSankeyChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);



  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Dinheiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cores para diferentes categorias
  const getNodeColor = (category: string) => {
    switch (category) {
      case 'source':
        return '#10B981'; // Verde para receitas
      case 'income':
        return '#3B82F6'; // Azul para tipos de receita
      case 'sink':
        return '#EF4444'; // Vermelho para despesas
      case 'expense':
        return '#F59E0B'; // Amarelo para categorias de despesa
      default:
        return '#6B7280'; // Cinza padrão
    }
  };

  // Organizar nós por categoria para melhor layout
  const sourceNodes = data.nodes.filter(node => node.category === 'source');
  const incomeNodes = data.nodes.filter(node => node.category === 'income');
  const sinkNodes = data.nodes.filter(node => node.category === 'sink');
  const expenseNodes = data.nodes.filter(node => node.category === 'expense');

  // Calcular posições dos nós
  const nodeWidth = 100;
  const nodeHeight = 35;
  const columnSpacing = 160;
  const rowSpacing = 45;

  // Função para calcular posição Y de um nó
  const getNodeY = (nodeId: string, category: string) => {
    const nodesInCategory = data.nodes.filter(n => n.category === category);
    const nodeIndex = nodesInCategory.findIndex(n => n.id === nodeId);
    return 50 + nodeIndex * rowSpacing;
  };

  // Função para calcular posição X de um nó
  const getNodeX = (category: string) => {
    switch (category) {
      case 'source': return 30;
      case 'income': return 30 + columnSpacing;
      case 'sink': return 30 + columnSpacing * 2;
      case 'expense': return 30 + columnSpacing * 3;
      default: return 30;
    }
  };

  // Calcular largura máxima dos links para normalização
  const maxLinkValue = Math.max(...data.links.map(link => link.value));
  const minLinkWidth = 1;
  const maxLinkWidth = 15;

  // Calcular largura total do SVG baseado no número de colunas
  const svgWidth = 30 + columnSpacing * 4 + 50; // 4 colunas + padding
  
  // Calcular altura baseada no número de nós (máximo de nós em qualquer coluna)
  const maxNodesInColumn = Math.max(
    sourceNodes.length,
    incomeNodes.length,
    sinkNodes.length,
    expenseNodes.length
  );
  const svgHeight = isFullscreen 
    ? Math.max(200, 50 + maxNodesInColumn * rowSpacing + 50) // Altura proporcional no fullscreen
    : 320; // Altura fixa no modo minimizado

  const chartContent = (
    <div className={`relative ${isFullscreen ? 'h-auto' : 'h-64'} overflow-hidden`}>
      {/* Indicador de scroll horizontal - apenas no modo minimizado */}
      {!isFullscreen && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span>Arraste para ver mais</span>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
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

          {/* Renderizar links */}
          {data.links.map((link, index) => {
            const sourceNode = data.nodes.find(n => n.id === link.source);
            const targetNode = data.nodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode) return null;

            const sourceX = getNodeX(sourceNode.category) + nodeWidth;
            const sourceY = getNodeY(sourceNode.id, sourceNode.category) + nodeHeight / 2;
            const targetX = getNodeX(targetNode.category);
            const targetY = getNodeY(targetNode.id, targetNode.category) + nodeHeight / 2;

            // Calcular largura do link baseada no valor
            const linkWidth = Math.max(minLinkWidth, (link.value / maxLinkValue) * maxLinkWidth);

            return (
              <path
                key={index}
                d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY} ${targetX} ${targetY}`}
                stroke={`url(#gradient-${index})`}
                strokeWidth={linkWidth}
                fill="none"
                opacity="0.5"
              />
            );
          })}

          {/* Renderizar nós */}
          {data.nodes.map((node) => {
            const x = getNodeX(node.category);
            const y = getNodeY(node.id, node.category);

            // Calcular valor total do nó baseado na categoria
            // Lógica: mostrar o valor que representa o nó no fluxo
            let nodeValue = 0;
            
            if (node.category === 'source') {
              // Para nós fonte (Receitas), somar apenas links outgoing
              nodeValue = data.links
                .filter(link => link.source === node.id)
                .reduce((sum, link) => sum + link.value, 0);
            } else if (node.category === 'income') {
              // Para nós de receita (Salário, Freelance, etc.), somar apenas links incoming
              nodeValue = data.links
                .filter(link => link.target === node.id)
                .reduce((sum, link) => sum + link.value, 0);
            } else if (node.category === 'sink') {
              // Para nós de destino, diferenciar por tipo:
              // - "expenses": somar links outgoing (valor gasto)
              // - "savings", "investments_out": somar links incoming (valor poupado/aplicado)
              if (node.id === 'expenses') {
                nodeValue = data.links
                  .filter(link => link.source === node.id)
                  .reduce((sum, link) => sum + link.value, 0);
              } else {
                // Para poupança e aplicações, somar links incoming
                nodeValue = data.links
                  .filter(link => link.target === node.id)
                  .reduce((sum, link) => sum + link.value, 0);
              }
            } else if (node.category === 'expense') {
              // Para nós de categoria de despesa, somar apenas links incoming
              nodeValue = data.links
                .filter(link => link.target === node.id)
                .reduce((sum, link) => sum + link.value, 0);
            }
            


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
        </svg>
      </div>
    </div>
  );

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50 bg-white shadow-2xl mb-20' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Fluxo de Dinheiro
        </CardTitle>
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
      </CardHeader>
      <CardContent className={isFullscreen ? '' : ''}>
        {chartContent}

        {/* Legenda - sempre visível abaixo do gráfico */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Tipos de Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Despesas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span>Categorias</span>
          </div>
        </div>

        {/* Estatísticas resumidas */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {data.links
                .filter(link => data.nodes.find(n => n.id === link.source)?.category === 'source')
                .reduce((sum, link) => sum + link.value, 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-600">Receitas Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              R$ {data.links
                .filter(link => data.nodes.find(n => n.id === link.target)?.category === 'expense')
                .reduce((sum, link) => sum + link.value, 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-600">Despesas Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              R$ {data.links
                .filter(link => {
                  const targetNode = data.nodes.find(n => n.id === link.target);
                  return targetNode?.category === 'sink' && 
                         (targetNode.id === 'savings' || targetNode.id === 'investments_out');
                })
                .reduce((sum, link) => sum + link.value, 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-600">Poupança</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 