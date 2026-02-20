
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Users, Rocket, Activity, LifeBuoy,
    TrendingUp, AlertCircle, CheckCircle2,
    Plus, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function InternalDashboard() {
    const { toast } = useToast();
    const [customerName, setCustomerName] = useState("");

    // CRM Queries
    const { data: accounts, isLoading: accountsLoading } = useQuery<any[]>({
        queryKey: ["/api/internal/crm/accounts"],
    });

    // Persona Queries
    const { data: personas } = useQuery<any[]>({
        queryKey: ["/api/internal/demos/personas"],
    });

    // Ops Queries
    const { data: health } = useQuery<any>({
        queryKey: ["/api/internal/ops/health"],
    });

    // Mutation for generating demos
    const generateDemo = useMutation({
        mutationFn: async (personaName: string) => {
            if (!customerName) throw new Error("Please enter a customer name");
            await apiRequest("POST", "/api/internal/demos/generate", {
                personaName,
                customerName
            });
        },
        onSuccess: () => {
            toast({
                title: "Demo Created",
                description: `Successfully spun up demo organization for ${customerName}.`,
            });
            setCustomerName("");
        },
        onError: (error: any) => {
            toast({
                title: "Generation Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Internal Command Center</h1>
                    <p className="text-muted-foreground">Manage platform growth, sales enablement, and health.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="flex gap-1 py-1 px-3">
                        <Activity className="h-4 w-4 text-green-500" />
                        System {health?.status || "Checking..."}
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="crm" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="crm" className="flex gap-2">
                        <Users className="h-4 w-4" /> CRM
                    </TabsTrigger>
                    <TabsTrigger value="demos" className="flex gap-2">
                        <Rocket className="h-4 w-4" /> Demos
                    </TabsTrigger>
                    <TabsTrigger value="ops" className="flex gap-2">
                        <TrendingUp className="h-4 w-4" /> Ops
                    </TabsTrigger>
                </TabsList>

                {/* CRM TAB */}
                <TabsContent value="crm" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{accounts?.length || 0}</div>
                                <p className="text-xs text-muted-foreground">+2 from last month</p>
                            </CardContent>
                        </Card>
                        {/* Add more metric cards here */}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border bg-background shadow">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 uppercase text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3">Account Name</th>
                                    <th className="px-4 py-3">Industry</th>
                                    <th className="px-4 py-3">Tier</th>
                                    <th className="px-4 py-3">Health Score</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts?.map((acc) => (
                                    <tr key={acc.id} className="border-b hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-4 font-medium">{acc.name}</td>
                                        <td className="px-4 py-4">{acc.industry}</td>
                                        <td className="px-4 py-4 capitalize">{acc.accountTier}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${acc.healthScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${acc.healthScore}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold">{acc.healthScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 capitalize">
                                            <Badge variant={acc.status === 'active' ? 'default' : 'secondary'}>{acc.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* DEMO FACTORY TAB */}
                <TabsContent value="demos" className="mt-6">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Launch New Demo Organization</CardTitle>
                            <CardDescription>
                                Create a pre-seeded environment for a prospect based on their industry persona.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium">Prospective Customer Name</label>
                                    <Input
                                        placeholder="e.g. Acme Manufacturing"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {personas?.map((persona) => (
                            <Card key={persona.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        {persona.name}
                                        <Rocket className="h-5 w-5 text-primary" />
                                    </CardTitle>
                                    <CardDescription>{persona.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Features Included</h4>
                                        <ul className="text-sm space-y-1">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Pre-shipped products</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Configured IoT sensors</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Material passports</li>
                                        </ul>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    <Button
                                        className="w-full"
                                        disabled={generateDemo.isPending || !customerName}
                                        onClick={() => generateDemo.mutate(persona.name)}
                                    >
                                        {generateDemo.isPending ? "Spawning..." : "Launch This Environment"}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* OPS TAB */}
                <TabsContent value="ops" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm text-muted-foreground">API Latency</span>
                                    <span className="font-mono">42ms</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm text-muted-foreground">DB Connection Pool</span>
                                    <span className="font-mono text-green-600">Healthy</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm text-muted-foreground">Uptime</span>
                                    <span className="font-mono">99.98%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Global Usage Activity</CardTitle>
                                <CardDescription>Live feed of platform interactions across all organizations.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                                    <div className="text-center space-y-1">
                                        <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">Scan volume visualization placeholder</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
