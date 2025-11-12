"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search as SearchIcon, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// --- Types ---
interface Ticket {
  id: string;
  organizationId: string;
  organizationName: string;
  amount: number;
  issuedDate: string; // ISO
  status: "PENDING" | "PAID" | "REJECTED";
  bankDetails?: BankDetails | null;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  branch: string;
}

interface FetchTicketsParams {
  offset: number;
  limit: number;
  search?: string;
  status?: string; // PENDING | PAID | REJECTED
  from?: string; // ISO date
  to?: string; // ISO date
}

// --- Mock server layer ---
const seedTickets = (() => {
  const list: Ticket[] = [];
  const orgs = [
    "Green Leaf Florists",
    "Sunrise Bakery",
    "Oceanic Traders",
    "Serendipity Crafts",
    "Lotus Events",
    "Ceylon Exports",
  ];
  for (let i = 1; i <= 42; i++) {
    const org = orgs[i % orgs.length];
    const status = i % 7 === 0 ? "PAID" : i % 11 === 0 ? "REJECTED" : "PENDING";
    list.push({
      id: `ticket_${i.toString().padStart(3, "0")}`,
      organizationId: `org_${(i % orgs.length) + 1}`,
      organizationName: org,
      amount: Math.round((Math.random() * 10000 + 500) * 100) / 100,
      issuedDate: new Date(Date.now() - i * 86400000).toISOString(),
      status: status as Ticket["status"],
    });
  }
  return list;
})();

// Simulate server fetch with offset/limit, search and date filters
function mockFetchTickets(params: FetchTicketsParams): Promise<{ data: Ticket[]; total: number }> {
  const { offset, limit, search, status, from, to } = params;
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = seedTickets.slice();
      if (status) filtered = filtered.filter((t) => t.status === status);
      if (search) filtered = filtered.filter((t) => t.organizationName.toLowerCase().includes(search.toLowerCase()));
      if (from) filtered = filtered.filter((t) => new Date(t.issuedDate) >= new Date(from));
      if (to) filtered = filtered.filter((t) => new Date(t.issuedDate) <= new Date(to));
      const total = filtered.length;
      const page = filtered.slice(offset, offset + limit);
      resolve({ data: page, total });
    }, 600 + Math.random() * 400); // simulate network
  });
}

function mockFetchBankDetails(orgId: string): Promise<BankDetails> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bankName: "Bank of Ceylon",
        accountNumber: `AC-${orgId.slice(-3)}-${Math.floor(100000 + Math.random() * 900000)}`,
        branch: "Nugegoda",
      });
    }, 500 + Math.random() * 300);
  });
}

function mockMarkAsPaid(ticketId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
}

function mockRejectTicket(ticketId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
}

