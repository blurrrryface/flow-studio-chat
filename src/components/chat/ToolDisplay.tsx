import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  Search, 
  FileText, 
  Globe, 
  Calculator, 
  Code, 
  Database,
  Brain,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
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
    'Search the internet with Serper': Globe,
    'serper_search': Globe,
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

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'success':
      return 'text-success';
    case 'error':
      return 'text-destructive';
    case 'pending':
      return 'text-warning';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-3 w-3" />;
    case 'error':
      return <XCircle className="h-3 w-3" />;
    case 'pending':
      return <Loader2 className="h-3 w-3 animate-spin" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const formatArgs = (args: Record<string, any> | string) => {
  if (typeof args === 'string') {
    try {
      const parsed = JSON.parse(args);
      return Object.entries(parsed)
        .map(([key, value]) => {
          if (typeof value === 'string' && value.length > 100) {
            return `${key}: "${value.substring(0, 100)}..."`;
          }
          return `${key}: ${JSON.stringify(value)}`;
        })
        .join(', ');
    } catch {
      return args.length > 100 ? `${args.substring(0, 100)}...` : args;
    }
  }
  
  return Object.entries(args)
    .map(([key, value]) => {
      if (typeof value === 'string' && value.length > 100) {
        return `${key}: "${value.substring(0, 100)}..."`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .join(', ');
};

const formatResult = (result: any): string => {
  if (!result) return '';
  
  if (typeof result === 'string') {
    return result.length > 200 ? `${result.substring(0, 200)}...` : result;
  }
  
  if (typeof result === 'object') {
    try {
      const str = JSON.stringify(result, null, 2);
      return str.length > 200 ? `${str.substring(0, 200)}...` : str;
    } catch {
      return '[Object]';
    }
  }
  
  return String(result);
};

export const ToolDisplay = ({ tools, state, className }: ToolDisplayProps) => {
  if (!tools || tools.length === 0) return null;

  return (
    <Card className={cn("mb-3 border-l-4 border-l-primary animate-slide-up", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {state === 'thinking' ? (
            <Brain className="h-4 w-4 animate-pulse" />
          ) : state === 'tool_calling' ? (
            <Wrench className="h-4 w-4 animate-pulse text-primary" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
          {state === 'tool_calling' ? '工具调用中' : 'Agent Actions'}
          {state && (
            <Badge variant="outline" className="ml-auto">
              {state === 'tool_calling' ? '执行中' : state}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {tools.map((tool, index) => (
          <div
            key={index}
            className={cn(
              "p-3 rounded-lg border transition-all duration-200",
              tool.status === 'pending' && "bg-primary/5 border-primary/20 animate-pulse-subtle",
              tool.status === 'success' && "bg-success/5 border-success/20",
              tool.status === 'error' && "bg-destructive/5 border-destructive/20",
              !tool.status && "bg-muted/30 border-border"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getToolIcon(tool.name)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm truncate">{tool.name}</span>
                  <div className={cn("flex items-center gap-1", getStatusColor(tool.status))}>
                    {getStatusIcon(tool.status)}
                    <span className="text-xs font-medium">
                      {tool.status === 'pending' ? '执行中' : 
                       tool.status === 'success' ? '完成' :
                       tool.status === 'error' ? '失败' : '等待'}
                    </span>
                  </div>
                </div>
                
                {/* Progress bar for pending tools */}
                {tool.status === 'pending' && (
                  <div className="mb-2">
                    <Progress value={undefined} className="h-1" />
                  </div>
                )}
                
                {tool.args && (
                  <div className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">参数: </span>
                    <code className="bg-background/50 px-1 py-0.5 rounded text-xs">
                      {formatArgs(tool.args)}
                    </code>
                  </div>
                )}
                
                {tool.result && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">结果: </span>
                    <div className="mt-1 p-2 bg-background/50 rounded border">
                      <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                        {formatResult(tool.result)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};