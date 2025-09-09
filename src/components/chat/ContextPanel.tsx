import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversationState } from "@/types/chat";
import { Brain, GitBranch, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ContextPanelProps {
  conversationState: ConversationState;
  isVisible: boolean;
  onBranchSelect?: (branch: string) => void;
}

export const ContextPanel = ({ conversationState, isVisible, onBranchSelect }: ContextPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="w-80 border-l bg-muted/30">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          对话上下文
        </h3>
      </div>
      
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Current State */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                当前状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-sm">
                {conversationState.currentState}
              </Badge>
            </CardContent>
          </Card>

          {/* Branch Tree */}
          {conversationState.branches.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-warning" />
                  对话分支树
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conversationState.branches.map((branch, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/60" />
                        <div className={`w-4 h-0.5 ${index === conversationState.branches.length - 1 ? 'bg-muted' : 'bg-primary/30'}`} />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-6 px-2 text-xs justify-start hover:bg-primary/10 ${
                          branch === conversationState.currentState ? 'bg-primary/20 text-primary' : ''
                        }`}
                        onClick={() => onBranchSelect?.(branch)}
                      >
                        {branch}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};