import { hotels } from '@/data/hotels';

export function getHotelById(id: string) {
  return hotels.find((hotel) => hotel.id === id) ?? null;
}

export function getFeaturedHotels(limit = 3) {
  return hotels.filter((hotel) => hotel.isFeatured).slice(0, limit);
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
