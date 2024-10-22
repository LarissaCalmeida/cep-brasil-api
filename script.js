var map = null;

navigator.geolocation.getCurrentPosition((position) => {
  map = L.map("map").setView(
    [position.coords.latitude, position.coords.longitude],
    13
  );

  // Adicionando uma camada de mapa (TileLayer) estilo escuro do CartoDB Dark Matter
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  // Adicionando um marcador no mapa
  var marker = L.marker([
    position.coords.latitude,
    position.coords.longitude,
  ]).addTo(map);

  // Adicionando um popup ao marcador
  marker.bindPopup("Sua localização atual").openPopup();
});

// São Paulo, Brasil

const handleZipCode = (event) => {
  let input = event.target;
  input.value = zipCodeMask(input.value);
};

const zipCodeMask = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{5})(\d)/, "$1-$2");

  if (value.length === 9) searchCEP();

  return value;
};

const searchCEP = async () => {
  const inputCep = document.querySelector("#cep");
  const errorMessage = document.getElementById("validationCep");
  let address = "";
  let city = "";
  let state = "";

  await fetch(`https://brasilapi.com.br/api/cep/v2/${inputCep.value}`)
    .then((response) => {
      // Verifica se a requisição foi bem-sucedida
      if (!response.ok) {
        console.log(response);
        if (response.status === 404) {
          errorMessage.style.display = "initial";
          inputCep.classList.add("is-invalid");
        }

        throw new Error("Erro na requisição");
      }

      errorMessage.style.display = "none";
      inputCep.classList.remove("is-invalid");
      return response.json(); // Transforma a resposta em JSON
    })
    .then((data) => {
      const spanStreet = document.getElementById("street");
      const spanNeighborhood = document.getElementById("neighborhood");
      const spanCity = document.getElementById("city");
      const spanState = document.getElementById("state");
      // Manipula os dados recebidos
      //   document.getElementById("data").textContent = JSON.stringify(data);
      console.log(data);
      spanStreet.innerHTML = data.street;
      spanNeighborhood.innerHTML = data.neighborhood;
      spanCity.innerHTML = data.city;
      spanState.innerHTML = data.state;

      address = `${data.street}, ${data.neighborhood}. ${data.city} - ${data.state}`;
      city = data.city;
      state = data.state;
    })
    .catch((error) => {
      console.log(error);
      console.error("Erro:", error);
    });

  if (address) {
    fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        address
      )}&key=f8eb90a300314289a547e5316660e89c`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.results[0].geometry); // Exibe a latitude e longitude
        map.remove();
        map = L.map("map").setView(
          [data.results[0].geometry.lat, data.results[0].geometry.lng],
          13
        );
        // Adicionando uma camada de mapa (TileLayer) estilo escuro do CartoDB Dark Matter
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(map);
        // Adicionando um marcador no mapa
        var marker = L.marker([
          data.results[0].geometry.lat,
          data.results[0].geometry.lng,
        ]).addTo(map);
        // Adicionando um popup ao marcador
        marker.bindPopup(`${city} - ${state}`).openPopup();
      })
      .catch((error) => console.error("Erro:", error));
  }
};
