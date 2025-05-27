import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { UserPlus, LogIn } from 'lucide-react';

const Index = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="flex justify-between items-center mb-16">
        <div className="flex-1">
          <Logo size="lg" variant="full" />
        </div>
        <div className="flex gap-2">
          <Link to="/assessment?login=true">
            <Button variant="outline" className="flex items-center gap-1">
              <LogIn className="h-4 w-4" /> Log In
            </Button>
          </Link>
          <Link to="/assessment?signup=true">
            <Button variant="outline" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-assessment-blue mb-6">
              Discover Your True Language Level
            </h2>
            <p className="text-gray-700 mb-4">
              LinguaSpeak AI uses advanced speech recognition and natural language processing 
              to accurately assess your language proficiency according to the CEFR framework.
            </p>
            <ul className="mb-8 space-y-2">
              <li className="flex items-center">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2">✓</span>
                Quick speaking assessment (30 minutes or less)
              </li>
              <li className="flex items-center">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2">✓</span>
                Comprehensive full assessment (coming soon)
              </li>
              <li className="flex items-center">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2">✓</span>
                Detailed feedback and improvement suggestions
              </li>
              <li className="flex items-center">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2">✓</span>
                Intelligent CEFR level comparison
              </li>
            </ul>
            <div>
              <Link to="/assessment">
                <Button className="bg-assessment-teal hover:bg-assessment-lightBlue text-white px-8 py-6 text-lg rounded-md">
                  Start Your Assessment
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-assessment-blue to-assessment-teal p-1 shadow-lg">
            <div className="bg-white rounded-lg h-full flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/e6d117b5-e769-46fe-a446-8e52cac843d6.png" 
                alt="Professional using LinguaSpeak AI language assessment"
                className="w-full h-auto rounded-lg object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center text-assessment-blue mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm">
              <div className="bg-assessment-blue/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-assessment-blue">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Your Assessment</h3>
              <p className="text-gray-600">
                Select a quick speaking assessment or a comprehensive full evaluation of all skills.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm">
              <div className="bg-assessment-blue/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-assessment-blue">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Complete the Tasks</h3>
              <p className="text-gray-600">
                Read texts, listen to audio, speak responses, or write answers based on your assessment type.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm">
              <div className="bg-assessment-blue/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-assessment-blue">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Your Results</h3>
              <p className="text-gray-600">
                Receive detailed feedback on your performance and your CEFR proficiency level.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-assessment-blue/5 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-assessment-blue">New Feature: CEFR Level Comparison</h3>
          <p className="text-gray-700 mb-4">
            Our system now analyzes the gap between the prompt's CEFR level and your response level. 
            This ensures fair assessment by detecting when you're performing significantly above the 
            expected level for a given prompt.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md border border-assessment-blue/20">
              <h4 className="font-medium text-assessment-blue">How It Works:</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="text-assessment-teal mr-2">•</span>
                  Determines the CEFR level of both the prompt and your response
                </li>
                <li className="flex items-start">
                  <span className="text-assessment-teal mr-2">•</span>
                  Calculates the discrepancy between these levels
                </li>
                <li className="flex items-start">
                  <span className="text-assessment-teal mr-2">•</span>
                  Adjusts scoring when significant gaps are detected
                </li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-md border border-assessment-blue/20">
              <h4 className="font-medium text-assessment-blue">Benefits:</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="text-assessment-teal mr-2">•</span>
                  More accurate assessment of your true language ability
                </li>
                <li className="flex items-start">
                  <span className="text-assessment-teal mr-2">•</span>
                  Prevents underestimation of advanced learners
                </li>
                <li className="flex items-start">
                  <span className="text-assessment-teal mr-2">•</span>
                  Provides clearer justification for your CEFR level
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
