export default function MapSection({ latitude, longitude, city }: { latitude: number; longitude: number; city: string }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(longitude - 0.03).toFixed(4)}%2C${(latitude - 0.02).toFixed(4)}%2C${(longitude + 0.03).toFixed(4)}%2C${(latitude + 0.02).toFixed(4)}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="glass-panel overflow-hidden">
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-xl font-bold text-slate-900">Location map</h3>
      </div>
      <div className="h-72 w-full">
        <iframe
          title={`${city} map`}
          src={mapUrl}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
