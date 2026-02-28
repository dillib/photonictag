import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Package,
    Activity,
    Database,
    Search,
    LayoutDashboard,
    ShieldAlert,
    HelpCircle,
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <div className="w-full max-w-sm hidden sm:block">
                <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-between w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search registry...
                    </span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Platform Navigation">
                        <CommandItem onSelect={() => runCommand(() => setLocation("/"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Intelligence Hub</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/products"))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Digital Twin Registry</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/iot-devices"))}>
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Optical Sensor Fleet</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/integrations"))}>
                            <Database className="mr-2 h-4 w-4" />
                            <span>Enterprise Integrations (SAP)</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Quick Actions">
                        <CommandItem onSelect={() => runCommand(() => setLocation("/products/new"))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Enroll New Twin</span>
                            <CommandShortcut>⌘E</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/public/scan"))}>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Simulate Public Scan</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Internal Management">
                        <CommandItem onSelect={() => runCommand(() => setLocation("/internal"))}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Internal Hub</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/internal/support"))}>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>AI Support Agent</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
