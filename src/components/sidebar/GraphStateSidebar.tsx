import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationState } from "@/types/chat";
import { 
  GitBranch, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Network
} from "lucide-react";

interface GraphStateSidebarProps {
  conversationState?: ConversationState;
  currentNode?: string;
  branches?: Array<{
    id: string;
    name: string;
    status: 'active' | 'completed' | 'pending' | 'error';
  }>;
}

export function GraphStateSidebar({ 
  conversationState, 
  currentNode, 
  branches = [] 
}: GraphStateSidebarProps) {
  const { open } = useSidebar();

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-primary" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Pause className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Sidebar className={open ? "w-80" : "w-14"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="p-4 space-y-4">
        {open && (
          <>
            {/* Current State */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Graph State
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversationState ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Session ID</span>
                      <span className="text-xs font-mono">{conversationState.id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Current State</span>
                      <Badge variant="outline" className="text-xs">
                        {conversationState.currentState}
                      </Badge>
                    </div>
                    {currentNode && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Active Node</span>
                        <Badge variant="secondary" className="text-xs">
                          {currentNode}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No active session</p>
                )}
              </CardContent>
            </Card>

            {/* Memory Overview */}
            {conversationState?.memory && Object.keys(conversationState.memory).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Memory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(conversationState.memory).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate">{key}</span>
                        <span className="font-mono max-w-20 truncate">
                          {typeof value === 'object' ? '[Object]' : String(value).slice(0, 10)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Branch Tree */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {open && "Execution Branches"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {branches.map((branch) => (
                <SidebarMenuItem key={branch.id}>
                  <SidebarMenuButton className="flex items-center gap-2 p-2">
                    {getNodeIcon(branch.status)}
                    {open && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate">
                            {branch.name}
                          </span>
                          <Badge 
                            className={`text-xs ${getStatusColor(branch.status)}`}
                            variant="secondary"
                          >
                            {branch.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {branches.length === 0 && open && (
                <SidebarMenuItem>
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    No branches detected
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}