import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";

const Navbar = () => {
  const [username, setUsername] = useState("Pengguna");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  return (
    <nav className="text-black font-bold px-6 py-3 flex items-center justify-between shadow-md">
      <div />
      <div className="flex items-center space-x-2">
        <UserCircle2 className="w-8 h-8" />
        <span className="font-medium">{username}</span>
      </div>
    </nav>
  );
};

export default Navbar;
