'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Search,
  Filter,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Reply,
  Archive,
  Star,
  StarOff,
  RefreshCw,
  Send,
  Paperclip,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';

interface Inquiry {
  id: string;
  subject: string;
  message: string;
  adminName: string;
  adminEmail: string;
  containerName: string;
  containerId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'general';
  createdAt: string;
  updatedAt: string;
  isStarred: boolean;
  responses: InquiryResponse[];
  attachments?: string[];
}

interface InquiryResponse {
  id: string;
  message: string;
  author: string;
  authorType: 'admin' | 'system-admin';
  timestamp: string;
}

export default function InquiriesPage() {
  const { containers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Mock inquiry data - TODO: Replace with actual API calls
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 'inq_001',
      subject: 'Unable to access member analytics dashboard',
      message: 'Hi, I\'m having trouble accessing the new analytics dashboard. When I click on the Analytics tab, I get a 404 error. This started happening after the recent update. Could you please help me resolve this issue?',
      adminName: 'Sarah Johnson',
      adminEmail: 'admin@stanford.edu',
      containerName: 'Stanford University',
      containerId: 'cnt_001',
      priority: 'high',
      status: 'open',
      category: 'technical',
      createdAt: '2024-01-22T10:30:00Z',
      updatedAt: '2024-01-22T10:30:00Z',
      isStarred: true,
      responses: []
    },
    {
      id: 'inq_002',
      subject: 'Request for additional storage space',
      message: 'Our alumni database has grown significantly, and we\'re approaching our storage limit. We would like to upgrade our storage allocation. What are our options and pricing?',
      adminName: 'David Chen',
      adminEmail: 'alumni@mit.edu',
      containerName: 'MIT Alumni Network',
      containerId: 'cnt_002',
      priority: 'medium',
      status: 'in-progress',
      category: 'billing',
      createdAt: '2024-01-21T14:15:00Z',
      updatedAt: '2024-01-22T09:20:00Z',
      isStarred: false,
      responses: [
        {
          id: 'resp_001',
          message: 'Thank you for reaching out. I\'ll review your current usage and provide you with upgrade options within 24 hours.',
          author: 'System Admin',
          authorType: 'system-admin',
          timestamp: '2024-01-22T09:20:00Z'
        }
      ]
    },
    {
      id: 'inq_003',
      subject: 'Feature request: Custom event registration forms',
      message: 'We would love to have the ability to create custom registration forms for our events. Currently, the standard form doesn\'t capture all the information we need for our specialized events.',
      adminName: 'Maria Rodriguez',
      adminEmail: 'eng@berkeley.edu',
      containerName: 'Berkeley Engineering',
      containerId: 'cnt_003',
      priority: 'low',
      status: 'resolved',
      category: 'feature-request',
      createdAt: '2024-01-20T16:45:00Z',
      updatedAt: '2024-01-21T11:30:00Z',
      isStarred: false,
      responses: [
        {
          id: 'resp_002',
          message: 'Great suggestion! Custom event forms are actually planned for our next major release (v1.4.0). I\'ll add your specific requirements to our development roadmap.',
          author: 'System Admin',
          authorType: 'system-admin',
          timestamp: '2024-01-21T11:30:00Z'
        }
      ]
    },
    {
      id: 'inq_004',
      subject: 'Email notifications not working',
      message: 'Our members are not receiving email notifications for new events and announcements. I\'ve checked the settings and everything looks correct. This issue started about a week ago.',
      adminName: 'John Smith',
      adminEmail: 'admin@harvardlaw.edu',
      containerName: 'Harvard Law Alumni',
      containerId: 'cnt_004',
      priority: 'urgent',
      status: 'open',
      category: 'bug-report',
      createdAt: '2024-01-22T08:00:00Z',
      updatedAt: '2024-01-22T08:00:00Z',
      isStarred: true,
      responses: []
    },
    {
      id: 'inq_005',
      subject: 'Question about data export functionality',
      message: 'Is there a way to export our member data in CSV format? We need to create some custom reports for our board meeting next week.',
      adminName: 'Lisa Wang',
      adminEmail: 'admin@caltech.edu',
      containerName: 'Caltech Alumni',
      containerId: 'cnt_005',
      priority: 'medium',
      status: 'closed',
      category: 'general',
      createdAt: '2024-01-19T13:20:00Z',
      updatedAt: '2024-01-20T10:15:00Z',
      isStarred: false,
      responses: [
        {
          id: 'resp_003',
          message: 'Yes, you can export member data from the Members section. Click on the "Export" button in the top right corner and select CSV format. Let me know if you need help with this.',
          author: 'System Admin',
          authorType: 'system-admin',
          timestamp: '2024-01-19T15:45:00Z'
        },
        {
          id: 'resp_004',
          message: 'Perfect! I found the export function. Thank you for the quick response.',
          author: 'Lisa Wang',
          authorType: 'admin',
          timestamp: '2024-01-20T10:15:00Z'
        }
      ]
    }
  ]);

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.containerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || inquiry.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || inquiry.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSendResponse = async () => {
    if (!selectedInquiry || !responseMessage.trim()) return;

    setIsResponding(true);

    try {
      const newResponse: InquiryResponse = {
        id: `resp_${Date.now()}`,
        message: responseMessage,
        author: 'System Admin',
        authorType: 'system-admin',
        timestamp: new Date().toISOString()
      };

      // Update the inquiry with the new response
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === selectedInquiry.id 
          ? { 
              ...inquiry, 
              responses: [...inquiry.responses, newResponse],
              status: inquiry.status === 'open' ? 'in-progress' : inquiry.status,
              updatedAt: new Date().toISOString()
            }
          : inquiry
      ));

      // Update selected inquiry
      setSelectedInquiry(prev => prev ? {
        ...prev,
        responses: [...prev.responses, newResponse],
        status: prev.status === 'open' ? 'in-progress' : prev.status,
        updatedAt: new Date().toISOString()
      } : null);

      setResponseMessage('');
      
      toast.success('Response sent successfully');
    } catch (error) {
      toast.error('Failed to send response');
    } finally {
      setIsResponding(false);
    }
  };

  const handleStatusChange = (inquiryId: string, newStatus: Inquiry['status']) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { ...inquiry, status: newStatus, updatedAt: new Date().toISOString() }
        : inquiry
    ));

    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
    }

    toast.success(`Inquiry marked as ${newStatus}`);
  };

  const handleToggleStar = (inquiryId: string) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { ...inquiry, isStarred: !inquiry.isStarred }
        : inquiry
    ));

    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
    }
  };

  const getPriorityColor = (priority: Inquiry['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: Inquiry['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: Inquiry['category']) => {
    switch (category) {
      case 'technical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'billing':
        return <Mail className="h-4 w-4" />;
      case 'feature-request':
        return <Star className="h-4 w-4" />;
      case 'bug-report':
        return <AlertTriangle className="h-4 w-4" />;
      case 'general':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const statusCounts = inquiries.reduce((acc, inquiry) => {
    acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Inquiries</h1>
          <p className="text-muted-foreground">
            Manage support requests from organizational administrators
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
          Open: {statusCounts.open || 0}
        </Badge>
        <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
          In Progress: {statusCounts['in-progress'] || 0}
        </Badge>
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
          Resolved: {statusCounts.resolved || 0}
        </Badge>
        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20">
          Closed: {statusCounts.closed || 0}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="feature-request">Feature Request</SelectItem>
            <SelectItem value="bug-report">Bug Report</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Support Inquiries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(inquiry.id)}
                      className="h-6 w-6 p-0"
                    >
                      {inquiry.isStarred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div 
                          className="cursor-pointer"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <div className="font-medium hover:text-primary">
                            {inquiry.subject}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {inquiry.message}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center justify-between">
                            <span>{selectedInquiry?.subject}</span>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(selectedInquiry?.priority || 'medium')}>
                                {selectedInquiry?.priority}
                              </Badge>
                              <Badge className={getStatusColor(selectedInquiry?.status || 'open')}>
                                {selectedInquiry?.status}
                              </Badge>
                            </div>
                          </DialogTitle>
                          <DialogDescription>
                            From {selectedInquiry?.adminName} ({selectedInquiry?.containerName})
                          </DialogDescription>
                        </DialogHeader>
                        
                        <ScrollArea className="max-h-96">
                          <div className="space-y-4">
                            {/* Original Message */}
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {selectedInquiry?.adminName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{selectedInquiry?.adminName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedInquiry?.createdAt && formatDistanceToNow(new Date(selectedInquiry.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm">{selectedInquiry?.message}</p>
                            </div>

                            {/* Responses */}
                            {selectedInquiry?.responses.map((response) => (
                              <div key={response.id} className={`p-4 rounded-lg ${
                                response.authorType === 'system-admin' 
                                  ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
                                  : 'bg-muted'
                              }`}>
                                <div className="flex items-center space-x-3 mb-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {response.authorType === 'system-admin' ? 'SA' : 
                                       response.author.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{response.author}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDistanceToNow(new Date(response.timestamp), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm">{response.message}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        {/* Response Form */}
                        <div className="space-y-4 border-t pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="response">Your Response</Label>
                            <Textarea
                              id="response"
                              placeholder="Type your response here..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Attach File
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Select 
                                value={selectedInquiry?.status} 
                                onValueChange={(value: any) => 
                                  selectedInquiry && handleStatusChange(selectedInquiry.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button 
                                onClick={handleSendResponse}
                                disabled={!responseMessage.trim() || isResponding}
                              >
                                {isResponding ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Response
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{inquiry.adminName}</div>
                      <div className="text-sm text-muted-foreground">{inquiry.adminEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inquiry.containerName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(inquiry.priority)}>
                      {inquiry.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(inquiry.category)}
                      <span className="text-sm capitalize">{inquiry.category.replace('-', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedInquiry(inquiry)}>
                          <Reply className="mr-2 h-4 w-4" />
                          Respond
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStar(inquiry.id)}>
                          {inquiry.isStarred ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Unstar
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Star
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(inquiry.id, 'resolved')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(inquiry.id, 'closed')}>
                          <Archive className="mr-2 h-4 w-4" />
                          Close
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No inquiries match your filters'
                  : 'No inquiries found'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}