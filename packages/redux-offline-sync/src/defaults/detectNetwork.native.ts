import {
  type NetInfoState,
  addEventListener,
  fetch,
} from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import type { Config, NetInfo } from '../types';

class DetectNetwork {
  private isConnected: boolean;
  private type: string;
  private isConnectionExpensive: boolean;
  private callback: (netInfo: NetInfo) => void;

  constructor(callback: (netInfo: NetInfo) => void) {
    this.type = 'none';
    this.isConnected = false;
    this.isConnectionExpensive = false;
    this.callback = callback;

    this.init();
    this.addListeners();
  }

  /**
   * Check props for changes
   * @param {string} type - connection type.
   *     - Cross-platform: [none, wifi, cellular, unknown, other]
   *     - Android/Web: [bluetooth, ethernet, wimax, vpn]
   * @returns {boolean} - Whether the connection type or the connection props have changed
   * @private
   */
  private hasChanged = (newNetInfo: NetInfo) => {
    if (this.type !== newNetInfo.type) {
      return true;
    }
    if (this.isConnected !== newNetInfo.isConnected) {
      return true;
    }
    if (this.isConnectionExpensive !== newNetInfo.isConnectionExpensive) {
      return true;
    }
    return false;
  };

  /**
   * Sets the connection reachability prop
   * @param {string} reach - connection reachability.
   *     - Cross-platform: [none, wifi, cellular, unknown]
   *     - Android: [bluetooth, ethernet, wimax]
   * @returns {void}
   * @private
   */
  private setNetInfo = (newNetInfo: NetInfo) => {
    this.type = newNetInfo.type as string;
    this.isConnected = newNetInfo.isConnected;
    this.isConnectionExpensive = newNetInfo.isConnectionExpensive as boolean;
  };

  /**
   * Fetches and sets the connection reachability and the isConnected props,
   * if neither of the AppState and NetInfo event listeners have been called
   * @returns {Promise.<void>} Resolves when the props have been
   * initialized and update.
   * @private
   */
  private init = async () => {
    const netInfoState = await fetch();

    await this.update(netInfoState);
  };

  /**
   * Check changes on props and store and dispatch if neccesary
   * @param {string} reach - connection reachability.
   *     - Cross-platform: [none, wifi, cellular, unknown]
   *     - Android: [bluetooth, ethernet, wimax]
   * @returns {void}
   * @private
   */
  private update = async (netInfoState: NetInfoState) => {
    const newNetInfo: NetInfo = {
      type: netInfoState.type,
      isConnected: netInfoState.isConnected ?? false,
      isConnectionExpensive: netInfoState.details?.isConnectionExpensive,
    };
    if (this.hasChanged(newNetInfo)) {
      this.setNetInfo(newNetInfo);
      this.dispatch();
    }
  };

  /**
   * Adds listeners for when connection reachability and app state changes to update props
   * @returns {void}
   * @private
   */
  private addListeners() {
    AppState.addEventListener('change', async () => {
      const netInfoState = await fetch();
      this.update(netInfoState);
    });
    addEventListener((netInfoState) => {
      this.update(netInfoState);
    });
  }

  /**
   * Executes the given callback to update redux's store with the new internal props
   * @returns {Promise.<void>} Resolves after fetching the isConnectionExpensive
   * and dispatches actions
   * @private
   */
  private dispatch = async () => {
    this.callback({
      type: this.type,
      isConnected: this.isConnected,
      isConnectionExpensive: this.isConnectionExpensive,
    });
  };
}

const detectNetwork: Config['detectNetwork'] = (
  callback: (netInfo: NetInfo) => void
) => new DetectNetwork(callback);

export default detectNetwork;
