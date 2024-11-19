const evolutionWrapper = document.querySelector(".evolution-wrapper");

// Function to fetch evolution data
async function fetchEvolutionChain(chainUrl) {
  try {
    const response = await fetch(chainUrl);
    const data = await response.json();

    const chain = [];
    let current = data.chain;

    // Get the types of Pokémon in the chain
    const types = [];

    while (current) {
      const species = current.species;
      const id = species.url.split("/").filter(Boolean).pop(); // Extract Pokémon ID

      // Fetch type data for each Pokémon
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const pokemonData = await pokemonResponse.json();

      // Get types of the Pokémon
      const pokemonTypes = pokemonData.types.map(type => type.type.name);
      types.push(...pokemonTypes);  // Collect all types

      // Get Pokémon number (ID) and name
      chain.push({
        name: species.name,
        id: pokemonData.id,  // Pokémon number (ID)
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`,
        types: pokemonTypes, // Store types
      });

      current = current.evolves_to[0];
    }

    return { chain, types };
  } catch (error) {
    console.error("Error fetching evolution chain:", error);
  }
}

// Function to fetch all evolution chains
async function fetchAllEvolutions() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/evolution-chain?limit=100");
    const data = await response.json();

    for (const chain of data.results) {
      const evolutionChain = await fetchEvolutionChain(chain.url);
      displayEvolutionChain(evolutionChain.chain, evolutionChain.types);
    }
  } catch (error) {
    console.error("Error fetching all evolution chains:", error);
  }
}

// Function to display an evolution chain
function displayEvolutionChain(chain, types) {
  const chainElement = document.createElement("div");
  chainElement.classList.add("evolution-chain");

  // Assign the background color based on the Pokémon types (just picking the first type for simplicity)
  const primaryType = types[0]; // You can adjust this to your preference (e.g., pick the most frequent type)
  chainElement.classList.add(primaryType); // Add a class based on the Pokémon type

  chain.forEach((pokemon, index) => {
    const pokemonDiv = document.createElement("div");
    pokemonDiv.classList.add("pokemon");

    const img = document.createElement("img");
    img.src = pokemon.image;
    img.alt = pokemon.name;

    const name = document.createElement("p");
    name.textContent = `${pokemon.name} (#${pokemon.id})`; // Display name with ID (Pokémon number)

    pokemonDiv.appendChild(img);
    pokemonDiv.appendChild(name);
    chainElement.appendChild(pokemonDiv);

    // Add an arrow if not the last Pokémon
    if (index < chain.length - 1) {
      const arrow = document.createElement("div");
      arrow.classList.add("arrow");
      arrow.textContent = "➔";
      chainElement.appendChild(arrow);
    }
  });

  evolutionWrapper.appendChild(chainElement);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", fetchAllEvolutions);
