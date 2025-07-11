import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const MapComponent = ({ heatmapData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([12.9716, 77.5946], 13);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add markers for each gate
    heatmapData.forEach((gate) => {
      // Get gate coordinates from the data
      const coordinates = getGateCoordinates(gate._id);
      
      if (coordinates) {
        const color = getRiskColor(gate.color || 'green');
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([coordinates.lat, coordinates.lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>Gate ${gate._id}</strong><br/>
              Density: ${gate.density}<br/>
              Risk: ${gate.tag || 'Safe'}<br/>
              Level: ${gate.riskLevel || 1}
            </div>
          `);
      }
    });
  }, [heatmapData]);

  const getGateCoordinates = (gateId) => {
    // Gate coordinates mapping
    const coordinates = {
      'G1': { lat: 12.9784, lng: 77.5996 }, // Stadium North
      'G2': { lat: 12.9762, lng: 77.5990 }, // Stadium South
      'G3': { lat: 12.9775, lng: 77.6010 }, // Stadium East
      'G4': { lat: 12.9770, lng: 77.5975 }, // Stadium West
      // Metro coordinates (slightly different area)
      'G5': { lat: 12.9758, lng: 77.6101 }, // Metro Entry 1
      'G6': { lat: 12.9760, lng: 77.6095 }, // Metro Entry 2
      'G7': { lat: 12.9762, lng: 77.6103 }, // Metro Exit 1
      'G8': { lat: 12.9756, lng: 77.6098 }, // Metro Exit 2
      // Mall coordinates
      'G9': { lat: 13.0116, lng: 77.5556 }, // Mall Main
      'G10': { lat: 13.0120, lng: 77.5560 }, // Mall Parking
      'G11': { lat: 13.0118, lng: 77.5558 }, // Mall Food Court
      'G12': { lat: 13.0114, lng: 77.5552 }, // Mall Emergency
    };
    
    return coordinates[gateId];
  };

  const getRiskColor = (color) => {
    const colorMap = {
      'green': '#28a745',
      'yellow': '#ffc107',
      'orange': '#fd7e14',
      'darkred': '#dc3545',
      'red': '#6f42c1'
    };
    return colorMap[color] || '#28a745';
  };

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent; 