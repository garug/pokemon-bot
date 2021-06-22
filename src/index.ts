import { Client, MessageEmbed, TextChannel } from "discord.js";
import axios from "axios";

const client = new Client();

let newPokemon: TextChannel;

const maxInterval = 30 * 60 * 1000;

client.on("ready", async () => {
  const channel = await client.channels.fetch("855838535503970344");
  if (channel instanceof TextChannel) {
    newPokemon = channel;
  }
});

let lastPokemon = new Date();

const types = {
  level1: 100,
  level2_3: 70,
  level_unique: 60,
  level2_2: 55,
  evo_stone: 55,
  level3_3: 50,
  mystic: 5,
  legendary: 1,
};

const possiblePokemon = [
  {
    name: "bulbasaur",
    url: "https://pokeapi.co/api/v2/pokemon/1/",
    chance: types.level1,
  },
  {
    name: "ivysaur",
    url: "https://pokeapi.co/api/v2/pokemon/2/",
    chance: types.level2_3,
  },
  {
    name: "venusaur",
    url: "https://pokeapi.co/api/v2/pokemon/3/",
    chance: types.level3_3,
  },
  {
    name: "charmander",
    url: "https://pokeapi.co/api/v2/pokemon/4/",
    chance: types.level1,
  },
  {
    name: "charmeleon",
    url: "https://pokeapi.co/api/v2/pokemon/5/",
    chance: types.level2_3,
  },
  {
    name: "charizard",
    url: "https://pokeapi.co/api/v2/pokemon/6/",
    chance: types.level3_3,
  },
  {
    name: "squirtle",
    url: "https://pokeapi.co/api/v2/pokemon/7/",
    chance: types.level1,
  },
  {
    name: "wartortle",
    url: "https://pokeapi.co/api/v2/pokemon/8/",
    chance: types.level2_3,
  },
  {
    name: "blastoise",
    url: "https://pokeapi.co/api/v2/pokemon/9/",
    chance: types.level3_3,
  },
  {
    name: "caterpie",
    url: "https://pokeapi.co/api/v2/pokemon/10/",
    chance: types.level1,
  },
  {
    name: "metapod",
    url: "https://pokeapi.co/api/v2/pokemon/11/",
    chance: types.level2_3,
  },
  {
    name: "butterfree",
    url: "https://pokeapi.co/api/v2/pokemon/12/",
    chance: types.level3_3,
  },
  {
    name: "weedle",
    url: "https://pokeapi.co/api/v2/pokemon/13/",
    chance: types.level1,
  },
  {
    name: "kakuna",
    url: "https://pokeapi.co/api/v2/pokemon/14/",
    chance: types.level2_3,
  },
  {
    name: "beedrill",
    url: "https://pokeapi.co/api/v2/pokemon/15/",
    chance: types.level3_3,
  },
  {
    name: "pidgey",
    url: "https://pokeapi.co/api/v2/pokemon/16/",
    chance: types.level1,
  },
  {
    name: "pidgeotto",
    url: "https://pokeapi.co/api/v2/pokemon/17/",
    chance: types.level2_3,
  },
  {
    name: "pidgeot",
    url: "https://pokeapi.co/api/v2/pokemon/18/",
    chance: types.level3_3,
  },
  {
    name: "rattata",
    url: "https://pokeapi.co/api/v2/pokemon/19/",
    chance: types.level1,
  },
  {
    name: "raticate",
    url: "https://pokeapi.co/api/v2/pokemon/20/",
    chance: types.level2_2,
  },
  {
    name: "spearow",
    url: "https://pokeapi.co/api/v2/pokemon/21/",
    chance: types.level1,
  },
  {
    name: "fearow",
    url: "https://pokeapi.co/api/v2/pokemon/22/",
    chance: types.level2_2,
  },
  {
    name: "ekans",
    url: "https://pokeapi.co/api/v2/pokemon/23/",
    chance: types.level1,
  },
  {
    name: "arbok",
    url: "https://pokeapi.co/api/v2/pokemon/24/",
    chance: types.level2_2,
  },
  {
    name: "pikachu",
    url: "https://pokeapi.co/api/v2/pokemon/25/",
    chance: types.level1,
  },
  {
    name: "raichu",
    url: "https://pokeapi.co/api/v2/pokemon/26/",
    chance: types.level2_2,
  },
  {
    name: "sandshrew",
    url: "https://pokeapi.co/api/v2/pokemon/27/",
    chance: types.level1,
  },
  {
    name: "sandslash",
    url: "https://pokeapi.co/api/v2/pokemon/28/",
    chance: types.level2_2,
  },
  {
    name: "nidoran-f",
    url: "https://pokeapi.co/api/v2/pokemon/29/",
    chance: types.level1,
  },
  {
    name: "nidorina",
    url: "https://pokeapi.co/api/v2/pokemon/30/",
    chance: types.level2_3,
  },
  {
    name: "nidoqueen",
    url: "https://pokeapi.co/api/v2/pokemon/31/",
    chance: types.level3_3,
  },
  {
    name: "nidoran-m",
    url: "https://pokeapi.co/api/v2/pokemon/32/",
    chance: types.level1,
  },
  {
    name: "nidorino",
    url: "https://pokeapi.co/api/v2/pokemon/33/",
    chance: types.level2_3,
  },
  {
    name: "nidoking",
    url: "https://pokeapi.co/api/v2/pokemon/34/",
    chance: types.level3_3,
  },
  {
    name: "clefairy",
    url: "https://pokeapi.co/api/v2/pokemon/35/",
    chance: types.level1,
  },
  {
    name: "clefable",
    url: "https://pokeapi.co/api/v2/pokemon/36/",
    chance: types.level2_2,
  },
  {
    name: "vulpix",
    url: "https://pokeapi.co/api/v2/pokemon/37/",
    chance: types.level1,
  },
  {
    name: "ninetales",
    url: "https://pokeapi.co/api/v2/pokemon/38/",
    chance: types.level2_3,
  },
  {
    name: "jigglypuff",
    url: "https://pokeapi.co/api/v2/pokemon/39/",
    chance: types.level1,
  },
  {
    name: "wigglytuff",
    url: "https://pokeapi.co/api/v2/pokemon/40/",
    chance: types.level2_2,
  },
  {
    name: "zubat",
    url: "https://pokeapi.co/api/v2/pokemon/41/",
    chance: types.level1,
  },
  {
    name: "golbat",
    url: "https://pokeapi.co/api/v2/pokemon/42/",
    chance: types.level2_2,
  },
  {
    name: "oddish",
    url: "https://pokeapi.co/api/v2/pokemon/43/",
    chance: types.level1,
  },
  {
    name: "gloom",
    url: "https://pokeapi.co/api/v2/pokemon/44/",
    chance: types.level2_3,
  },
  {
    name: "vileplume",
    url: "https://pokeapi.co/api/v2/pokemon/45/",
    chance: types.level3_3,
  },
  {
    name: "paras",
    url: "https://pokeapi.co/api/v2/pokemon/46/",
    chance: types.level1,
  },
  {
    name: "parasect",
    url: "https://pokeapi.co/api/v2/pokemon/47/",
    chance: types.level2_2,
  },
  {
    name: "venonat",
    url: "https://pokeapi.co/api/v2/pokemon/48/",
    chance: types.level1,
  },
  {
    name: "venomoth",
    url: "https://pokeapi.co/api/v2/pokemon/49/",
    chance: types.level2_2,
  },
  {
    name: "diglett",
    url: "https://pokeapi.co/api/v2/pokemon/50/",
    chance: types.level1,
  },
  {
    name: "dugtrio",
    url: "https://pokeapi.co/api/v2/pokemon/51/",
    chance: types.level2_2,
  },
  {
    name: "meowth",
    url: "https://pokeapi.co/api/v2/pokemon/52/",
    chance: types.level1,
  },
  {
    name: "persian",
    url: "https://pokeapi.co/api/v2/pokemon/53/",
    chance: types.level2_2,
  },
  {
    name: "psyduck",
    url: "https://pokeapi.co/api/v2/pokemon/54/",
    chance: types.level1,
  },
  {
    name: "golduck",
    url: "https://pokeapi.co/api/v2/pokemon/55/",
    chance: types.level2_2,
  },
  {
    name: "mankey",
    url: "https://pokeapi.co/api/v2/pokemon/56/",
    chance: types.level1,
  },
  {
    name: "primeape",
    url: "https://pokeapi.co/api/v2/pokemon/57/",
    chance: types.level2_2,
  },
  {
    name: "growlithe",
    url: "https://pokeapi.co/api/v2/pokemon/58/",
    chance: types.level1,
  },
  {
    name: "arcanine",
    url: "https://pokeapi.co/api/v2/pokemon/59/",
    chance: types.level2_2,
  },
  {
    name: "poliwag",
    url: "https://pokeapi.co/api/v2/pokemon/60/",
    chance: types.level1,
  },
  {
    name: "poliwhirl",
    url: "https://pokeapi.co/api/v2/pokemon/61/",
    chance: types.level2_3,
  },
  {
    name: "poliwrath",
    url: "https://pokeapi.co/api/v2/pokemon/62/",
    chance: types.level3_3,
  },
  {
    name: "abra",
    url: "https://pokeapi.co/api/v2/pokemon/63/",
    chance: types.level1,
  },
  {
    name: "kadabra",
    url: "https://pokeapi.co/api/v2/pokemon/64/",
    chance: types.level2_3,
  },
  {
    name: "alakazam",
    url: "https://pokeapi.co/api/v2/pokemon/65/",
    chance: types.level3_3,
  },
  {
    name: "machop",
    url: "https://pokeapi.co/api/v2/pokemon/66/",
    chance: types.level1,
  },
  {
    name: "machoke",
    url: "https://pokeapi.co/api/v2/pokemon/67/",
    chance: types.level2_3,
  },
  {
    name: "machamp",
    url: "https://pokeapi.co/api/v2/pokemon/68/",
    chance: types.level3_3,
  },
  {
    name: "bellsprout",
    url: "https://pokeapi.co/api/v2/pokemon/69/",
    chance: types.level1,
  },
  {
    name: "weepinbell",
    url: "https://pokeapi.co/api/v2/pokemon/70/",
    chance: types.level2_3,
  },
  {
    name: "victreebel",
    url: "https://pokeapi.co/api/v2/pokemon/71/",
    chance: types.level3_3,
  },
  {
    name: "tentacool",
    url: "https://pokeapi.co/api/v2/pokemon/72/",
    chance: types.level1,
  },
  {
    name: "tentacruel",
    url: "https://pokeapi.co/api/v2/pokemon/73/",
    chance: types.level2_2,
  },
  {
    name: "geodude",
    url: "https://pokeapi.co/api/v2/pokemon/74/",
    chance: types.level1,
  },
  {
    name: "graveler",
    url: "https://pokeapi.co/api/v2/pokemon/75/",
    chance: types.level2_3,
  },
  {
    name: "golem",
    url: "https://pokeapi.co/api/v2/pokemon/76/",
    chance: types.level3_3,
  },
  {
    name: "ponyta",
    url: "https://pokeapi.co/api/v2/pokemon/77/",
    chance: types.level1,
  },
  {
    name: "rapidash",
    url: "https://pokeapi.co/api/v2/pokemon/78/",
    chance: types.level2_2,
  },
  {
    name: "slowpoke",
    url: "https://pokeapi.co/api/v2/pokemon/79/",
    chance: types.level1,
  },
  {
    name: "slowbro",
    url: "https://pokeapi.co/api/v2/pokemon/80/",
    chance: types.level2_2,
  },
  {
    name: "magnemite",
    url: "https://pokeapi.co/api/v2/pokemon/81/",
    chance: types.level1,
  },
  {
    name: "magneton",
    url: "https://pokeapi.co/api/v2/pokemon/82/",
    chance: types.level2_2,
  },
  {
    name: "farfetchd",
    url: "https://pokeapi.co/api/v2/pokemon/83/",
    chance: types.level_unique,
  },
  {
    name: "doduo",
    url: "https://pokeapi.co/api/v2/pokemon/84/",
    chance: types.level1,
  },
  {
    name: "dodrio",
    url: "https://pokeapi.co/api/v2/pokemon/85/",
    chance: types.level2_2,
  },
  {
    name: "seel",
    url: "https://pokeapi.co/api/v2/pokemon/86/",
    chance: types.level1,
  },
  {
    name: "dewgong",
    url: "https://pokeapi.co/api/v2/pokemon/87/",
    chance: types.level2_2,
  },
  {
    name: "grimer",
    url: "https://pokeapi.co/api/v2/pokemon/88/",
    chance: types.level1,
  },
  {
    name: "muk",
    url: "https://pokeapi.co/api/v2/pokemon/89/",
    chance: types.level2_2,
  },
  {
    name: "shellder",
    url: "https://pokeapi.co/api/v2/pokemon/90/",
    chance: types.level1,
  },
  {
    name: "cloyster",
    url: "https://pokeapi.co/api/v2/pokemon/91/",
    chance: types.level2_2,
  },
  {
    name: "gastly",
    url: "https://pokeapi.co/api/v2/pokemon/92/",
    chance: types.level1,
  },
  {
    name: "haunter",
    url: "https://pokeapi.co/api/v2/pokemon/93/",
    chance: types.level2_3,
  },
  {
    name: "gengar",
    url: "https://pokeapi.co/api/v2/pokemon/94/",
    chance: types.level3_3,
  },
  {
    name: "onix",
    url: "https://pokeapi.co/api/v2/pokemon/95/",
    chance: types.level_unique,
  },
  {
    name: "drowzee",
    url: "https://pokeapi.co/api/v2/pokemon/96/",
    chance: types.level1,
  },
  {
    name: "hypno",
    url: "https://pokeapi.co/api/v2/pokemon/97/",
    chance: types.level2_2,
  },
  {
    name: "krabby",
    url: "https://pokeapi.co/api/v2/pokemon/98/",
    chance: types.level1,
  },
  {
    name: "kingler",
    url: "https://pokeapi.co/api/v2/pokemon/99/",
    chance: types.level2_2,
  },
  {
    name: "voltorb",
    url: "https://pokeapi.co/api/v2/pokemon/100/",
    chance: types.level1,
  },
  {
    name: "electrode",
    url: "https://pokeapi.co/api/v2/pokemon/101/",
    chance: types.level2_2,
  },
  {
    name: "exeggcute",
    url: "https://pokeapi.co/api/v2/pokemon/102/",
    chance: types.level1,
  },
  {
    name: "exeggutor",
    url: "https://pokeapi.co/api/v2/pokemon/103/",
    chance: types.level2_2,
  },
  {
    name: "cubone",
    url: "https://pokeapi.co/api/v2/pokemon/104/",
    chance: types.level1,
  },
  {
    name: "marowak",
    url: "https://pokeapi.co/api/v2/pokemon/105/",
    chance: types.level2_2,
  },
  {
    name: "hitmonlee",
    url: "https://pokeapi.co/api/v2/pokemon/106/",
    chance: types.level_unique,
  },
  {
    name: "hitmonchan",
    url: "https://pokeapi.co/api/v2/pokemon/107/",
    chance: types.level_unique,
  },
  {
    name: "lickitung",
    url: "https://pokeapi.co/api/v2/pokemon/108/",
    chance: types.level_unique,
  },
  {
    name: "koffing",
    url: "https://pokeapi.co/api/v2/pokemon/109/",
    chance: types.level1,
  },
  {
    name: "weezing",
    url: "https://pokeapi.co/api/v2/pokemon/110/",
    chance: types.level2_2,
  },
  {
    name: "rhyhorn",
    url: "https://pokeapi.co/api/v2/pokemon/111/",
    chance: types.level1,
  },
  {
    name: "rhydon",
    url: "https://pokeapi.co/api/v2/pokemon/112/",
    chance: types.level2_2,
  },
  {
    name: "chansey",
    url: "https://pokeapi.co/api/v2/pokemon/113/",
    chance: types.level_unique,
  },
  {
    name: "tangela",
    url: "https://pokeapi.co/api/v2/pokemon/114/",
    chance: types.level_unique,
  },
  {
    name: "kangaskhan",
    url: "https://pokeapi.co/api/v2/pokemon/115/",
    chance: types.level_unique,
  },
  {
    name: "horsea",
    url: "https://pokeapi.co/api/v2/pokemon/116/",
    chance: types.level1,
  },
  {
    name: "seadra",
    url: "https://pokeapi.co/api/v2/pokemon/117/",
    chance: types.level2_2,
  },
  {
    name: "goldeen",
    url: "https://pokeapi.co/api/v2/pokemon/118/",
    chance: types.level1,
  },
  {
    name: "seaking",
    url: "https://pokeapi.co/api/v2/pokemon/119/",
    chance: types.level2_2,
  },
  {
    name: "staryu",
    url: "https://pokeapi.co/api/v2/pokemon/120/",
    chance: types.level1,
  },
  {
    name: "starmie",
    url: "https://pokeapi.co/api/v2/pokemon/121/",
    chance: types.level2_2,
  },
  {
    name: "mr-mime",
    url: "https://pokeapi.co/api/v2/pokemon/122/",
    chance: types.level_unique,
  },
  {
    name: "scyther",
    url: "https://pokeapi.co/api/v2/pokemon/123/",
    chance: types.level_unique,
  },
  {
    name: "jynx",
    url: "https://pokeapi.co/api/v2/pokemon/124/",
    chance: types.level_unique,
  },
  {
    name: "electabuzz",
    url: "https://pokeapi.co/api/v2/pokemon/125/",
    chance: types.level_unique,
  },
  {
    name: "magmar",
    url: "https://pokeapi.co/api/v2/pokemon/126/",
    chance: types.level_unique,
  },
  {
    name: "pinsir",
    url: "https://pokeapi.co/api/v2/pokemon/127/",
    chance: types.level_unique,
  },
  {
    name: "tauros",
    url: "https://pokeapi.co/api/v2/pokemon/128/",
    chance: types.level_unique,
  },
  {
    name: "magikarp",
    url: "https://pokeapi.co/api/v2/pokemon/129/",
    chance: types.level1,
  },
  {
    name: "gyarados",
    url: "https://pokeapi.co/api/v2/pokemon/130/",
    chance: types.level2_2,
  },
  {
    name: "lapras",
    url: "https://pokeapi.co/api/v2/pokemon/131/",
    chance: types.level_unique,
  },
  {
    name: "ditto",
    url: "https://pokeapi.co/api/v2/pokemon/132/",
    chance: types.level_unique,
  },
  {
    name: "eevee",
    url: "https://pokeapi.co/api/v2/pokemon/133/",
    chance: types.level1,
  },
  {
    name: "vaporeon",
    url: "https://pokeapi.co/api/v2/pokemon/134/",
    chance: types.evo_stone,
  },
  {
    name: "jolteon",
    url: "https://pokeapi.co/api/v2/pokemon/135/",
    chance: types.evo_stone,
  },
  {
    name: "flareon",
    url: "https://pokeapi.co/api/v2/pokemon/136/",
    chance: types.evo_stone,
  },
  {
    name: "porygon",
    url: "https://pokeapi.co/api/v2/pokemon/137/",
    chance: types.level_unique,
  },
  {
    name: "omanyte",
    url: "https://pokeapi.co/api/v2/pokemon/138/",
    chance: types.level1,
  },
  {
    name: "omastar",
    url: "https://pokeapi.co/api/v2/pokemon/139/",
    chance: types.level2_3,
  },
  {
    name: "kabuto",
    url: "https://pokeapi.co/api/v2/pokemon/140/",
    chance: types.level1,
  },
  {
    name: "kabutops",
    url: "https://pokeapi.co/api/v2/pokemon/141/",
    chance: types.level2_2,
  },
  {
    name: "aerodactyl",
    url: "https://pokeapi.co/api/v2/pokemon/142/",
    chance: types.level_unique,
  },
  {
    name: "snorlax",
    url: "https://pokeapi.co/api/v2/pokemon/143/",
    chance: types.level_unique,
  },
  {
    name: "articuno",
    url: "https://pokeapi.co/api/v2/pokemon/144/",
    chance: types.legendary,
  },
  {
    name: "zapdos",
    url: "https://pokeapi.co/api/v2/pokemon/145/",
    chance: types.legendary,
  },
  {
    name: "moltres",
    url: "https://pokeapi.co/api/v2/pokemon/146/",
    chance: types.legendary,
  },
  {
    name: "dratini",
    url: "https://pokeapi.co/api/v2/pokemon/147/",
    chance: types.level2_3,
  },
  {
    name: "dragonair",
    url: "https://pokeapi.co/api/v2/pokemon/148/",
    chance: types.level3_3,
  },
  {
    name: "dragonite",
    url: "https://pokeapi.co/api/v2/pokemon/149/",
    chance: types.mystic,
  },
  {
    name: "mewtwo",
    url: "https://pokeapi.co/api/v2/pokemon/150/",
    chance: types.legendary,
  },
  {
    name: "mew",
    url: "https://pokeapi.co/api/v2/pokemon/151/",
    chance: types.legendary,
  },
];

