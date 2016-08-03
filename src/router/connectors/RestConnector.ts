import {ISourceConnector, BaseSourceConnector} from './SourceConnector';
import * as restler from 'restler';

export class RestConnector extends BaseSourceConnector {
  type: 'geojson';
  /** Refresh interval for the source in [seconds]. */

  /**
   * Creates an instance of RestConnector.
   *
   * @param {string} URI of REST source.
   * @param {number} [refreshInterval=5000] in milliseconds
   */
  constructor(private path: string, private refreshIntervalMSec = 5000) {
    super();
    if (this.path.indexOf('http://') === -1) this.path = 'http://' + this.path;
  }

  connect(callback: (result: any) => void) {
    this.refresh(callback);
  }

  private refresh(callback: (result: any) => void) {
    restler.get(this.path).on('complete', result => {
      if (result instanceof Error) {
        this.hasError = true;
        console.log('Error:', result.message);
      } else {
        this.hasError = false;
        callback(result);
      }
      if (this.refreshIntervalMSec >= 0) setTimeout(() => this.refresh(callback), this.refreshIntervalMSec);
    });
  }
}
