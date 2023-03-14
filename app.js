`use strict`;
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const coords = [latitude, longitude];
      const map = L.map("hero-map").setView(coords, 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (mapEvent) {
        const { lat, lng } = mapEvent.latlng;
        L.marker([lat, lng]).addTo(map).bindPopup("Apartment").openPopup();

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(L.popup(closeOnClick, false))
          .openPopup();
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(L.popup(autoClose, false))
          .openPopup();
      });
    },
    function () {}
  );

// Seletivize.js API
// var $select = $("#select-tools").selectize({
//   maxItems: null,
//   valueField: "id",
//   labelField: "title",
//   searchField: "title",
//   options: [
//     {
//       id: 1,
//       title: "Ikeja",
//       url: "http://en.wikipedia.org/wiki/Spectrometers",
//     },
//     {
//       id: 2,
//       title: "Lekki",
//       url: "http://en.wikipedia.org/wiki/Star_chart",
//     },
//     {
//       id: 3,
//       title: "Festac",
//       url: "http://en.wikipedia.org/wiki/Electrical_tape",
//     },
//     {
//       id: 4,
//       title: "Yaba",
//       url: "http://en.wikipedia.org/wiki/Electrical_tape",
//     },
//   ],
//   create: false,
// });

// // API controls

// var control = $select[0].selectize;

// $("#button-clear").on("click", function () {
//   control.clear();
// });

// $("#button-clearoptions").on("click", function () {
//   control.clearOptions();
// });

// $("#button-addoption").on("click", function () {
//   control.addOption({
//     id: 5,
//     title: "Something New",
//     url: "http://google.com",
//   });
// });

// $("#button-additem").on("click", function () {
//   control.addItem(2);
// });

// $("#button-maxitems2").on("click", function () {
//   control.setMaxItems(1);
// });

// $("#button-maxitems100").on("click", function () {
//   control.setMaxItems(100);
// });

// $("#button-setvalue").on("click", function () {
//   control.setValue([2, 3]);
// });
// dropdown

// // Reveal sections
// const allSections = document.querySelectorAll(".section");

// const revealSection = function (entries, observer) {
//   const [entry] = entries;

//   if (!entry.isIntersecting) return;

//   entry.target.classList.remove("section--hidden");
//   observer.unobserve(entry.target);
// };

// const sectionObserver = new IntersectionObserver(revealSection, {
//   root: null,
//   threshold: 0.15,
// });

// allSections.forEach(function (section) {
//   sectionObserver.observe(section);
//   section.classList.add("section--hidden");
// });

//Adding the Intersection observer API
const hidden = document.querySelectorAll(".section--hidden");
const imageAnim = document.querySelectorAll(".life-anim");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});

hidden.forEach((el) => observer.observe(el));

// Sticky Navigation
const navbar = document.querySelector(".navbar");
const navHeight = navbar.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) navbar.classList.add("sticky");
  else navbar.classList.remove("sticky");
};

const navObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `${navHeight}px`,
});
// navObserver.observe(navbar);
// console.log(navHeight);

// Slider functionality
const slider = function () {
  const slides = document.querySelectorAll(".test-content");
  const dotContainer = document.querySelector(".test-dots");

  let curSlide = 0;
  const maxSlide = slides.length;

  // Add dots to the dot container
  const addDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="test-dots_dot" data-slide="${i}"></button>`
      );
    });
  };

  const startDot = function (slide) {
    // first remove all the active class from all the dots
    document
      .querySelectorAll(".test-dots_dot")
      .forEach((dot) => dot.classList.remove("test-dot-active"));

    // Add it to the current slide that is on display
    document
      .querySelector(`.test-dots_dot[data-slide="${slide}"]`)
      .classList.add("test-dot-active");
  };

  // Go to the current slide that is clicked
  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  // Next Slide
  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    startDot(curSlide);
  };
  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    startDot(curSlide);
  };

  // initial position
  const initalPosition = function () {
    goToSlide(0);
    addDots();
    startDot(0);
  };
  initalPosition();
  // Add Event Handlers to Arrow Keys
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") prevSlide();
    e.key === "ArrowRight" && nextSlide();
  });
  // Add Event Handlers to the buttons
  dotContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("test-dots_dot")) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      startDot(slide);
    }
  });
};

slider();