// --- UI Component ---
export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<"unhandled" | "handled" | "rejected">("unhandled");

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Confirmation dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"pay" | "reject" | null>(null);

  // Simple toast message
  const [toast, setToast] = useState<string | null>(null);

  const statusMap = useMemo(() => ({ unhandled: "PENDING", handled: "PAID", rejected: "REJECTED" }), []);

  useEffect(() => {
    fetchList();
    // reset offset when tab changes
    setOffset(0);
  }, [activeTab, limit]);

  useEffect(() => {
    // clear toast after 3s
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchList() {
    setLoading(true);
    const resp = await mockFetchTickets({ offset, limit, search, status: statusMap[activeTab], from: fromDate || undefined, to: toDate || undefined });
    setTickets(resp.data);
    setTotal(resp.total);
    setLoading(false);
  }

  async function openDetails(ticket: Ticket) {
    setSelected(ticket);
    setBankDetails(null);
    setDetailLoading(true);
    try {
      const bd = await mockFetchBankDetails(ticket.organizationId);
      setBankDetails(bd);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetails() {
    setSelected(null);
    setBankDetails(null);
  }

  function onSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setOffset(0);
    fetchList();
  }

  async function startMarkPaidFlow(ticket: Ticket) {
    setConfirmAction("pay");
    setConfirmOpen(true);
    setSelected(ticket);
  }

  async function startRejectFlow(ticket: Ticket) {
    setConfirmAction("reject");
    setConfirmOpen(true);
    setSelected(ticket);
  }

  async function performConfirm() {
    if (!selected || !confirmAction) return;
    setConfirmOpen(false);
    setLoading(true);

    if (confirmAction === "pay") {
      await mockMarkAsPaid(selected.id);
      // mutate local seed (in real app server will return updated list on next fetch)
      seedTickets.forEach((t) => {
        if (t.id === selected.id) t.status = "PAID";
      });
      setToast("Marked as paid");
    } else if (confirmAction === "reject") {
      await mockRejectTicket(selected.id);
      seedTickets.forEach((t) => {
        if (t.id === selected.id) t.status = "REJECTED";
      });
      setToast("Ticket rejected");
    }

    setSelected(null);
    setConfirmAction(null);
    // refresh current tab and also cause handled/rejected to refresh when user navigates
    await fetchList();
    setLoading(false);
  }

  function changePage(next: boolean) {
    const newOffset = next ? offset + limit : Math.max(0, offset - limit);
    setOffset(newOffset);
  }

  useEffect(() => {
    // fetch whenever offset, search or date filters change
    fetchList();
  }, [offset, search, fromDate, toDate]);

  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-muted-foreground">Manage transaction tickets and payments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="unhandled">Unhandled</TabsTrigger>
                <TabsTrigger value="handled">Handled</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filters */}
          <form onSubmit={onSearchSubmit} className="flex items-center space-x-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search organization..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="flex items-center space-x-2">
              <label className="sr-only">From</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <label className="sr-only">To</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">Apply</Button>
          </form>

          <Card className="mb-4">
            <CardContent className="p-0">
              <ScrollArea className="h-[420px]">
                <div className="space-y-0">
                  {loading ? (
                    <div className="p-6 text-center">Loading transactions...</div>
                  ) : tickets.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">No transactions found</div>
                  ) : (
                    tickets.map((t, idx) => (
                      <div key={t.id}>
                        <div className="p-4 hover:bg-muted/50 transition-colors flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <div className="text-sm font-medium">{t.organizationName}</div>
                                <div className="text-xs text-muted-foreground">Issued {new Date(t.issuedDate).toLocaleDateString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">LKR {t.amount.toFixed(2)}</div>
                                <Badge variant={t.status === "PENDING" ? "outline" : t.status === "PAID" ? "default" : "destructive"} className="mt-2">
                                  {t.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-3">
                              {t.status === "PENDING" ? (
                                <>
                                  <Button size="sm" onClick={() => openDetails(t)}>View & Pay</Button>
                                  <Button size="sm" variant="destructive" onClick={() => startRejectFlow(t)}>Reject</Button>
                                </>
                              ) : (
                                <Button size="sm" onClick={() => openDetails(t)}>View</Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {idx < tickets.length - 1 && <Separator />}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => changePage(false)} disabled={offset === 0}>Previous</Button>
              <Button variant="ghost" onClick={() => changePage(true)} disabled={offset + limit >= total}>Next</Button>
            </div>
            <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} — {total} total</div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) closeDetails(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? `${selected.organizationName} — ${selected.status}` : "Details"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 p-2">
            {selected ? (
              <>
                <div className="text-sm">Issued: {new Date(selected.issuedDate).toLocaleString()}</div>
                <div className="text-sm">Amount: LKR {selected.amount.toFixed(2)}</div>
                <div className="text-sm">Status: {selected.status}</div>

                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2">Bank details</div>
                  {detailLoading ? (
                    <div className="text-sm text-muted-foreground">Loading bank details...</div>
                  ) : bankDetails ? (
                    <div className="text-sm text-muted-foreground">
                      <div>{bankDetails.bankName}</div>
                      <div>Account: {bankDetails.accountNumber}</div>
                      <div>Branch: {bankDetails.branch}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No bank details available</div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter>
            {selected && selected.status === "PENDING" ? (
              <>
                <Button onClick={() => { setConfirmAction("pay"); setConfirmOpen(true); }}>Mark as Paid</Button>
                <Button variant="ghost" onClick={() => closeDetails()}>Cancel</Button>
              </>
            ) : (
              <Button onClick={() => closeDetails()}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction === "pay" ? "Confirm mark as paid" : "Confirm reject"}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="text-sm">{confirmAction === "pay" ? "Are you sure you want to mark this ticket as paid?" : "Are you sure you want to reject this ticket?"}</div>
            {selected && (
              <div className="mt-2 text-sm text-muted-foreground">{selected.organizationName} — LKR {selected.amount.toFixed(2)}</div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => performConfirm()}>{confirmAction === "pay" ? "Confirm" : "Reject"}</Button>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 rounded shadow-lg p-3 bg-white">
          <div className="text-sm">{toast}</div>
        </div>
      )}
    </div>
  );
}

