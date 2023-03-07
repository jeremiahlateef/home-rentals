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
