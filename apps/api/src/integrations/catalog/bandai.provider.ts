import type { CatalogProvider } from './catalog-provider.js';
export class BandaiProvider implements CatalogProvider {
  readonly id = 'bandai' as const;
  async fetchCollection(): Promise<never> {
    // Deliberately fail closed even if an environment flag is accidentally enabled.
    // Permission, discovered selectors and printing/language evidence are not validated.
    throw new Error('Bandai disabled: content permission and live parser review pending');
  }
}
