import ReactMarkdown from "react-markdown";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const trimmed = (content || "").trim();
  const isHtml = trimmed.startsWith("<");

  if (isHtml) {
    return (
      <div
        className="prose prose-lg prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="prose prose-lg prose-neutral max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
