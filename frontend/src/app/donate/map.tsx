"use client";

import Link from "next/link";
import { Label } from "@radix-ui/react-label";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DivIcon } from "leaflet";

import { Badge } from "@/components/ui/badge";

const foodBankIcon = new DivIcon({
  className: "custom-foodbank-marker",
  html: `<div style="
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" stroke="none" class="lucide lucide-map-marker-filled"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const foodBanks = [
  {
    name: "Hamburger Tafel e.V.",
    address: "Dratelnstraße 32, 21109 Hamburg",
    position: [53.5101, 10.0221],
    website: "https://www.hamburger-tafel.de/",
    slotStatus: "3 slots left",
    currentIngredients: [
      { name: "Chicken Breast", quantity: 1, unit: "kg", expires_in_days: 3 },
      { name: "Rice", quantity: 2, unit: "kg", expires_in_days: 30 },
      { name: "Tomatoes", quantity: 1, unit: "kg", expires_in_days: 5 },
    ],
  },
  {
    name: "Tafel Harburg",
    address: "Baererstraße 36, 21073 Hamburg",
    position: [53.4576, 9.9786],
    website: "https://www.tafel-harburg.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Pasta", quantity: 1, unit: "kg", expires_in_days: 20 },
      { name: "Milk", quantity: 1, unit: "L", expires_in_days: 7 },
      { name: "Potatoes", quantity: 3, unit: "kg", expires_in_days: 15 },
    ],
  },
  {
    name: "Tafel Altona",
    address: "Stresemannstraße 374, 22761 Hamburg",
    position: [53.5652, 9.9227],
    website: "https://www.altonaer-tafel.de/",
    slotStatus: "2 slots left",
    currentIngredients: [
      { name: "Bread", quantity: 2, unit: "loaves", expires_in_days: 2 },
      { name: "Eggs", quantity: 12, unit: "pcs", expires_in_days: 10 },
      { name: "Carrots", quantity: 1, unit: "kg", expires_in_days: 7 },
    ],
  },
  {
    name: "Tafel Wandsbek",
    address: "Wandsbeker Allee 68, 22041 Hamburg",
    position: [53.5734, 10.0753],
    website: "https://www.tafel-wandsbek.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Apples", quantity: 2, unit: "kg", expires_in_days: 14 },
      { name: "Cheese", quantity: 500, unit: "g", expires_in_days: 20 },
      { name: "Onions", quantity: 1, unit: "kg", expires_in_days: 30 },
    ],
  },
  {
    name: "Tafel Eimsbüttel",
    address: "Hoheluftchaussee 95, 20253 Hamburg",
    position: [53.5793, 9.9665],
    website: "https://www.tafel-eimsbuettel.de/",
    slotStatus: "9 slots left",
    currentIngredients: [
      { name: "Chicken Breast", quantity: 1, unit: "kg", expires_in_days: 3 },
      { name: "Flour", quantity: 1, unit: "kg", expires_in_days: 180 },
      { name: "Bananas", quantity: 1, unit: "kg", expires_in_days: 5 },
    ],
  },
  {
    name: "Tafel Bergedorf",
    address: "Kurt-A.-Körber-Chaussee 73, 21033 Hamburg",
    position: [53.4857, 10.2147],
    website: "https://www.tafel-bergedorf.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Rice", quantity: 2, unit: "kg", expires_in_days: 30 },
      { name: "Tomatoes", quantity: 1, unit: "kg", expires_in_days: 5 },
      { name: "Milk", quantity: 1, unit: "L", expires_in_days: 7 },
    ],
  },
  {
    name: "Hamburg University of Technology",
    address: "Am Schwarzenberg-Campus 1, 21073 Hamburg",
    position: [53.4612, 9.9696],
    website: "https://www.tuhh.de/",
    slotStatus: "17 slots left",
    currentIngredients: [
      { name: "Pasta", quantity: 1, unit: "kg", expires_in_days: 20 },
      { name: "Eggs", quantity: 12, unit: "pcs", expires_in_days: 10 },
      { name: "Cheese", quantity: 500, unit: "g", expires_in_days: 20 },
    ],
  },
  {
    name: "Tafel St. Pauli",
    address: "Simon-von-Utrecht-Straße 1, 20359 Hamburg",
    position: [53.5503, 9.9671],
    website: "https://www.tafel-stpauli.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Potatoes", quantity: 3, unit: "kg", expires_in_days: 15 },
      { name: "Carrots", quantity: 1, unit: "kg", expires_in_days: 7 },
      { name: "Bread", quantity: 2, unit: "loaves", expires_in_days: 2 },
    ],
  },
  {
    name: "Tafel Barmbek",
    address: "Fuhlsbüttler Straße 113, 22305 Hamburg",
    position: [53.5886, 10.0336],
    website: "https://www.tafel-barmbek.de/",
    slotStatus: "6 slots left",
    currentIngredients: [
      { name: "Bananas", quantity: 1, unit: "kg", expires_in_days: 5 },
      { name: "Onions", quantity: 1, unit: "kg", expires_in_days: 30 },
      { name: "Flour", quantity: 1, unit: "kg", expires_in_days: 180 },
    ],
  },
  {
    name: "Tafel Niendorf",
    address: "Niendorfer Marktplatz 12, 22459 Hamburg",
    position: [53.6312, 9.9484],
    website: "https://www.tafel-niendorf.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Chicken Breast", quantity: 1, unit: "kg", expires_in_days: 3 },
      { name: "Apples", quantity: 2, unit: "kg", expires_in_days: 14 },
      { name: "Rice", quantity: 2, unit: "kg", expires_in_days: 30 },
    ],
  },
  {
    name: "Tafel Rahlstedt",
    address: "Rahlstedter Straße 151, 22143 Hamburg",
    position: [53.6087, 10.1602],
    website: "https://www.tafel-rahlstedt.de/",
    slotStatus: "11 slots left",
    currentIngredients: [
      { name: "Milk", quantity: 1, unit: "L", expires_in_days: 7 },
      { name: "Tomatoes", quantity: 1, unit: "kg", expires_in_days: 5 },
      { name: "Pasta", quantity: 1, unit: "kg", expires_in_days: 20 },
    ],
  },
  {
    name: "Tafel Lokstedt",
    address: "Vogt-Wells-Straße 22, 22529 Hamburg",
    position: [53.5921, 9.9594],
    website: "https://www.tafel-lokstedt.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Eggs", quantity: 12, unit: "pcs", expires_in_days: 10 },
      { name: "Cheese", quantity: 500, unit: "g", expires_in_days: 20 },
      { name: "Potatoes", quantity: 3, unit: "kg", expires_in_days: 15 },
    ],
  },
  {
    name: "Tafel Finkenwerder",
    address: "Ostfrieslandstraße 2, 21129 Hamburg",
    position: [53.5333, 9.8644],
    website: "https://www.tafel-finkenwerder.de/",
    slotStatus: "9 slots left",
    currentIngredients: [
      { name: "Carrots", quantity: 1, unit: "kg", expires_in_days: 7 },
      { name: "Bread", quantity: 2, unit: "loaves", expires_in_days: 2 },
      { name: "Bananas", quantity: 1, unit: "kg", expires_in_days: 5 },
    ],
  },
  {
    name: "Tafel Wilhelmsburg",
    address: "Veringstraße 147, 21107 Hamburg",
    position: [53.5156, 9.9874],
    website: "https://www.tafel-wilhelmsburg.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Onions", quantity: 1, unit: "kg", expires_in_days: 30 },
      { name: "Flour", quantity: 1, unit: "kg", expires_in_days: 180 },
      { name: "Apples", quantity: 2, unit: "kg", expires_in_days: 14 },
    ],
  },
  {
    name: "Tafel Langenhorn",
    address: "Langenhorner Chaussee 560, 22419 Hamburg",
    position: [53.6542, 10.0064],
    website: "https://www.tafel-langenhorn.de/",
    slotStatus: "4 slots left",
    currentIngredients: [
      { name: "Rice", quantity: 2, unit: "kg", expires_in_days: 30 },
      { name: "Tomatoes", quantity: 1, unit: "kg", expires_in_days: 5 },
      { name: "Chicken Breast", quantity: 1, unit: "kg", expires_in_days: 3 },
    ],
  },
  {
    name: "Tafel Eppendorf",
    address: "Eppendorfer Landstraße 102, 20249 Hamburg",
    position: [53.5816, 9.9824],
    website: "https://www.tafel-eppendorf.de/",
    slotStatus: "Slots Full",
    currentIngredients: [
      { name: "Pasta", quantity: 1, unit: "kg", expires_in_days: 20 },
      { name: "Milk", quantity: 1, unit: "L", expires_in_days: 7 },
      { name: "Eggs", quantity: 12, unit: "pcs", expires_in_days: 10 },
    ],
  },
  {
    name: "Tafel Blankenese",
    address: "Blankeneser Bahnhofstraße 5, 22587 Hamburg",
    position: [53.5611, 9.7872],
    website: "https://www.tafel-blankenese.de/",
    slotStatus: "5 slots left",
    currentIngredients: [
      { name: "Cheese", quantity: 500, unit: "g", expires_in_days: 20 },
      { name: "Potatoes", quantity: 3, unit: "kg", expires_in_days: 15 },
      { name: "Carrots", quantity: 1, unit: "kg", expires_in_days: 7 },
    ],
  },
];

export default function HamburgMap() {
  const bounds: [[number, number], [number, number]] = [
    [53.395, 9.7],
    [53.715, 10.3],
  ];

  return (
    <MapContainer
      center={[53.5511, 9.9937]}
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "24px" }}
      maxBounds={bounds}
      minZoom={10}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      {foodBanks.map((bank, idx) => (
        <Marker
          key={idx}
          position={bank.position as [number, number]}
          icon={foodBankIcon}
        >
          <Popup>
            <div>
              <h2 className="text-slate-950 text-xl font-bold">{bank.name}</h2>
              <div className="text-slate-500 mb-2">{bank.address}</div>
              <Link
                href={bank.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                To the Website
              </Link>
              <div>
                <Badge
                  variant={"outline"}
                  className="px-4 py-1 mt-4 rounded-full"
                >
                  {bank.slotStatus}
                </Badge>
              </div>
              <div className="py-4">
                <Label className="text-lg font-bold">Current Inventory</Label>
                <div className="mt-2">
                  {bank.currentIngredients.map((ingredient, index) => (
                    <ul key={index} className="text-slate-700 text-xs">
                      <li className="mb-2">
                        <strong>{ingredient.name}</strong> {ingredient.quantity}{" "}
                        {ingredient.unit}{" "}
                        <span className="text-slate-600 bg-slate-100 rounded-full px-2 py-1 text-xs">
                          Expires in {ingredient.expires_in_days} days
                        </span>
                      </li>
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
