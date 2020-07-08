export const UniversalRendering = 'universal-rendering'
export const GlobalErrorHandling = 'global-error-handling'
export const GlobalClickHandling = 'global-click-handling'

export interface HasFeatures {
  readonly features: string[];
  supports(feature: string): boolean;
}