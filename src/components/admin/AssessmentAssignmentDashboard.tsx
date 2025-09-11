import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, Clock, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Assessment {
  id: string;
  user_id: string;
  status: string;
  overall_score: number;
  overall_cefr_level: string;
  created_at: string;
  assigned_assessor?: string;
  student_info: {
    name?: string;
    email?: string;
  };
  profiles?: {
    full_name?: string;
    email: string;
  };
}

interface Assessor {
  id: string;
  full_name: string;
  email: string;
}

const AssessmentAssignmentDashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());
  const [selectedAssessor, setSelectedAssessor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch completed assessments and available assessors
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('You must be logged in to access the admin dashboard');
        }

        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          throw new Error('You must be an admin to access this dashboard');
        }
        // Fetch completed assessments
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessment_sessions')
          .select(`
            id,
            user_id,
            status,
            overall_score,
            overall_cefr_level,
            created_at,
            assigned_assessor,
            student_info,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .in('status', ['completed', 'under_review'])
          .order('created_at', { ascending: false });

        if (assessmentError) {
          throw assessmentError;
        }

        // Transform the data to handle the profiles relation properly
        const transformedAssessments = (assessmentData || []).map((assessment: any) => ({
          ...assessment,
          profiles: Array.isArray(assessment.profiles) 
            ? assessment.profiles[0] 
            : assessment.profiles
        }));

        setAssessments(transformedAssessments);

        // Fetch available assessors
        const { data: assessorData, error: assessorError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'assessor')
          .eq('is_active', true);

        if (assessorError) {
          throw assessorError;
        }

        setAssessors(assessorData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setAuthError(error.message);
        toast.error('Failed to load data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle individual assessment selection
  const handleAssessmentSelect = (assessmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssessments);
    if (checked) {
      newSelected.add(assessmentId);
    } else {
      newSelected.delete(assessmentId);
    }
    setSelectedAssessments(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUnassigned = assessments
        .filter(a => a.status === 'completed')
        .map(a => a.id);
      setSelectedAssessments(new Set(allUnassigned));
    } else {
      setSelectedAssessments(new Set());
    }
  };

  // Handle batch assignment
  const handleBatchAssign = async () => {
    if (!selectedAssessor || selectedAssessments.size === 0) {
      toast.error('Please select an assessor and at least one assessment');
      return;
    }

    setIsAssigning(true);
    try {
      const assessmentIds = Array.from(selectedAssessments);
      
      const { error } = await supabase
        .from('assessment_sessions')
        .update({
          assigned_assessor: selectedAssessor,
          status: 'under_review',
          reviewed_at: new Date().toISOString()
        })
        .in('id', assessmentIds)
        .eq('status', 'completed');

      if (error) {
        throw error;
      }

      // Update local state
      setAssessments(prev => prev.map(assessment => 
        selectedAssessments.has(assessment.id)
          ? { ...assessment, assigned_assessor: selectedAssessor, status: 'under_review' }
          : assessment
      ));

      setSelectedAssessments(new Set());
      setSelectedAssessor('');
      
      const assignedAssessor = assessors.find(a => a.id === selectedAssessor);
      toast.success(`Successfully assigned ${assessmentIds.length} assessments to ${assignedAssessor?.full_name}`);
    } catch (error: any) {
      console.error('Error assigning assessments:', error);
      toast.error('Failed to assign assessments: ' + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAssessorName = (assessorId?: string) => {
    if (!assessorId) return 'Unassigned';
    const assessor = assessors.find(a => a.id === assessorId);
    return assessor?.full_name || 'Unknown';
  };

  const unassignedCount = assessments.filter(a => a.status === 'completed').length;
  const underReviewCount = assessments.filter(a => a.status === 'under_review').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading assessments...</span>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-destructive mb-2">Access Denied</div>
          <div className="text-muted-foreground">{authError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Assessments</p>
                <p className="text-2xl font-bold">{assessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Pending Assignment</p>
                <p className="text-2xl font-bold text-orange-500">{unassignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Under Review</p>
                <p className="text-2xl font-bold text-blue-500">{underReviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedAssessor} onValueChange={setSelectedAssessor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an assessor" />
                </SelectTrigger>
                <SelectContent>
                  {assessors.map((assessor) => (
                    <SelectItem key={assessor.id} value={assessor.id}>
                      {assessor.full_name} ({assessor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleBatchAssign}
              disabled={isAssigning || selectedAssessments.size === 0 || !selectedAssessor}
              className="shrink-0"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign ${selectedAssessments.size} Assessment${selectedAssessments.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
          {selectedAssessments.size > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedAssessments.size} assessment{selectedAssessments.size !== 1 ? 's' : ''} selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAssessments.size > 0 && selectedAssessments.size === unassignedCount}
                      onCheckedChange={handleSelectAll}
                      disabled={unassignedCount === 0}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>CEFR Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => {
                  const studentName = assessment.student_info?.name || 
                                    assessment.profiles?.full_name || 
                                    'Unknown Student';
                  const studentEmail = assessment.student_info?.email || 
                                     assessment.profiles?.email || 
                                     'No email';
                  
                  return (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAssessments.has(assessment.id)}
                          onCheckedChange={(checked) => 
                            handleAssessmentSelect(assessment.id, checked as boolean)
                          }
                          disabled={assessment.status !== 'completed'}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{studentName}</p>
                          <p className="text-sm text-muted-foreground">{studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {assessment.overall_score ? assessment.overall_score.toFixed(1) : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {assessment.overall_cefr_level || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assessment.status)}
                      </TableCell>
                      <TableCell>
                        <span className={assessment.assigned_assessor ? 'text-primary' : 'text-muted-foreground'}>
                          {getAssessorName(assessment.assigned_assessor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {assessments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No assessments found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentAssignmentDashboard;