export interface WMSLayerConfig {
  url: string;
  layers: string;
  styles?: string;
  attribution?: string;
  opacity?: number;
}

export interface WFSConfig {
  url: string;
  featureType: string;
}

export interface FeatureInfoConfig {
  url: string;
  layer: string;
}

export interface LBOConfig {
  name: string;
  abstandsflaecheFaktor: number;
  abstandsflaechemMin: number;
  stellplatzDefault: number;
  aufzugAbOG: number;
  holzbauMaxGK: number;
  dachbegruenungPflicht: boolean;
}

export interface RegionConfig {
  id: string;
  name: string;
  shortName: string;
  center: [number, number];
  zoom: number;
  layers: {
    flurstuecke?: WMSLayerConfig;
    gebaeude?: WMSLayerConfig;
    bebauungsplaene?: WMSLayerConfig;
    bodenrichtwerte?: WMSLayerConfig;
    wohnlagen?: WMSLayerConfig;
    orthophotos?: WMSLayerConfig;
    dgm?: WMSLayerConfig;
  };
  wfs?: {
    flurstuecke?: WFSConfig;
  };
  featureInfo?: {
    flurstuecke?: FeatureInfoConfig;
    bodenrichtwerte?: FeatureInfoConfig;
    wohnlagen?: FeatureInfoConfig;
  };
  /** WFS returns JSON (true) or GML/XML (false/undefined) */
  wfsSupportsJson?: boolean;
  lbo: LBOConfig;
}
