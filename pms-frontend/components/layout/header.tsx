'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/layout/mode-toggle';

export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b bg-white dark:bg-zinc-900">
            <div className="flex flex-1 justify-between px-6">
                <div className="flex flex-1 items-center">
                    <div className="w-full max-w-md">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                            </div>
                            <Input
                                type="search"
                                className="pl-10"
                                placeholder="Search bookings, customers..."
                            />
                        </div>
                    </div>
                </div>
                <div className="ml-4 flex items-center gap-4">
                    <div className="mr-2">
                        <ModeToggle />
                    </div>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                        </span>
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800 cursor-pointer">
                        <User className="h-5 w-5 text-zinc-500" />
                    </div>
                </div>
            </div>
        </header>
    );
}
