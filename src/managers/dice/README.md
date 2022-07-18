# Dados
A batalha se dará por meio de dados. Cada pokemon representa um dado comum de 6 lados.

Cada dado sempre terá, pelo menos:
1 Movimento
1 Geração de energia

Também podendo ter espaços vazios, significando que o pokémon aquele turno não produzirá energia nem usará movimentos.

Um movimento sempre sempre terá um nome e um custo de energia, podendo também ter:
- Dano: Valor numérico, com menor valor 10, representa o dano base quando o movimento acertar
- Descrição: Movimentos podem ter efeitos extras, como aplicar status no alvo, modificar status do atacante, gerar energias extras, etc...

A geração de energia comumente possui o valor de 1 ou 2.

Um exemplo de um dado representando um charmander, onde cada número representa uma face do mesmo:
1 - Geração de energia: 1 Energia do tipo fogo
2 - Geração de energia: 2 Energia do tipo fogo
3 - Movimento: Tail on Fire
4 - Movimento: Tail on Fire
5 - Movimento: Flare
6 - Falha

Dados também podem ser muito ruins, como exemplo:
1 - Geração de energia: 1 Energia do tipo fogo
2 - Movimento: Flare
3 - Falha
4 - Falha
5 - Falha
6 - Falha

Os dados no momento são gerados aleatoriamente no momento da captura, fora as duas faces sempre preenchidas, a geração de um dado segue as regras, na sequência:
75% de chance de gerar um movimento OU geração de energia
Caso tenha gerado um movimento:
50% de chance de gerar uma geração de energia
12.5% de chance de gerar um terceiro movimento
Finalizando com mais 5% de chance de gerar mais um movimento OU geração de energia

No caso de ter gerado uma geração de energia, os valores são os mesmos mas invertendo geração de energia/movimento.

Se todos os testes forem positivos, as 6 faces do lado estarão preenchidas.
