import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, ExternalLink } from 'lucide-react';

export default function ComplaintMap({
  latitude,
  longitude,
  address,
  village,
  mandal,
  district,
  height = '240px',
  interactive = false,
  onLocationChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const lat = parseFloat(latitude) || 17.3850; // default Hyderabad coords if missing
  const lng = parseFloat(longitude) || 78.4867;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet marker icon path issues in bundlers
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    // Custom civic Pin Icon
    const civicIcon = L.divIcon({
      className: 'custom-civic-pin',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #dc2626;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: civicIcon,
        draggable: interactive
      }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
          <strong style="color: #0f172a; font-size: 13px;">Grievance Location</strong><br/>
          <span style="color: #475569;">${address || `${village || ''}, ${mandal || ''}, ${district || ''}`}</span><br/>
          <span style="color: #0284c7; font-weight: bold; font-size: 11px;">Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)}</span>
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();

      if (interactive && onLocationChange) {
        marker.on('dragend', function (e) {
          const newPos = e.target.getLatLng();
          onLocationChange(newPos.lat, newPos.lng);
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="color: #0f172a; font-size: 13px;">Grievance Location</strong><br/>
            <span style="color: #475569;">${address || `${village || ''}, ${mandal || ''}, ${district || ''}`}</span><br/>
            <span style="color: #0284c7; font-weight: bold; font-size: 11px;">Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)}</span>
          </div>
        `;
        markerRef.current.setPopupContent(popupContent);
      }
    }

    return () => {
      // clean up on unmount
    };
  }, [lat, lng, address, village, mandal, district, interactive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height, minHeight: '180px', zIndex: 10 }}
      />
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#475569',
          borderTop: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} color="#dc2626" />
          <span>
            {lat.toFixed(5)}, {lng.toFixed(5)} &bull; {village || 'Locality'}, {mandal || 'Mandal'}
          </span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          <span>Open in Google Maps</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