setInterval(async () => {
  const now = new Date().getTime();
  const probability = (now - lastPokemon.getTime()) / maxInterval;
  const val = Math.random();
  console.log(now - lastPokemon.getTime(), probability, val);
  const test = probability > val;

  let total = 0;

  if (test) {
    const probabilities = possiblePokemon.map((p) => {
      total += p.chance;
      return total;
    });
    const sortedNumber = Math.floor(Math.random() * (total - 1)) + 1;
    const sortedPokemon =
      possiblePokemon[probabilities.findIndex((n) => n > sortedNumber)];
    lastPokemon = new Date();
    const pokemon = await axios.get(sortedPokemon.url);
    console.log(pokemon.data.sprites.other["official-artwork"].front_default);
    const message = new MessageEmbed()
      .setColor("#ff3f34")
      .setTitle("A wild pokemon appeared")
      // .setURL("https://discord.js.org/")
      // .setAuthor(
      //   "Some name",
      //   "https://i.imgur.com/wSTFkRM.png",
      //   "https://discord.js.org"
      // )
      .setDescription("Who's that pokemon?")
      // .setThumbnail("https://i.imgur.com/wSTFkRM.png")
      // .addFields(
      //   { name: "Regular field title", value: "Some value here" },
      //   { name: "\u200B", value: "\u200B" },
      //   { name: "Inline field title", value: "Some value here", inline: true },
      //   { name: "Inline field title", value: "Some value here", inline: true }
      // )
      // .addField("Inline field title", "Some value here", true)
      .setImage(pokemon.data.sprites.other["official-artwork"].front_default);
    // .setTimestamp()
    // .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");

    newPokemon.send(message);
  }
}, 30 * 1000);

client.on("message", (message) => {
  if (message.content === "ping") {
    message.channel.send("pong");
  } else if (message.content === "what is my avatar") {
    // Send the user's avatar URL
    message.reply(message.author.displayAvatarURL());
  }
});

client.login("ODU1ODI1MjExODI2ODk2OTA2.YM4HVg.EnXoHzzHpRPmd__STNyE0X3jLKw");
