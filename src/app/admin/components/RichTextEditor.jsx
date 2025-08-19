'use client'

import { Editor } from '@tinymce/tinymce-react';

export default function RichTextEditor({ value, onChange, height = 300 }) {
  return (
    <Editor
      apiKey="5eihxrq2udxuvjiozzck4hey1edzak7uhcf30k0jfzspdrh5"
      value={value}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image media link | help',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; font-size: 14px }',
        directionality: 'rtl',
        language: 'fa',
        images_upload_handler: async function (blobInfo) {
          // این قسمت رو باید با API آپلود فایل خودتون جایگزین کنید
          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          return data.url;
        }
      }}
      onEditorChange={onChange}
    />
  );
}
