import type { ImageSourcePropType } from 'react-native';

export type Product = {
  id: string;
  nameKey: string;
  detailKey: string;
  priceCrc: number;
  image: ImageSourcePropType;
};

export const products: Product[] = [
  { id: 'cap', nameKey: 'product.cap.name', detailKey: 'product.cap.detail', priceCrc: 18900, image: require('../../assets/shop/shop-cap.jpg') },
  { id: 'jersey', nameKey: 'product.jersey.name', detailKey: 'product.jersey.detail', priceCrc: 34900, image: require('../../assets/shop/shop-jersey.jpg') },
  { id: 'hoodie', nameKey: 'product.hoodie.name', detailKey: 'product.hoodie.detail', priceCrc: 42900, image: require('../../assets/shop/shop-hoodie.jpg') },
  { id: 'scarf', nameKey: 'product.scarf.name', detailKey: 'product.scarf.detail', priceCrc: 15900, image: require('../../assets/shop/shop-scarf.jpg') },
];
