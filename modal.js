let currentModalTab = "stats";

function openModal(id, name, image, types) {
    document.body.style.overflow = "hidden";
    setModalContent(id, name, image);
    updateModalContent(types);

    window.currentPokemonId = id;
    loadCry(id);
    openModalSection(currentModalTab);
}

function setModalContent(id, name, image) {
    let formattedId = id.toString().padStart(3, "0");
    document.getElementById("modal-name").textContent = `#${formattedId} ${name}`;
    document.getElementById("modal-image").src = image;
    document.getElementById("modal-image").alt = name;
    document.getElementById("modal_img_bg").src = "assets/img/pokeball_img_bg.webp";
}

function updateModalContent(types) {
    let modalContent = document.getElementById("modal-content");

    if (types.length > 0) {
        let primaryType = types[0].type.name;
        modalContent.style.backgroundColor = typeColors[primaryType] || "#F5F5F5";
    }
}


function loadCry(id) {
    let cryAudio = document.getElementById("pokemon-cry");

    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(pokemonData => {
            let cryUrl = pokemonData.cries?.latest;
            if (cryUrl) {
                cryAudio.src = cryUrl;
            } else {
                console.error("Cry-Daten für dieses Pokémon nicht verfügbar.");
            }
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der Pokémon-Daten:", error);
        });

    document.getElementById("modal").style.display = "flex";
}

function playCry() {
    let cryAudio = document.getElementById("pokemon-cry");
    cryAudio.play().catch(error => {
        console.error("Fehler beim Abspielen des Pokémon-Rufs:", error);
    });
}

async function openModalSection(type) {
    let statsContainer = document.getElementById("stats_container");
    if (!statsContainer) return console.error("stats_container nicht gefunden!");

    currentModalTab = type;
    let pokemonData = await fetchPokemonData(window.currentPokemonId);
    if (!pokemonData) return;

    statsContainer.innerHTML = generateModalContent(type, pokemonData);
    statsContainer.style.display = "flex";
}

async function fetchPokemonData(id) {
    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error("Fehler beim Laden der Pokémon-Daten");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

function generateModalContent(type, data) {
    if (type === "stats") return generateStatsHTML(data.stats);
    if (type === "info") return generateInfoHTML(data);
    if (type === "shiny") return `<img src="${data.sprites.front_shiny}" alt="${data.name}">`;
    return "";
}

function generateStatsHTML(stats) {
    return stats.map(stat => `
        <div class="stat-row">
            <p>${stat.stat.name}:</p>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stat.base_stat / 255) * 100}%; background-color: ${getStatColor(stat.base_stat)};">
                    ${stat.base_stat}
                </div>
            </div>
        </div>
    `).join("");
}

function generateInfoHTML(data) {
    return `
        <p><strong>Height:</strong><div class="abilities_layout"> ${data.height / 10} m</div></p>
        <p><strong>Weight:</strong><div class="abilities_layout"> ${data.weight / 10} kg</div></p>
        <p><strong>Abilities:</strong><div class="abilities_layout">${data.abilities.map(a => a.ability.name).join(", ")}</div></p>
    `;
}

function getStatColor(value) {
    let percentage = (value / 255) * 100;
    if (percentage < 10) return "red";
    if (percentage < 20) return "orange";
    if (percentage < 35) return "yellow";
    if (percentage < 62) return "lightgreen";
    return "lightblue";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("close-modal").addEventListener("click", () => {
        document.getElementById("modal").style.display = "none";
        document.body.style.overflow = "";
        let cryAudio = document.getElementById("pokemon-cry");

        document.getElementById("stats_container").style.display = "none";

        cryAudio.pause();
        cryAudio.currentTime = 0;
    });
});

function navigatePokemon(direction) {
    let currentIndex = allPokemonData.findIndex(p => p.id === window.currentPokemonId);

    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = allPokemonData.length - 1;
    if (newIndex >= allPokemonData.length) newIndex = 0;

    let newPokemon = allPokemonData[newIndex];

    openModal(newPokemon.id, newPokemon.name, newPokemon.sprites.front_default, newPokemon.types);
    openModalSection(currentModalTab);
}