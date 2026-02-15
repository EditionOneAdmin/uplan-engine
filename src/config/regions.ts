import type { RegionConfig } from "./regionTypes";

export const regions: Record<string, RegionConfig> = {
  berlin: {
    id: "berlin",
    name: "Berlin",
    shortName: "BLN",
    center: [52.52, 13.405],
    zoom: 12,
    layers: {
      flurstuecke: {
        url: "https://gdi.berlin.de/services/wms/alkis_flurstuecke",
        layers: "flurstuecke",
        styles: "",
        attribution: "© Berlin GDI",
        opacity: 0.7,
      },
      bebauungsplaene: {
        url: "https://gdi.berlin.de/services/wms/bplan",
        layers: "b_bp_fs",
        styles: "",
        attribution: "© Berlin GDI",
        opacity: 0.6,
      },
      bodenrichtwerte: {
        url: "https://gdi.berlin.de/services/wms/brw2025",
        layers: "brw2025",
        styles: "",
        attribution: "© Berlin GDI – BORIS 2025",
        opacity: 0.5,
      },
      wohnlagen: {
        url: "https://gdi.berlin.de/services/wms/wohnlagenadr2024",
        layers: "wohnlagenadr2024",
        styles: "",
        attribution: "© Berlin GDI – Mietspiegel 2024",
        opacity: 0.5,
      },
      orthophotos: {
        url: "https://gdi.berlin.de/services/wms/truedop_2024",
        layers: "truedop_2024",
        styles: "",
        attribution: "© Berlin GDI – TrueOrthophoto 2024",
      },
    },
    wfs: {
      flurstuecke: {
        url: "https://gdi.berlin.de/services/wfs/alkis_flurstuecke",
        featureType: "alkis_flurstuecke",
      },
    },
    featureInfo: {
      bodenrichtwerte: {
        url: "https://gdi.berlin.de/services/wms/brw2025",
        layer: "brw2025",
      },
      wohnlagen: {
        url: "https://gdi.berlin.de/services/wms/wohnlagenadr2024",
        layer: "wohnlagenadr2024",
      },
    },
    lbo: {
      name: "BauO Bln",
      abstandsflaecheFaktor: 0.4,
      abstandsflaechemMin: 3.0,
      stellplatzDefault: 0.5,
      aufzugAbOG: 5,
      holzbauMaxGK: 4,
      dachbegruenungPflicht: true,
    },
  },
  nrw: {
    id: "nrw",
    name: "Nordrhein-Westfalen",
    shortName: "NRW",
    center: [51.45, 7.01],
    zoom: 8,
    layers: {
      flurstuecke: {
        url: "https://www.wms.nrw.de/geobasis/wms_nw_alkis",
        layers: "adv_alkis_flurstuecke",
        styles: "",
        attribution: "© GeoBasis NRW",
        opacity: 0.7,
      },
      gebaeude: {
        url: "https://www.wms.nrw.de/geobasis/wms_nw_alkis",
        layers: "adv_alkis_gebaeude",
        styles: "",
        attribution: "© GeoBasis NRW",
        opacity: 0.7,
      },
      orthophotos: {
        url: "https://www.wms.nrw.de/geobasis/wms_nw_dop",
        layers: "nw_dop_rgb",
        styles: "",
        attribution: "© GeoBasis NRW – DOP",
      },
      dgm: {
        url: "https://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung",
        layers: "nw_dgm-schummerung_col",
        styles: "",
        attribution: "© GeoBasis NRW – DGM",
        opacity: 0.6,
      },
    },
    wfs: {
      flurstuecke: {
        url: "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht",
        featureType: "ave:Flurstueck",
      },
    },
    lbo: {
      name: "BauO NRW 2018",
      abstandsflaecheFaktor: 0.4,
      abstandsflaechemMin: 3.0,
      stellplatzDefault: 1.0,
      aufzugAbOG: 4,
      holzbauMaxGK: 5,
      dachbegruenungPflicht: false,
    },
  },
};

export const regionIds = Object.keys(regions);
export const defaultRegionId = "berlin";
