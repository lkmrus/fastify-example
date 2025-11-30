import axios, { AxiosInstance } from 'axios';

export interface SkinportItem {
  market_hash_name: string;
  currency: string;
  suggested_price: number | null;
  item_page: string;
  market_page: string;
  min_price: number | null;
  max_price: number | null;
  mean_price: number | null;
  median_price: number | null;
  quantity: number;
  created_at: number;
  updated_at: number;
}

export class SkinportClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.skinport.com',
      timeout: 30000,
      headers: {
        'Accept-Encoding': 'br',
      },
    });
  }

  async getItems(tradable: boolean): Promise<SkinportItem[]> {
    try {
      const response = await this.client.get<SkinportItem[]>('/v1/items', {
        params: {
          app_id: 730,
          currency: 'EUR',
          tradable: tradable ? 1 : 0,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Skinport API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getAllItems(): Promise<{ tradable: SkinportItem[]; nontradable: SkinportItem[] }> {
    try {
      const [tradable, nontradable] = await Promise.all([
        this.getItems(true),
        this.getItems(false),
      ]);

      return { tradable, nontradable };
    } catch (error) {
      throw error;
    }
  }
}

