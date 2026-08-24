import "./components/project-card.js";
import "./components/projects-list.js";

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const closeMenuBtn = document.getElementById("close-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");

function toggleMenu() {
  mobileMenu.classList.toggle("menu-closed");
  mobileMenu.classList.toggle("menu-open");
  document.body.classList.toggle("overflow-hidden");
}

mobileMenuBtn.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);

mobileLinks.forEach((link) => {
  link.addEventListener("click", toggleMenu);
});

// Intersection Observer for Entrance Animations
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            // Optional: Unobserve after revealing to prevent re-animation
            // observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    // If reduced motion, set them active immediately
    reveals.forEach((el) => el.classList.add("active"));
  }

  // Sticky Header Scroll Effect
  const header = document.getElementById("main-nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.classList.add("shadow-lg", "bg-[#110e25]/95");
      header.classList.remove("bg-[#110e25]/80");
    } else {
      header.classList.remove("shadow-lg", "bg-[#110e25]/95");
      header.classList.add("bg-[#110e25]/80");
    }
  });
});
