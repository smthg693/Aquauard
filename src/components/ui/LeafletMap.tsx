import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Complaint } from '../../types';
import { useNavigate } from 'react-router-dom';

interface LeafletMapProps {
  complaints: Complaint[];
  height?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  complaints,
  height = '500px',
  onSelectComplaint,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || leafletInstance.current) return;

    // Default center (Metropolis City Center)
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([19.0760, 72.8777], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    leafletInstance.current = map;

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletInstance.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    const bounds = L.latLngBounds([]);

    complaints.forEach((c) => {
      const lat = c.latitude || 19.0760 + (Math.random() - 0.5) * 0.08;
      const lng = c.longitude || 72.8777 + (Math.random() - 0.5) * 0.08;

      let color = '#2EA9C4'; // Medium/Default Cyan
      if (c.severity === 'Critical') color = '#D6493C'; // Red
      else if (c.severity === 'High') color = '#DB8A1E'; // Orange
      else if (c.severity === 'Low') color = '#1F9D63'; // Green

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 6px rgba(11,37,69,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: 600; font-size: 12px; color: #0B2545;">${c.complaintCode}</span>
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 12px; background-color: ${color}20; color: ${color}; font-weight: 600;">
              ${c.severity}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1A2733;">${c.categoryName}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #4A5568;">${c.address}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #718096;">
            <span>Status: <strong>${c.status}</strong></span>
            <button id="btn-${c.id}" style="
              background-color: #0B2545;
              color: white;
              border: none;
              padding: 4px 10px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 11px;
              font-weight: 500;
            ">View Details</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${c.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectComplaint) {
              onSelectComplaint(c);
            } else {
              navigate(`/authority/complaints/${c.id}`);
            }
          };
        }
      });

      markersLayer.current?.addLayer(marker);
      bounds.extend([lat, lng]);
    });

    if (complaints.length > 0 && bounds.isValid()) {
      leafletInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [complaints, navigate, onSelectComplaint]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg shadow-sm border border-[#E2E8F0] z-0 overflow-hidden"
    />
  );
};
