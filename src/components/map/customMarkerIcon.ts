import L from "leaflet";

const beerSvg =
  '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7v13h11V7M17 8h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M9 11v5M13 11v5"/><path d="M5 7a3 3 0 0 1 3-4c1-2 4-2 5 0a3 3 0 0 1 4 4Z"/></svg>';

export function createPubIcon(selected = false) {
  return L.divIcon({
    className: `map-marker${selected ? " selected" : ""}`,
    html: `<div class="map-marker-pin">${beerSvg}</div>`,
    iconSize: [40, 45],
    iconAnchor: [20, 43],
  });
}
