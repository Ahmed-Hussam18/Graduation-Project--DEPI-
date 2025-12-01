import React from "react";
import { Container } from "react-bootstrap";

function Footer() {
  return (
    <footer className="py-4 bg-dark text-light text-center">
      <Container>
        <p className="mb-0">
          © {new Date().getFullYear()} Ahmed Hussam All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
