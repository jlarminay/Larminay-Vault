// store/imageLoader.ts
import { defineStore } from 'pinia';

interface ImageLoaderState {
  loadingQueue: HTMLImageElement[];
  loadingCount: number;
  maxConcurrentLoads: number;
  observer: IntersectionObserver | null;
}

export const useImageLoaderStore = defineStore('imageLoader', {
  state: (): ImageLoaderState => ({
    loadingQueue: [],
    loadingCount: 0,
    maxConcurrentLoads: 5,
    observer: null,
  }),
  actions: {
    initObserver() {
      if (!this.observer) {
        this.observer = new IntersectionObserver(this.onIntersection, {
          root: null,
          rootMargin: '0px',
          threshold: 0.1,
        });
      }
    },
    observeImage(image: HTMLImageElement) {
      if (this.observer) {
        this.observer.observe(image);
      }
    },
    onIntersection(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.addToQueue(entry.target as HTMLImageElement);
        }
      });
      this.processQueue();
    },
    addToQueue(image: HTMLImageElement) {
      if (!this.loadingQueue.includes(image)) {
        this.loadingQueue.push(image);
      }
    },
    processQueue() {
      while (this.loadingQueue.length > 0 && this.loadingCount < this.maxConcurrentLoads) {
        const image = this.loadingQueue.shift()!;
        this.loadImage(image);
      }
    },
    loadImage(image: HTMLImageElement) {
      const src = image.dataset.src;
      if (src) {
        this.loadingCount++;
        const img = new Image();
        img.src = src;
        img.onload = async () => {
          await new Promise((resolve) => setTimeout(resolve, 50)); // add a delay to show the image
          image.src = src;
          this.loadingCount--;
          this.processQueue(); // Process the next set of images after loading one
        };
      }
    },
  },
});
