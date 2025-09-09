import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, User, Globe, Languages } from 'lucide-react';
import { assessorService, type PendingAssessment } from '@/services/assessorService';
import AssessmentReviewModal from '@/components/assessor/AssessmentReviewModal';
import { toast } from 'sonner';

const AssessorPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAssessments, setPendingAssessments] = useState<PendingAssessment[]>([]);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAssessmentDetails, setSelectedAssessmentDetails] = useState<any>(null);
  
  const fetchPendingAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await assessorService.getPendingAssessments();
      if (response.success) {
        setPendingAssessments(response.data || []);
        console.log('📊 Loaded pending assessments:', response.data?.length);
      } else {
        toast.error(response.error || 'Failed to load assessments');
        setPendingAssessments([]);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
      setPendingAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAssessments();
  }, []);

  const handleAssignAssessment = async (sessionId: string) => {
    setIsAssigning(sessionId);
    try {
      const response = await assessorService.assignAssessment(sessionId);
      if (response.success) {
        toast.success('Assessment assigned successfully');
        await fetchPendingAssessments(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to assign assessment');
      }
    } catch (error) {
      console.error('Error assigning assessment:', error);
      toast.error('Failed to assign assessment');
    } finally {
      setIsAssigning(null);
    }
  };

  const handleViewDetails = async (sessionId: string) => {
    try {
      const response = await assessorService.getAssessmentDetails(sessionId);
      if (response.success) {
        setSelectedAssessmentDetails(response.data);
        setReviewModalOpen(true);
      } else {
        toast.error(response.error || 'Failed to load details');
      }
    } catch (error) {
      console.error('Error loading details:', error);
      toast.error('Failed to load assessment details');
    }
  };

  const handleReviewSubmitted = () => {
    fetchPendingAssessments(); // Refresh the list
    setReviewModalOpen(false);
    setSelectedAssessmentDetails(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCEFRColor = (level: string) => {
    const colors = {
      'A1': 'bg-red-100 text-red-800',
      'A2': 'bg-orange-100 text-orange-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-green-100 text-green-800',
      'C1': 'bg-blue-100 text-blue-800',
      'C2': 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-assessment-blue">Assessor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {user?.full_name || user?.email || 'Assessor'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Home
          </Button>
          {user && (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-assessment-blue">
              {isLoading ? '...' : pendingAssessments.length}
            </div>
            <p className="text-sm text-muted-foreground">Assessments awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-sm text-muted-foreground">Reviews completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-sm text-muted-foreground">Average assessment score</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pending Assessments</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchPendingAssessments}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-assessment-blue" />
              <span className="ml-2">Loading assessments...</span>
            </div>
          ) : pendingAssessments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No pending assessments</h3>
              <p className="text-gray-500">All assessments have been reviewed or no new submissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAssessments.map((assessment) => (
                <Card key={assessment.id} className="border-l-4 border-l-assessment-blue">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {assessment.profiles?.full_name || assessment.student_info?.name || 'Anonymous User'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {assessment.session_type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(assessment.created_at)}</span>
                          </div>
                          
                          {assessment.profiles?.first_language && (
                            <div className="flex items-center gap-1">
                              <Languages className="h-3 w-3" />
                              <span>{assessment.profiles.first_language}</span>
                            </div>
                          )}
                          
                          {assessment.profiles?.country_of_residence && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <span>{assessment.profiles.country_of_residence}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Overall Score:</span>
                          <Badge variant="outline">
                            {Math.round(assessment.overall_score || 0)}/100
                          </Badge>
                          {assessment.overall_cefr_level && (
                            <Badge className={getCEFRColor(assessment.overall_cefr_level)}>
                              {assessment.overall_cefr_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(assessment.id)}
                        >
                          Review Assessment
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAssignAssessment(assessment.id)}
                          disabled={isAssigning === assessment.id}
                        >
                          {isAssigning === assessment.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              Assigning...
                            </>
                          ) : (
                            'Assign to Me'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Review Modal */}
      <AssessmentReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedAssessmentDetails(null);
        }}
        assessmentDetails={selectedAssessmentDetails}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default AssessorPanel;