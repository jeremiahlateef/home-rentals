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
      });

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(L.popup(closeOnClick, false))
        .openPopup();
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(L.popup(autoClose, false))
        .openPopup();
    },
    function () {
      alert("Could not get your location");
    }
  );
