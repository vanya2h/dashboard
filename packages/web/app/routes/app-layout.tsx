import { Outlet } from "react-router";
import { Header } from "../../src/components/Header";

export default function AppLayout() {
  return (
    <div className="max-w-360 mx-auto border-x border-border min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
}
