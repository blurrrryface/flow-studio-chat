import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Wifi, WifiOff, TestTube } from "lucide-react";
import { LangGraphConfig, useLangGraphAPI } from "@/hooks/useLangGraphAPI";
import { toast } from "sonner";

interface APIConfigDialogProps {
  config: LangGraphConfig;
  onConfigChange: (config: LangGraphConfig) => void;
}

export const APIConfigDialog = ({ config, onConfigChange }: APIConfigDialogProps) => {
  const [tempConfig, setTempConfig] = useState<LangGraphConfig>(config);
  const [isOpen, setIsOpen] = useState(false);
  const { testConnection, isConnected } = useLangGraphAPI(config);

  const handleSave = () => {
    onConfigChange(tempConfig);
    setIsOpen(false);
    toast.success("配置已保存");
  };

  const handleTest = async () => {
    const result = await testConnection();
    if (result) {
      toast.success("连接测试成功！");
    } else {
      toast.error("连接测试失败，请检查配置");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          API配置
          {isConnected ? (
            <Wifi className="h-4 w-4 text-success" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LangGraph API 配置
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                连接状态
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "已连接" : "未连接"}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="baseUrl">API基础URL</Label>
              <Input
                id="baseUrl"
                value={tempConfig.baseUrl}
                onChange={(e) => setTempConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="http://localhost:8000"
              />
            </div>
            
            <div>
              <Label htmlFor="graphId">Graph ID</Label>
              <Input
                id="graphId"
                value={tempConfig.graphId}
                onChange={(e) => setTempConfig(prev => ({ ...prev, graphId: e.target.value }))}
                placeholder="my-langgraph-app"
              />
            </div>
            
            <div>
              <Label htmlFor="apiKey">API密钥 (可选)</Label>
              <Input
                id="apiKey"
                type="password"
                value={tempConfig.apiKey || ""}
                onChange={(e) => setTempConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="可选的API密钥"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleTest}
              className="flex-1 gap-2"
            >
              <TestTube className="h-4 w-4" />
              测试连接
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存配置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};