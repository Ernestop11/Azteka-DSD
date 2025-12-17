type EventListener<T> = (payload: T) => void;

export class AiEventBus<T = any> {
  private listeners = new Set<EventListener<T>>();

  emit(payload: T) {
    this.listeners.forEach(listener => listener(payload));
  }

  subscribe(listener: EventListener<T>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clear() {
    this.listeners.clear();
  }
}
