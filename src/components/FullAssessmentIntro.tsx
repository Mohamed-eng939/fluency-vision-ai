import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Award, BookOpen } from 'lucide-react';
import { FullAssessment, TestTask } from '../types/assessment';

interface FullAssessmentIntroProps {
  assessment: FullAssessment;
  onStartAssessment: () => void;
  onClose: () => void;
}

const FullAssessmentIntro: React.FC<FullAssessmentIntroProps> = ({ 
  assessment, 
  onStartAssessment,
  onClose
}) => {
  // Restructured to avoid the type error
  const tasksByLevel: Record<string, TestTask[]> = {};
  
  // Populate tasksByLevel
  assessment.sections.forEach(section => {
    section.tasks.forEach(task => {
      if (!tasksByLevel[task.level]) {
        tasksByLevel[task.level] = [];
      }
      tasksByLevel[task.level].push(task);
    });
  });

  const levels = Object.keys(tasksByLevel).sort();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-assessment-blue">{assessment.title}</CardTitle>
            <CardDescription className="mt-2">{assessment.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 text-assessment-teal" />
            <span className="text-sm font-medium">{assessment.estimatedTime}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 bg-assessment-blue/5 p-4 rounded-lg border border-assessment-blue/10">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-assessment-teal" />
            Instructions
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>This assessment evaluates your language abilities across different skills and levels.</li>
            <li>The test progresses from basic (A1) to advanced (C2) difficulty levels.</li>
            <li>Each task has specific instructions and time limits.</li>
            <li>Complete as many sections as possible for the most accurate assessment.</li>
            <li>You can pause between sections, but individual tasks are timed.</li>
          </ul>
        </div>

        <Tabs defaultValue={levels[0]} className="w-full">
          <TabsList className="mb-4 grid grid-cols-3 sm:grid-cols-6">
            {levels.map((level) => (
              <TabsTrigger key={level} value={level} className="text-center">
                {level}
              </TabsTrigger>
            ))}
          </TabsList>

          {levels.map((level) => (
            <TabsContent key={level} value={level} className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-assessment-teal" />
                Level {level} Tasks
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasksByLevel[level].map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-assessment-teal">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="uppercase text-xs font-semibold text-gray-500">
                          {task.skill}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.timeLimit} min
                        </span>
                      </div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Return to Quick Assessment
        </Button>
        <Button 
          className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
          onClick={onStartAssessment}
        >
          Start Full Assessment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FullAssessmentIntro;
