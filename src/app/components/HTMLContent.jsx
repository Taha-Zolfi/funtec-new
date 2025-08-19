'use client'

export default function HTMLContent({ content }) {
  return (
    <div 
      className="rich-content"
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
}
