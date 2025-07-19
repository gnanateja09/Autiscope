interface ScreeningResult {
  id: string;
  screening_code: string;
  type: 'adult' | 'toddler';
  name: string;
  age?: number;
  age_months?: number;
  prediction: string;
  classification_result?: string;
  created_at: string;
  responses: Record<string, string>;
  classification_responses?: Record<string, string>;
}

const adultQuestions = [
  { key: 'A1', text: 'I often notice small sounds when others do not' },
  { key: 'A2', text: 'I usually concentrate more on the whole picture, rather than the small details' },
  { key: 'A3', text: 'I find it easy to do more than one thing at once' },
  { key: 'A4', text: 'If there is an interruption, I can switch back to what I was doing very quickly' },
  { key: 'A5', text: 'I find it easy to read between the lines when someone is talking to me' },
  { key: 'A6', text: 'I know how to tell if someone listening to me is getting bored' },
  { key: 'A7', text: 'When I am reading a story, I find it difficult to work out the characters\' intentions' },
  { key: 'A8', text: 'I like to collect information about categories of things' },
  { key: 'A9', text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face' },
  { key: 'A10', text: 'I find it difficult to work out people\'s intentions' }
];

const toddlerQuestions = [
  { key: 'A1', text: 'Does your child look at you when you call his/her name?' },
  { key: 'A2', text: 'How easy is it for you to get eye contact with your child?' },
  { key: 'A3', text: 'Does your child point to indicate that s/he wants something?' },
  { key: 'A4', text: 'Does your child point to share interest with you?' },
  { key: 'A5', text: 'Does your child pretend (e.g., care for dolls, talk on phone)?' },
  { key: 'A6', text: 'Does your child follow where you\'re looking?' },
  { key: 'A7', text: 'If you or someone else in the family is visibly upset, does your child show signs of wanting to comfort them?' },
  { key: 'A8', text: 'Would you describe your child\'s first words as normal?' },
  { key: 'A9', text: 'Does your child use simple gestures (e.g., wave goodbye)?' },
  { key: 'A10', text: 'Does your child stare at nothing with no apparent purpose?' }
];

const classificationQuestions = [
  { key: 'Q1', text: 'Does the person require support to live independently?' },
  { key: 'Q2', text: 'Does the person have difficulty with social communication?' },
  { key: 'Q3', text: 'Does the person show repetitive behaviors or restricted interests?' },
  { key: 'Q4', text: 'Does the person have sensory sensitivities?' },
  { key: 'Q5', text: 'Does the person need help with daily activities?' }
];

const treatmentInformation = `
TREATMENT OPTIONS AND RECOMMENDATIONS

There are several evidence-based treatments and interventions that can help individuals with autism spectrum disorder. Treatment plans are typically individualized based on specific needs and goals.

1. Applied Behavior Analysis (ABA)
Evidence-based therapy that focuses on improving specific behaviors and skills through structured learning. ABA can help with communication, social skills, and reducing challenging behaviors.

2. Educational Interventions
Specialized educational programs and accommodations to support learning and development. This includes individualized education plans (IEPs) and specialized teaching methods.

3. Speech and Language Therapy
Helps improve communication skills, including verbal and non-verbal communication. Can address speech delays, language comprehension, and social communication.

4. Occupational Therapy
Focuses on developing daily living skills, fine motor skills, and sensory processing abilities. Helps individuals become more independent in daily activities.

5. Social Skills Training
Structured programs to help develop social interaction skills, understanding social cues, and building relationships with peers and family members.

6. Sensory Integration Therapy
Addresses sensory processing difficulties that are common in autism. Helps individuals better process and respond to sensory information.

7. Family Support and Training
Provides families with strategies and support to better understand and help their loved ones with autism. Includes parent training programs and family therapy.

8. Medications (when appropriate)
While there are no medications that treat the core symptoms of autism, some medications may help manage co-occurring conditions such as anxiety, depression, or attention difficulties.

IMPORTANT NOTES:
- Early intervention is crucial and can significantly improve outcomes
- Treatment should be individualized based on the person's specific needs and strengths
- A multidisciplinary approach often works best
- Regular monitoring and adjustment of treatment plans is important
- Family involvement and support is essential for success

NEXT STEPS:
1. Consult with a qualified healthcare professional for proper evaluation
2. Consider seeking a comprehensive developmental assessment
3. Research local autism support services and resources
4. Connect with autism support groups and organizations
5. Develop a comprehensive treatment plan with professional guidance

DISCLAIMER:
This screening tool is not a diagnostic instrument. A formal diagnosis of autism spectrum disorder requires comprehensive evaluation by qualified healthcare professionals, including developmental pediatricians, child psychologists, or psychiatrists specializing in autism.
`;

export const generatePDFReport = async (screening: ScreeningResult): Promise<void> => {
  const questions = screening.type === 'adult' ? adultQuestions : toddlerQuestions;
  
  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Autism Screening Report - ${screening.screening_code}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .screening-code {
          font-size: 18px;
          color: #6b7280;
          font-family: monospace;
          background: #f3f4f6;
          padding: 5px 10px;
          border-radius: 5px;
          display: inline-block;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: #f9fafb;
          border-radius: 5px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
        }
        .info-value {
          color: #6b7280;
        }
        .prediction {
          text-align: center;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 18px;
          font-weight: bold;
        }
        .prediction.positive {
          background: #fef3c7;
          color: #92400e;
          border: 2px solid #f59e0b;
        }
        .prediction.negative {
          background: #d1fae5;
          color: #065f46;
          border: 2px solid #10b981;
        }
        .question-item {
          margin-bottom: 15px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 5px;
          border-left: 4px solid #2563eb;
        }
        .question-text {
          font-weight: 500;
          margin-bottom: 8px;
          color: #1f2937;
        }
        .question-answer {
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 3px;
          display: inline-block;
        }
        .answer-yes {
          background: #fee2e2;
          color: #991b1b;
        }
        .answer-no {
          background: #dcfce7;
          color: #166534;
        }
        .treatment-section {
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 8px;
          padding: 25px;
          margin-top: 30px;
        }
        .treatment-content {
          white-space: pre-line;
          line-height: 1.8;
        }
        .disclaimer {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
          text-align: center;
        }
        .disclaimer-title {
          font-weight: bold;
          color: #92400e;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧠 AutiScope</div>
        <div class="report-title">${screening.type === 'adult' ? 'Adult' : 'Toddler'} Autism Screening Report</div>
        <div class="screening-code">Code: ${screening.screening_code}</div>
      </div>

      <div class="section">
        <div class="section-title">📋 Screening Information</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${screening.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Age:</span>
            <span class="info-value">${screening.type === 'adult' ? `${screening.age} years` : `${screening.age_months} months`}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Screening Type:</span>
            <span class="info-value">${screening.type === 'adult' ? 'Adult Assessment' : 'Toddler Assessment'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date:</span>
            <span class="info-value">${new Date(screening.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      </div>

      <div class="prediction ${screening.prediction === 'YES' ? 'positive' : 'negative'}">
        🎯 Screening Result: ${screening.prediction === 'YES' ? 'Autism Traits Detected' : 'No Significant Autism Traits Detected'}
        ${screening.classification_result ? `<br>Classification: ${screening.classification_result}` : ''}
      </div>

      <div class="section">
        <div class="section-title">❓ Screening Questions & Responses</div>
        ${questions.map(q => `
          <div class="question-item">
            <div class="question-text">${q.key}. ${q.text}</div>
            <span class="question-answer ${screening.responses[q.key] === 'yes' ? 'answer-yes' : 'answer-no'}">
              ${screening.responses[q.key] === 'yes' ? 'Yes' : 'No'}
            </span>
          </div>
        `).join('')}
      </div>

      ${screening.classification_responses ? `
        <div class="section">
          <div class="section-title">🔍 Classification Assessment</div>
          ${classificationQuestions.map(q => `
            <div class="question-item">
              <div class="question-text">${q.key}. ${q.text}</div>
              <span class="question-answer ${screening.classification_responses![q.key] === 'yes' ? 'answer-yes' : 'answer-no'}">
                ${screening.classification_responses![q.key] === 'yes' ? 'Yes' : 'No'}
              </span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="treatment-section">
        <div class="section-title">💡 Treatment Information & Recommendations</div>
        <div class="treatment-content">${treatmentInformation}</div>
      </div>

      <div class="disclaimer">
        <div class="disclaimer-title">⚠️ Important Medical Disclaimer</div>
        <p>This screening tool is for informational purposes only and is not intended as a medical diagnosis. 
        Please consult with qualified healthcare professionals for proper evaluation and diagnosis. 
        A formal diagnosis of autism spectrum disorder requires comprehensive evaluation by qualified healthcare professionals.</p>
      </div>

      <div class="footer">
        <p>Generated by AutiScope Autism Screening Platform</p>
        <p>Report generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print the report
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  } else {
    // Fallback: create a downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autism-screening-report-${screening.screening_code}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};