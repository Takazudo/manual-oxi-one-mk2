import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Strong,
  Em,
  A,
  Code,
  Ul,
  Ol,
  Table,
  Hr,
} from '@/components/markdown';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        h6: H6,
        p: P,
        strong: Strong,
        em: Em,
        a: A,
        code: Code,
        ul: Ul,
        ol: Ol,
        table: Table,
        hr: Hr,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
