// Predefined automotive service templates for quick setup
export interface ServiceTemplate {
  service_name: string;
  description: string;
  category: 'maintenance' | 'repair' | 'detailing' | 'inspection' | 'cleaning' | 'tuning' | 'other';
  estimated_duration: number;
  requires_appointment: boolean;
  service_details: string;
  prerequisites?: string;
  typical_pricing?: {
    kleinwagen?: number;
    mittelklasse?: number;
    oberklasse?: number;
    suv?: number;
    transporter?: number;
    motorrad?: number;
  };
}

export const automotiveServiceTemplates: ServiceTemplate[] = [
  // Maintenance Services
  {
    service_name: "Ölwechsel",
    description: "Kompletter Motoröl- und Filterwechsel",
    category: "maintenance",
    estimated_duration: 45,
    requires_appointment: true,
    service_details: "Vollsynthetisches Motoröl, neuer Ölfilter, Ölstand- und Leckagenprüfung",
    typical_pricing: { kleinwagen: 89, mittelklasse: 119, oberklasse: 149, suv: 139, motorrad: 69 }
  },
  {
    service_name: "Inspektion",
    description: "Große Inspektion nach Herstellervorgaben",
    category: "inspection",
    estimated_duration: 180,
    requires_appointment: true,
    service_details: "Komplette Fahrzeugprüfung, alle Flüssigkeiten, Bremsen, Beleuchtung, Computer-Diagnose",
    typical_pricing: { kleinwagen: 299, mittelklasse: 399, oberklasse: 599, suv: 499 }
  },
  {
    service_name: "Reifenwechsel",
    description: "Saisonaler Reifen- und Räderwechsel",
    category: "maintenance",
    estimated_duration: 60,
    requires_appointment: true,
    service_details: "Reifen wechseln, Luftdruck prüfen, Profiltiefe messen, Auswuchten bei Bedarf",
    typical_pricing: { kleinwagen: 39, mittelklasse: 49, oberklasse: 59, suv: 59, transporter: 69 }
  },
  {
    service_name: "Bremsenservice",
    description: "Bremsbeläge und Bremsscheiben Service",
    category: "maintenance",
    estimated_duration: 120,
    requires_appointment: true,
    service_details: "Bremsbeläge prüfen/wechseln, Bremsscheiben prüfen, Bremsflüssigkeit, Bremssystem spülen",
    typical_pricing: { kleinwagen: 199, mittelklasse: 299, oberklasse: 449, suv: 379 }
  },
  
  // Repair Services
  {
    service_name: "Batterie-Check & Wechsel",
    description: "Batterieprüfung und Austausch",
    category: "repair",
    estimated_duration: 30,
    requires_appointment: false,
    service_details: "Batteriekapazität testen, Ladezustand prüfen, neue Batterie einbauen und programmieren",
    typical_pricing: { kleinwagen: 149, mittelklasse: 179, oberklasse: 229, suv: 199, motorrad: 89 }
  },
  {
    service_name: "Klimaanlagen-Service",
    description: "Klimaanlage warten und reparieren",
    category: "repair",
    estimated_duration: 90,
    requires_appointment: true,
    service_details: "Klimagas prüfen/auffüllen, Filter wechseln, Funktionsprüfung, Desinfektion",
    typical_pricing: { kleinwagen: 129, mittelklasse: 149, oberklasse: 189, suv: 169 }
  },
  {
    service_name: "Auspuff-Reparatur",
    description: "Auspuffanlage reparieren oder austauschen",
    category: "repair",
    estimated_duration: 120,
    requires_appointment: true,
    service_details: "Auspuffanlage prüfen, defekte Teile ersetzen, Abgaswerte messen",
    typical_pricing: { kleinwagen: 199, mittelklasse: 299, oberklasse: 499, suv: 399 }
  },

  // Detailing & Cleaning
  {
    service_name: "Fahrzeugwäsche Premium",
    description: "Professionelle Außen- und Innenreinigung",
    category: "cleaning",
    estimated_duration: 120,
    requires_appointment: true,
    service_details: "Handwäsche, Felgenreinigung, Innenraum saugen und wischen, Kunststoffpflege",
    typical_pricing: { kleinwagen: 49, mittelklasse: 69, oberklasse: 89, suv: 79, transporter: 99 }
  },
  {
    service_name: "Lackaufbereitung",
    description: "Professionelle Lackpflege und Aufbereitung",
    category: "detailing",
    estimated_duration: 240,
    requires_appointment: true,
    service_details: "Lackpolitur, Kratzer entfernen, Wachsversiegelung, Hochglanz-Finish",
    typical_pricing: { kleinwagen: 299, mittelklasse: 399, oberklasse: 599, suv: 499 }
  },
  {
    service_name: "Innenraum-Aufbereitung",
    description: "Komplette Innenraumreinigung und -pflege",
    category: "detailing",
    estimated_duration: 180,
    requires_appointment: true,
    service_details: "Sitze reinigen, Teppiche shampoonieren, Armaturenbrett pflegen, Geruchsneutralisierung",
    typical_pricing: { kleinwagen: 199, mittelklasse: 249, oberklasse: 349, suv: 299 }
  },

  // Inspection Services
  {
    service_name: "TÜV-Vorbereitung",
    description: "Fahrzeug für TÜV/HU vorbereiten",
    category: "inspection",
    estimated_duration: 90,
    requires_appointment: true,
    service_details: "Komplette Fahrzeugprüfung, alle sicherheitsrelevanten Teile, Mängelbehebung",
    typical_pricing: { kleinwagen: 89, mittelklasse: 119, oberklasse: 149, suv: 129, motorrad: 69 }
  },
  {
    service_name: "Abgas-Untersuchung (AU)",
    description: "Abgasuntersuchung durchführen",
    category: "inspection",
    estimated_duration: 30,
    requires_appointment: true,
    service_details: "Abgaswerte messen, OBD-Auslese, Lambdasonde prüfen, AU-Bescheinigung",
    typical_pricing: { kleinwagen: 49, mittelklasse: 59, oberklasse: 69, suv: 64 }
  },

  // Tuning & Performance
  {
    service_name: "Chiptuning",
    description: "Motorleistung optimieren",
    category: "tuning",
    estimated_duration: 180,
    requires_appointment: true,
    service_details: "Kennfeld-Optimierung, Leistungssteigerung, Verbrauchsoptimierung, Garantie",
    typical_pricing: { mittelklasse: 699, oberklasse: 999, suv: 899 }
  },
  {
    service_name: "Tieferlegung",
    description: "Fahrwerk tieferlegen und einstellen",
    category: "tuning",
    estimated_duration: 240,
    requires_appointment: true,
    service_details: "Sportfahrwerk einbauen, Sturz und Spur einstellen, Probefahrt",
    typical_pricing: { kleinwagen: 899, mittelklasse: 1299, oberklasse: 1799 }
  }
];

