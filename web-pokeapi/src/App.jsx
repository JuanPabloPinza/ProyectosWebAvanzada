import React, { useState, useEffect } from "react";
import styles from "./App.module.css";

const App = () => {
  const [pokemons, setPokemons] = useState([]);
  const [nextUrl, setNextUrl] = useState("");
  const [prevUrl, setPrevUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState(
    "https://pokeapi.co/api/v2/pokemon"
  );
  const [originalUrl, setOriginalUrl] = useState(
    "https://pokeapi.co/api/v2/pokemon"
  );
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [showPagination, setShowPagination] = useState(true);

  const getPokemons = async (url) => {
    try {
      const response = await fetch(url);
      const results = await response.json();
      setNextUrl(results.next);
      setPrevUrl(results.previous);
      getPokemonDetails(results.results);
    } catch (error) {
      console.error(error);
    }
  };

  const filterByName = async (name) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );
      if (response.ok) {
        const result = await response.json();
        setPokemons([result]);
        setError("");
        setShowPagination(false); 
      } else {
        setError("El Pokémon no existe.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNameChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleSearchNameClick = () => {
    if (searchName.trim() !== "") {
      filterByName(searchName.trim());
    }
  };

  const getPokemonDetails = async (data) => {
    try {
      const promises = data.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        return await response.json();
      });
      const results = await Promise.all(promises);
      const filteredPokemons = results.filter(
        (pokemon) => pokemon.sprites.front_default
      );
      setPokemons(filteredPokemons);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getPokemonTypes = async () => {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/type");
      const results = await response.json();
      setTypes(results.results);
    } catch (error) {
      console.error(error);
    }
  };

  const filterByType = async (typeUrl) => {
    try {
      const response = await fetch(typeUrl);
      const results = await response.json();
      const filteredPokemonUrls = results.pokemon.map((p) => p.pokemon.url);
      const promises = filteredPokemonUrls.map(async (url) => {
        const response = await fetch(url);
        return await response.json();
      });
      const filteredPokemons = await Promise.all(promises);
      setPokemons(filteredPokemons);
      setCurrentUrl(typeUrl);
      setShowPagination(true); 
    } catch (error) {
      console.error(error);
    }
  };

  const filterById = async (id) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (response.ok) {
        const result = await response.json();
        setPokemons([result]);
        setError("");
        setShowPagination(false); 
      } else {
        setError("El ID del Pokémon no existe.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleIdChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setSelectedId(value);
    }
  };

  const handleSearchClick = () => {
    if (selectedId !== "") {
      filterById(selectedId);
    }
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    if (value === "") {
      setCurrentUrl(originalUrl);
      setShowPagination(true);
    } else {
      filterByType(value);
    }
  };

  useEffect(() => {
    getPokemons(currentUrl);
    getPokemonTypes();
  }, [currentUrl]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokedex Personal</h1>
      <div className={styles.filterContainer}>
        <h2 className={styles.filterTitle}>Selecciona un Tipo:</h2>
        <select
          className={styles.filterSelect}
          onChange={handleTypeChange}
          value={selectedType}
        >
          <option value="">Todos los Tipos</option>
          {types.map((type, index) => (
            <option key={index} value={type.url}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterContainer}>
        <h2 className={styles.filterTitle}>Filtrar por ID:</h2>
        <input
          type="text"
          placeholder="ID del Pokémon (1-1302)"
          className={styles.filterInput}
          value={selectedId}
          onChange={handleIdChange}
        />
        <button className={styles.btnSearch} onClick={handleSearchClick}>
          Buscar
        </button>
      </div>
      <div className={styles.filterContainer}>
        <h2 className={styles.filterTitle}>Buscar por Nombre:</h2>
        <input
          type="text"
          placeholder="Nombre del Pokémon"
          className={styles.filterInput}
          value={searchName}
          onChange={handleNameChange}
        />
        <button className={styles.btnSearch} onClick={handleSearchNameClick}>
          Buscar
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.lists__pokemons}>
        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : (
          pokemons.map((pokemon, index) => (
            <div key={index} className={styles.pokemon__img}>
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
              <p>{pokemon.name}</p>
            </div>
          ))
        )}
      </div>
      <div className={styles.buttons}>
        {prevUrl && showPagination && (
          <button className={styles.btn} onClick={() => setCurrentUrl(prevUrl)}>
            Anterior
          </button>
        )}
        {nextUrl && showPagination && (
          <button className={styles.btn} onClick={() => setCurrentUrl(nextUrl)}>
            Siguiente
          </button>
        )}
      </div>
      <p>Creado usando PokeAPI | Grupo 1: Pinza, Mora, Rivadeneira</p>
    </div>
  );
};

export default App;
