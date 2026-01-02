import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
}

interface AmbulanceMapProps {
  userLocation: Location;
  ambulanceLocation?: Location | null;
  status?: string;
}

const AmbulanceMap: React.FC<AmbulanceMapProps> = ({ 
  userLocation, 
  ambulanceLocation,
  status 
}) => {
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
    // Create a static map URL showing both locations
    const userMarker = `${userLocation.longitude},${userLocation.latitude}`;
    
    // Using OpenStreetMap static image via a free service
    let url = `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.longitude - 0.02},${userLocation.latitude - 0.02},${userLocation.longitude + 0.02},${userLocation.latitude + 0.02}&layer=mapnik&marker=${userLocation.latitude},${userLocation.longitude}`;
    
    setMapUrl(url);
  }, [userLocation, ambulanceLocation]);

  const calculateDistance = () => {
    if (!ambulanceLocation) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (ambulanceLocation.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (ambulanceLocation.longitude - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(ambulanceLocation.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(2);
  };

  return (
    <Card className="overflow-hidden border-primary/30">
      <div className="relative">
        {/* Map Container */}
        <div className="h-64 bg-muted relative">
          <iframe
            src={mapUrl}
            className="w-full h-full border-0"
            title="Location Map"
            loading="lazy"
          />
          
          {/* Overlay with status */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-md">
              <MapPin className="h-4 w-4 text-destructive" />
              <span className="font-medium">Your Location</span>
            </div>
            
            {ambulanceLocation && (
              <div className="bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-md text-primary-foreground">
                <Navigation className="h-4 w-4 animate-pulse" />
                <span className="font-medium">Ambulance</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status === 'en_route' || status === 'accepted' ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ambulance En Route</p>
                    <p className="text-xs text-muted-foreground">
                      {ambulanceLocation ? `${calculateDistance()} km away` : 'Calculating distance...'}
                    </p>
                  </div>
                </>
              ) : status === 'initiated' ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Finding Ambulance</p>
                    <p className="text-xs text-muted-foreground">Searching for nearest available...</p>
                  </div>
                </>
              ) : status === 'arrived' ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ambulance Arrived!</p>
                    <p className="text-xs text-muted-foreground">Help is here</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Location Shared</p>
                    <p className="text-xs text-muted-foreground">Emergency services notified</p>
                  </div>
                </>
              )}
            </div>

            {/* Open in Maps */}
            <a
              href={`https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Open in Maps →
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AmbulanceMap;
