import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TooltipIconButtonProps = ButtonProps & {
  tooltip: string;
};

export const TooltipIconButton = forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ children, tooltip, ...props }, ref) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} size="icon" {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
});
TooltipIconButton.displayName = "TooltipIconButton";