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
import { Input } from "@/components/ui/input";
import { TrendingUp, LayoutGrid, ListOrdered, PieChart, Target, User } from "lucide-react";
import { PropsWithChildren } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { ExpandableChatInterface } from "@/components/ExpandableChatInterface";

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
            <Input placeholder="Buscar..." className="mx-2" />
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

      <SidebarInset>
        <header className="sticky top-0 z-20 bg-white/60 supports-[backdrop-filter]:bg-white/40 backdrop-blur border-b border-gray-200/80 dark:bg白/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
          <div className="h-12 px-3 flex items-center gap-2">
            <SidebarTrigger />
            <div className="text-sm text-gray-600">{isDashboard ? "Dashboard" : ""}</div>
          </div>
        </header>

        <div className="relative min-h-[calc(100svh-3rem)] pb-28">
          {children}

          {/* Dock do chat dentro do OUTLET */}
          <ExpandableChatInterface
            messages={messages}
            onSendMessage={(m) => processUserMessage(m)}
            isProcessing={isProcessing}
            withinOutlet
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;

