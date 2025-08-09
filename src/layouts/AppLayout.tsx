import { Link, useRoute } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input as SidebarSearchInput } from "@/components/ui/input";
import { TrendingUp, LayoutGrid, ListOrdered, PieChart, Target, User } from "lucide-react";
import { PropsWithChildren } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { ChatBar } from "@/components/ChatBar";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

export function AppLayout({ children }: PropsWithChildren) {
  const { messages, isProcessing, processUserMessage } = useAIChat();
  const [isDashboard] = useRoute("/");

  return (
    <SidebarProvider>
      <Sidebar className="bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-r border-gray-200/80 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="flex h-full flex-col">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="font-semibold tracking-tight">FinanceAI</div>
            </div>
            <SidebarSearchInput placeholder="Buscar..." className="mx-2" />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/">
                      <SidebarMenuButton asChild isActive={!!isDashboard}>
                        <a>
                          <LayoutGrid />
                          <span>Dashboard</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/transactions">
                      <SidebarMenuButton asChild>
                        <a>
                          <ListOrdered />
                          <span>Transações</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/reports">
                      <SidebarMenuButton asChild>
                        <a>
                          <PieChart />
                          <span>Relatórios</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/goals">
                      <SidebarMenuButton asChild>
                        <a>
                          <Target />
                          <span>Metas</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/profile">
                      <SidebarMenuButton asChild>
                        <a>
                          <User />
                          <span>Perfil</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="outline" className="justify-start">
              Configurações
            </Button>
            <Button className="justify-start">Upgrade</Button>
          </SidebarFooter>
        </div>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        {/* Top Bar fora do fluxo do conteúdo (sempre no topo) */}
        <div className="sticky top-0 z-30">
          <header className="supports-[backdrop-filter]:bg-white/40 backdrop-blur border-b border-gray-200/60 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10 bg-transparent">
            <div className="h-16 px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center gap-3 justify-between mx-auto max-w-7xl xl:max-w-[90rem] 2xl:max-w-[96rem]">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <div className="text-2xl font-semibold tracking-tight">Dashboard</div>
              </div>
              <div className="flex-1 max-w-xl md:max-w-2xl xl:max-w-3xl">
                <Input placeholder="Buscar qualquer coisa…" className="rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                {/* Botão Modo Demo elegante */}
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-purple-100/70 text-purple-700 ring-1 ring-purple-200">
                  <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                  Modo Demo
                </div>
                {/* Usuário compacto */}
                <button className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-gray-100/70 ring-1 ring-gray-200 hover:bg-gray-100">
                  <Avatar className="h-7 w-7" />
                  <span className="text-sm">João Silva</span>
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Conteúdo com padding-top para não ficar sob o top bar (sem fundo) */}
        <div className="relative pt-12 min-h-[100svh] pb-28 bg-transparent">
          {children}

          {/* Chat estilo AI Studio fixo ao rodapé do conteúdo */}
          <ChatBar
            onSend={(m) => processUserMessage(m)}
            isProcessing={isProcessing}
            suggestions={["Registrar despesa", "Relatório mensal", "Comparar meses"]}
            messages={messages}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;

