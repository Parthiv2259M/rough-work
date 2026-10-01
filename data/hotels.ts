export type Hotel = {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  coordinates: { lat: number; lng: number };
  features: string[];
  isFeatured: boolean;
  availableRooms: number;
  distanceFromCenter: string;
};

export const hotels: Hotel[] = [
  {
    id: 'azure-cove-resort',
    name: 'Azure Cove Resort',
    location: 'Seminyak, Bali',
    city: 'Bali',
    country: 'Indonesia',
    price: 189,
    rating: 4.9,
    reviewCount: 1284,
    category: 'Resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Oceanfront villa resort with private pools, open-air dining, and curated wellness experiences.',
    amenities: ['Infinity pool', 'Spa', 'Breakfast', 'Airport shuttle'],
    coordinates: { lat: -8.650, lng: 115.210 },
    features: ['Beachfront', 'Ocean view', 'Family rooms'],
    isFeatured: true,
    availableRooms: 14,
    distanceFromCenter: '1.4 km',
  },
  {
    id: 'harbor-light-hotel',
    name: 'Harbor Light Hotel',
    location: 'Queens, New York',
    city: 'New York',
    country: 'USA',
    price: 245,
    rating: 4.8,
    reviewCount: 942,
    category: 'City Hotel',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Contemporary loft hotel overlooking the city skyline, steps from museums and waterfront dining.',
    amenities: ['High speed WiFi', 'Gym', 'Room service', 'Pet-friendly'],
    coordinates: { lat: 40.694, lng: -73.942 },
    features: ['Downtown', 'Late checkout', 'Business center'],
    isFeatured: true,
    availableRooms: 22,
    distanceFromCenter: '3.8 km',
  },
  {
    id: 'alpine-peak-lodge',
    name: 'Alpine Peak Lodge',
    location: 'Zermatt, Switzerland',
    city: 'Zermatt',
    country: 'Switzerland',
    price: 320,
    rating: 5.0,
    reviewCount: 642,
    category: 'Mountain Lodge',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Boutique ski lodge with panoramic alpine views, a wellness spa, and mountain dining.',
    amenities: ['Ski access', 'Hot tub', 'Dinner', 'Concierge'],
    coordinates: { lat: 46.021, lng: 7.749 },
    features: ['Ski-in', 'Mountain view', 'Private chalet'],
    isFeatured: true,
    availableRooms: 9,
    distanceFromCenter: '0.8 km',
  },
  {
    id: 'sunset-bay-villas',
    name: 'Sunset Bay Villas',
    location: 'Nusa Dua, Bali',
    city: 'Bali',
    country: 'Indonesia',
    price: 210,
    rating: 4.7,
    reviewCount: 778,
    category: 'Villa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Private villa complex with breezy terraces, sunrise breakfasts, and lagoon access.',
    amenities: ['Private deck', 'Pool', 'Beach access', 'Complimentary breakfast'],
    coordinates: { lat: -8.75, lng: 115.228 },
    features: ['Garden view', 'Balcony', 'Family suites'],
    isFeatured: false,
    availableRooms: 18,
    distanceFromCenter: '2.1 km',
  },
  {
    id: 'midnight-palms',
    name: 'Midnight Palms',
    location: 'Dubai Marina, UAE',
    city: 'Dubai',
    country: 'UAE',
    price: 285,
    rating: 4.9,
    reviewCount: 1123,
    category: 'Luxury Hotel',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A luxury skyline stay with marina views, rooftop dining, and wellness concierge.',
    amenities: ['Sky lounge', 'Pool deck', 'Airport transfer', 'Spa'],
    coordinates: { lat: 25.085, lng: 55.145 },
    features: ['Waterfront', 'Rooftop lounge', 'VIP service'],
    isFeatured: false,
    availableRooms: 12,
    distanceFromCenter: '1.1 km',
  },
];

export const featuredHotels = hotels.filter((hotel) => hotel.isFeatured);
