import type { FxLayer } from './fxLayers';
import { getLayer } from './fxLayers';

type LayerState = {
  name: string;
  element: HTMLElement;
};

const activeLayers = new Map<string, LayerState>();

const resolveElement = (target?: HTMLElement | string) => {
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target) ?? document.body;
  }
  return target ?? document.body;
};

export const registerFxLayer = (layerName: string, target?: HTMLElement | string) => {
  if (typeof window === 'undefined') return;
  const layer = getLayer(layerName);
  if (!layer) return;

  const element = resolveElement(target);
  element.classList.add(layer.className);
  activeLayers.set(layerName, { name: layerName, element });
};

export const enableFx = (layerName: string, target?: HTMLElement | string) => {
  registerFxLayer(layerName, target);
};

export const disableFx = (layerName: string) => {
  const state = activeLayers.get(layerName);
  if (!state) return;
  state.element.classList.remove(getLayer(layerName)?.className ?? '');
  activeLayers.delete(layerName);
};

export const toggleFx = (layerName: string, shouldEnable?: boolean) => {
  if (shouldEnable === undefined) {
    if (activeLayers.has(layerName)) {
      disableFx(layerName);
    } else {
      enableFx(layerName);
    }
    return;
  }
  if (shouldEnable) {
    enableFx(layerName);
  } else {
    disableFx(layerName);
  }
};

export const clearAllFx = () => {
  activeLayers.forEach(({ name }) => disableFx(name));
};

export const getActiveFx = () => Array.from(activeLayers.keys());
