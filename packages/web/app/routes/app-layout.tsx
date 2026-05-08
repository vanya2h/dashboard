import { Outlet } from "react-router";
import { Footer } from "../../src/components/Footer";
import { Header } from "../../src/components/Header";
import { Container } from "../../src/components/layout/Container";

import { ProfileSoftGate } from "~/components/ProfileSoftGate";

export default function AppLayout() {
  return (
    <Container>
      <Header />
      <ProfileSoftGate />
      <Outlet />
      <Footer />
    </Container>
  );
}
