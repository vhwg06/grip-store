import ReactMarkdown from "react-markdown";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-lg prose-neutral max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
