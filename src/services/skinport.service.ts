import { SkinportClient, SkinportItem } from '@plugins/skinport-client';
import Cache from '@plugins/cache';
import { MergedItem } from '../schemas/skinport.schema';

export class SkinportService {
  private readonly CACHE_KEY = 'skinport:items:all';
  private readonly CACHE_TTL = 300;

  constructor(
    private skinportClient: SkinportClient,
    private cache: Cache,
  ) {}

  async getItems(): Promise<MergedItem[]> {
    const cached = await this.cache.get(this.CACHE_KEY);
    if (cached) {
      return cached as MergedItem[];
    }

    const { tradable, nontradable } = await this.skinportClient.getAllItems();

    const cheapestTradable = tradable.reduce(
      (cheapest: SkinportItem | null, item: SkinportItem) => {
        if (item.quantity > 0 && item.min_price !== null) {
          if (!cheapest || item.min_price < cheapest.min_price!) {
            return item;
          }
        }
        return cheapest;
      },
      null as SkinportItem | null,
    );

    const cheapestNontradable = nontradable.reduce(
      (cheapest: SkinportItem | null, item: SkinportItem) => {
        if (item.quantity > 0 && item.min_price !== null) {
          if (!cheapest || item.min_price < cheapest.min_price!) {
            return item;
          }
        }
        return cheapest;
      },
      null as SkinportItem | null,
    );

    const result: MergedItem[] = [];

    if (cheapestTradable) {
      result.push({
        market_hash_name: cheapestTradable.market_hash_name,
        currency: cheapestTradable.currency,
        suggested_price: cheapestTradable.suggested_price,
        item_page: cheapestTradable.item_page,
        market_page: cheapestTradable.market_page,
        min_price_tradable: cheapestTradable.min_price,
        min_price_nontradable: null,
        quantity_tradable: cheapestTradable.quantity,
        quantity_nontradable: 0,
        created_at: cheapestTradable.created_at,
        updated_at: cheapestTradable.updated_at,
      });
    }

    if (cheapestNontradable) {
      result.push({
        market_hash_name: cheapestNontradable.market_hash_name,
        currency: cheapestNontradable.currency,
        suggested_price: cheapestNontradable.suggested_price,
        item_page: cheapestNontradable.item_page,
        market_page: cheapestNontradable.market_page,
        min_price_tradable: null,
        min_price_nontradable: cheapestNontradable.min_price,
        quantity_tradable: 0,
        quantity_nontradable: cheapestNontradable.quantity,
        created_at: cheapestNontradable.created_at,
        updated_at: cheapestNontradable.updated_at,
      });
    }

    await this.cache.set(this.CACHE_KEY, result, this.CACHE_TTL);

    return result;
  }
}
