
import { useQuery } from "@tanstack/react-query";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LifeBuoy, Clock, ChevronRight,
    AlertCircle, MessageSquare, Bot
} from "lucide-react";
import { format } from "date-fns";

export default function SupportInternal() {
    const { data: tickets, isLoading } = useQuery<any[]>({
        queryKey: ["/api/internal/support/tickets"], // In a real app, this might fetch all for admins
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Support Triage</h1>
                    <p className="text-muted-foreground">Monitor and respond to AI-categorized support requests.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="px-4 py-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Avg Response: 14m</span>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <p>Loading tickets...</p>
                ) : tickets?.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-12 text-center">
                        <LifeBuoy className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <CardTitle>Queue is Empty</CardTitle>
                        <CardDescription>No active support tickets requiring attention.</CardDescription>
                    </Card>
                ) : (
                    tickets?.map((ticket) => (
                        <Card key={ticket.id} className="overflow-hidden border-l-4 border-l-primary group cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                                <div className="p-6 md:w-2/3">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Ticket #{ticket.id.slice(0, 8)}</span>
                                                <span>•</span>
                                                <span>{format(new Date(ticket.createdAt), "PPp")}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={ticket.priority === 'urgent' ? 'destructive' : 'default'}
                                            className="capitalize"
                                        >
                                            {ticket.priority}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-foreground line-clamp-2 mb-4">{ticket.description}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {ticket.aiTags?.map((tag: string) => (
                                            <Badge key={tag} variant="outline" className="text-[10px] uppercase font-bold tracking-tighter px-1.5 py-0">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 md:w-1/3 bg-muted/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Bot className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Intelligence</span>
                                    </div>
                                    <div className="bg-background rounded p-3 border text-sm italic text-muted-foreground shadow-sm">
                                        "{ticket.aiSummary}"
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Status: <span className="text-foreground font-medium capitalize">{ticket.status}</span></span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
