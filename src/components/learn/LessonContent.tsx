import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import type { Lesson, UserHighlight } from '@/types/lesson';
import { Button } from '@/components/ui/button';
import { Highlighter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  lesson: Lesson;
  onSectionChange: (section: string, percent: number, visitedCount: number, totalCount: number) => void;
  onAddHighlight: (snippet: string, color: string, section?: string) => void;
  highlights: UserHighlight[];
  focusMode?: boolean;
}

export function LessonContent({
  lesson,
  onSectionChange,
  onAddHighlight,
  highlights,
  focusMode = false,
}: LessonContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const visitedSectionsRef = useRef(new Set<string>());

  // Track sections using Intersection Observer
  useEffect(() => {
    if (!contentRef.current) return;

    const sections = contentRef.current.querySelectorAll('h1, h2, h3');
    console.log(`[SectionTracking] Found ${sections.length} sections`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.textContent || '';
            if (sectionId && !visitedSectionsRef.current.has(sectionId)) {
              visitedSectionsRef.current.add(sectionId);
              
              // Calculate progress based on sections visited
              const totalSections = sections.length;
              const progress = totalSections > 0 ? Math.round((visitedSectionsRef.current.size / totalSections) * 100) : 0;
              
              console.log(`[SectionTracking] New section visited: "${sectionId}" (${visitedSectionsRef.current.size}/${totalSections} = ${progress}%)`);
              onSectionChange(sectionId, progress, visitedSectionsRef.current.size, totalSections);
            }
          }
        });
      },
      {
        rootMargin: '-10% 0px -10% 0px', // Section must be 10% visible to count as visited
        threshold: 0.3 // Lower threshold to catch sections more easily
      }
    );

    // Observe all sections
    sections.forEach((section, index) => {
      observer.observe(section);
      console.log(`[SectionTracking] Observing section ${index + 1}: "${section.id || section.textContent?.substring(0, 30)}"`);
    });

    return () => {
      observer.disconnect();
      console.log(`[SectionTracking] Observer disconnected`);
    };
  }, [onSectionChange, lesson.content]);

  // Handle text selection for highlighting
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && text.length < 500) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelectedText(text);
          setMenuPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 50,
          });
          setShowHighlightMenu(true);
        }
      } else {
        setShowHighlightMenu(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, []);

  const handleHighlight = (color: string) => {
    if (selectedText) {
      onAddHighlight(selectedText, color);
      setShowHighlightMenu(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div ref={contentRef} className="relative">
      {/* Highlight Menu */}
      {showHighlightMenu && (
        <div
          className="fixed z-50 bg-popover border rounded-lg shadow-lg p-2 flex gap-1"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-yellow-200 hover:bg-yellow-300"
            onClick={() => handleHighlight('yellow')}
            title="Yellow highlight"
          >
            <span className="sr-only">Yellow</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-green-200 hover:bg-green-300"
            onClick={() => handleHighlight('green')}
            title="Green highlight"
          >
            <span className="sr-only">Green</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-blue-200 hover:bg-blue-300"
            onClick={() => handleHighlight('blue')}
            title="Blue highlight"
          >
            <span className="sr-only">Blue</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-pink-200 hover:bg-pink-300"
            onClick={() => handleHighlight('pink')}
            title="Pink highlight"
          >
            <span className="sr-only">Pink</span>
          </Button>
        </div>
      )}

      {/* Content */}
      <article
        className={cn(
          'prose prose-slate dark:prose-invert max-w-none',
          focusMode ? 'prose-xl prose-headings:text-3xl prose-headings:font-bold prose-p:text-lg prose-li:text-lg' : 'prose-lg',
          'prose-headings:scroll-mt-24',
          'prose-pre:bg-slate-900 prose-pre:text-slate-100',
          'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-a:text-primary hover:prose-a:text-primary/80',
          'prose-img:rounded-lg prose-img:shadow-md',
          focusMode && 'prose-blockquote:border-l-4 prose-blockquote:border-primary'
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ node, ...props }) => {
              const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-');
              return <h1 id={id} {...props} />;
            },
            h2: ({ node, ...props }) => {
              const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-');
              return <h2 id={id} {...props} />;
            },
            h3: ({ node, ...props }) => {
              const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-');
              return <h3 id={id} {...props} />;
            },
          }}
        >
          {lesson.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

