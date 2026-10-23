"use strict";

/* Home Rentals: behaviour for the accessibility rebuild.
   Everything here is an enhancement. The page content is readable without it. */

(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  /* ------------------------------------------------------------------
     1. Mobile menu: a real button that reports expanded / collapsed (4.1.2)
     ------------------------------------------------------------------ */
  const menuBtn = $("#menu-btn");
  const navLinks = $("#nav-links");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  menuBtn.addEventListener("click", () => {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuBtn.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  /* ------------------------------------------------------------------
     2. Scroll reveal. Only runs when the visitor has not asked for reduced
        motion, and content never hides again once shown (2.3.3).
     ------------------------------------------------------------------ */
  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  if (motionOk && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 },
    );
    $$(".section-center").forEach((el) => {
      el.classList.add("section--hidden");
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     3. Map. Created at the Bay Area view with no location prompt on load.
        Every listing is also in the list below the map, so the map is never
        the only way to find a property.
     ------------------------------------------------------------------ */
  const mapEl = $("#hero-map");
  const mapStatus = $("#map-status");
  const cards = $$(".property-card");
  const markers = new Map();
  let map = null;

  function popupFor(card) {
    const box = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = $(".prop-title", card).textContent;
    const price = document.createElement("div");
    price.textContent = $(".prop-price", card).textContent;
    const link = document.createElement("a");
    link.href = "#" + card.id;
    link.textContent = "View listing";
    box.append(title, price, link);
    return box;
  }

  function initMap() {
    if (typeof L === "undefined") {
      mapEl.textContent =
        "The map could not be loaded. Browse the property list below instead.";
      mapEl.removeAttribute("role");
      return;
    }
    map = L.map(mapEl, { scrollWheelZoom: false }).setView(
      [37.7749, -122.4194],
      10,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    cards.forEach((card) => {
      const address = $(".prop-title", card).textContent;
      // Pins are a visual shortcut for mouse users. Keyboard and screen reader
      // users get every listing, with the same details, from the list below
      // (WCAG 2.1.1 equivalent functionality). Overlapping pins would also be
      // too close together to tap reliably (2.5.8), so they are left out of
      // the tab order and hidden from assistive technology.
      const marker = L.marker(
        [Number(card.dataset.lat), Number(card.dataset.lng)],
        {
          title: address,
          alt: "",
          keyboard: false,
        },
      ).bindPopup(popupFor(card));
      markers.set(card.id, marker);
    });
  }

  $("#locate").addEventListener("click", () => {
    if (!map || !navigator.geolocation) {
      mapStatus.textContent = "Location is not available in this browser.";
      return;
    }
    mapStatus.textContent = "Finding your location...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
        L.circleMarker([latitude, longitude], { radius: 8 })
          .addTo(map)
          .bindPopup("You are here");
        mapStatus.textContent = "The map is now centered on your location.";
      },
      () => {
        mapStatus.textContent =
          "We could not get your location. The map still shows the San Francisco Bay Area.";
      },
    );
  });

  /* ------------------------------------------------------------------
     4. Search and filter, announced through a status message (4.1.3)
     ------------------------------------------------------------------ */
  const typeSelect = $("#all-type");
  const searchInput = $("#location");
  const countEl = $("#result-count");

  function applyFilters() {
    const type = typeSelect.value;
    const query = searchInput.value.trim().toLowerCase();
    let shown = 0;
    const visible = [];

    cards.forEach((card) => {
      const address = $(".prop-title", card).textContent.toLowerCase();
      const cardType = card.dataset.type;
      const match =
        (!type || cardType === type) &&
        (!query ||
          address.includes(query) ||
          cardType.toLowerCase().includes(query));
      card.hidden = !match;
      const marker = markers.get(card.id);
      if (marker && map) {
        if (match) marker.addTo(map);
        else marker.remove();
      }
      if (match) {
        shown += 1;
        visible.push(marker);
      }
    });

    if (map && visible.length) {
      map.fitBounds(L.featureGroup(visible).getBounds().pad(0.25), {
        maxZoom: 13,
      });
    }

    countEl.textContent =
      shown === 0
        ? "No properties match your search. Try a different area or property type."
        : `Showing ${shown} of ${cards.length} properties.`;
  }

  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  typeSelect.addEventListener("change", applyFilters);
  searchInput.addEventListener("search", applyFilters);
  $("#show-all").addEventListener("click", () => {
    typeSelect.value = "";
    searchInput.value = "";
    applyFilters();
  });

  initMap();
  if (map) {
    markers.forEach((marker) => marker.addTo(map));
    map.fitBounds(
      L.featureGroup(Array.from(markers.values())).getBounds().pad(0.25),
    );
  }

  /* ------------------------------------------------------------------
     5. Add-property form: visible labels, inline errors, error summary
        that receives focus (3.3.1, 3.3.3, 3.3.2)
     ------------------------------------------------------------------ */
  const form = $("#add-form");
  const summary = $("#form-errors");
  const summaryList = $("#form-errors-list");
  const success = $("#form-success");

  const rules = [
    {
      id: "name",
      message: "Enter your name.",
      valid: (v) => v.trim().length > 0,
    },
    {
      id: "address",
      message: "Enter the property address.",
      valid: (v) => v.trim().length > 0,
    },
    {
      id: "unit",
      message: "Enter the unit number.",
      valid: (v) => v.trim().length > 0,
    },
    {
      id: "city",
      message: "Choose a city from the list.",
      valid: (v) => v !== "",
    },
    {
      id: "description",
      message: "Describe the property in at least 20 characters.",
      valid: (v) => v.trim().length >= 20,
    },
  ];

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    success.textContent = "";
    const problems = [];

    rules.forEach(({ id, message, valid }) => {
      const field = document.getElementById(id);
      const error = document.getElementById(id + "-error");
      const base =
        field.dataset.describedby ||
        (field.dataset.describedby =
          field.getAttribute("aria-describedby") || "");

      if (valid(field.value)) {
        field.removeAttribute("aria-invalid");
        error.hidden = true;
        error.textContent = "";
        if (base) field.setAttribute("aria-describedby", base);
        else field.removeAttribute("aria-describedby");
      } else {
        problems.push({ id, message });
        field.setAttribute("aria-invalid", "true");
        error.textContent = "Error: " + message;
        error.hidden = false;
        field.setAttribute(
          "aria-describedby",
          (base + " " + id + "-error").trim(),
        );
      }
    });

    if (problems.length) {
      summaryList.innerHTML = "";
      problems.forEach(({ id, message }) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + id;
        link.textContent = message;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          document.getElementById(id).focus();
        });
        item.appendChild(link);
        summaryList.appendChild(item);
      });
      summary.hidden = false;
      summary.focus();
      return;
    }

    summary.hidden = true;
    form.reset();
    success.textContent =
      "Thank you. Your property was received. This is a demo form, so nothing was sent.";
  });

  /* ------------------------------------------------------------------
     6. Testimonial carousel. Previous and next buttons, named dot buttons,
        off-screen slides hidden from assistive technology, no auto-rotation,
        and no global arrow-key listener (2.1.1, 2.2.2, 4.1.2)
     ------------------------------------------------------------------ */
  const slides = $$(".test-content");
  const controls = $("#test-controls");

  if (slides.length > 1) {
    const total = slides.length;
    let current = 0;

    const status = document.createElement("p");
    status.className = "sr-only";
    status.setAttribute("role", "status");

    const makeButton = (className, label, inner) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.setAttribute("aria-label", label);
      if (inner) {
        button.innerHTML = inner;
      }
      return button;
    };

    const prev = makeButton(
      "test-nav-btn",
      "Previous testimonial",
      '<span aria-hidden="true">&#8249;</span>',
    );
    const next = makeButton(
      "test-nav-btn",
      "Next testimonial",
      '<span aria-hidden="true">&#8250;</span>',
    );
    const dots = slides.map((_, i) =>
      makeButton("test-dots_dot", `Show testimonial ${i + 1} of ${total}`),
    );

    controls.append(prev, ...dots, next, status);

    function show(index, announce) {
      current = (index + total) % total;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${100 * (i - current)}%)`;
        slide.setAttribute("aria-hidden", String(i !== current));
      });
      dots.forEach((dot, i) =>
        dot.setAttribute("aria-current", String(i === current)),
      );
      if (announce)
        status.textContent = `Showing testimonial ${current + 1} of ${total}.`;
    }

    prev.addEventListener("click", () => show(current - 1, true));
    next.addEventListener("click", () => show(current + 1, true));
    dots.forEach((dot, i) =>
      dot.addEventListener("click", () => show(i, true)),
    );
    show(0, false);
  }
})();
