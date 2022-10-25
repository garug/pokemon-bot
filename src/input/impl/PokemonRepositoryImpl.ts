import { FilterQuery, PipelineStage } from "mongoose";

import OwnedPokemon from "../../models/OwnedPokemon";
import InfoPokemon from "../../models/InfoPokemon";
import { Page, Pageable, PokemonFilters, PokemonRepository } from "../PokemonRepository";
import { availableTiers, fnList } from "../../managers/tier";

export default function useRepository(): PokemonRepository {
  return {
    async find(filters: PokemonFilters, pageable: Pageable): Promise<Page<any>> {
      const mongoFilter = buildMongoFilter(filters);

      const contentAggregate = moreStrong(mongoFilter, pageable);

      const countQuery = OwnedPokemon.find(mongoFilter).count();

      const [ content, count ] = await Promise.all([ contentAggregate, countQuery ]);

      console.log(count);

      return {
        content,
        count,
        ...pageable
      }
    },

    async updateTiers(): Promise<any> {
      return updateTiersImpl();
    }
  }
}

const prepareToSort: PipelineStage[] = [ {
  $addFields: {
    training: {
      attack: {
        $sum: '$trainings.attributes.attack'
      },
      defense: {
        $sum: '$trainings.attributes.defense'
      },
      hp: {
        $sum: '$trainings.attributes.hp'
      },
      sp_attack: {
        $sum: '$trainings.attributes.sp_attack'
      },
      sp_defense: {
        $sum: '$trainings.attributes.sp_defense'
      },
      speed: {
        $sum: '$trainings.attributes.speed'
      }
    }
  }
}, {
  $project: {
    training: 1,
    total: {
      $add: [
        '$attributes.attack',
        '$attributes.defense',
        '$attributes.hp',
        '$attributes.sp_attack',
        '$attributes.sp_defense',
        '$attributes.speed',
        '$training.attack',
        '$training.defense',
        '$training.hp',
        '$training.sp_attack',
        '$training.sp_defense',
        '$training.speed'
      ]
    }
  }
} ];

async function updateTiersImpl() {
  const allPoke = await OwnedPokemon.aggregate([
    ...prepareToSort,
    {
      $group: {
        _id: "$id_dex",
        name: {
          $first: "$name",
        },
        arr: {
          $push: {
            total: "$total",
          },
        },
      },
    },
  ])

  const updates = allPoke.map((p) => {
    const fn = fnList(
        p.arr,
        availableTiers.map((t) => t.value)
    );

    const tiers = availableTiers
        .filter((_, index) => fn[index])
        .map((t, index) => ({
          order: index,
          name: t.name,
          value: fn[index][fn[index].length - 1].total,
        }));

    return InfoPokemon.updateOne(
        {
          id_dex: p._id,
        },
        {
          $set: {
            tiers,
          },
        },
        { upsert: true }
    );
  });

  return Promise.all(updates);
}

function moreStrong(filters: FilterQuery<any>, pageable: Pageable) {
  const applyFilters: PipelineStage = {
    $match: filters
  }

  const sortAndPagination: PipelineStage[] = [
    {
      $sort: {
        total: -1
      }
    },
    {
      $skip: (pageable.page - 1) * pageable.size
    },
    {
      $limit: pageable.size
    }
  ];

  const formatResponse: PipelineStage[] = [
    {
      $lookup: {
        from: "ownedpokemons",
        localField: "_id",
        foreignField: "_id",
        as: "original"
      }
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$original", 0 ] }, "$$ROOT" ] }
      }
    },
    {
      $unset: [ "trainings", "original", "_id", "__v" ]
    }
  ];

  return OwnedPokemon.aggregate([
    applyFilters,
    ...prepareToSort,
    ...sortAndPagination,
    ...formatResponse,
  ])
}

function buildMongoFilter(filters: PokemonFilters) {
  const result: FilterQuery<any> = {};

  if (!!filters.name)
    result.name = { $regex: filters.name.toLowerCase() }

  if (filters.shiny === true)
    result["marks.shiny"] = true;

  if (filters.user)
    result.user = filters.user;

  return result;
}