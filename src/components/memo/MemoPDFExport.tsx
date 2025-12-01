import { forwardRef } from "react";
import { MemoSection } from "./MemoSection";
import { MemoParagraph } from "./MemoParagraph";
import { MemoKeyPoints } from "./MemoKeyPoints";
import { MemoHighlight } from "./MemoHighlight";
import { MemoVCReflection } from "./MemoVCReflection";
import { MemoVCQuestions } from "./MemoVCQuestions";
import { MemoBenchmarking } from "./MemoBenchmarking";
import { MemoAIConclusion } from "./MemoAIConclusion";
import { MemoStructuredContent } from "@/types/memo";
import { FileText } from "lucide-react";

interface MemoPDFExportProps {
  memoContent: MemoStructuredContent;
  companyInfo: any;
}

export const MemoPDFExport = forwardRef<HTMLDivElement, MemoPDFExportProps>(
  ({ memoContent, companyInfo }, ref) => {
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <div ref={ref} className="pdf-export bg-white text-gray-900 p-8">
        {/* Cover Page */}
        <div className="pdf-page mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Investment Memorandum
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto mb-8" />
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 mb-8 border-2 border-gray-200">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {companyInfo.name}
            </h2>
            {companyInfo.description && (
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                {companyInfo.description}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold border border-pink-300">
                {companyInfo.stage}
              </span>
              {companyInfo.category && (
                <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold border border-purple-300">
                  {companyInfo.category}
                </span>
              )}
            </div>
          </div>

          <div className="text-center text-gray-600 text-sm">
            <p className="font-medium">Generated: {generatedDate}</p>
            <p className="mt-2 text-xs text-gray-500">Confidential - For Investment Purposes Only</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="pdf-page mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-gray-300 pb-3">
            Table of Contents
          </h2>
          <div className="space-y-3">
            {memoContent.sections.map((section, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-800 font-medium">{section.title}</span>
                <span className="text-gray-500 text-sm">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memo Sections */}
        <div className="space-y-12">
          {memoContent.sections.map((section, index) => {
            const narrative = section.narrative || {
              paragraphs: section.paragraphs,
              highlights: section.highlights,
              keyPoints: section.keyPoints
            };

            return (
              <div key={section.title} className="pdf-section">
                <MemoSection title={section.title} index={index}>
                  {/* Narrative Content */}
                  <div className="space-y-4">
                    {narrative.paragraphs?.map((para, i) => (
                      <MemoParagraph key={i} text={para.text} emphasis={para.emphasis} />
                    ))}
                  </div>

                  {narrative.highlights && narrative.highlights.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {narrative.highlights.map((highlight, i) => (
                        <MemoHighlight key={i} metric={highlight.metric} label={highlight.label} />
                      ))}
                    </div>
                  )}

                  {narrative.keyPoints && narrative.keyPoints.length > 0 && (
                    <MemoKeyPoints points={narrative.keyPoints} />
                  )}

                  {/* VC Reflection Content */}
                  {section.vcReflection && (
                    <>
                      {section.vcReflection.analysis && (
                        <MemoVCReflection text={section.vcReflection.analysis} />
                      )}
                      {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                        <MemoVCQuestions questions={section.vcReflection.questions} />
                      )}
                      {section.vcReflection.benchmarking && (
                        <MemoBenchmarking text={section.vcReflection.benchmarking} />
                      )}
                      {section.vcReflection.conclusion && (
                        <MemoAIConclusion text={section.vcReflection.conclusion} />
                      )}
                    </>
                  )}
                </MemoSection>
              </div>
            );
          })}
        </div>

        {/* Footer - appears on every page */}
        <div className="pdf-footer fixed bottom-0 left-0 right-0 text-center text-xs text-gray-500 py-4 border-t border-gray-200 bg-white">
          <p className="font-medium">{companyInfo.name} - Investment Memorandum</p>
          <p className="mt-1">Confidential & Proprietary | {generatedDate}</p>
        </div>
      </div>
    );
  }
);

MemoPDFExport.displayName = "MemoPDFExport";