export const defaultQuickActions = [
  {
    action_text: "Termin vereinbaren",
    action_type: "calendar" as const,
    message_template: "Gerne vereinbare ich einen Termin für Sie. Wann passt es Ihnen am besten?",
    icon_name: "calendar",
    display_order: 0
  },
  {
    action_text: "Kostenvoranschlag anfordern",
    action_type: "service_inquiry" as const,
    message_template: "Für einen detaillierten Kostenvoranschlag benötige ich einige Informationen zu Ihrem Fahrzeug.",
    icon_name: "euro",
    display_order: 1
  },
  {
    action_text: "Notfall-Service",
    action_type: "message" as const,
    message_template: "Sie haben einen Notfall? Rufen Sie uns sofort unter [TELEFON] an oder schildern Sie mir Ihr Problem.",
    icon_name: "phone",
    display_order: 2
  },
  {
    action_text: "Fahrzeug-Diagnose",
    action_type: "service_inquiry" as const,
    message_template: "Haben Sie Probleme mit Ihrem Fahrzeug? Beschreiben Sie die Symptome und ich helfe Ihnen weiter.",
    icon_name: "wrench",
    display_order: 3
  },
  {
    action_text: "Öffnungszeiten",
    action_type: "message" as const,
    message_template: "Unsere Öffnungszeiten: Mo-Fr 8:00-18:00, Sa 8:00-14:00. Termine auch außerhalb dieser Zeiten möglich.",
    icon_name: "clock",
    display_order: 4
  },
  {
    action_text: "Standort & Anfahrt",
    action_type: "message" as const,
    message_template: "Sie finden uns unter [ADRESSE]. Parkplätze direkt vor der Werkstatt verfügbar.",
    icon_name: "map-pin",
    display_order: 5
  }
];