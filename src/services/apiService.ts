import axios, { AxiosResponse } from 'axios';
import { Account, Transaction } from '../App';
import { resolveMerchantLogo } from './merchantLogos';

// API Configuration
const API_CONFIG = {
  baseURL: 'https://api.up.com.au/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTime: 2 * 60 * 1000, // 2 minutes
};

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();

// API Service Class
class UpBankApiService {
  private apiKey: string = '';

  // Set API key for authentication
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get cached data if valid
  private getCachedData(key: string): any | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTime) {
      return cached.data;
    }
    return null;
  }

  // Set cached data
  private setCachedData(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
  }

  // Retry logic with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    context: string
  ): Promise<AxiosResponse<T>> {
    let lastError: Error;

    for (let attempt = 0; attempt < API_CONFIG.retryAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === API_CONFIG.retryAttempts - 1) {
          console.error(`${context} failed after ${API_CONFIG.retryAttempts} attempts:`, error);
          throw error;
        }

        const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
        console.warn(`${context} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Validate API response structure
  private validateApiResponse(response: any, expectedType: 'accounts' | 'transactions'): boolean {
    if (!response || typeof response !== 'object') return false;
    
    if (expectedType === 'accounts') {
      return response.data && 
             Array.isArray(response.data) && 
             response.data.length > 0 && 
             response.data[0].attributes && 
             response.data[0].attributes.displayName;
    }
    
    if (expectedType === 'transactions') {
      return response.data && 
             Array.isArray(response.data) && 
             response.data.length > 0 && 
             response.data[0].attributes && 
             response.data[0].attributes.description;
    }
    
    return false;
  }

  // Handle API errors
  private handleApiError(error: any): string {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          return '🔐 Authentication failed. Please check your API key and try again.';
        case 403:
          return '🚫 Access denied. Your API key may not have the required permissions.';
        case 429:
          return '⏱️ Too many requests. Please wait a moment and try again.';
        case 500:
        case 502:
        case 503:
          return '🔧 Server error. Please try again later.';
        default:
          return `❌ Error ${status}: ${data?.errors?.[0]?.title || 'Unknown error occurred'}`;
      }
    } else if (error.request) {
      return '🌐 Network error. Please check your internet connection and try again.';
    } else {
      return `❌ Error: ${error.message}`;
    }
  }

  // Fetch accounts from Up Bank API
  async fetchAccounts(): Promise<{ success: boolean; data?: Account[]; error?: string }> {
    try {
      // Check cache first
      const cacheKey = `accounts_${this.apiKey}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Using cached accounts data');
        return { success: true, data: cachedData };
      }

      const response = await this.retryRequest(
        () => axios.get(`${API_CONFIG.baseURL}/accounts`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: API_CONFIG.timeout,
        }),
        'Accounts fetch'
      );

      if (!this.validateApiResponse(response.data, 'accounts')) {
        return { success: false, error: 'Invalid response format from Up API' };
      }

      // Process accounts data
      const accounts: Account[] = response.data.data.map((item: any) => {
        const displayName = item.attributes.displayName;
        const accountType = item.attributes.accountType;
        
        // Check if account name contains 🤔 emoji and label as maybuy saver
        const isMaybuySaver = displayName.includes('🤔');
        const finalType = isMaybuySaver ? 'MAYBUY_SAVER' : accountType;
        
        // Trim 🤔 emoji from name if it's a maybuy saver
        const finalName = isMaybuySaver ? displayName.replace('🤔', '').trim() : displayName;
        
        return {
          id: item.id,
          name: finalName,
          balance: parseFloat(item.attributes.balance.value),
          type: finalType,
          owner: item.attributes.ownershipType,
        };
      });

      // Cache the results
      this.setCachedData(cacheKey, accounts);

      return { success: true, data: accounts };
    } catch (error) {
      const errorMessage = this.handleApiError(error);
      return { success: false, error: errorMessage };
    }
  }

  // Fetch transactions from Up Bank API with pagination support
  async fetchTransactions(transactionCount: number): Promise<{ success: boolean; data?: Transaction[]; error?: string }> {
    try {
      // Check cache first
      const cacheKey = `transactions_${this.apiKey}_${transactionCount}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Using cached transactions data');
        return { success: true, data: cachedData };
      }

      // Up Bank API has a max page size of 100, so we need to paginate for more
      const maxPageSize = 100;
      const totalRequested = Math.min(transactionCount, 200);
      const pagesNeeded = Math.ceil(totalRequested / maxPageSize);
      
      console.log(`Fetching ${totalRequested} transactions across ${pagesNeeded} page(s) (Up API max: ${maxPageSize} per page)`);
      
      let allTransactions: any[] = [];
      let allIncluded: any[] = [];
      let nextPageUrl: string | null = null;

      // Fetch all pages
      for (let page = 0; page < pagesNeeded; page++) {
        const url: string = nextPageUrl || `${API_CONFIG.baseURL}/transactions?page[size]=${maxPageSize}&include=merchant,account`;
        
        const response: AxiosResponse<any> = await this.retryRequest(
          (): Promise<AxiosResponse<any>> => axios.get(url, {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            timeout: API_CONFIG.timeout,
          }),
          `Transactions fetch page ${page + 1}`
        );

        if (!this.validateApiResponse(response.data, 'transactions')) {
          return { success: false, error: 'Invalid response format from Up API' };
        }

        // Collect transactions and included data
        allTransactions = allTransactions.concat(response.data.data);
        allIncluded = allIncluded.concat(response.data.included || []);

        // Check if we have enough transactions or if there are no more pages
        if (allTransactions.length >= totalRequested || !response.data.links?.next) {
          break;
        }

        // Get next page URL
        nextPageUrl = response.data.links.next;
      }

      // Limit to requested amount
      allTransactions = allTransactions.slice(0, totalRequested);
      
      console.log(`Successfully fetched ${allTransactions.length} transactions`);

      // Build merchant and account lookup from all included data
      const merchantById: Record<string, { name?: string; websiteUrl?: string }> = {};
      const accountById: Record<string, { name?: string; type?: string }> = {};
      
      for (const inc of allIncluded) {
        if (inc.type === 'merchants') {
          merchantById[inc.id] = {
            name: inc.attributes?.name,
            websiteUrl: inc.attributes?.websiteUrl,
          };
        } else if (inc.type === 'accounts') {
          accountById[inc.id] = {
            name: inc.attributes?.displayName || inc.attributes?.name,
            type: inc.attributes?.accountType,
          };
        }
      }

      // Process transactions data
      const transactions: Transaction[] = allTransactions
        .map((item: any) => {
          const amount = parseFloat(item.attributes.amount.value);
          const isPositive = amount >= 0;
          
          // Format date and time
          const [date, time] = item.attributes.createdAt.split('T');
          const formattedTime = this.formatTime(time);
          
          const description: string = item.attributes.description;
          const rawText: string = item.attributes.rawText || 'N/A';
          const merchantId: string | undefined = item.relationships?.merchant?.data?.id;
          const accountId: string | undefined = item.relationships?.account?.data?.id;
          const merchantInfo = merchantId ? merchantById[merchantId] : undefined;
          const accountInfo = accountId ? accountById[accountId] : undefined;

          let merchantLogoUrl: string | undefined;
          if (merchantInfo?.websiteUrl) {
            const domain = this.extractDomain(merchantInfo.websiteUrl);
            if (domain) merchantLogoUrl = `https://logo.clearbit.com/${domain}`;
          }
          if (!merchantLogoUrl) {
            merchantLogoUrl = resolveMerchantLogo(description, rawText);
          }

          return {
            id: item.id,
            description,
            amount: Math.abs(amount),
            type: isPositive ? '+' : '',
            status: item.attributes.status,
            date: date,
            time: formattedTime,
            text: rawText,
            message: item.attributes.message || 'N/A',
            roundup: item.attributes.roundUp ? 'true' : 'false',
            tags: Array.isArray(item.relationships?.tags?.data)
              ? item.relationships.tags.data.map((t: any) => t.id?.replace('tag-', '')).filter(Boolean)
              : [],
            merchantLogoUrl,
            accountId: accountId,
            accountName: accountInfo?.name,
          };
        });

      // Cache the results
      this.setCachedData(cacheKey, transactions);

      return { success: true, data: transactions };
    } catch (error) {
      const errorMessage = this.handleApiError(error);
      return { success: false, error: errorMessage };
    }
  }

  // Format time (from original utils.js)
  private formatTime(time: string): string {
    let shortTime = time.split('+')[0].slice(0, 5);
    
    if (shortTime.charAt(0) === '0') {
      shortTime = shortTime.slice(1, 5);
    }
    
    const hour = parseInt(shortTime.slice(0, 2));
    
    if (hour < 12) {
      shortTime = shortTime + 'am';
    } else {
      shortTime = shortTime + 'pm';
    }

    if (hour > 12) {
      const pmTime = hour - 12;
      shortTime = pmTime + shortTime.slice(2);
    }
    
    return shortTime;
  }

  // Clear cache
  clearCache() {
    cache.clear();
  }

  // Resolution moved to merchantLogos.ts

  private extractDomain(url: string): string | null {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname;
    } catch {
      return null;
    }
  }

  // Fetch all data (accounts + transactions)
  async fetchAllData(transactionCount: number): Promise<{
    accounts: { success: boolean; data?: Account[]; error?: string };
    transactions: { success: boolean; data?: Transaction[]; error?: string };
  }> {
    const [accountsResult, transactionsResult] = await Promise.all([
      this.fetchAccounts(),
      this.fetchTransactions(transactionCount)
    ]);

    return {
      accounts: accountsResult,
      transactions: transactionsResult
    };
  }
}

// Export singleton instance
export const upBankApi = new UpBankApiService();
export default upBankApi;
