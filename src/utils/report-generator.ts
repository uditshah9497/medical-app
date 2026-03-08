// Patient report generator
// Generates downloadable medical reports in HTML/PDF format

export interface ReportData {
    consultationId: string;
    patientName: string;
    patientId: string;
    patientEmail: string;
    consultationDate: string;
    symptoms: string[];
    aiDiagnosis: string;
    urgency: string;
    status: string;
    doctorName?: string;
    doctorSpecialization?: string;
    aiRecommendations?: any;
    bloodReportData?: any;
}

export function generateHTMLReport(data: ReportData): string {
    const currentDate = new Date().toLocaleString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Medical Consultation Report - ${data.consultationId}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
        }
        .section {
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .section h2 {
            color: #667eea;
            margin-top: 0;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            width: 200px;
        }
        .info-value {
            flex: 1;
        }
        .urgency-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        .urgency-low { background: #e8f5e9; color: #2e7d32; }
        .urgency-medium { background: #fff3e0; color: #f57c00; }
        .urgency-high { background: #ffebee; color: #c62828; }
        .urgency-emergency { background: #d32f2f; color: white; }
        .symptom-list {
            list-style: none;
            padding: 0;
        }
        .symptom-list li {
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-left: 4px solid #667eea;
            padding-left: 15px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .disclaimer {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Medical Consultation Report</h1>
        <p>AI-Assisted Medical Consultation Platform</p>
    </div>

    <div class="section">
        <h2>Patient Information</h2>
        <div class="info-row">
            <div class="info-label">Patient Name:</div>
            <div class="info-value">${data.patientName}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Patient ID:</div>
            <div class="info-value">${data.patientId}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${data.patientEmail}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Consultation Date:</div>
            <div class="info-value">${new Date(data.consultationDate).toLocaleString()}</div>
        </div>
    </div>

    <div class="section">
        <h2>Consultation Details</h2>
        <div class="info-row">
            <div class="info-label">Consultation ID:</div>
            <div class="info-value">${data.consultationId}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value">${data.status.toUpperCase()}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Urgency Level:</div>
            <div class="info-value">
                <span class="urgency-badge urgency-${data.urgency}">
                    ${data.urgency.toUpperCase()}
                </span>
            </div>
        </div>
        ${data.doctorName ? `
        <div class="info-row">
            <div class="info-label">Reviewed By:</div>
            <div class="info-value">${data.doctorName} (${data.doctorSpecialization})</div>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <h2>Reported Symptoms</h2>
        <ul class="symptom-list">
            ${data.symptoms.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>AI Analysis</h2>
        <div class="info-row">
            <div class="info-label">Primary Diagnosis:</div>
            <div class="info-value"><strong>${data.aiDiagnosis}</strong></div>
        </div>
        ${data.aiRecommendations ? `
        <div style="margin-top: 15px;">
            <h3 style="color: #667eea;">Possible Conditions:</h3>
            ${data.aiRecommendations.possibleConditions ? 
                data.aiRecommendations.possibleConditions.slice(0, 3).map((c: any, i: number) => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                        <strong>${i + 1}. ${c.name}</strong> (${Math.round(c.probability * 100)}% probability)
                        <br><small>ICD-10: ${c.icd10Code}</small>
                    </div>
                `).join('') : ''
            }
        </div>
        <div style="margin-top: 15px;">
            <h3 style="color: #667eea;">Recommended Tests:</h3>
            ${data.aiRecommendations.recommendedTests ?
                data.aiRecommendations.recommendedTests.map((t: any) => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                        <strong>${t.testName}</strong> - ${t.priority.toUpperCase()} Priority
                        <br><small>${t.rationale}</small>
                        <br><small>Estimated Cost: ${t.estimatedCost}</small>
                    </div>
                `).join('') : ''
            }
        </div>
        ` : ''}
    </div>

    ${data.bloodReportData ? `
    <div class="section">
        <h2>Blood Test Results</h2>
        ${data.bloodReportData.testResults ? 
            data.bloodReportData.testResults.map((test: any) => `
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                    <strong>${test.name}:</strong> ${test.value} ${test.unit}
                    <br><small>Normal Range: ${test.normalRange} | Status: ${test.status.toUpperCase()}</small>
                </div>
            `).join('') : ''
        }
    </div>
    ` : ''}

    <div class="disclaimer">
        <strong>⚠️ Important Disclaimer:</strong>
        <p>This report is generated by an AI-assisted system and should not be considered as a final medical diagnosis. 
        All recommendations must be reviewed and approved by a licensed medical professional before any treatment is initiated. 
        Please consult with your doctor for proper medical advice.</p>
    </div>

    <div class="footer">
        <p>Report Generated: ${currentDate}</p>
        <p>MediConsult AI - Intelligent Healthcare Platform</p>
        <p>This is a computer-generated report and does not require a signature.</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            Print Report
        </button>
    </div>
</body>
</html>
    `;
}

export function generateTextReport(data: ReportData): string {
    return `
MEDICAL CONSULTATION REPORT
========================================

PATIENT INFORMATION
-------------------
Name: ${data.patientName}
Patient ID: ${data.patientId}
Email: ${data.patientEmail}
Consultation Date: ${new Date(data.consultationDate).toLocaleString()}

CONSULTATION DETAILS
--------------------
Consultation ID: ${data.consultationId}
Status: ${data.status.toUpperCase()}
Urgency Level: ${data.urgency.toUpperCase()}
${data.doctorName ? `Reviewed By: ${data.doctorName} (${data.doctorSpecialization})` : ''}

REPORTED SYMPTOMS
-----------------
${data.symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AI ANALYSIS
-----------
Primary Diagnosis: ${data.aiDiagnosis}

${data.aiRecommendations ? `
POSSIBLE CONDITIONS:
${data.aiRecommendations.possibleConditions ? 
    data.aiRecommendations.possibleConditions.slice(0, 3).map((c: any, i: number) => 
        `${i + 1}. ${c.name} (${Math.round(c.probability * 100)}% probability) - ICD-10: ${c.icd10Code}`
    ).join('\n') : ''
}

RECOMMENDED TESTS:
${data.aiRecommendations.recommendedTests ?
    data.aiRecommendations.recommendedTests.map((t: any) => 
        `- ${t.testName} (${t.priority.toUpperCase()} Priority)\n  ${t.rationale}\n  Cost: ${t.estimatedCost}`
    ).join('\n') : ''
}
` : ''}

DISCLAIMER
----------
This report is generated by an AI-assisted system and should not be 
considered as a final medical diagnosis. All recommendations must be 
reviewed and approved by a licensed medical professional before any 
treatment is initiated.

Report Generated: ${new Date().toLocaleString()}
MediConsult AI - Intelligent Healthcare Platform
    `.trim();
}
