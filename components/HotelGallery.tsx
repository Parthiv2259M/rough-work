import Image from 'next/image';
import { CarFront, Coffee, ShieldCheck, Wifi } from 'lucide-react';

const amenityIcons: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  Parking: CarFront,
  Breakfast: Coffee,
  '24/7 Support': ShieldCheck,
};

export default function HotelGallery({ gallery, name }: { gallery: string[]; name: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {gallery.map((image, index) => {
        const Icon = amenityIcons[Object.keys(amenityIcons)[index % Object.keys(amenityIcons).length]] ?? Wifi;

        return (
          <div key={`${name}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-52 w-full">
              <Image src={image} alt={`${name} gallery ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="flex items-center gap-2 p-3 text-sm text-slate-600">
              <Icon className="h-4 w-4 text-brand-600" />
              {['WiFi', 'Parking', 'Breakfast', '24/7 Support'][index % 4]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
