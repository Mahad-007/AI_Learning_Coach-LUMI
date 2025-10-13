import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  content: string;
  currentSection: string;
  onSectionClick: (section: string) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({
  content,
  currentSection,
  onSectionClick,
}: TableOfContentsProps) {
  const [sections, setSections] = useState<TocItem[]>([]);

  useEffect(() => {
    // Parse markdown headers
    const lines = content.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        items.push({ id, text, level });
      }
    });

    setSections(items);
  }, [content]);

  const handleSectionClick = (id: string) => {
    onSectionClick(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (sections.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">
        Contents
      </h3>
      <ScrollArea className="h-[400px]">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={cn(
                'block w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors',
                'hover:bg-muted',
                currentSection === section.id && 'bg-primary/10 text-primary font-medium',
                section.level === 1 && 'font-semibold',
                section.level === 2 && 'pl-4',
                section.level === 3 && 'pl-6 text-muted-foreground'
              )}
            >
              {section.text}
            </button>
          ))}
        </nav>
      </ScrollArea>
    </Card>
  );
}

