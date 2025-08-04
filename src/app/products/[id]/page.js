"use client";
import ProductDetail from '../ProductDetail.jsx';
import React from "react";

export default function ProductDetailsPage({ params }) {
  const { id } = React.use(params);
  return <ProductDetail id={id} />;
}
