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
import { TrendingUp, LayoutGrid, ListOrdered, PieChart, Target, User } from "lucide-react";
import { PropsWithChildren } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { ChatBar } from "@/components/ChatBar";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

export function AppLayout({ children }: PropsWithChildren) {
  const { messages, isProcessing, processUserMessage } = useAIChat();
  const [isDashboard] = useRoute("/");
  const [isTransactions] = useRoute("/transactions");
  const [isReports] = useRoute("/reports");
  const [isGoals] = useRoute("/goals");
  const [isProfile] = useRoute("/profile");

  return (
      <SidebarProvider>
      <Sidebar className="gradient-sidebar text-white shadow-2xl !rounded-r-2xl border-none">
        <div className="flex h-full flex-col">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="bg-white/20 p-2 rounded-xl ring-1 ring-white/25">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="font-semibold tracking-tight">FinanceAI</div>
            </div>
          </SidebarHeader>
          <SidebarSeparator className="bg-white/20" />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/80">Navegação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/">
                      <SidebarMenuButton asChild isActive={!!isDashboard} className="hover:bg-white/10 data-[active=true]:bg-white">
                        <a className="text-white data-[active=true]:!text-[#111827]">
                          <LayoutGrid />
                          <span>Dashboard</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/transactions">
                      <SidebarMenuButton asChild isActive={!!isTransactions} className="hover:bg-white/10 data-[active=true]:bg-white">
                        <a className="text-white data-[active=true]:!text-[#111827]" aria-current={isTransactions ? 'page' : undefined}>
                          <ListOrdered />
                          <span>Transações</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/reports">
                      <SidebarMenuButton asChild isActive={!!isReports} className="hover:bg-white/10 data-[active=true]:bg-white">
                        <a className="text-white data-[active=true]:!text-[#111827]" aria-current={isReports ? 'page' : undefined}>
                          <PieChart />
                          <span>Relatórios</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/goals">
                      <SidebarMenuButton asChild isActive={!!isGoals} className="hover:bg-white/10 data-[active=true]:bg-white">
                        <a className="text-white data-[active=true]:!text-[#111827]" aria-current={isGoals ? 'page' : undefined}>
                          <Target />
                          <span>Metas</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/profile">
                      <SidebarMenuButton asChild isActive={!!isProfile} className="hover:bg-white/10 data-[active=true]:bg-white">
                        <a className="text-white data-[active=true]:!text-[#111827]" aria-current={isProfile ? 'page' : undefined}>
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
            <Button variant="outline" className="justify-start bg-white/10 hover:bg-white/15 text-white border-white/20">
              Configurações
            </Button>
            <Button className="justify-start bg-white text-[#00A38D] hover:bg-gray-50">Upgrade</Button>
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
              <div className="flex-1 max-w-xl md:max-w-2xl xl:max-w-3xl" />
              <div className="flex items-center gap-3">
                {/* Chip Modo Demo - ciano da paleta */}
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-[#E6F0F6] text-[#00A89C] ring-1 ring-[#00C6B8]/30">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#00C6B8]" />
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
        <div className="relative min-h-[100svh] pt-4 pb-28 bg-transparent">
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

