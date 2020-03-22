declare namespace JSX {
  interface IntrinsicElements {
    'a-scene': any;
    'a-sky': any;
    'a-text': any;
  }
}

interface ShareData {
  text?: string;
  title?: string;
  url?: string;
}
interface Navigator {
  share(data?: ShareData): Promise<void>;
}
