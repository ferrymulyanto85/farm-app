export type UserRole = "admin" | "mitra";

export type VarietasJagung = "NK212" | "Bisi-18" | "Pioneer P27";

export type StatusSiklus =
  | "perencanaan"
  | "persiapan_lahan"
  | "penanaman"
  | "perawatan"
  | "panen"
  | "selesai"
  | "gagal";

export interface User {
  id: string;
  auth_id: string | null;
  nama: string;
  email: string;
  role: UserRole;
  no_telepon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lahan {
  id: string;
  user_id: string;
  nama: string;
  lokasi: string | null;
  luas_hektar: number;
  komoditas: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  users?: User;
}

export interface SiklusTanam {
  id: string;
  lahan_id: string;
  varietas: VarietasJagung;
  tanggal_tanam: string;
  estimasi_panen: string;
  tanggal_panen_aktual: string | null;
  status: StatusSiklus;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  lahan?: Lahan;
}
