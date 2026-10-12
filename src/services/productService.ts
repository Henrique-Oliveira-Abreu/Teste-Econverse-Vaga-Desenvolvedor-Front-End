import type { Product, ProductsResponse } from '../types';

const PRODUCTS_URL = '/api/products';

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await fetch(PRODUCTS_URL, { signal });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar os produtos (${response.status}).`);
  }

  const data: ProductsResponse = await response.json();
  if (!data.success || !Array.isArray(data.products)) {
    throw new Error('A resposta do catálogo está em um formato inválido.');
  }

  return data.products;
}
