export interface SEORequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  style: string;
  storeName?: string;
}

export interface SEOResult {
  title: string;
  description: string;
  tags: string[];
  imagePrompts: string[];
}
