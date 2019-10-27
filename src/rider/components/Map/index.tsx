import MapBase, { IMapProps } from '../../../common/components/Map';
import { inject, observer } from 'mobx-react/native';
import { STORE_LOCATION } from '../../constants';
import { AppState } from 'react-native';

@inject(STORE_LOCATION)
@observer
export default class Map extends MapBase {

  public componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  public componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  public handleAppStateChange = () => {
    const { init } = this.props[STORE_LOCATION];
    init().then(hasLocationPermission => {
      if (hasLocationPermission) {
        this.animateToUserLocation();
      }
    });
  }

  public onMapReady = () => {
    this.setState({ isMapReady: true });
    this.handleAppStateChange();
  }
}
