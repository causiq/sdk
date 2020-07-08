import { HasFeatures } from "./features"
import { Runnable } from "./runnable"

export default interface LogaryPlugin extends Runnable, HasFeatures {
  readonly name: string;
}

export interface PluginAPI {
  /**
   * Register a new plugin with Logary
   * @param plugin The plugin declaration to register
   */
  register(plugin: LogaryPlugin): void;

  /**
   * Gets all plugins that support all of the passed features. Plugins that only support one of the features
   * are not returned.
   *
   * @param features The feature constants these plugins must support to be returned
   */
  getSupporters(features: string[]): LogaryPlugin[];
}