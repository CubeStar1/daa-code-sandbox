"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function ProviderInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Provider Information">
          <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-6 shadow-xl rounded-lg" side="bottom" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg leading-tight mb-1">
              Execution Providers
            </h4>
            <div className="flex items-center gap-2 bg-red-500 px-2 py-1 rounded text-white">
              <strong>Rate Limit:</strong> 1 submission/minute
            </div>
          </div>
          
          <hr className="my-3"/>

          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-md">
              <h5 className="font-medium mb-0.5">OneCompiler</h5>
              <p className="text-sm text-muted-foreground">
                Generally reliable and suitable for most use cases. 50 submissions/day
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <h5 className="font-medium mb-0.5">Judge0</h5>
              <p className="text-sm text-muted-foreground">
                Can offer faster execution times. May have stricter rate limits. A good alternative if OneCompiler is experiencing issues or is rate-limited. 1000 submissions/month
              </p>
            </div>
          </div>

          <div className="pt-3 mt-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note on Rate Limits:</strong> Both services have API rate limits. Our application also has a general rate limit of 1 request/minute for API calls (handled by the Vercel firewall). If you encounter repeated errors or messages about too many requests, please try switching the provider or allow a few minutes before retrying.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
