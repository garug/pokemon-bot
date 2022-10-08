import { FilterQuery, PipelineStage } from "mongoose";

import OwnedPokemon from "../../models/OwnedPokemon";
import { Page, Pageable, PokemonFilters, PokemonRepository } from "../PokemonRepository";

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
    }
  }
}

function moreStrong(filters: FilterQuery<any>, pageable: Pageable) {
  const applyFilters: PipelineStage = {
    $match: filters
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