// Database Types
export type SocialOuting = {
  _id: string;
  nombre: string;
  ubicacion?: string;
  deporte?: string;
  fecha?: string;
  hora?: string;
  duracion?: string;
  descripcion?: string;
  localidad?: string;
  provincia?: string;
  telefonoOrganizador?: string;
  imagen?: string;
  locationCoords?: {
    lat?: number;
    lng?: number;
  };
  dificultad?: string;
  precio?: string;
  cupo: number;
  cbu?: string;
  alias?: string;
  creador_id: any; // Populated User object
  whatsappLink?: string;
  shortId: string;
  participantes?: number; // Count of approved members
  createdAt: Date;
  updatedAt: Date;
};

export type Team = {
  _id: string;
  nombre: string;
  ubicacion: string;
  precio: string;
  deporte: string;
  fecha: string;
  hora: string;
  duracion: string;
  localidad?: string;
  provincia?: string;
  telefonoOrganizador?: string;
  whatsappLink?: string;
  descripcion?: string;
  imagen?: string;
  locationCoords?: {
    lat?: number;
    lng?: number;
  };
  creadorId: any; // Populated User object
  cupo: number;
  cbu?: string;
  alias?: string;
  dificultad?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Academy = {
  _id: string;
  dueño_id: any; // Populated User object
  nombre_academia: string;
  pais: string;
  provincia: string;
  localidad: string;
  descripcion?: string;
  tipo_disciplina: "Running" | "Trekking" | "Ciclismo" | "Otros";
  telefono?: string;
  imagen?: string;
  clase_gratis: boolean;
  precio?: string;
  cbu?: string;
  alias?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Member = {
  _id: string;
  usuario_id: any; // Populated User object
  salida_id?: any; // Populated SalidaSocial object
  fecha_union: Date;
  rol: "miembro" | "organizador";
  estado: "pendiente" | "aprobado" | "rechazado";
  pago_id?: any; // Populated Pago object
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  _id: string;
  salidaId?: any; // Populated SalidaSocial object
  academiaId?: any; // Populated Academia object
  userId: any; // Populated User object
  comprobanteUrl?: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  amount?: number;
  tipoPago: "transferencia" | "mercadopago";
  // Campos para tracking (persisten aunque se borre la entidad)
  salidaNombre?: string;
  academiaNombre?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  rol: "alumno" | "profe" | "dueño de academia" | "admin";
  telnumber?: string;
  imagen?: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Stats = {
  totalSalidas: number;
  totalTeams: number;
  totalAcademias: number;
  totalMiembros: number;
  ingresosAprobados: number;
};

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};
