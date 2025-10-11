// cspell:ignore Toongabbie Somersby Passionfruit Bundaberg
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pub, drink, pubLog, pubDrinks, pubLogDrinks } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    await db.insert(pub).values([
      {
        name: "Toongabbie Sports Club",
        image_Url: "https://www.lawnbowls.com/wp-content/uploads/listing-uploads/logo/2024/10/Image-12.jpeg",
        description: "A Toongabbie based sports/bowling club with cheap drinks and a satisfactory kitchen.",
        lat: -33.78430331612734,
        long: 150.95202014232729,
        created_At: Date.now(),
        updated_At: Date.now(),
      },
    ]);

    await db.insert(drink).values([
      {
      name: "Carlton Dry",
      slug: "carlton-dry",
      image_Url:
        "https://senseoftaste.com.au/cdn/shop/products/SOTE-Commresizing5-2022-01-31T101419.410.jpg?v=1746800666",
      description: "A crisp, refreshing lager with a clean finish.",
      type: "Beer",
      brewery: "Carlton & United Breweries",
      style: "Lager",
      abv: 4.6,
      created_At: Date.now(),
      updated_At: Date.now(),
    },
    {
      name: "Great Northern Original",
      slug: "great-northern-original",
      image_Url:
        "https://www.liquorbarons.com.au/wp-content/uploads/2022/06/Great-Northern-Original-Bottle-700x700.png",
      description: "A smooth, full-strength lager with a mild bitterness.",
      type: "Beer",
      brewery: "Great Northern Brewing Co",
      style: "Lager",
      abv: 4.2,
      created_At: Date.now(),
      updated_At: Date.now(),
    },
    {
      name: "Stone & Wood Pacific Ale",
      slug: "stone-and-wood-pacific-ale",
      image_Url:
        "https://www.stoneandwood.com.au/cdn/shop/products/pacific-ale-bottle.png",
      description: "A hazy, aromatic ale with passionfruit and citrus notes.",
      type: "Beer",
      brewery: "Stone & Wood Brewing Co",
      style: "Pale Ale",
      abv: 4.4,
      created_At: Date.now(),
      updated_At: Date.now(),
    },
    {
      name: "Somersby Apple Cider",
      slug: "somersby-apple-cider",
      image_Url:
        "https://images.danmurphys.com.au/dnmrp/media/sys_master/h31/h7d/8793063827486.png",
      description: "A sweet, refreshing cider made with crisp apples.",
      type: "Cider",
      brewery: "Somersby",
      style: "Apple Cider",
      abv: 4.5,
      created_At: Date.now(),
      updated_At: Date.now(),
    },
    {
      name: "Bundaberg Rum & Cola",
      slug: "bundaberg-rum-and-cola",
      image_Url:
        "https://static.bottlemart.com.au/media/catalog/product/cache/1/image/800x800/17f82f742ffe127f42dca9de82fb58b1/b/u/bundaberg_rum_and_cola_375ml_can_6_pack.jpg",
      description: "A classic premix of Bundaberg Rum with cola.",
      type: "Premix",
      brewery: "Bundaberg Distilling Company",
      style: "Rum & Cola",
      abv: 4.6,
      created_At: Date.now(),
      updated_At: Date.now(),
    },
    ]);

    await db.insert(pubLog).values([
    {
      name: "Example Summary",
      description: "An example review of the pub.",
      lat: -33.78430331612734,
      long: 150.95202014232729,
      pub_Id: 1,
      user_Id: "ea21a6bb-c0ce-490b-81c1-513f459b8169",
      created_At: Date.now(),
      updated_At: Date.now(),
    },
    {
      name: "Another Example Summary",
      description: "An example review of the pub from another user.",
      lat: -33.78430331612734,
      long: 150.95202014232729,
      pub_Id: 1,
      user_Id: "d30776c1-3ae3-4510-9a1b-1bb8007eaa74",
      created_At: Date.parse("2024-10-20T10:20:30Z"),
      updated_At: Date.parse("2024-10-20T10:20:30Z"),
    },
  ]);

  await db.insert(pubDrinks).values([
      {
        pub_Id: 1,
        drink_Id: 1,
        created_At: Date.now(),
      },
      {
        pub_Id: 1,
        drink_Id: 2,
        created_At: Date.now(),
      },
      {
        pub_Id: 1,
        drink_Id: 3,
        created_At: Date.now(),
      },
      {
        pub_Id: 1,
        drink_Id: 4,
        created_At: Date.now(),
      },
    ]);

  await db.insert(pubLogDrinks).values([
    {
      pub_Log_Id: 1,
      drink_Id: 1,
      created_At: Date.now(),
    },
    {
      pub_Log_Id: 1,
      drink_Id: 2,
      created_At: Date.now(),
    },
    {
      pub_Log_Id: 2,
      drink_Id: 3,
      created_At: Date.parse("2024-10-20T10:20:30Z"),
    },
    {
      pub_Log_Id: 2,
      drink_Id: 4,
      created_At: Date.parse("2024-10-20T10:20:30Z"),
    },
  ]);

    return NextResponse.json({ success: true, message: "Seed complete" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
