import React, { useState, useEffect } from "react";
import {
  MapContainer,
  LayersControl,
  LayerGroup,
  Polyline,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import calculatePolyLines from "./polylines";
import L from "leaflet";

const Map = ({ data, setSelectedHcp, selectedHcp, setShowHcpDetails }) => {
  const [polylines, setPolylines] = useState([]);

  useEffect(() => {
    if (data?.edges) setPolylines(calculatePolyLines(data));
  }, [data?.nodes, data?.edges]);

  const center = [37.445767, -100.161522];

  const ChangeView = () => {
    const map = useMap();
    if (selectedHcp?.key) {
      map.setView([
        parseFloat(selectedHcp?.attributes.lat),
        parseFloat(selectedHcp?.attributes.lng),
      ]);
    } else {
      map.setView(center);
    }
    return null;
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        style={{ width: "100%", height: "550px" }}
        center={center}
        zoom={4}
        scrollWheelZoom={false}
      >
        <ChangeView />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Default Map">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="KOLs Marked on Map">
            <LayerGroup>
              {data?.nodes?.map((element, index) => {
                return (
                  <Marker
                    key={index}
                    id={element?.key}
                    position={[element.attributes.lat, element.attributes.lng]}
                    zIndexOffset={element.attributes.icon ? 1000 : 0}
                    icon={
                      element.attributes.icon != null
                        ? new L.Icon({
                            iconUrl: element.attributes.icon,
                            iconRetinaUrl: element.attributes.icon,
                            popupAnchor: [0, -12],
                            iconSize:
                              selectedHcp?.key == element?.key
                                ? new L.point(35, 35)
                                : new L.Point(20, 20),
                          })
                        : new L.divIcon({
                            iconSize:
                              selectedHcp?.key == element?.key
                                ? new L.point(20, 20)
                                : new L.Point(10, 10),
                            html: `<div style="background-color:${
                              element.attributes.color
                            };padding:${
                              selectedHcp?.key == element?.key ? "10px" : "5px"
                            };" ></div>`,
                            popupAnchor: [0, -5],
                          })
                    }
                  >
                    <Popup closeOnClick>
                      {element.attributes.label +
                        ", " +
                        element.attributes.credentials}
                      <button
                        style={{
                          fontStyle: "italic",
                          fontWeight: "bold",
                          marginLeft: "5px",
                        }}
                        onClick={() => {
                          setSelectedHcp(element);
                          setShowHcpDetails(true);
                        }}
                      >
                        i
                      </button>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Influence Directed on Map">
            <LayerGroup>
              {polylines?.length > 0 &&
                polylines.map((poly, index) => {
                  return (
                    <Polyline
                      key={index}
                      pathOptions={{ color: poly.cc, weight: 1 }}
                      positions={poly.pointList}
                    />
                  );
                })}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default Map;
