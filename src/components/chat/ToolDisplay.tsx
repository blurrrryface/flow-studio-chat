import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Search, 
  FileText, 
  Globe, 
  Calculator, 
  Code, 
  Database,
  Brain,
  Loader2
} from "lucide-react";

interface ToolCall {
  name: string;
  args?: Record<string, any>;
  result?: any;
  status?: 'pending' | 'success' | 'error';
}

interface ToolDisplayProps {
  tools: ToolCall[];
  state?: string;
  className?: string;
}

const getToolIcon = (toolName: string) => {
  const iconMap: Record<string, any> = {
    'search': Search,
    'web_search': Globe,
    'calculator': Calculator,
    'code_executor': Code,
    'database_query': Database,
    'file_reader': FileText,
    'tavily_search_results_json': Globe,
    'python': Code,
    'sql': Database,
  };
  
  const IconComponent = iconMap[toolName.toLowerCase()] || Wrench;
  return <IconComponent className="h-4 w-4" />;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'bg-success text-success-foreground';
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    case 'pending':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const formatArgs = (args: Record<string, any>) => {
  return Object.entries(args)
    .map(([key, value]) => {
      if (typeof value === 'string' && value.length > 100) {
        return `${key}: "${value.substring(0, 100)}..."`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .join(', ');
};

export const ToolDisplay = ({ tools, state, className }: ToolDisplayProps) => {
  if (!tools || tools.length === 0) return null;

  return (
    <Card className={cn("mb-3 border-l-4 border-l-primary", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {state === 'thinking' ? (
            <Brain className="h-4 w-4 animate-pulse" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
          Agent Actions
          {state && (
            <Badge variant="outline" className="ml-auto">
              {state}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {tools.map((tool, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getToolIcon(tool.name)}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{tool.name}</span>
                {tool.status && (
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getStatusColor(tool.status))}
                  >
                    {tool.status === 'pending' ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    {tool.status}
                  </Badge>
                )}
              </div>
              
              {tool.args && (
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Input: </span>
                  <code className="bg-background/50 px-1 py-0.5 rounded">
                    {formatArgs(tool.args)}
                  </code>
                </div>
              )}
              
              {tool.result && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Output: </span>
                  <div className="mt-1 p-2 bg-background/50 rounded border">
                    <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                      {typeof tool.result === 'string' 
                        ? tool.result.length > 200 
                          ? `${tool.result.substring(0, 200)}...`
                          : tool.result
                        : JSON.stringify(tool.result, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};