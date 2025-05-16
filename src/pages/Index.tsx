
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const Index = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <Logo size="lg" variant="full" />
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Advanced language proficiency assessment powered by artificial intelligence.
        </p>
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
                Quick 2-minute speaking assessments
              </li>
              <li className="flex items-center">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2">✓</span>
                Comprehensive full skill evaluations
              </li>
              <li className="flex items-center">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2">✓</span>
                Detailed feedback and improvement suggestions
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
                src="/language-assessment.jpg" 
                alt="Student taking a language assessment"
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
      </div>
    </div>
  );
};

export default Index;
