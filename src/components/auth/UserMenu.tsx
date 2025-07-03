import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard, LogOut, Crown, Shield } from "lucide-react";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    plan: "free" | "family" | "premium";
    questionsRemaining?: number;
  };
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free": return "secondary";
      case "family": return "default";
      case "premium": return "outline";
      default: return "secondary";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "free": return <Shield className="h-3 w-3" />;
      case "family": return <User className="h-3 w-3" />;
      case "premium": return <Crown className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 animate-scale-in" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <Badge variant={getPlanColor(user.plan)} className="flex items-center gap-1 text-xs">
                {getPlanIcon(user.plan)}
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.plan === "free" && user.questionsRemaining !== undefined && (
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Questions left:</span>
                  <span className="font-medium text-primary">{user.questionsRemaining}/5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-gradient-primary h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(user.questionsRemaining / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:bg-accent">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-accent">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-accent">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}