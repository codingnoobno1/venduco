export interface LoginSlide {
  id: string;
  image: string;
  alt: string;
  discipline: string;
  title: string;
  description: string;
}

export const LOGIN_SLIDES: readonly LoginSlide[] = [
  {
    id: "civil-delivery",
    image: "/images/login/civil-delivery.png",
    alt: "Civil engineers coordinating viaduct construction at an active infrastructure site",
    discipline: "Civil delivery",
    title: "Build with field visibility",
    description:
      "Coordinate packages, quantities, milestones and site decisions from one controlled workspace.",
  },
  {
    id: "electrical-ohe",
    image: "/images/login/electrical-ohe.png",
    alt: "Electrical engineers inspecting railway overhead electrification equipment",
    discipline: "Electrical & OHE",
    title: "Energise every interface",
    description:
      "Connect installation, inspection and commissioning teams to the same delivery record.",
  },
  {
    id: "signalling-telecom",
    image: "/images/login/signalling-telecom.png",
    alt: "Signalling and telecom engineers commissioning trackside systems",
    discipline: "Signalling & telecom",
    title: "Commission with confidence",
    description:
      "Keep technical checks, dependencies and approvals traceable through every handover.",
  },
  {
    id: "mechanical-equipment",
    image: "/images/login/mechanical-equipment.png",
    alt: "Mechanical engineers inspecting heavy construction equipment in a site yard",
    discipline: "Mechanical & plant",
    title: "Keep critical equipment ready",
    description:
      "Bring fleet readiness, maintenance evidence and resource coordination into daily planning.",
  },
  {
    id: "quality-safety",
    image: "/images/login/quality-safety.png",
    alt: "Quality and safety teams inspecting concrete works and briefing a site crew",
    discipline: "Quality & HSE",
    title: "Turn assurance into action",
    description:
      "Capture inspections, risks and corrective actions where the work actually happens.",
  },
  {
    id: "integrated-corridor",
    image: "/images/login/integrated-corridor.png",
    alt: "Multidisciplinary engineers reviewing an integrated transport corridor project",
    discipline: "Integrated controls",
    title: "One view across the corridor",
    description:
      "Align civil, electrical, mechanical and commercial teams around live delivery priorities.",
  },
] as const;
