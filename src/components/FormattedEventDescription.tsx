import React from "react";
import { cn } from "@/lib/utils";

interface FormattedEventDescriptionProps {
  text: string;
  className?: string;
}

export function FormattedEventDescription({ text, className }: FormattedEventDescriptionProps) {
  if (!text) return null;

  // Convert explicit <br> tags into real newlines
  const normalized = text.replace(/<br\s*\/?>/gi, "\n");

  // Split paragraphs by 2 or more newlines
  const paragraphs = normalized.split(/\n{2,}/);

  return (
    <div className={cn("mt-4 space-y-2.5 leading-relaxed text-foreground/85 text-sm sm:text-base", className)}>
      {paragraphs.map((para, idx) => (
        <p key={idx} className="whitespace-pre-line text-pretty">
          {renderInlineFormatting(para)}
        </p>
      ))}
    </div>
  );
}

function renderInlineFormatting(content: string): React.ReactNode[] {
  // Matches <b>, <strong>, <i>, <em>, and markdown **bold**
  const regex = /(<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>|<i>[\s\S]*?<\/i>|<em>[\s\S]*?<\/em>|\*\*[\s\S]*?\*\*)/gi;
  const parts = content.split(regex);

  return parts.map((part, i) => {
    const boldMatch = part.match(/^<(?:b|strong)>(.*?)<\/(?:b|strong)>$/i) || part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
    }

    const italicMatch = part.match(/^<(?:i|em)>(.*?)<\/(?:i|em)>$/i);
    if (italicMatch) {
      return (
        <em key={i} className="italic">
          {italicMatch[1]}
        </em>
      );
    }

    return part;
  });
}
