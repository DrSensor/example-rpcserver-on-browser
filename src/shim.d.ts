declare module 'html-webpack-externals-plugin' {
  import { Plugin } from 'webpack'

  export = HtmlWebpackExternalsPlugin

  class HtmlWebpackExternalsPlugin extends Plugin {
    constructor(options?: HtmlWebpackExternalsPlugin.Options);
  }

  namespace HtmlWebpackExternalsPlugin {
    interface Supplement {
      path: string;
      cwpPatternConfig?: object;
    }

    interface Entry extends Supplement {
      type: 'js' | 'css';
      attributes?: { [key: string]: string };
    }


    interface External {
      module?: string;
      entry?: string | string[] | Entry | Array<Entry | string>;
      global?: string | null;
      supplements?: string[] | Supplement[];
      append?: boolean;
    }

    interface Options {
      externals: External[];
      hash?: boolean;
      outputPath?: string;
      publicPath?: string | null;
      files?: string | string[] | null;
      cwpOptions?: object;
      enabled?: boolean
    }
  }
}
