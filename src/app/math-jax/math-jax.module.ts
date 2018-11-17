import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MathJaxDirective} from './math-jax.directive';
import {_Window} from './domain/window';
import {MathJaxService} from './math-jax.service';

export class ModuleConfiguration {
  /**
   * The version of the MathJax library.
   */
  version: string;

  /**
   * The config name of the MathJax library.
   */
  config: string;
}


@NgModule({
  declarations: [MathJaxDirective],
  imports: [
    CommonModule
  ],
  exports: [MathJaxDirective]
})
export class MathJaxModule {

  constructor(moduleConfig: ModuleConfiguration, window: _Window, service: MathJaxService) {

    /**
     * Define the {Subject} and {Observable} for the MathJax library.
     */
    const mathJaxHubSubject = service.MathJaxHubSubject;
    window.mathJaxHubSubject = mathJaxHubSubject;
    const document = window.document;

    /**
     * Define the function string to be inserted into the mathjax configuration script block.
     */
    const mathJaxHubConfig = (() => {
      MathJax.Hub.Config({
        skipStartupTypeset: true
      });
      MathJax.Hub.Register.StartupHook('End', () => mathJaxHubSubject.next(MathJax.Hub));
    }).toString();

    /**
     * Insert the MathJax configuration script into the Head element.
     */
    (function () {
      const script = document.createElement('script') as HTMLScriptElement;
      script.type = 'text/x-mathjax-config';
      script.text = `(${mathJaxHubConfig})();`;
      document.getElementsByTagName('head')[0].appendChild(script);
    })();

    /**
     * Insert the script block to load the MathJax library.
     */
    (function (version: string, config: string) {
      const script = document.createElement('script') as HTMLScriptElement;
      script.type = 'text/javascript';
      script.src = `https://cdnjs.cloudflare.com/ajax/libs/mathjax/${version}/MathJax.js?config=${config}`;
      script.async = true;
      document.getElementsByTagName('head')[0].appendChild(script);
    })(moduleConfig.version, moduleConfig.config);
  }

  public static config(moduleConfiguration: ModuleConfiguration = {version: '2.7.5', config: 'TeX-AMS_CHTML'}): ModuleWithProviders {
    return {
      ngModule: MathJaxModule,
      providers: [{provide: ModuleConfiguration, useValue: moduleConfiguration},
        {provide: _Window, useValue: window},
        {provide: MathJaxService, useClass: MathJaxService}]
    };
  }

}