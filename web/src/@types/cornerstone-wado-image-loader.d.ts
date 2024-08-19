declare module 'cornerstone-wado-image-loader' {
  import { Image } from 'cornerstone-core';

  export const external: {
    cornerstone: any;
    dicomParser: any;
  };

  export const wadouri: {
    fileManager: {
      add: (byteArray: File) => string;
    };
    dataSetCacheManager: {
      load: (url: string, options?: LoadImageOptions) => void;
    };
  };

  export function loadImage(imageId: string): Promise<Image>;

  export function configure(options: {
    beforeSend?: (xhr: XMLHttpRequest) => void;
  }): void;

  export const webWorkerManager: {
    initialize: (config: {
      webWorkerPath: string;
      taskConfiguration: {
        decodeTask: {
          codecsPath: string;
        };
      };
    }) => void;
  };
}
