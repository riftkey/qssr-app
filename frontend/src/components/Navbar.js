import { UserCircle2 } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="text-black font-bold px-6 py-3 flex items-center justify-between shadow-md">
      {/* Kiri: Kosong atau bisa isi konten lain */}
      <div />

      {/* Kanan: Foto + Nama User */}
      <div className="flex items-center space-x-2">
        <UserCircle2 className="w-8 h-8" />
        <span className="font-medium">Rifqi</span>
      </div>
    </nav>
  );
};

export default Navbar;
