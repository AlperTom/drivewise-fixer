import { Progress } from "@/components/ui/progress";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  validation?: {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
    isLeaked?: boolean;
  };
}

export function PasswordStrengthMeter({ password, validation }: PasswordStrengthMeterProps) {
  const getStrengthValue = (strength: string) => {
    switch (strength) {
      case 'weak': return 25;
      case 'medium': return 65;
      case 'strong': return 100;
      default: return 0;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-destructive';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'weak': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'medium': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'strong': return <ShieldCheck className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!password) return null;

  const strength = validation?.strength || 'weak';
  const strengthValue = getStrengthValue(strength);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {getStrengthIcon(strength)}
        <span className="text-sm font-medium capitalize">
          Password Strength: {strength}
        </span>
      </div>
      
      <Progress 
        value={strengthValue} 
        className={cn("h-2", getStrengthColor(strength))}
      />
      
      {validation?.errors && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}
      
      {validation?.isLeaked && (
        <p className="text-sm text-destructive font-medium flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          ⚠️ This password has been found in data breaches
        </p>
      )}
    </div>
  );
}