import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  console.error('Stack trace:', error.stack);
  
  let errorMessage = 'Unknown error';
  if (error.message) errorMessage = error.message;
  if (error.code) errorMessage = `${errorMessage} (Code: ${error.code})`;
  
  return NextResponse.json(
    { error: errorMessage }, 
    { status: 500 }
  );
}

export async function GET(request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Get single product
      const product = await db.get('SELECT * FROM products WHERE id = ?', id);
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      
      // Get comments for this product
      const comments = await db.all('SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC', id);
      
      // Parse arrays from string
      const { price, ...productWithoutPrice } = product;
      return NextResponse.json({
        ...productWithoutPrice,
        features: product.features ? product.features.split(',').filter(Boolean) : [],
        images: product.images ? product.images.split(',').filter(Boolean) : [],
        specifications: product.specifications ? product.specifications.split(',').filter(Boolean) : [],
        background_video: product.background_video || null,
        short_description: product.short_description || '',
        full_description: product.full_description || '',
        comments: comments
      });
    } else {
      // Get all products
      const products = await db.all('SELECT * FROM products');
      const processedProducts = products.map(product => {
        const { price, ...productWithoutPrice } = product;
        return {
          ...productWithoutPrice,
          features: product.features ? product.features.split(',').filter(Boolean) : [],
          images: product.images ? product.images.split(',').filter(Boolean) : [],
          specifications: product.specifications ? product.specifications.split(',').filter(Boolean) : [],
          background_video: product.background_video || null
        };
      });
      return NextResponse.json(processedProducts);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const db = await getDb();
  try {
    const data = await request.json();
    const { features, images, reviews, short_description, full_description, ...rest } = data;

    const result = await db.run(
      'INSERT INTO products (name, short_description, full_description, background_video, features, images, specifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        rest.name,
        short_description || '',
        full_description || '',
        rest.background_video || null,
        Array.isArray(features) ? features.join(',') : '',
        Array.isArray(images) ? images.join(',') : '',
        Array.isArray(data.specifications) ? data.specifications.join(',') : ''
      ]
    );

    return NextResponse.json({ id: result.lastID }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  let db;
  try {
    console.log('Starting PUT request');
    db = await getDb();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    console.log('Product ID from URL:', productId);
    
    if (!productId) {
      console.log('No product ID provided');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Check if product exists
    let existingProduct;
    try {
      existingProduct = await db.get('SELECT * FROM products WHERE id = ?', productId);
      console.log('Existing product:', existingProduct);
    } catch (dbError) {
      console.error('Error fetching existing product:', dbError);
      return NextResponse.json({ error: 'Failed to fetch existing product' }, { status: 500 });
    }

    if (!existingProduct) {
      console.log('Product not found:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Handle reviews if needed
    if (searchParams.get('action') === 'add_review') {
      try {
        const { review } = await request.json();
        console.log('Adding review:', review);
        const result = await db.run(
          'INSERT INTO product_reviews (product_id, rating, comment) VALUES (?, ?, ?)',
          [productId, review.rating, review.comment]
        );
        return NextResponse.json({ id: result.lastID });
      } catch (reviewError) {
        console.error('Error adding review:', reviewError);
        return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
      }
    }

    // Regular product update
    let updateData;
    try {
      updateData = await request.json();
      console.log('Received data for update:', JSON.stringify(updateData, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate required fields (name is required; short/full descriptions are optional)
    if (!updateData.name) {
      console.log('Missing required field: name');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Extract and prepare data
    const { features, images, specifications, ...rest } = updateData;
    
    const updateParams = [
      rest.name,
      rest.short_description || '',
      rest.full_description || '',
      rest.background_video || null,
      Array.isArray(features) ? features.filter(Boolean).join(',') : '',
      Array.isArray(images) ? images.filter(Boolean).join(',') : '',
      Array.isArray(specifications) ? specifications.filter(Boolean).join(',') : '',
      productId
    ];
    
    console.log('Update params:', JSON.stringify(updateParams, null, 2));

    // Perform update
    try {
      const updateResult = await db.run(
        'UPDATE products SET name = ?, short_description = ?, full_description = ?, background_video = ?, features = ?, images = ?, specifications = ? WHERE id = ?',
        updateParams
      );
      console.log('Update result:', updateResult);
      
      if (updateResult.changes === 0) {
        console.log('No rows were updated');
        return NextResponse.json({ error: 'Failed to update product - no rows affected' }, { status: 500 });
      }
    } catch (dbError) {
      console.error('Error updating product in database:', dbError);
      console.error('Error details:', dbError.message);
      console.error('Stack trace:', dbError.stack);
      return NextResponse.json({ 
        error: 'Failed to update product in database',
        details: dbError.message
      }, { status: 500 });
    }

    // Get updated product
    let updatedProduct;
    try {
      updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', productId);
      console.log('Retrieved updated product:', updatedProduct);
      
      if (!updatedProduct) {
        console.log('Product not found after update');
        return NextResponse.json({ error: 'Product not found after update' }, { status: 404 });
      }
    } catch (dbError) {
      console.error('Error fetching updated product:', dbError);
      console.error('Error details:', dbError.message);
      console.error('Stack trace:', dbError.stack);
      return NextResponse.json({ 
        error: 'Failed to fetch updated product',
        details: dbError.message
      }, { status: 500 });
    }

    // Transform and return the updated product
    try {
      const transformedProduct = {
        ...updatedProduct,
  features: updatedProduct.features ? updatedProduct.features.split(',').filter(Boolean) : [],
  images: updatedProduct.images ? updatedProduct.images.split(',').filter(Boolean) : [],
  specifications: updatedProduct.specifications ? updatedProduct.specifications.split(',').filter(Boolean) : [],
  background_video: updatedProduct.background_video || null,
  short_description: updatedProduct.short_description || '',
  full_description: updatedProduct.full_description || ''
      };
      
      console.log('Transformed product data:', JSON.stringify(transformedProduct, null, 2));
      
      return NextResponse.json({
        success: true,
        product: transformedProduct
      });
    } catch (transformError) {
      console.error('Error transforming product data:', transformError);
      return NextResponse.json({ 
        error: 'Error transforming product data',
        details: transformError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT request:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: error.message || 'Unknown error updating product',
      details: error.stack
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    await db.run('DELETE FROM product_reviews WHERE product_id = ?', id);
    await db.run('DELETE FROM products WHERE id = ?', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
