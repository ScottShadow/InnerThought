import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
  isSubscribed?: boolean;
}

export default function Navbar() {
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    refetchOnWindowFocus: true,
  });
  
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout");
      window.location.href = "/landing";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  return (
    <nav className="px-4 py-3 bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <span className="text-xl font-bold text-blue-600 cursor-pointer">MindJournal</span>
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link href="/">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Home</span>
            </Link>
            <Link href="/entries">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Journal</span>
            </Link>
            <Link href="/insights">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Insights</span>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-9 w-9 rounded-full">
                  <Avatar>
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.displayName || user.username} />
                    ) : (
                      <AvatarFallback>
                        {getInitials(user.displayName || user.username)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-semibold">
                  {user.displayName || user.username}
                </DropdownMenuItem>
                {user.isSubscribed ? (
                  <DropdownMenuItem className="text-green-600">
                    Premium Member
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/subscribe")}>
                    Upgrade to Premium
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 space-y-2 px-2 pt-2 pb-3 border-t">
          <Link href="/">
            <span className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">Home</span>
          </Link>
          <Link href="/entries">
            <span className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">Journal</span>
          </Link>
          <Link href="/insights">
            <span className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">Insights</span>
          </Link>
          {user && (
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}