import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the public directory
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    console.log('Saving file to:', filepath);
    await writeFile(filepath, buffer);
    console.log('File saved successfully');
    
    return NextResponse.json({ 
      success: true,
      url: `/uploads/${filename}`
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
