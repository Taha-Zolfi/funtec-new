"use client";
import ProductDetail from '../ProductDetail.jsx';
import React from "react";

export default function ProductDetailsPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  
  // Parse id from params
  const productId = parseInt(id);
  
  if (isNaN(productId)) {
    return <div>محصول نامعتبر</div>;
  }
  
  return <ProductDetail productId={productId} />;
}
