import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import axios from 'axios';
import useGoogleMapsApi from '../hooks/useGoogleMapsApi';

const StoreList = lazy(() => import('./StoreList'));
const StorePopup = lazy(() => import('./StorePopup'));

const containerStyle = {
  display: 'flex',
  width: '100%',
  height: '100vh',
};

const mapStyle = {
  flex: 1,
  height: '100%',
};

const Map = () => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const isGoogleMapsLoaded = useGoogleMapsApi();

  const fetchNearbyStores = useCallback(async (longitude, latitude) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/v1/stores/nearby`, {
        params: {
          longitude,
          latitude,
          max_distance: 3000
        },
        timeout: 5000,
        headers: {
          'Cache-Control': 'max-age=300'
        }
      });
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching nearby stores:", error.response || error);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation && isGoogleMapsLoaded) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            setCenter(location);
            setCurrentLocation(location);
            fetchNearbyStores(longitude, latitude);
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
      );
    } else if (!navigator.geolocation) {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  }, [fetchNearbyStores, isGoogleMapsLoaded]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  }), []);

  const initMap = useCallback(() => {
    if (center && !map && isGoogleMapsLoaded && window.google) {
      const newMap = new window.google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 16,
        ...mapOptions,
      });
      setMap(newMap);

      newMap.addListener('tilesloaded', () => {
        newMap.setOptions({
          scrollwheel: true,
          disableDoubleClickZoom: false
        });
      });
    }
  }, [center, map, mapOptions, isGoogleMapsLoaded]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  const handleMarkerClick = useCallback((store, marker) => {
    setSelectedStore(store);

    const markerPosition = marker.getPosition();
    map.setCenter(markerPosition);
    map.setZoom(18);

    requestAnimationFrame(() => {
      const mapDiv = document.getElementById('map');
      const mapRect = mapDiv.getBoundingClientRect();
      const scale = Math.pow(2, map.getZoom());
      const pixelOffset = new window.google.maps.Point(
          (markerPosition.lng() - map.getCenter().lng()) * (mapRect.width / 360) * scale,
          (map.getCenter().lat() - markerPosition.lat()) * (mapRect.height / 180) * scale
      );

      const popupX = mapRect.left + mapRect.width / 2 + pixelOffset.x;
      const popupY = mapRect.top + mapRect.height / 2 + pixelOffset.y;

      setPopupPosition({ x: popupX, y: popupY });
    });
  }, [map]);

  const handleStoreSelect = useCallback((store) => {
    if (map) {
      const storePosition = { lat: store.loc.coordinates[1], lng: store.loc.coordinates[0] };
      map.setCenter(storePosition);
      map.setZoom(18);

      const selectedMarker = map.markers.find(marker =>
          marker.getPosition().lat() === storePosition.lat &&
          marker.getPosition().lng() === storePosition.lng
      );
      if (selectedMarker) {
        handleMarkerClick(store, selectedMarker);
      }
    }
  }, [map, handleMarkerClick]);

  const handleReturnToCurrentLocation = useCallback(() => {
    if (map && currentLocation) {
      map.setCenter(currentLocation);
      map.setZoom(16);
      fetchNearbyStores(currentLocation.lng, currentLocation.lat);
      setSelectedStore(null);
      setPopupPosition(null);
    }
  }, [map, currentLocation, fetchNearbyStores]);

  const handleClosePopup = useCallback(() => {
    setSelectedStore(null);
    setPopupPosition(null);
  }, []);

  const updateMarkers = useCallback(() => {
    if (map && center && isGoogleMapsLoaded && window.google) {
      map.setCenter(center);

      if (map.markers) {
        map.markers.forEach(marker => marker.setMap(null));
        map.overlays.forEach(overlay => overlay.setMap(null));
      }
      map.markers = [];
      map.overlays = [];

      class StoreLabel extends window.google.maps.OverlayView {
        constructor(position, content) {
          super();
          this.position = position;
          this.content = content;
        }

        onAdd() {
          this.div = document.createElement('div');
          this.div.style.position = 'absolute';
          this.div.style.backgroundColor = 'white';
          this.div.style.border = '1px solid #ccc';
          this.div.style.borderRadius = '5px';
          this.div.style.padding = '1px 3px';
          this.div.style.fontSize = '12px';
          this.div.style.fontFamily = 'Arial, sans-serif';
          this.div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
          this.div.style.userSelect = 'none';
          this.div.style.whiteSpace = 'nowrap';
          this.div.innerHTML = this.content;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(this.div);
        }

        draw() {
          const overlayProjection = this.getProjection();
          const position = overlayProjection.fromLatLngToDivPixel(this.position);
          this.div.style.left = (position.x + 12) + 'px';
          this.div.style.top = (position.y - 23) + 'px';
        }

        onRemove() {
          if (this.div) {
            this.div.parentNode.removeChild(this.div);
            delete this.div;
          }
        }
      }

      const currentLocationMarker = new window.google.maps.Marker({
        position: center,
        map: map,
        title: "Your Location",
        icon: {
          url: `${process.env.PUBLIC_URL}/img/mannertee.png`,
          scaledSize: new window.google.maps.Size(32, 48)
        }
      });
      map.markers.push(currentLocationMarker);

      stores.forEach(store => {
        const position = { lat: store.loc.coordinates[1], lng: store.loc.coordinates[0] };
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: store.name,
          icon: {
            url: `${process.env.PUBLIC_URL}/img/tmark.png`,
            scaledSize: new window.google.maps.Size(20, 20)
          }
        });

        const label = new StoreLabel(position, store.name);
        label.setMap(map);

        marker.addListener('click', () => handleMarkerClick(store, marker));

        map.markers.push(marker);
        map.overlays.push(label);
      });

      map.addListener('click', (e) => {
        if (e.placeId) return;
        handleClosePopup();
      });
    }
  }, [map, center, stores, handleMarkerClick, isGoogleMapsLoaded, handleClosePopup]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  useEffect(() => {
    return () => {
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [map]);

  if (!isGoogleMapsLoaded) return <div>Loading Google Maps...</div>;
  if (!center) return <div>Loading... Please enable location services if prompted.</div>;

  return (
      <div style={containerStyle}>
        <div id="map" style={mapStyle}></div>
        <Suspense fallback={<div>Loading...</div>}>
          <StoreList
              stores={stores}
              onStoreSelect={handleStoreSelect}
              onReturnToCurrentLocation={handleReturnToCurrentLocation}
          />
          {selectedStore && popupPosition && (
              <StorePopup
                  store={selectedStore}
                  position={popupPosition}
                  onClose={handleClosePopup}
              />
          )}
        </Suspense>
      </div>
  );
}

export default React.memo(Map);