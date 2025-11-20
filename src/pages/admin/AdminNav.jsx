import { NavLink } from "react-router-dom";

export default function AdminNav() {
  const link = "px-3 py-2 rounded-xl text-[#004581] hover:bg-[#E6F0F4]";
  const active = "px-3 py-2 rounded-xl bg-[#E6F0F4] text-[#004581] font-semibold";
  return (
    <div className="flex gap-2">
      <NavLink to="/admin" className={({isActive}) => isActive ? active : link}>Dashboard</NavLink>
      <NavLink to="/admin/waitlist" className={({isActive}) => isActive ? active : link}>Waitlist</NavLink>
      <NavLink to="/admin/reports" className={({isActive}) => isActive ? active : link}>Reports</NavLink>
    </div>
  );
}
