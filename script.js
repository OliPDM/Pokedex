let allPokemonData = [];
let displayLimit = 20;
let BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
let totalPokemon = 1025;

async function fetchAllPokemon() {
    showLoadingSpinner();
    allPokemonData = [];

    if (loadFromCache()) return;

    for (let i = 1; i <= totalPokemon; i++) {
        await fetchPokemon(i);
        if (allPokemonData.length >= displayLimit) updateDisplay();
    }

    saveToCache();
    hideLoadingSpinner();
}

async function fetchPokemon(id) {
    try {
        let response = await fetch(`${BASE_URL}${id}`);
        if (!response.ok) return;

        let pokemon = await response.json();
        allPokemonData.push(pokemon);
    } catch (error) {
        console.error(`Fehler beim Abrufen von Pokémon ID ${id}:`, error);
    }
}

function loadFromCache() {
    let cachedData = localStorage.getItem("pokemonData");
    if (!cachedData) return false;

    allPokemonData = JSON.parse(cachedData).map(sortPokemonData);

    updateDisplay();
    hideLoadingSpinner();
    return true;
}

function sortPokemonData(pokemon) {
    return {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types.map(type => ({ type: { name: type } })),
        sprites: {
            front_default: pokemon.modalSprite || "",
            other: { "official-artwork": { front_default: pokemon.cardSprite || "" } }
        }
    };
}

function saveToCache() {
    let compactData = allPokemonData.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types.map(t => t.type.name),
        cardSprite: pokemon.sprites?.other?.["official-artwork"]?.front_default || "",
        modalSprite: pokemon.sprites?.front_default || ""
    }));

    localStorage.setItem("pokemonData", JSON.stringify(compactData));
}

function updateDisplay() {
    displayPokemonList(allPokemonData.slice(0, displayLimit));
}

function displayPokemonList(pokemonList) {
    let container = document.getElementById("pokemon-container");
    container.innerHTML = "";

    pokemonList.forEach(pokemon => container.appendChild(createPokemonCard(pokemon)));
}

function createPokemonCard(pokemon) {
    let card = document.createElement("div");
    card.classList.add("pokemon-card");
    card.style.backgroundColor = getBackgroundColor(pokemon);
    card.onclick = () => openModal(pokemon.id, pokemon.name, pokemon.sprites.front_default, pokemon.types);
    card.innerHTML = getPokemonCardHTML(pokemon);
    return card;
}

function getPokemonCardHTML(pokemon) {
    let formattedId = pokemon.id.toString().padStart(3, "0");
    let typesHTML = pokemon.types.map(t => `<img src="assets/img/${t.type.name}.svg" alt="${t.type.name}" title="${t.type.name}" style="width: 40px; height: 40px; margin: 5px;">`).join("");

    return `
        <h2>#${formattedId} ${pokemon.name}</h2>
        <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
        <p>${typesHTML}</p>
    `;
}

function getBackgroundColor(pokemon) {
    return typeColors[pokemon.types[0].type.name] || "#F5F5F5";
}

function loadMorePokemon() {
    displayLimit += 20;
    displayPokemonList(allPokemonData.slice(0, displayLimit));
}

function searchPokemon() {
    let searchInput = document.getElementById("search-input").value.toLowerCase();

    if (searchInput.length >= 2) {
        let filteredPokemon = allPokemonData.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchInput)
        );

        displayPokemonList(filteredPokemon);
    } else {
        displayPokemonList(allPokemonData.slice(0, displayLimit));
    }
}

function showLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "flex";
}

function hideLoadingSpinner() {
    document.getElementById("loading-spinner").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => fetchAllPokemon());