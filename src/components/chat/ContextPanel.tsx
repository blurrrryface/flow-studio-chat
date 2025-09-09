import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversationState } from "@/types/chat";
import { Brain, GitBranch, Database, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContextPanelProps {
  conversationState: ConversationState;
  isVisible: boolean;
}

export const ContextPanel = ({ conversationState, isVisible }: ContextPanelProps) => {
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

          {/* Available Branches */}
          {conversationState.branches.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-warning" />
                  可用分支
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {conversationState.branches.map((branch, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {branch}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Memory */}
          {Object.keys(conversationState.memory).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  记忆存储
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(conversationState.memory).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      <span className="ml-1 text-foreground">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {Object.keys(conversationState.metadata).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">元数据</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(conversationState.metadata).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      <span className="ml-1 text-foreground">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
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