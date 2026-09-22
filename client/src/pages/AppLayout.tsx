import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackToTopButton from "../components/BackToTop";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <BackToTopButton />
    </>
  );
};

export default AppLayout;
