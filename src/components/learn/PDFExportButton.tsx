import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedLessonService } from '@/services/enhancedLessonService';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Lesson, UserNote, UserHighlight } from '@/types/lesson';
import { toast } from 'sonner';

interface PDFExportButtonProps {
  lesson: Lesson;
  notes: UserNote[];
  highlights: UserHighlight[];
}

export function PDFExportButton({ lesson, notes, highlights }: PDFExportButtonProps) {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      // Build HTML content for PDF
      const htmlContent = generateHTMLContent(lesson, notes, highlights, user?.name || 'User');

      // Create a print-friendly window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download PDF');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Trigger print dialog (user can save as PDF)
      setTimeout(() => {
        printWindow.print();
      }, 250);

      // Increment download count
      await EnhancedLessonService.incrementDownloadCount(user!.id, lesson.id);

      toast.success('PDF export ready!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className="w-full gap-2"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}

function generateHTMLContent(
  lesson: Lesson,
  notes: UserNote[],
  highlights: UserHighlight[],
  userName: string
): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Convert markdown to basic HTML (simplified)
  const contentHtml = lesson.content
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${lesson.topic} - ${lesson.subject}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #6366f1;
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    
    .header .subtitle {
      color: #666;
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .meta {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .badge-beginner { background: #dcfce7; color: #166534; }
    .badge-intermediate { background: #fef3c7; color: #854d0e; }
    .badge-advanced { background: #fee2e2; color: #991b1b; }
    
    .content {
      margin: 30px 0;
    }
    
    .content h1 {
      color: #1f2937;
      font-size: 28px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    
    .content h2 {
      color: #374151;
      font-size: 22px;
      margin-top: 25px;
      margin-bottom: 12px;
    }
    
    .content h3 {
      color: #4b5563;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    .content p {
      margin: 10px 0;
      text-align: justify;
    }
    
    .content code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #6366f1;
    }
    
    .content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 15px 0;
    }
    
    .content pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    
    .notes-section,
    .highlights-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 24px;
      color: #6366f1;
      margin-bottom: 20px;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
    }
    
    .note,
    .highlight {
      background: #f9fafb;
      border-left: 4px solid #6366f1;
      padding: 15px;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    
    .highlight {
      border-left-color: #fbbf24;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .header {
        page-break-after: avoid;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>${lesson.topic}</h1>
    ${lesson.subtitle ? `<div class="subtitle">${lesson.subtitle}</div>` : ''}
    <div class="meta">
      <div class="meta-item">
        <span class="badge badge-${lesson.difficulty}">${lesson.difficulty}</span>
      </div>
      <div class="meta-item">
        📚 ${lesson.subject}
      </div>
      <div class="meta-item">
        ⏱ ${lesson.estimated_minutes || lesson.duration} minutes
      </div>
      <div class="meta-item">
        ⭐ ${lesson.xp_reward} XP
      </div>
    </div>
    <div style="margin-top: 15px; font-size: 14px;">
      <strong>Student:</strong> ${userName} | <strong>Date:</strong> ${date}
    </div>
  </div>
  
  <!-- Main Content -->
  <div class="content">
    <p>${contentHtml}</p>
  </div>
  
  <!-- Notes Section -->
  ${
    notes.length > 0
      ? `
    <div class="notes-section">
      <h2 class="section-title">📝 My Notes (${notes.length})</h2>
      ${notes
        .map(
          (note) => `
        <div class="note">
          <p>${note.content.replace(/\n/g, '<br>')}</p>
        </div>
      `
        )
        .join('')}
    </div>
  `
      : ''
  }
  
  <!-- Highlights Section -->
  ${
    highlights.length > 0
      ? `
    <div class="highlights-section">
      <h2 class="section-title">✨ Highlights (${highlights.length})</h2>
      ${highlights
        .map(
          (highlight) => `
        <div class="highlight">
          <p>"${highlight.snippet}"</p>
        </div>
      `
        )
        .join('')}
    </div>
  `
      : ''
  }
  
  <!-- Footer -->
  <div class="footer">
    <p>Generated by AI Learning Coach | ${date}</p>
    <p>${lesson.topic} - ${lesson.subject}</p>
  </div>
</body>
</html>
  `;
}

