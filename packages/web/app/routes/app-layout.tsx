import { Outlet } from "react-router";
import { Header } from "../../src/components/Header";

export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
