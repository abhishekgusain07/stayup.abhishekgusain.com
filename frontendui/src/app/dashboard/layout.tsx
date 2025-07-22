import { NavbarDemo } from "@/components/navbar";
import Footer from "../components/footer";
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NavbarDemo className="bg-white">
        {children}
        <Footer />
      </NavbarDemo>
    </div>
  );
};

export default DashboardLayout;